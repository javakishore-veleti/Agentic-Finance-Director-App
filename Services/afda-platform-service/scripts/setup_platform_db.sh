#!/bin/bash
###############################################################################
# setup_platform_db.sh
# Brings the platform service database under Alembic migration control.
#
# Usage:
#   cd Services/afda-platform-service
#   bash scripts/setup_platform_db.sh [fresh|existing]
#
#   fresh    - New laptop, empty DB  -> alembic upgrade head
#   existing - Current dev DB        -> ALTER + alembic stamp head
#
# After this script, all future changes go through:
#   alembic revision -m "description"  (create migration)
#   alembic upgrade head               (apply migration)
###############################################################################
set -e

MODE="${1:-detect}"
DB_URL="postgresql://afda_platform:platform_secret@localhost:5433/afda_platform_db"

echo "========================================"
echo "  Platform Service DB Setup (Alembic)"
echo "========================================"

# Auto-detect if tables exist
if [ "$MODE" = "detect" ]; then
    TABLE_EXISTS=$(psql "$DB_URL" -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer');" 2>/dev/null || echo "false")
    if [ "$TABLE_EXISTS" = "t" ]; then
        MODE="existing"
    else
        MODE="fresh"
    fi
    echo "  Auto-detected: $MODE database"
fi

echo "  Mode: $MODE"
echo ""

if [ "$MODE" = "fresh" ]; then
    echo "--- Fresh install: creating all tables via Alembic ---"
    alembic upgrade head
    echo ""
    echo "  Done. All 11 tables created."

elif [ "$MODE" = "existing" ]; then
    echo "--- Existing DB: adding missing columns + stamping ---"
    echo ""

    # Add the 5 new columns (safe to re-run)
    psql "$DB_URL" -c "
        ALTER TABLE platform_user     ADD COLUMN IF NOT EXISTS department    VARCHAR(100);
        ALTER TABLE api_key            ADD COLUMN IF NOT EXISTS last_used_at  TIMESTAMP;
        ALTER TABLE data_connection    ADD COLUMN IF NOT EXISTS last_error    TEXT;
        ALTER TABLE platform_setting   ADD COLUMN IF NOT EXISTS description  VARCHAR(500);
        ALTER TABLE audit_log          ADD COLUMN IF NOT EXISTS actor_email  VARCHAR(300);
    "
    echo "  + 5 columns added (IF NOT EXISTS)"
    echo ""

    # Stamp alembic to mark 001 as already applied
    alembic stamp 001_initial_schema
    echo "  + Alembic stamped at 001_initial_schema"

else
    echo "  Usage: bash scripts/setup_platform_db.sh [fresh|existing]"
    exit 1
fi

echo ""
echo "========================================"
echo "  Setup complete!"
echo ""
echo "  Current migration head:"
alembic current 2>/dev/null || echo "  (run from Services/afda-platform-service/)"
echo ""
echo "  Future schema changes:"
echo "    alembic revision -m 'add_xyz_column'"
echo "    alembic upgrade head"
echo "========================================"
