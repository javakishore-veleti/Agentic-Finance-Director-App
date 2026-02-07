#!/bin/bash
# Start Platform Service in development mode
VENV="${HOME}/runtime_data/python_venvs/Agentic-Finance-Director-App_venv"
if [ -d "$VENV" ]; then
    exec "$VENV/bin/uvicorn" app.main:app --reload --host 0.0.0.0 --port 8002
else
    exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
fi
