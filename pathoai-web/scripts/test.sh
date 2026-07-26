#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  pathoai-web — Run Selenium E2E tests
#  Usage: ./scripts/test.sh [BASE_URL]
# ─────────────────────────────────────────────────────────────
WEB_BASE_URL="${1:-http://127.0.0.1:8000}"
export WEB_BASE_URL

echo "Running Selenium E2E tests against: $WEB_BASE_URL"
cd tests && python -m pytest e2e/test_web.py -v --tb=short
