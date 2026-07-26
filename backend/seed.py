"""
PathoAI Backend MongoDB Atlas Database Seeder
Populates MongoDB Atlas collections with clinical seed data and default doctor account.
"""

import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import get_db_instance, init_db
from backend.auth import get_password_hash


def seed_database(reset: bool = False):
    print("[INFO] Connecting to MongoDB Atlas & Initializing Collections...")
    init_db()

    db = get_db_instance()

    try:
        # 1. Create Default Doctor Account
        default_email = "doctor@pathoai.com"
        user = db.users.find_one({"email": default_email})
        if not user:
            user_doc = {
                "email": default_email,
                "hashed_password": get_password_hash("PathoAI2026!"),
                "full_name": "Dr. Akhil Komma",
                "institution": "Apollo Clinical Intelligence Suite",
                "license_id": "DOC2026-AP88",
                "role": "doctor",
                "is_active": True,
                "created_at": datetime.utcnow(),
            }
            res = db.users.insert_one(user_doc)
            doctor_id_str = str(res.inserted_id)
            print(f"[OK] Created default doctor account: {default_email} (Password: PathoAI2026!)")
        else:
            doctor_id_str = str(user["_id"])

        # 2. Seed Sample Patient Biopsy Cases
        patient_count = db.patients.count_documents({})
        if patient_count == 0 or reset:
            if reset:
                db.patients.delete_many({})

            sample_patients = [
                {
                    "patient_uid": "PID-1001",
                    "name": "Eleanor Vance",
                    "age": 54,
                    "gender": "Female",
                    "tissue_type": "Oral Mucosa",
                    "biopsy_site": "Lateral Tongue",
                    "status": "Analyzed",
                    "diagnosis": "Moderate Dysplasia",
                    "risk_score": 68.0,
                    "confidence": 94.2,
                    "risk_label": "High Risk",
                    "image_url": "/src/assets/pathology_slide_sample.png",
                    "notes": "Nuclear hyperchromatism and loss of basal polarity observed in basal 1/3 of epithelium.",
                    "doctor_id": doctor_id_str,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                },
                {
                    "patient_uid": "PID-1002",
                    "name": "Marcus Thorne",
                    "age": 62,
                    "gender": "Male",
                    "tissue_type": "Oral Mucosa",
                    "biopsy_site": "Floor of Mouth",
                    "status": "Analyzed",
                    "diagnosis": "Severe Dysplasia (Carcinoma in Situ)",
                    "risk_score": 89.0,
                    "confidence": 98.7,
                    "risk_label": "Malignant",
                    "image_url": "/src/assets/pathology_slide_sample.png",
                    "notes": "Full-thickness epithelial atypia, pleomorphism and frequent atypical mitotic figures.",
                    "doctor_id": doctor_id_str,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                },
                {
                    "patient_uid": "PID-1003",
                    "name": "Sophia Chen",
                    "age": 41,
                    "gender": "Female",
                    "tissue_type": "Oral Mucosa",
                    "biopsy_site": "Buccal Mucosa",
                    "status": "Pending",
                    "diagnosis": "Awaiting AI Pipeline",
                    "risk_score": 22.0,
                    "confidence": 0.0,
                    "risk_label": "Benign",
                    "image_url": "/src/assets/pathology_slide_sample.png",
                    "notes": "Lichenoid mucositis with basal cell vacuolization.",
                    "doctor_id": doctor_id_str,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                },
                {
                    "patient_uid": "PID-1004",
                    "name": "Arthur Pendelton",
                    "age": 68,
                    "gender": "Male",
                    "tissue_type": "Oral Mucosa",
                    "biopsy_site": "Hard Palate",
                    "status": "Analyzed",
                    "diagnosis": "Mild Dysplasia",
                    "risk_score": 35.0,
                    "confidence": 89.1,
                    "risk_label": "Low Risk",
                    "image_url": "/src/assets/pathology_slide_sample.png",
                    "notes": "Hyperkeratosis with mild basal cell hyperplasia.",
                    "doctor_id": doctor_id_str,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }
            ]

            db.patients.insert_many(sample_patients)
            print(f"[OK] Seeded {len(sample_patients)} clinical biopsy cases into MongoDB Atlas database.")

        # 3. Seed System Settings
        setting_count = db.system_settings.count_documents({})
        if setting_count == 0 or reset:
            if reset:
                db.system_settings.delete_many({})

            default_settings = [
                {"key": "app_name", "value": "PathoAI Clinical Suite", "updated_at": datetime.utcnow()},
                {"key": "ai_model_version", "value": "v2.4-resnet50-oralpath", "updated_at": datetime.utcnow()},
                {"key": "confidence_threshold", "value": "85.0", "updated_at": datetime.utcnow()}
            ]
            db.system_settings.insert_many(default_settings)
            print("[OK] Seeded system configuration settings into MongoDB Atlas.")

        print("\n[SUCCESS] MongoDB Atlas initialization & seeding completed successfully!")

    except Exception as e:
        print(f"[ERROR] Error seeding MongoDB database: {e}")
        raise


if __name__ == "__main__":
    seed_database()
