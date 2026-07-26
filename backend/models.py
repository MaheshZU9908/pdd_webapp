"""
PathoAI Data Models & Schema Definitions for all 14 MongoDB Collections.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


def clean_mongo_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Converts MongoDB BSON document dict to clean JSON-serializable dict (converting ObjectId to str/int)."""
    if not doc:
        return None
    res = dict(doc)
    if "_id" in res:
        res["id"] = str(res.pop("_id"))
    return res


# ── 1. Users Collection Schema ────────────────────────────────────────────────
class UserModel(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    hashed_password: str
    full_name: Optional[str] = ""
    institution: Optional[str] = ""
    license_id: Optional[str] = ""
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    totp_secret: Optional[str] = None
    mfa_enabled: bool = False
    role: str = "doctor"
    reset_token: Optional[str] = None
    reset_token_expiry: Optional[datetime] = None


# ── 2. Doctor Profiles Collection Schema ─────────────────────────────────────
class DoctorProfileModel(BaseModel):
    id: Optional[str] = None
    user_id: str
    email: EmailStr
    full_name: str
    institution: Optional[str] = ""
    license_id: Optional[str] = ""
    specialty: Optional[str] = "Oral Pathology"
    phone: Optional[str] = ""
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── 3. Patients Collection Schema ─────────────────────────────────────────────
class PatientModel(BaseModel):
    id: Optional[str] = None
    patient_uid: str
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
    status: str = "Pending"
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    doctor_id: Optional[str] = None


# ── 4. Patient Medical Records Collection Schema ─────────────────────────────
class PatientMedicalRecordModel(BaseModel):
    id: Optional[str] = None
    record_id: str
    patient_id: str
    patient_uid: Optional[str] = None
    biopsy_site: Optional[str] = None
    tissue_type: Optional[str] = None
    notes: Optional[str] = None
    diagnosis: Optional[str] = "Pending Analysis"
    doctor_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ── 5. Uploaded Pathology Images Collection Schema ───────────────────────────
class UploadedPathologyImageModel(BaseModel):
    id: Optional[str] = None
    image_id: str
    patient_id: Optional[str] = None
    user_id: Optional[str] = None
    filename: str
    file_path: Optional[str] = None
    file_url: Optional[str] = None
    size_bytes: Optional[int] = 0
    content_type: Optional[str] = "image/png"
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)


# ── 6. AI Prediction Results Collection Schema ───────────────────────────────
class AIPredictionResultModel(BaseModel):
    id: Optional[str] = None
    prediction_id: str
    image_id: Optional[str] = None
    patient_id: Optional[str] = None
    user_id: Optional[str] = None
    label: str
    prediction: str
    confidence: float
    risk_score: float
    description: Optional[str] = None
    tiles_processed: int = 256
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ── 7. Analysis Images Collection Schema ──────────────────────────────────────
class AnalysisImageModel(BaseModel):
    id: Optional[str] = None
    analysis_id: str
    prediction_id: Optional[str] = None
    patient_id: Optional[str] = None
    heatmap_url: Optional[str] = None
    file_path: Optional[str] = None
    roi_boxes: Optional[List[Dict[str, Any]]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ── 8. Diagnostic Reports Collection Schema ──────────────────────────────────
class DiagnosticReportModel(BaseModel):
    id: Optional[str] = None
    report_uid: str
    patient_id: str
    patient_uid: Optional[str] = None
    patient_name: Optional[str] = None
    slide_id: Optional[str] = None
    diagnosis: str
    risk_score: float
    confidence: float
    detailed_findings: Optional[str] = None
    recommendations: Optional[str] = None
    status: str = "Draft"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None


# ── 9. Prediction History Collection Schema ──────────────────────────────────
class PredictionHistoryModel(BaseModel):
    id: Optional[str] = None
    history_id: str
    prediction_id: str
    patient_id: Optional[str] = None
    user_id: Optional[str] = None
    risk_score: float
    confidence: float
    label: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ── 10. Dashboard Statistics Collection Schema ───────────────────────────────
class DashboardStatisticsModel(BaseModel):
    id: Optional[str] = None
    stat_type: str = "summary"
    total_patients: int = 0
    analyzed_patients: int = 0
    high_risk_patients: int = 0
    pending_patients: int = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── 11. Notifications Collection Schema ──────────────────────────────────────
class NotificationModel(BaseModel):
    id: Optional[str] = None
    notification_id: str
    user_id: Optional[str] = None
    message: str
    type: str = "info"
    read: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ── 12. Activity Logs Collection Schema ──────────────────────────────────────
class ActivityLogModel(BaseModel):
    id: Optional[str] = None
    log_id: str
    user_id: Optional[str] = None
    action: str
    details: Optional[str] = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ── 13. User Settings Collection Schema ──────────────────────────────────────
class UserSettingModel(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    key: str
    value: Any
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── 14. Search History Collection Schema ──────────────────────────────────────
class SearchHistoryModel(BaseModel):
    id: Optional[str] = None
    search_id: str
    user_id: Optional[str] = None
    query: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

