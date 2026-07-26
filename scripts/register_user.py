import json, urllib.request, urllib.error

url = "http://127.0.0.1:8000/auth/register"
payload = {
    "full_name": "Akhil",
    "license_id": "DOC2026001",
    "institution": "Apollo Hospitals Chennai",
    "email": "akhilkomma7@gmail.com",
    "password": "Pass123!"
}

data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req) as resp:
        print("SUCCESS:", resp.read().decode())
except urllib.error.HTTPError as e:
    res_body = e.read().decode()
    if e.code == 400 and "Email already registered" in res_body:
        print("SUCCESS: User already registered and ready to login.")
    else:
        print("ERROR:", e.code, res_body)
except Exception as e:
    print("EXCEPTION:", e)
