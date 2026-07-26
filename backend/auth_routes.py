from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Header
from fastapi.security import OAuth2PasswordRequestForm
from pymongo.database import Database
from bson import ObjectId
from datetime import timedelta, datetime
from typing import Optional

from .database import get_db
from .models import clean_mongo_doc
from . import auth, mfa
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Schemas ────────────────────────────────────────────────────────────────────
class RegisterSchema(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""
    institution: str = ""
    license_id: str = ""


class ResetPasswordSchema(BaseModel):
    token: str
    new_password: str


class EnableMFASchema(BaseModel):
    code: str


class ForgotPasswordSchema(BaseModel):
    email: EmailStr


# ── Helpers ────────────────────────────────────────────────────────────────────
def send_reset_email(email: str, token: str):
    import os
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5500").rstrip("/")
    reset_link = f"{frontend_url}/reset-password?token={token}"
    print(f"[Email] To: {email}\nSubject: PathoAI Password Reset\nReset link: {reset_link}\n")


def _get_current_user_from_request(request: Request, db: Database):
    token = request.cookies.get("access_token") or (
        request.headers.get("Authorization", "").replace("Bearer ", "").strip() or None
    )
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = auth.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    sub = payload.get("sub")
    query = {"$or": [{"_id": ObjectId(sub) if ObjectId.is_valid(sub) else sub}, {"email": sub}]}
    user = db.users.find_one(query)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return clean_mongo_doc(user)


# ── Routes ─────────────────────────────────────────────────────────────────────
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterSchema, db: Database = Depends(get_db)):
    import uuid
    existing = db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = auth.get_password_hash(data.password)
    totp_secret = mfa.generate_totp_secret()
    uri = mfa.get_totp_uri(totp_secret, data.email)
    qr_data_uri = mfa.generate_qr_code_data_uri(uri)
    
    user_doc = {
        "email": data.email,
        "hashed_password": hashed,
        "full_name": data.full_name,
        "institution": data.institution,
        "license_id": data.license_id,
        "totp_secret": totp_secret,
        "mfa_enabled": False,
        "is_active": True,
        "role": "doctor",
        "created_at": datetime.utcnow(),
    }
    result = db.users.insert_one(user_doc)
    user_id_str = str(result.inserted_id)

    # Also persist to doctor_profiles collection
    db.doctor_profiles.update_one(
        {"user_id": user_id_str},
        {"$set": {
            "user_id": user_id_str,
            "email": data.email,
            "full_name": data.full_name,
            "institution": data.institution,
            "license_id": data.license_id,
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )

    # Activity Log entry
    db.activity_logs.insert_one({
        "log_id": "LOG-" + str(uuid.uuid4())[:8],
        "user_id": user_id_str,
        "action": "User Registered Credentials",
        "details": f"Registered doctor profile for {data.email}",
        "timestamp": datetime.utcnow()
    })

    return {
        "msg": "User registered successfully",
        "id": user_id_str,
        "qr_code": qr_data_uri,
        "mfa_enabled": False,
    }


@router.post("/login")
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Database = Depends(get_db),
    totp_code: Optional[str] = Header(None, alias="X-TOTP"),
):
    import uuid
    user = db.users.find_one({"email": form_data.username})
    if not user or not auth.verify_password(form_data.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if user.get("mfa_enabled", False):
        if not totp_code:
            raise HTTPException(status_code=401, detail="MFA code required")
        totp = mfa.totp_from_secret(user.get("totp_secret")) if hasattr(mfa, "totp_from_secret") else None
        if totp and not totp.verify(totp_code):
            raise HTTPException(status_code=401, detail="Invalid MFA code")

    user_id_str = str(user["_id"])
    access_token = auth.create_access_token({"sub": user_id_str})
    response.set_cookie(
        key="access_token", value=access_token,
        httponly=True, max_age=60 * 60 * 24,  # 24 h
        samesite="lax",
    )

    # Activity Log entry
    db.activity_logs.insert_one({
        "log_id": "LOG-" + str(uuid.uuid4())[:8],
        "user_id": user_id_str,
        "action": "User Logged In",
        "details": f"Authenticated session for {user['email']}",
        "timestamp": datetime.utcnow()
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id_str,
            "email": user["email"],
            "full_name": user.get("full_name", ""),
            "institution": user.get("institution", ""),
            "mfa_enabled": user.get("mfa_enabled", False),
        },
    }


@router.post("/logout")
def logout(response: Response, db: Database = Depends(get_db)):
    import uuid
    response.delete_cookie(key="access_token")
    db.activity_logs.insert_one({
        "log_id": "LOG-" + str(uuid.uuid4())[:8],
        "action": "User Logged Out",
        "details": "Terminated user session",
        "timestamp": datetime.utcnow()
    })
    return {"msg": "Logged out"}


@router.get("/me")
def read_me(request: Request, db: Database = Depends(get_db)):
    user = _get_current_user_from_request(request, db)
    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user.get("full_name", ""),
        "institution": user.get("institution", ""),
        "license_id": user.get("license_id", ""),
        "is_active": user.get("is_active", True),
        "mfa_enabled": user.get("mfa_enabled", False),
        "role": user.get("role", "doctor"),
    }


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordSchema, db: Database = Depends(get_db)):
    user = db.users.find_one({"email": payload.email})
    if not user:
        # Don't reveal if email exists — return success anyway
        return {"msg": "If that email exists, a reset link has been sent"}
    
    user_id_str = str(user["_id"])
    token = auth.create_access_token({"sub": user_id_str}, expires_delta=timedelta(hours=1))
    db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "reset_token": token,
            "reset_token_expiry": datetime.utcnow() + timedelta(hours=1)
        }}
    )
    send_reset_email(payload.email, token)
    return {"msg": "If that email exists, a reset link has been sent"}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordSchema, db: Database = Depends(get_db)):
    token_data = auth.decode_access_token(payload.token)
    if not token_data:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    sub = token_data.get("sub")
    user = db.users.find_one({"$or": [{"_id": ObjectId(sub) if ObjectId.is_valid(sub) else sub}, {"email": sub}]})
    if not user or user.get("reset_token") != payload.token:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    expiry = user.get("reset_token_expiry")
    if expiry and expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expired")
    
    hashed = auth.get_password_hash(payload.new_password)
    db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "hashed_password": hashed,
            "reset_token": None,
            "reset_token_expiry": None
        }}
    )
    return {"msg": "Password reset successful"}
