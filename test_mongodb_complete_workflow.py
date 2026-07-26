import requests
import json
import uuid

BASE_URL = "http://127.0.0.1:8000"

def test_full_workflow():
    session = requests.Session()
    
    # 1. Health check
    print("--- 1. Testing Health Check ---")
    res = session.get(f"{BASE_URL}/health")
    assert res.status_code == 200
    print("Health response:", res.json())
    
    # 2. Register
    test_email = f"doctor_{uuid.uuid4().hex[:6]}@pathoai.com"
    print(f"\n--- 2. Registering User ({test_email}) ---")
    reg_data = {
        "email": test_email,
        "password": "TestPassword123!",
        "full_name": "Dr. Test Pathologist",
        "institution": "Atlas Pathology Lab",
        "license_id": "LIC-998877"
    }
    res = session.post(f"{BASE_URL}/auth/register", json=reg_data)
    assert res.status_code == 201, f"Reg failed: {res.text}"
    print("Register response:", res.json())
    
    # 3. Login
    print("\n--- 3. Logging in ---")
    login_data = {"username": test_email, "password": "TestPassword123!"}
    res = session.post(f"{BASE_URL}/auth/login", data=login_data)
    assert res.status_code == 200, f"Login failed: {res.text}"
    user_info = res.json()
    print("Login response:", user_info)
    
    # 4. Get Current User Me
    print("\n--- 4. Checking /auth/me ---")
    res = session.get(f"{BASE_URL}/auth/me")
    assert res.status_code == 200
    print("Me response:", res.json())
    
    # 5. Create Patient
    print("\n--- 5. Registering Patient Biopsy ---")
    patient_payload = {
        "name": "Jane Doe Verification",
        "age": 48,
        "gender": "Female",
        "tissue_type": "Oral Epithelium",
        "biopsy_site": "Lateral Tongue",
        "notes": "Erythroplakia observed on lateral border of tongue."
    }
    res = session.post(f"{BASE_URL}/patients/", json=patient_payload)
    assert res.status_code == 201, f"Patient create failed: {res.text}"
    created_patient = res.json()
    patient_id = created_patient["id"]
    patient_uid = created_patient["patient_uid"]
    print(f"Created Patient ID: {patient_id}, UID: {patient_uid}")
    
    # 6. List Patients
    print("\n--- 6. Fetching Patients List from MongoDB ---")
    res = session.get(f"{BASE_URL}/patients/")
    assert res.status_code == 200
    patients_list = res.json()
    print(f"Total patients in MongoDB: {len(patients_list)}")
    match = [p for p in patients_list if p["id"] == patient_id]
    assert len(match) == 1, "Created patient not found in list!"
    print("Matched patient from MongoDB:", match[0])
    
    # 7. AI Slide Prediction & Analysis
    print("\n--- 7. Uploading Slide Image & Running AI Prediction ---")
    dummy_img_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x03\x00\x05\xfe\x02\xfe\xa7\x35\x81\x84\x00\x00\x00\x00IEND\xaeB`\x82"
    files = {'file': ('test_slide.png', dummy_img_content, 'image/png')}
    data = {'patient_id': patient_id}
    res = session.post(f"{BASE_URL}/predict", files=files, data=data)
    assert res.status_code == 200, f"Predict failed: {res.text}"
    pred_res = res.json()
    print("AI Prediction Result saved to MongoDB:", pred_res)
    
    # 8. Verify Patient Updated Status in MongoDB
    print("\n--- 8. Verifying Patient Record Updated with AI Staging in MongoDB ---")
    res = session.get(f"{BASE_URL}/patients/{patient_id}")
    assert res.status_code == 200
    updated_p = res.json()
    print("Updated Patient Record:", updated_p)
    assert updated_p["status"] == "Analyzed"
    assert updated_p["risk_score"] == pred_res["risk_score"]
    
    # 9. Verify Dashboard Statistics
    print("\n--- 9. Verifying Dashboard Statistics in MongoDB ---")
    res = session.get(f"{BASE_URL}/dashboard")
    assert res.status_code == 200
    dash = res.json()
    print("Dashboard Data:", dash)
    
    # 10. Verify Prediction History
    print("\n--- 10. Verifying Prediction History in MongoDB ---")
    res = session.get(f"{BASE_URL}/history")
    assert res.status_code == 200
    hist = res.json()
    print(f"Total history entries in MongoDB: {len(hist)}")
    
    print("\n=======================================================")
    print("[SUCCESS] ALL MONGODB VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=======================================================")

if __name__ == "__main__":
    test_full_workflow()
