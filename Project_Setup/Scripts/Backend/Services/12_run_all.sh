#!/bin/bash
###############################################################################
# 12_run_all.sh
# Master script — runs 01-11 in sequence, validates output
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

SCRIPT_DIR="Project_Setup/Scripts/Backend/Services"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   AFDA Backend — Full Scaffold Generator                    ║"
echo "║   Running 11 scripts to create both microservices           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

SCRIPTS=(
    "01_crud_api_foundation.sh"
    "02_command_center_module.sh"
    "03_fpa_module.sh"
    "04_treasury_module.sh"
    "05_accounting_module.sh"
    "06_risk_module.sh"
    "07_monitoring_module.sh"
    "08_admin_module.sh"
    "09_activate_all_routers.sh"
    "10_agent_gateway_foundation.sh"
    "11_database_setup.sh"
)

TOTAL=${#SCRIPTS[@]}
PASSED=0
FAILED=0

for i in "${!SCRIPTS[@]}"; do
    STEP=$((i + 1))
    SCRIPT="${SCRIPTS[$i]}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  [$STEP/$TOTAL] Running $SCRIPT"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if bash "$SCRIPT_DIR/$SCRIPT"; then
        PASSED=$((PASSED + 1))
        echo ""
    else
        FAILED=$((FAILED + 1))
        echo "  ❌ FAILED: $SCRIPT"
        echo "  Stopping execution."
        exit 1
    fi
done

# ═══════════════════════════════════════════════════════════════
# VALIDATION
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   VALIDATION                                                ║"
echo "╚══════════════════════════════════════════════════════════════╝"

ERRORS=0

# -- Check CRUD API structure --
CRUD_FILES=(
    "Services/afda-crud-api/main.py"
    "Services/afda-crud-api/requirements.txt"
    "Services/afda-crud-api/Dockerfile"
    "Services/afda-crud-api/.env"
    "Services/afda-crud-api/alembic.ini"
    "Services/afda-crud-api/alembic/env.py"
    "Services/afda-crud-api/app/config.py"
    "Services/afda-crud-api/app/database.py"
    "Services/afda-crud-api/app/dependencies.py"
    "Services/afda-crud-api/app/shared/responses.py"
    "Services/afda-crud-api/app/shared/exceptions.py"
    "Services/afda-crud-api/app/shared/pagination.py"
    "Services/afda-crud-api/app/middleware/error_handler.py"
    "Services/afda-crud-api/scripts/seed_data.py"
    "Services/afda-crud-api/scripts/create_tables.py"
)

MODULES=("command_center" "fpa" "treasury" "accounting" "risk" "monitoring" "admin")
MODULE_FILES=("__init__.py" "models.py" "dtos.py" "dao.py" "service.py" "facade.py" "router.py")

for f in "${CRUD_FILES[@]}"; do
    if [ ! -f "$f" ]; then
        echo "  ❌ Missing: $f"
        ERRORS=$((ERRORS + 1))
    fi
done

for mod in "${MODULES[@]}"; do
    for mf in "${MODULE_FILES[@]}"; do
        path="Services/afda-crud-api/app/modules/${mod}/${mf}"
        if [ ! -f "$path" ]; then
            echo "  ❌ Missing: $path"
            ERRORS=$((ERRORS + 1))
        fi
    done
done

# -- Check Agent Gateway structure --
GW_FILES=(
    "Services/afda-agent-gateway/main.py"
    "Services/afda-agent-gateway/requirements.txt"
    "Services/afda-agent-gateway/Dockerfile"
    "Services/afda-agent-gateway/.env"
    "Services/afda-agent-gateway/app/config.py"
    "Services/afda-agent-gateway/app/database.py"
    "Services/afda-agent-gateway/app/services/orchestrator.py"
    "Services/afda-agent-gateway/app/services/engine_registry.py"
    "Services/afda-agent-gateway/app/services/engine_n8n.py"
    "Services/afda-agent-gateway/app/services/engine_langgraph.py"
    "Services/afda-agent-gateway/app/services/engine_bedrock.py"
    "Services/afda-agent-gateway/app/routers/agent_chat.py"
    "Services/afda-agent-gateway/app/routers/agent_workflows.py"
    "Services/afda-agent-gateway/app/routers/agent_executions.py"
    "Services/afda-agent-gateway/app/routers/streaming.py"
    "Services/afda-agent-gateway/app/routers/health.py"
    "Services/afda-agent-gateway/app/middleware/rate_limiter.py"
    "Services/afda-agent-gateway/app/middleware/metrics.py"
)

for f in "${GW_FILES[@]}"; do
    if [ ! -f "$f" ]; then
        echo "  ❌ Missing: $f"
        ERRORS=$((ERRORS + 1))
    fi
done

# -- Count files --
CRUD_COUNT=$(find Services/afda-crud-api -type f -name "*.py" | wc -l)
GW_COUNT=$(find Services/afda-agent-gateway -type f -name "*.py" | wc -l)
TOTAL_PY=$((CRUD_COUNT + GW_COUNT))

echo ""
if [ $ERRORS -eq 0 ]; then
    echo "  ✅ All files validated — 0 errors"
else
    echo "  ⚠️  $ERRORS files missing"
fi

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   🎉 BACKEND SCAFFOLD COMPLETE                             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "  Scripts run:     $PASSED/$TOTAL passed"
echo "  Python files:    $TOTAL_PY total ($CRUD_COUNT CRUD + $GW_COUNT Gateway)"
echo "  Validation:      $ERRORS errors"
echo ""
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │ Service              Port   Endpoints   Tables          │"
echo "  ├─────────────────────────────────────────────────────────┤"
echo "  │ afda-crud-api        8000   102         40 (Postgres)   │"
echo "  │ afda-agent-gateway   8001    15          3 (MongoDB)    │"
echo "  ├─────────────────────────────────────────────────────────┤"
echo "  │ TOTAL                       117         43              │"
echo "  └─────────────────────────────────────────────────────────┘"
echo ""
echo "  📁 Structure:"
echo "  Services/"
echo "  ├── afda-crud-api/           FastAPI CRUD (7 modules)"
echo "  │   ├── app/modules/         command_center, fpa, treasury,"
echo "  │   │                        accounting, risk, monitoring, admin"
echo "  │   ├── alembic/             DB migrations"
echo "  │   └── scripts/             seed, create, drop"
echo "  └── afda-agent-gateway/      FastAPI Agent Gateway"
echo "      ├── app/services/        orchestrator + 3 engine adapters"
echo "      └── app/routers/         chat, workflows, executions, SSE"
echo ""
echo "  🚀 Quick Start:"
echo "  ─────────────────────────────────────────────────────────"
echo "  # 1. Start infrastructure (Postgres, Mongo, Redis, n8n)"
echo "  cd DevOps/Local && bash docker-all-start.sh"
echo ""
echo "  # 2. Setup CRUD API"
echo "  cd Services/afda-crud-api"
echo "  pip install -r requirements.txt"
echo "  python -m scripts.create_tables"
echo "  python -m scripts.seed_data"
echo "  uvicorn main:app --port 8000 --reload"
echo ""
echo "  # 3. Setup Agent Gateway"
echo "  cd Services/afda-agent-gateway"
echo "  pip install -r requirements.txt"
echo "  uvicorn main:app --port 8001 --reload"
echo ""
echo "  # 4. Open Swagger"
echo "  CRUD API:       http://localhost:8000/docs"
echo "  Agent Gateway:  http://localhost:8001/docs"
echo "  ─────────────────────────────────────────────────────────"
