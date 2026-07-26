@echo off
REM ─────────────────────────────────────────────────────────────
REM  pathoai-web — Start local development server
REM  Usage: scripts\start.bat [API_URL] [PORT]
REM  Example: scripts\start.bat http://127.0.0.1:8000 5500
REM ─────────────────────────────────────────────────────────────

SET PATHOAI_API_BASE_URL=%1
IF "%PATHOAI_API_BASE_URL%"=="" SET PATHOAI_API_BASE_URL=http://127.0.0.1:8000

SET PORT=%2
IF "%PORT%"=="" SET PORT=5500

ECHO.
ECHO  pathoai-web dev server
ECHO  Backend API: %PATHOAI_API_BASE_URL%
ECHO  Port:        %PORT%
ECHO.

node src\js\server.js
