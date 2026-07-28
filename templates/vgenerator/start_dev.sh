#!/bin/bash
# VGenerator — Development Start Script
# Starts both the backend server and the frontend dev server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  VGenerator — AI Video Generator"
echo "=========================================="

# Check for .env
if [ -f .env ]; then
  echo "Loading environment from .env..."
  set -a
  source .env
  set +a
fi

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
npm install --silent 2>/dev/null

# Install backend dependencies
echo "📦 Installing backend dependencies..."
pip install -q fastapi uvicorn pydantic 2>/dev/null || python3 -m pip install -q fastapi uvicorn pydantic 2>/dev/null || uv pip install fastapi uvicorn pydantic 2>/dev/null

# Start backend server in background
echo ""
echo "🚀 Starting backend server on port ${VGEN_PORT:-8090}..."
python3 server.py "${VGEN_PORT:-8090}" &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# Give backend a moment to start
sleep 1

# Start frontend dev server
echo "🚀 Starting frontend dev server on port 5173..."
echo ""
echo "  Open: http://localhost:5173"
echo "=========================================="
echo ""
npx vite --host
