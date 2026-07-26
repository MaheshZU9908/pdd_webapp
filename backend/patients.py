from fastapi import APIRouter, Depends, HTTPException, status, Request
from pymongo.database import Database
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import random
import string
import re

from .database import get_db
from .models import clean_mongo_doc
from .auth import decode_access_token

router = APIRouter(prefix="/patients", tags=["patients"])


# ── Auth helper ────────────────────────────────────────────────────────────────
def get_current_user(request: Request, db: Database = Depends(get_db)):
    token = request.cookies.get("access_token") or (
        request.headers.get("Authorization", "").replace("Bearer ", "").strip() or None
    )
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    sub = payload.get("sub")
    query = {"$or": [{"_id": ObjectId(sub) if ObjectId.is_valid(sub) else sub}, {"email": sub}]}
    user = db.users.find_one(query)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return clean_mongo_doc(user)


# ── Schemas ────────────────────────────────────────────────────────────────────
class PatientCreate(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    tissue_type: Optional[str] = None
    biopsy_site: Optional[str] = None
    notes: Optional[str] = None
    diagnosis: Optional[str] = None
    risk_score: Optional[float] = None
    confidence: Optional[float] = None
    risk_label: Optional[str] = None
    image_url: Optional[str] = None


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    tissue_type: Optional[str] = None
    biopsy_site: Optional[str] = None
    notes: Optional[str] = None
    diagnosis: Optional[str] = None
    risk_score: Optional[float] = None
    confidence: Optional[float] = None
    risk_label: Optional[str] = None
    status: Optional[str] = None
    image_url: Optional[str] = None


def _uid():
    chars = string.digits
    return "PID-" + "".join(random.choices(chars, k=6))


def _patient_dict(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not doc:
        return None
    p = clean_mongo_doc(doc)
    created = p.get("created_at")
    updated = p.get("updated_at")
    if isinstance(created, datetime):
        p["created_at"] = created.isoformat()
    if isinstance(updated, datetime):
        p["updated_at"] = updated.isoformat()
    return p


# ── Routes ─────────────────────────────────────────────────────────────────────
@router.get("/")
def list_patients(
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    q: Optional[str] = None,
):
    query: Dict[str, Any] = {}
    
    # Filter by doctor if present
    if current_user and "id" in current_user:
        query["$or"] = [{"doctor_id": current_user["id"]}, {"doctor_id": None}]

    if q:
        regex = re.compile(q, re.IGNORECASE)
        search_filter = {"$or": [{"name": regex}, {"patient_uid": regex}]}
        if "$or" in query:
            query = {"$and": [query, search_filter]}
        else:
            query = search_filter

    patients = list(db.patients.find(query).sort("created_at", -1))
    return [_patient_dict(p) for p in patients]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_patient(
    data: PatientCreate,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    uid = _uid()
    while db.patients.find_one({"patient_uid": uid}):
        uid = _uid()

    patient_doc = {
        "patient_uid": uid,
        "name": data.name,
        "age": data.age,
        "gender": data.gender,
        "tissue_type": data.tissue_type,
        "biopsy_site": data.biopsy_site,
        "notes": data.notes,
        "diagnosis": data.diagnosis,
        "risk_score": data.risk_score,
        "confidence": data.confidence,
        "risk_label": data.risk_label or ("Pending" if not data.risk_score else ("Malignant" if data.risk_score > 60 else "Benign")),
        "status": "Pending" if not data.risk_score else "Analyzed",
        "image_url": data.image_url,
        "doctor_id": current_user.get("id"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = db.patients.insert_one(patient_doc)
    patient_doc["_id"] = result.inserted_id
    patient_id_str = str(result.inserted_id)

    import uuid
    # 1. Patient Medical Records collection
    rec_id = "REC-" + str(uuid.uuid4())[:8]
    db.patient_medical_records.insert_one({
        "record_id": rec_id,
        "patient_id": patient_id_str,
        "patient_uid": uid,
        "biopsy_site": data.biopsy_site or "Oral Cavity",
        "tissue_type": data.tissue_type or "Oral Mucosa",
        "notes": data.notes or "",
        "diagnosis": data.diagnosis or "Pending Analysis",
        "doctor_id": current_user.get("id"),
        "created_at": datetime.utcnow()
    })

    # 2. Diagnostic Reports collection
    rep_id = "REP-" + str(uuid.uuid4())[:8]
    db.diagnostic_reports.insert_one({
        "report_uid": rep_id,
        "patient_id": patient_id_str,
        "patient_uid": uid,
        "patient_name": data.name,
        "diagnosis": data.diagnosis or "Pending Analysis",
        "risk_score": data.risk_score or 0.0,
        "confidence": data.confidence or 0.0,
        "detailed_findings": data.notes or "Oral biopsy specimen submitted for digital MIL analysis.",
        "status": "Final" if data.risk_score else "Draft",
        "created_at": datetime.utcnow(),
        "created_by": current_user.get("id")
    })

    # 3. Activity Logs collection
    db.activity_logs.insert_one({
        "log_id": "LOG-" + str(uuid.uuid4())[:8],
        "user_id": current_user.get("id"),
        "action": "Patient Biopsy Record Registered",
        "details": f"Created patient case {data.name} ({uid})",
        "timestamp": datetime.utcnow()
    })

    return _patient_dict(patient_doc)


def _find_patient_query(patient_id: str):
    pid_str = str(patient_id)
    or_list = [
        {"_id": pid_str},
        {"patient_uid": pid_str},
        {"id": pid_str}
    ]
    if ObjectId.is_valid(pid_str):
        or_list.append({"_id": ObjectId(pid_str)})
    try:
        or_list.append({"id": int(pid_str)})
    except (ValueError, TypeError):
        pass
    return {"$or": or_list}


@router.get("/{patient_id}")
def get_patient(
    patient_id: str,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    p = db.patients.find_one(_find_patient_query(patient_id))
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    return _patient_dict(p)


@router.put("/{patient_id}")
def update_patient(
    patient_id: str,
    data: PatientUpdate,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    import uuid
    p = db.patients.find_one(_find_patient_query(patient_id))
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    update_data = {k: v for k, v in data.dict(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.utcnow()
    
    db.patients.update_one({"_id": p["_id"]}, {"$set": update_data})
    updated_doc = db.patients.find_one({"_id": p["_id"]})

    patient_str_id = str(p["_id"])
    # Cascade update to diagnostic reports
    report_updates = {}
    if "diagnosis" in update_data:
        report_updates["diagnosis"] = update_data["diagnosis"]
    if "risk_score" in update_data:
        report_updates["risk_score"] = update_data["risk_score"]
    if "confidence" in update_data:
        report_updates["confidence"] = update_data["confidence"]
    if "notes" in update_data:
        report_updates["detailed_findings"] = update_data["notes"]
    
    if report_updates:
        db.diagnostic_reports.update_many({"patient_id": patient_str_id}, {"$set": report_updates})
        db.patient_medical_records.update_many({"patient_id": patient_str_id}, {"$set": report_updates})

    # Activity Log entry
    db.activity_logs.insert_one({
        "log_id": "LOG-" + str(uuid.uuid4())[:8],
        "user_id": current_user.get("id"),
        "action": "Patient Biopsy Record Updated",
        "details": f"Updated patient record for {p.get('name')} ({p.get('patient_uid')})",
        "timestamp": datetime.utcnow()
    })

    return _patient_dict(updated_doc)


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: str,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    import uuid
    p = db.patients.find_one(_find_patient_query(patient_id))
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    patient_str_id = str(p["_id"])
    # Delete related documents across collections
    db.patients.delete_one({"_id": p["_id"]})
    db.patient_medical_records.delete_many({"$or": [{"patient_id": patient_str_id}, {"patient_uid": p.get("patient_uid")}]})
    db.diagnostic_reports.delete_many({"$or": [{"patient_id": patient_str_id}, {"patient_uid": p.get("patient_uid")}]})
    db.uploaded_pathology_images.delete_many({"patient_id": patient_str_id})
    db.ai_prediction_results.delete_many({"patient_id": patient_str_id})
    db.analysis_images.delete_many({"patient_id": patient_str_id})
    db.prediction_history.delete_many({"patient_id": patient_str_id})

    # Activity Log entry
    db.activity_logs.insert_one({
        "log_id": "LOG-" + str(uuid.uuid4())[:8],
        "user_id": current_user.get("id"),
        "action": "Patient Record Deleted",
        "details": f"Deleted patient case {p.get('name')} ({p.get('patient_uid')})",
        "timestamp": datetime.utcnow()
    })

    return None

