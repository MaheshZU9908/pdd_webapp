# PathoAI Clinical Suite

AI-powered pathology clinical suite. This repository is organized as a **monorepo** containing three independent areas:

---

## Repository Structure

```
PathoAI/
├── backend/            ← Shared FastAPI REST API (Python)
├── pathoai-web/        ← Website (HTML/CSS/JS) — independent project
├── pathoai-mobile/     ← Mobile App (Flutter + Android) — independent project
├── docs/               ← Project documentation
└── .github/workflows/
    └── main.yml        ← Backend-only CI
```

---

## Projects

### 🔗 Backend API (`backend/`)
The shared FastAPI backend consumed by both the web app and mobile app.

- **Language**: Python 3.10+
- **Framework**: FastAPI + Uvicorn
- **Database**: SQLite (via SQLAlchemy)
- **Features**: Auth (JWT + MFA), patient records, AI pathology predictions

**Quick start:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

---

### 🌐 Web Application (`pathoai-web/`)
An independent browser-based frontend for the PathoAI suite.

- **Stack**: HTML5, CSS3, Vanilla JavaScript
- **Tests**: Selenium E2E
- **Deploy**: GitHub Pages (automatic on merge to `main`)
- **CI**: `pathoai-web/.github/workflows/web-ci.yml`

See [`pathoai-web/README.md`](./pathoai-web/README.md) for full setup instructions.

---

### 📱 Mobile Application (`pathoai-mobile/`)
An independent Flutter (iOS/Android) and native Android application.

- **Stack**: Flutter / Dart + Kotlin (Android)
- **Tests**: Flutter unit tests + Appium E2E
- **CI**: `pathoai-mobile/.github/workflows/mobile-ci.yml`

See [`pathoai-mobile/README.md`](./pathoai-mobile/README.md) for full setup instructions.

---

## Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/MaheshZU9908/pdd_patho.git
cd PathoAI
```

### 2. Start the backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Run the web app
```bash
cd pathoai-web
npm install && npm start
```

### 4. Run the mobile app
```bash
cd pathoai-mobile/flutter
flutter pub get && flutter run
```

---

## CI/CD Overview

| Workflow | Trigger | Scope |
|---|---|---|
| `main.yml` | Changes to `backend/` | Backend health check |
| `web-ci.yml` | Changes to `pathoai-web/` or `backend/` | E2E tests + GitHub Pages deploy |
| `mobile-ci.yml` | Changes to `pathoai-mobile/` or `backend/` | Flutter tests + APK build |

---

## License

MIT
