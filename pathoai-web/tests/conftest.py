# pathoai-web — pytest configuration & shared fixtures
#
# Placed at pathoai-web/tests/ so pytest can find it from the tests/ dir.
# Run from pathoai-web/: pytest tests/e2e/test_web.py -v

import os
import sys
import pytest

# ── Make e2e test modules importable ────────────────────────────────────────────
E2E_DIR = os.path.join(os.path.dirname(__file__), "e2e")
if E2E_DIR not in sys.path:
    sys.path.insert(0, E2E_DIR)


# ── Shared pytest configuration ──────────────────────────────────────────────────
def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line("markers", "smoke: quick sanity tests")
    config.addinivalue_line("markers", "auth: authentication tests")
    config.addinivalue_line("markers", "patients: patient record tests")
    config.addinivalue_line("markers", "upload: image upload tests")


# ── Base URL fixture ─────────────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def web_base_url():
    """
    Base URL for the web app under test.
    Override via WEB_BASE_URL environment variable.
    Default: http://127.0.0.1:8000 (backend serving the frontend).
    """
    return os.environ.get("WEB_BASE_URL", "http://127.0.0.1:8000")
