import os
import json
import uuid
import time
from datetime import datetime
from pymongo import MongoClient, ASCENDING
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DEFAULT_MONGO_URI = "mongodb+srv://lakshmimahesh248_db_user:8VVlZZLthEHdMarq@cluster0.a9elc1z.mongodb.net/?appName=Cluster0"
MONGO_URI = os.getenv("MONGO_URI", DEFAULT_MONGO_URI)
DB_NAME = os.getenv("DB_NAME", "pathoai_db")

_client = None

# Helper to match mongo queries
def _match_query(doc, query):
    if not query:
        return True
    for k, v in query.items():
        if k == "$or":
            if not any(_match_query(doc, sub) for sub in v):
                return False
        elif isinstance(v, dict):
            val = doc.get(k)
            for op, op_val in v.items():
                if op == "$gte" and not (val is not None and val >= op_val):
                    return False
                elif op == "$lte" and not (val is not None and val <= op_val):
                    return False
                elif op == "$gt" and not (val is not None and val > op_val):
                    return False
                elif op == "$lt" and not (val is not None and val < op_val):
                    return False
                elif op == "$ne" and not (val != op_val):
                    return False
        else:
            doc_val = doc.get(k)
            if str(doc_val) != str(v):
                return False
    return True

# Mock PyMongo implementation for local offline demo fallback
class MockCursor:
    def __init__(self, items):
        self.items = list(items)

    def sort(self, key, direction=1):
        reverse = (direction == -1)
        def sort_key(x):
            v = x.get(key)
            if v is None:
                return ""
            if hasattr(v, 'isoformat'):
                return v.isoformat()
            return str(v)
        self.items.sort(key=sort_key, reverse=reverse)
        return self

    def limit(self, count):
        self.items = self.items[:count]
        return self

    def __iter__(self):
        return iter(self.items)

    def __getitem__(self, index):
        return self.items[index]

class MockCollection:
    def __init__(self, db, name):
        self.db = db
        self.name = name

    def _get_data(self):
        if self.name not in self.db._data:
            self.db._data[self.name] = []
        return self.db._data[self.name]

    def _save(self):
        self.db._save_to_file()

    def insert_one(self, document):
        doc = dict(document)
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4())
        self._get_data().append(doc)
        self._save()
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc["_id"])

    def insert_many(self, documents):
        inserted_ids = []
        for document in documents:
            doc = dict(document)
            if "_id" not in doc:
                doc["_id"] = str(uuid.uuid4())
            self._get_data().append(doc)
            inserted_ids.append(doc["_id"])
        self._save()
        class InsertManyResult:
            def __init__(self, ids):
                self.inserted_ids = ids
        return InsertManyResult(inserted_ids)

    def find_one(self, query=None):
        if query is None:
            query = {}
        for doc in self._get_data():
            if _match_query(doc, query):
                return dict(doc)
        return None

    def find(self, query=None):
        if query is None:
            query = {}
        results = []
        for doc in self._get_data():
            if _match_query(doc, query):
                results.append(dict(doc))
        return MockCursor(results)

    def count_documents(self, query=None):
        if query is None:
            query = {}
        count = 0
        for doc in self._get_data():
            if _match_query(doc, query):
                count += 1
        return count

    def update_one(self, query, update, upsert=False):
        matched_doc = None
        for doc in self._get_data():
            if _match_query(doc, query):
                matched_doc = doc
                break

        class UpdateResult:
            def __init__(self, modified, matched, upserted_id=None):
                self.modified_count = modified
                self.matched_count = matched
                self.upserted_id = upserted_id

        if matched_doc:
            if "$set" in update:
                for k, v in update["$set"].items():
                    matched_doc[k] = v
            self._save()
            return UpdateResult(1, 1)
        elif upsert:
            new_doc = {}
            for k, v in query.items():
                if not k.startswith("$"):
                    new_doc[k] = v
            if "$set" in update:
                for k, v in update["$set"].items():
                    new_doc[k] = v
            res = self.insert_one(new_doc)
            return UpdateResult(0, 0, res.inserted_id)
        return UpdateResult(0, 0)

    def update_many(self, query, update):
        modified = 0
        for doc in self._get_data():
            if _match_query(doc, query):
                if "$set" in update:
                    for k, v in update["$set"].items():
                        doc[k] = v
                    modified += 1
        if modified > 0:
            self._save()
        class UpdateResult:
            def __init__(self, count):
                self.modified_count = count
        return UpdateResult(modified)

    def delete_many(self, query):
        data = self._get_data()
        original_len = len(data)
        new_data = [doc for doc in data if not _match_query(doc, query)]
        self.db._data[self.name] = new_data
        self._save()
        class DeleteResult:
            def __init__(self, count):
                self.deleted_count = count
        return DeleteResult(original_len - len(new_data))

    def create_index(self, keys, unique=False):
        return self.name + "_index"

class MockDatabase:
    def __init__(self, filepath):
        self._filepath = filepath
        self._data = {}
        self._load_from_file()
        self._seed_initial_data()

    def _load_from_file(self):
        try:
            if os.path.exists(self._filepath):
                with open(self._filepath, 'r') as f:
                    self._data = json.load(f)
        except Exception as e:
            print(f"[WARN] Failed to load mock database: {e}")
            self._data = {}

    def _save_to_file(self):
        try:
            with open(self._filepath, 'w') as f:
                json.dump(self._data, f, default=str, indent=2)
        except Exception as e:
            print(f"[WARN] Failed to save mock database: {e}")

    def __getattr__(self, name):
        return MockCollection(self, name)

    def __getitem__(self, name):
        return MockCollection(self, name)

    def command(self, cmd_name):
        return {"ok": 1}

    def _seed_initial_data(self):
        # 1. User (Dr. Akhil Komma)
        if "users" not in self._data or not self._data["users"]:
            import bcrypt
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw("PathoAI2026!".encode('utf-8'), salt).decode('utf-8')
            doctor_id = "mock_doctor_id"
            self._data["users"] = [{
                "_id": doctor_id,
                "email": "doctor@pathoai.com",
                "hashed_password": hashed,
                "full_name": "Dr. Akhil Komma",
                "institution": "Apollo Clinical Intelligence Suite",
                "license_id": "DOC2026-AP88",
                "role": "doctor",
                "is_active": True,
                "created_at": datetime.utcnow().isoformat()
            }]
        else:
            doctor_id = self._data["users"][0].get("_id", "mock_doctor_id")

        # 2. Patients
        if "patients" not in self._data or not self._data["patients"]:
            self._data["patients"] = [
                {
                    "_id": "mock_patient_1",
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
                    "image_url": "/pathology_slide_sample.png",
                    "notes": "Nuclear hyperchromatism and loss of basal polarity observed in basal 1/3 of epithelium.",
                    "doctor_id": doctor_id,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                },
                {
                    "_id": "mock_patient_2",
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
                    "image_url": "/pathology_slide_sample.png",
                    "notes": "Full-thickness epithelial atypia, pleomorphism and frequent atypical mitotic figures.",
                    "doctor_id": doctor_id,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                },
                {
                    "_id": "mock_patient_3",
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
                    "doctor_id": doctor_id,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                },
                {
                    "_id": "mock_patient_4",
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
                    "doctor_id": doctor_id,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                }
            ]

        # 3. Settings
        if "system_settings" not in self._data or not self._data["system_settings"]:
            self._data["system_settings"] = [
                {"key": "app_name", "value": "PathoAI Clinical Suite", "updated_at": datetime.utcnow().isoformat()},
                {"key": "ai_model_version", "value": "v2.4-resnet50-oralpath", "updated_at": datetime.utcnow().isoformat()},
                {"key": "confidence_threshold", "value": "85.0", "updated_at": datetime.utcnow().isoformat()}
            ]
        self._save_to_file()

class MockClient:
    def __init__(self, filepath):
        self.filepath = filepath
        self.db = MockDatabase(filepath)

    def __getitem__(self, db_name):
        return self.db

    @property
    def admin(self):
        class MockAdmin:
            def command(self, cmd):
                return {"ok": 1}
        return MockAdmin()

def get_client() -> MongoClient:
    """
    Connect to MongoDB Atlas using the configured connection string.
    If remote SSL/TLS or network connection fails, fall back gracefully to a local MongoDB instance.
    If both fail, falls back gracefully to a MockClient so the app remains fully functional.
    """
    global _client
    if _client is not None:
        return _client

    try:
        client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=2000,
            tls=True,
        )
        client.admin.command("ping")
        print("[OK] Connected to MongoDB Atlas.")
        _client = client
        return _client
    except (ServerSelectionTimeoutError, PyMongoError) as e:
        print(f"[WARN] Could not connect to MongoDB Atlas: {e}")
        local_uri = os.getenv("LOCAL_MONGO_URI", "mongodb://127.0.0.1:27017")
        try:
            client = MongoClient(local_uri, serverSelectionTimeoutMS=1000)
            client.admin.command("ping")
            print(f"[OK] Connected to fallback local MongoDB at {local_uri} for database: '{DB_NAME}'")
            _client = client
            return _client
        except Exception as e2:
            print("[WARN] All MongoDB connection attempts failed. Falling back to local MockClient.")
            mock_path = os.path.join(os.path.dirname(__file__), "mock_db.json")
            _client = MockClient(mock_path)
            return _client

def get_db():
    client = get_client()
    db = client[DB_NAME]
    try:
        yield db
    finally:
        pass

def get_db_instance():
    """Direct database instance accessor for scripts and internal workers."""
    return get_client()[DB_NAME]

def init_db():
    """Ensure MongoDB collections and required indexes exist.
    If the database is unreachable or a MockClient is used, it skips index creation gracefully.
    """
    try:
        db = get_db_instance()
    except Exception as e:
        print(f"[WARN] Skipping DB initialization because connection failed: {e}")
        return
    
    if isinstance(db, MockDatabase):
        print("[OK] MockDatabase initialized with offline seed data.")
        return

    try:
        # 1. Users collection
        db.users.create_index([("email", ASCENDING)], unique=True)

        # 2. Doctor Profiles collection
        db.doctor_profiles.create_index([("user_id", ASCENDING)], unique=True)
        db.doctor_profiles.create_index([("email", ASCENDING)])

        # 3. Patients collection
        db.patients.create_index([("patient_uid", ASCENDING)], unique=True)
        db.patients.create_index([("doctor_id", ASCENDING)])
        db.patients.create_index([("status", ASCENDING)])

        # 4. Patient Medical Records collection
        db.patient_medical_records.create_index([("record_id", ASCENDING)], unique=True)
        db.patient_medical_records.create_index([("patient_id", ASCENDING)])

        # 5. Uploaded Pathology Images collection
        db.uploaded_pathology_images.create_index([("image_id", ASCENDING)], unique=True)
        db.uploaded_pathology_images.create_index([("patient_id", ASCENDING)])

        # 6. AI Prediction Results collection
        db.ai_prediction_results.create_index([("prediction_id", ASCENDING)], unique=True)
        db.ai_prediction_results.create_index([("patient_id", ASCENDING)])

        # 7. Analysis Images collection
        db.analysis_images.create_index([("analysis_id", ASCENDING)], unique=True)
        db.analysis_images.create_index([("patient_id", ASCENDING)])

        # 8. Diagnostic Reports collection
        db.diagnostic_reports.create_index([("report_uid", ASCENDING)], unique=True)
        db.diagnostic_reports.create_index([("patient_id", ASCENDING)])

        # 9. Prediction History collection
        db.prediction_history.create_index([("history_id", ASCENDING)], unique=True)
        db.prediction_history.create_index([("patient_id", ASCENDING)])

        # 10. Dashboard Statistics collection
        db.dashboard_statistics.create_index([("stat_type", ASCENDING)], unique=True)

        # 11. Notifications collection
        db.notifications.create_index([("notification_id", ASCENDING)], unique=True)
        db.notifications.create_index([("user_id", ASCENDING)])

        # 12. Activity Logs collection
        db.activity_logs.create_index([("log_id", ASCENDING)], unique=True)
        db.activity_logs.create_index([("user_id", ASCENDING)])
        db.activity_logs.create_index([("timestamp", ASCENDING)])

        # 13. User Settings collection
        db.user_settings.create_index([("user_id", ASCENDING)])
        db.user_settings.create_index([("key", ASCENDING)])

        # 14. Search History collection
        db.search_history.create_index([("search_id", ASCENDING)], unique=True)
        db.search_history.create_index([("user_id", ASCENDING)])

        print(f"[OK] Verified and initialized 14 MongoDB collections in '{DB_NAME}'")
    except Exception as err:
        print(f"[WARN] Error initializing database indexes: {err}")
