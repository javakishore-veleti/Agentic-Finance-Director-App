#!/bin/bash
# Start platform service in dev mode
# Prerequisite: PostgreSQL running on port 5433 with afda_platform_db
set -e

echo "🏢 Starting AFDA Platform Service..."
echo "   Port: 8002"
echo "   DB:   afda_platform_db @ localhost:5433"
echo ""

# Create DB if it doesn't exist (using the main PG on 5432 or dedicated on 5433)
# If using same PG instance as CRUD API (port 5432), create DB there:
# PGPASSWORD=afda_secret psql -h localhost -p 5432 -U afda -c "CREATE DATABASE afda_platform_db OWNER afda;" 2>/dev/null || true

# If using dedicated PG container on 5433:
# PGPASSWORD=platform_secret psql -h localhost -p 5433 -U afda_platform -c "SELECT 1;" 2>/dev/null || echo "⚠️  DB not ready"

cd "$(dirname "$0")"
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
