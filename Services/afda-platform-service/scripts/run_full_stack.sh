#!/bin/bash
###############################################################################
# Quick-start: brings up full multi-tenant stack
###############################################################################
set -e

echo "🚀 Starting full multi-tenant stack..."
echo ""

SCRIPTS_DIR="$(dirname "$0")"
SVC_DIR="$(dirname "$SCRIPTS_DIR")"
ROOT_DIR="$(dirname "$(dirname "$SVC_DIR")")"

# 1. Start platform DB
echo "━━━ Starting Platform DB ━━━"
cd "$SVC_DIR"
docker compose -f docker-compose.platform.yml up -d afda-platform-db
echo "  Waiting for DB..."
sleep 3

# 2. Seed platform
echo "━━━ Seeding Platform Service ━━━"
python -m scripts.seed_platform

# 3. Start platform service
echo "━━━ Starting Platform Service (:8002) ━━━"
bash run_dev.sh &
PLAT_PID=$!
echo "  PID: $PLAT_PID"
sleep 2

# 4. Start CRUD API (assumes its DB is already up)
echo "━━━ Starting CRUD API (:8000) ━━━"
cd "$ROOT_DIR/Services/afda-crud-api"
bash run_dev.sh &
CRUD_PID=$!
echo "  PID: $CRUD_PID"
sleep 2

# 5. Backfill org_id on CRUD data
echo "━━━ Backfilling organization_id ━━━"
python -m scripts.backfill_org_id

# 6. Run verification
echo ""
echo "━━━ Running Verification ━━━"
cd "$SVC_DIR"
bash scripts/verify_e2e.sh

echo ""
echo "Stack running:"
echo "  Platform Service: http://localhost:8002 (PID: $PLAT_PID)"
echo "  CRUD API:         http://localhost:8000 (PID: $CRUD_PID)"
echo ""
echo "  Press Ctrl+C to stop all"
wait
