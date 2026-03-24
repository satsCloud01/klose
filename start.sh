#!/bin/bash
set -e

cd "$(dirname "$0")"

# Backend setup
if [ ! -d "backend/.venv" ]; then
  echo "Creating backend virtual environment..."
  python3 -m venv backend/.venv
  backend/.venv/bin/pip install -r backend/requirements.txt
fi

# Frontend setup
if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd frontend && /usr/local/bin/npm install && cd ..
fi

echo "Starting Klose CRM..."
echo "  Backend:  http://localhost:8007"
echo "  Frontend: http://localhost:5179"

# Start backend
cd backend && PYTHONPATH=src .venv/bin/uvicorn klose.main:app --reload --port 8007 &
BACKEND_PID=$!

# Start frontend
cd ../frontend && /usr/local/bin/npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
