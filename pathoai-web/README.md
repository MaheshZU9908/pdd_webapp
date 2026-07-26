# PathoAI — Web Application

An independent web project for the PathoAI Clinical Suite. Built with plain HTML, CSS, and JavaScript; served via a Node.js static server locally and deployed to GitHub Pages.

## Project Structure

```
pathoai-web/
├── src/                   # Web source files
│   ├── index.html         # Main application entry point
│   ├── css/               # Stylesheets
│   │   └── styles.css
│   ├── js/                # JavaScript modules
│   │   ├── app.js
│   │   ├── server.js      # Local dev static server
│   │   └── sw.js          # Service worker
│   ├── assets/            # Images and static assets
│   └── manifest.json      # PWA manifest
├── tests/
│   ├── e2e/               # Selenium end-to-end tests
│   └── data/              # Test data (CSV, fixtures)
├── .github/workflows/
│   └── web-ci.yml         # CI: E2E tests + GitHub Pages deploy
├── package.json
├── requirements-test.txt  # Python test deps (pytest, selenium)
└── README.md
```

## Prerequisites

- Node.js 20+
- Python 3.10+ (for running tests)
- Google Chrome + ChromeDriver (for Selenium tests)
- The shared **backend** running at `http://127.0.0.1:8000`

## Development

### 1. Start the backend

From the repository root:

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Serve the web app locally

```bash
cd pathoai-web
npm install
npm start
```

Open `http://localhost:3000` (or open `src/index.html` directly in a browser).

## Running Tests

```bash
cd pathoai-web
pip install -r requirements-test.txt
pytest tests/e2e/test_web.py -v
```

## Deployment

The web app is automatically deployed to **GitHub Pages** via the `web-ci.yml` workflow on every push to `main` (after E2E tests pass).

Manual deploy:

```bash
npm run deploy
```

## Related Projects

| Project | Path | Description |
|---|---|---|
| Backend API | `../backend/` | Shared FastAPI backend consumed by this app |
| Mobile App | `../pathoai-mobile/` | Flutter/Android mobile application |
