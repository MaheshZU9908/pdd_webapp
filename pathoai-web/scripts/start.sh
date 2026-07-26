#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  pathoai-web — Start local development server
#  Usage: ./scripts/start.sh [API_URL] [PORT]
#  Example: ./scripts/start.sh http://127.0.0.1:8000 5500
# ─────────────────────────────────────────────────────────────

PATHOAI_API_BASE_URL="${1:-http://127.0.0.1:8000}"
PORT="${2:-5500}"

export PATHOAI_API_BASE_URL
export PORT

echo ""
echo "  pathoai-web dev server"
echo "  Backend API: $PATHOAI_API_BASE_URL"
echo "  Port:        $PORT"
echo ""

node src/js/server.js
