@echo off
REM ─────────────────────────────────────────────────────────────
REM  pathoai-web — Run Selenium E2E tests
REM  Usage: scripts\test.bat [BASE_URL]
REM  Example: scripts\test.bat http://127.0.0.1:8000
REM ─────────────────────────────────────────────────────────────

SET WEB_BASE_URL=%1
IF "%WEB_BASE_URL%"=="" SET WEB_BASE_URL=http://127.0.0.1:8000

ECHO Running Selenium E2E tests against: %WEB_BASE_URL%

cd tests
python -m pytest e2e\test_web.py -v --tb=short
