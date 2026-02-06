# 🚀 AFDA — Next Phases Implementation Blueprint

> **PURPOSE**: This file is the master context document. If Claude loses memory, hand this file back to resume work exactly where we left off.
> **Last Updated**: Feb 6, 2026
> **Status**: Phase 1 COMPLETE (Agent Inventory + Architecture) → Phase 2 NEXT (Backend Services)

---

## 📦 WHAT'S ALREADY DONE

### ✅ Phase 0 — Portal Frontend (Angular 18 + Bootstrap 5)
- Complete Angular portal with 8 modules, 37 pages, all component `.ts` files delivered
- Shell: top-navbar, module-sidebar, app-layout, breadcrumb
- All page components wired with routes
- Files: `portal-shell.zip`, `portal-v2-update.zip`, individual `.component.ts` files

### ✅ Phase 1A — Agent Inventory (200 Agents in 4 Batches)
- `AFDA_Agent_Inventory_Batch1_001-050.xlsx` — Command Center (12) + FP&A (13) + Treasury (13) + Accounting (12)
- `AFDA_Agent_Inventory_Batch2_051-100.xlsx` — Agent Studio (18) + Risk Intelligence (14) + Monitoring (12) + Admin (6)
- `AFDA_Agent_Inventory_Batch3_101-150.xlsx` — Cross-Cutting (50)
- `AFDA_Agent_Inventory_Batch4_151-200.xlsx` — Cross-Cutting (50)
- Each agent has 21 fields: ID, Name, Module, Page, Agent Type, Behavior, Autonomy, Purpose, Trigger, LLM Model, Orchestrator, Tools, Input, Output, Databases, Guardrails, Error Handling, KPIs, Multi-Agent, Memory, MCP Tools

### ✅ Phase 1B — Architecture Documents
- `architecture-v2.md` — Full enterprise architecture (repo structure, service matrix, agent abstraction layer)
- `ai-cfo-architecture.md` — AI CFO system design
- `AFDA_Portal_Pages_AI_Matrix.xlsx` — Page-to-agent mapping matrix

---

## 🎯 PHASE 2 — BACKEND SERVICES (WHAT TO BUILD NEXT)

### Top-Down API-First Methodology
```
1. OpenAPI 3.1 YAML spec → 2. Swagger UI preview → 3. Code layers
```

### Architecture Decision: TWO Python Services

| Service | Framework | Port | Role |
|---------|-----------|------|------|
| `afda-crud-api` | **FastAPI** | 8000 | CRUD operations, data queries, reports, user mgmt, REST |
| `afda-agent-gateway` | **FastAPI** | 8001 | Agent chat (WebSocket), workflow mgmt, streaming, engine abstraction |

> **UPDATE**: We decided to use FastAPI for BOTH services (not Flask for CRUD). Unified stack.

### Code Layer Pattern — CRUD Service (afda-crud-api)
```
API Layer (FastAPI Router)
  → Facade Layer (thin orchestrator, composes service calls)
    → Service Layer (business logic, validation)
      → DAO Layer (database access, queries)
        → DTO Layer (Pydantic models for request/response)
```

### Code Layer Pattern — Agent Service (afda-agent-gateway)
```
Agent AI Anatomy Pattern:
  Router → AgentOrchestrator (abstract)
    → Engine Adapters (n8n, LangGraph, Bedrock)
      → Tool Registry → MCP Servers
```

---

## 🏗️ PHASE 2 IMPLEMENTATION PLAN

### Step 1: Generate `setup_backend.sh` Script
A single shell script that creates the ENTIRE backend directory structure with all files.

### Step 2: CRUD Service — Module by Module

#### Module Build Order:
```
1. Command Center  (AGT-001 to AGT-012)  — 4 pages, 12 agents
2. FP&A            (AGT-013 to AGT-025)  — 5 pages, 13 agents
3. Treasury        (AGT-026 to AGT-038)  — 5 pages, 13 agents
4. Accounting      (AGT-039 to AGT-050)  — 5 pages, 12 agents
5. Agent Studio    (AGT-051 to AGT-068)  — 5 pages, 18 agents
6. Risk Intel      (AGT-069 to AGT-082)  — 4 pages, 14 agents
7. Monitoring      (AGT-083 to AGT-094)  — 4 pages, 12 agents
8. Admin           (AGT-095 to AGT-100)  — 5 pages, 6 agents
```

#### Per-Module Deliverables:
For each module, generate:
1. **OpenAPI YAML** — Full spec with paths, schemas, examples
2. **Router** — FastAPI router with all endpoints
3. **Facade** — Orchestration layer
4. **Service** — Business logic
5. **DAO** — Database queries (SQLAlchemy for Postgres, Motor for MongoDB)
6. **DTOs** — Pydantic request/response models
7. **Database migrations** — Alembic for Postgres, MongoDB collection setup

### Step 3: Agent Gateway Service
1. WebSocket chat endpoint
2. Agent orchestrator abstraction
3. Engine adapters (n8n, LangGraph, Bedrock)
4. Streaming (SSE)
5. Execution history

### Step 4: Database Layer
1. PostgreSQL schemas + seed data
2. MongoDB collections + indexes
3. Redis configuration

---

## 📐 BACKEND DIRECTORY STRUCTURE

```
Services/
├── afda-crud-api/                          # FastAPI CRUD Service (Port 8000)
│   ├── main.py                             # App entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── alembic/                            # DB migrations
│   │   └── versions/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py                       # Settings (pydantic-settings)
│   │   ├── database.py                     # DB connections (Postgres, Mongo, Redis)
│   │   ├── dependencies.py                 # Shared DI (get_db, get_current_user)
│   │   ├── middleware/
│   │   │   ├── cors.py
│   │   │   ├── error_handler.py
│   │   │   └── request_logger.py
│   │   │
│   │   ├── modules/
│   │   │   ├── command_center/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py               # /api/v1/command-center/*
│   │   │   │   ├── facade.py
│   │   │   │   ├── service.py
│   │   │   │   ├── dao.py
│   │   │   │   ├── dtos.py                 # Pydantic models
│   │   │   │   └── models.py               # SQLAlchemy ORM models
│   │   │   │
│   │   │   ├── fpa/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py               # /api/v1/fpa/*
│   │   │   │   ├── facade.py
│   │   │   │   ├── service.py
│   │   │   │   ├── dao.py
│   │   │   │   ├── dtos.py
│   │   │   │   └── models.py
│   │   │   │
│   │   │   ├── treasury/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py               # /api/v1/treasury/*
│   │   │   │   ├── facade.py
│   │   │   │   ├── service.py
│   │   │   │   ├── dao.py
│   │   │   │   ├── dtos.py
│   │   │   │   └── models.py
│   │   │   │
│   │   │   ├── accounting/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py               # /api/v1/accounting/*
│   │   │   │   ├── facade.py
│   │   │   │   ├── service.py
│   │   │   │   ├── dao.py
│   │   │   │   ├── dtos.py
│   │   │   │   └── models.py
│   │   │   │
│   │   │   ├── risk/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py               # /api/v1/risk/*
│   │   │   │   ├── facade.py
│   │   │   │   ├── service.py
│   │   │   │   ├── dao.py
│   │   │   │   ├── dtos.py
│   │   │   │   └── models.py
│   │   │   │
│   │   │   ├── monitoring/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py               # /api/v1/monitoring/*
│   │   │   │   ├── facade.py
│   │   │   │   ├── service.py
│   │   │   │   ├── dao.py
│   │   │   │   ├── dtos.py
│   │   │   │   └── models.py
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── __init__.py
│   │   │       ├── router.py               # /api/v1/admin/*
│   │   │       ├── facade.py
│   │   │       ├── service.py
│   │   │       ├── dao.py
│   │   │       ├── dtos.py
│   │   │       └── models.py
│   │   │
│   │   ├── shared/
│   │   │   ├── __init__.py
│   │   │   ├── pagination.py               # Paginated response helper
│   │   │   ├── filters.py                  # Query filter builder
│   │   │   ├── validators.py               # Common validators
│   │   │   ├── exceptions.py               # Custom exceptions
│   │   │   └── responses.py                # Standard API response wrapper
│   │   │
│   │   └── openapi/
│   │       ├── command_center.yaml
│   │       ├── fpa.yaml
│   │       ├── treasury.yaml
│   │       ├── accounting.yaml
│   │       ├── risk.yaml
│   │       ├── monitoring.yaml
│   │       └── admin.yaml
│   │
│   └── tests/
│       ├── conftest.py
│       ├── test_command_center/
│       ├── test_fpa/
│       ├── test_treasury/
│       ├── test_accounting/
│       ├── test_risk/
│       ├── test_monitoring/
│       └── test_admin/
│
├── afda-agent-gateway/                     # FastAPI Agent Gateway (Port 8001)
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── routers/
│   │   │   ├── agent_chat.py               # WebSocket + HTTP chat
│   │   │   ├── agent_workflows.py          # Workflow CRUD
│   │   │   ├── agent_executions.py         # Run history
│   │   │   ├── streaming.py                # SSE for real-time
│   │   │   └── health.py
│   │   ├── services/
│   │   │   ├── orchestrator.py             # Abstract agent orchestrator
│   │   │   ├── engine_n8n.py               # n8n adapter
│   │   │   ├── engine_langgraph.py         # LangGraph adapter
│   │   │   ├── engine_bedrock.py           # AWS Bedrock adapter
│   │   │   └── engine_registry.py          # Engine selection
│   │   ├── models/
│   │   │   ├── agent_request.py
│   │   │   ├── agent_response.py
│   │   │   └── engine_config.py
│   │   └── middleware/
│   │       ├── rate_limiter.py
│   │       └── metrics.py
│   └── tests/
```

---

## 🗄️ DATABASE SCHEMAS (HIGH-LEVEL)

### PostgreSQL (Structured Data)

```sql
-- Command Center
kpi_definitions, kpi_values, action_items, executive_briefings

-- FP&A
budgets, budget_line_items, actuals, variance_records, forecasts,
forecast_versions, flux_commentaries, reports

-- Treasury
bank_accounts, cash_positions, cash_transactions, cash_forecasts,
ar_invoices, ar_aging_buckets, liquidity_metrics

-- Accounting
chart_of_accounts, journal_entries, journal_lines, trial_balances,
intercompany_transactions, reconciliations, recon_items,
close_periods, close_tasks

-- Risk Intelligence
alerts, alert_rules, alert_history, risk_scores, risk_factors

-- Monitoring
service_registry, incidents, api_metrics_log

-- Admin
users, roles, permissions, user_roles, api_keys,
data_connections, audit_log, platform_settings
```

### MongoDB (Documents)
```
agent_conversations, agent_executions, agent_configs,
workflow_definitions, prompt_templates, compliance_evidence,
investigation_reports, benchmark_results, postmortem_reports
```

### Redis (Cache/Real-time)
```
session:*, cache:kpi:*, cache:dashboard:*, rate:*,
agent:health:*, ws:connections:*, budget:counter:*
```

---

## 🔌 API ENDPOINT SUMMARY PER MODULE

### Command Center — `/api/v1/command-center`
```
GET    /overview/stats               # Dashboard stats
GET    /kpis                         # List KPIs with current values
GET    /kpis/{id}                    # Single KPI detail
POST   /kpis                         # Create KPI definition
PUT    /kpis/{id}                    # Update KPI
GET    /executive-briefings          # List briefings
GET    /executive-briefings/latest   # Latest AI-generated briefing
POST   /executive-briefings/generate # Trigger AI briefing generation
GET    /action-items                 # List action items
POST   /action-items                 # Create action item
PUT    /action-items/{id}            # Update (status, assignee)
DELETE /action-items/{id}            # Delete
GET    /action-items/summary         # Stats by status/priority
```

### FP&A — `/api/v1/fpa`
```
GET    /budgets                      # List budgets
POST   /budgets                      # Create budget
GET    /budgets/{id}                 # Budget detail with line items
PUT    /budgets/{id}                 # Update budget
GET    /budgets/{id}/vs-actual       # Budget vs actual comparison
GET    /variance                     # Variance analysis data
GET    /variance/by-department       # Department breakdown
GET    /variance/by-account          # Account breakdown
GET    /flux                         # Flux commentary list
POST   /flux/generate               # AI-generate flux commentary
GET    /forecasts                    # List forecasts
POST   /forecasts                    # Create forecast
GET    /forecasts/{id}               # Forecast detail
GET    /forecasts/{id}/scenarios     # Scenario comparison
GET    /reports                      # List saved reports
POST   /reports/generate             # Generate report
GET    /reports/{id}/download        # Download PDF/Excel
```

### Treasury — `/api/v1/treasury`
```
GET    /cash-position                # Current cash across all accounts
GET    /cash-position/history        # Historical cash positions
GET    /bank-accounts                # List bank accounts
POST   /bank-accounts                # Add bank account
GET    /bank-accounts/{id}           # Account detail
GET    /cash-forecast                # Cash flow forecast
POST   /cash-forecast/generate      # AI forecast generation
GET    /ar-aging                     # AR aging summary
GET    /ar-aging/buckets             # Aging bucket breakdown
GET    /ar-aging/invoices            # Invoice-level detail
GET    /liquidity                    # Liquidity risk metrics
GET    /liquidity/ratios             # Key liquidity ratios
```

### Accounting — `/api/v1/accounting`
```
GET    /general-ledger               # GL entries (paginated, filtered)
POST   /general-ledger               # Create journal entry
GET    /general-ledger/{id}          # Entry detail
GET    /trial-balance                # Current trial balance
GET    /trial-balance/comparison     # Period comparison
GET    /intercompany                 # Intercompany transactions
POST   /intercompany/match          # Auto-match intercompany
GET    /reconciliation               # Reconciliation dashboard
POST   /reconciliation/{id}/reconcile # Execute reconciliation
GET    /reconciliation/{id}/items    # Recon item details
GET    /close                        # Close management dashboard
GET    /close/periods                # List close periods
POST   /close/periods                # Create close period
GET    /close/periods/{id}/tasks     # Close checklist
PUT    /close/tasks/{id}             # Update task status
```

### Risk Intelligence — `/api/v1/risk`
```
GET    /alerts                       # List alerts (filtered, paginated)
GET    /alerts/{id}                  # Alert detail
PUT    /alerts/{id}/acknowledge      # Acknowledge alert
PUT    /alerts/{id}/resolve          # Resolve alert
GET    /dashboard                    # Risk dashboard data
GET    /dashboard/heatmap            # Risk heatmap
GET    /dashboard/scores             # Composite risk scores
GET    /rules                        # List alert rules
POST   /rules                        # Create rule
PUT    /rules/{id}                   # Update rule
DELETE /rules/{id}                   # Delete rule
GET    /history                      # Alert history
GET    /history/trends               # Trend analysis
```

### Monitoring — `/api/v1/monitoring`
```
GET    /system-health                # Overall system health
GET    /system-health/services       # Per-service health
GET    /service-status               # Service dependency map
GET    /service-status/{name}        # Single service detail
GET    /api-metrics                  # API performance metrics
GET    /api-metrics/endpoints        # Per-endpoint breakdown
GET    /api-metrics/latency          # Latency percentiles
GET    /grafana/dashboards           # List Grafana dashboards
```

### Admin — `/api/v1/admin`
```
GET    /users                        # List users
POST   /users                        # Create user
PUT    /users/{id}                   # Update user
DELETE /users/{id}                   # Deactivate user
GET    /roles                        # List roles
POST   /roles                        # Create role
PUT    /roles/{id}                   # Update role permissions
GET    /api-keys                     # List API keys
POST   /api-keys                     # Generate new key
DELETE /api-keys/{id}                # Revoke key
GET    /data-connections             # List connections
POST   /data-connections             # Create connection
PUT    /data-connections/{id}        # Update connection
POST   /data-connections/{id}/test   # Test connection
GET    /audit-log                    # Audit log (paginated, filtered)
GET    /settings                     # Platform settings
PUT    /settings                     # Update settings
```

### Agent Gateway — `/api/v1/agents` (Port 8001)
```
WS     /chat/{session_id}           # WebSocket agent chat
POST   /chat/send                    # HTTP fallback for chat
GET    /chat/sessions                # List sessions
GET    /chat/sessions/{id}/history   # Conversation history
GET    /workflows                    # List workflows
POST   /workflows                    # Create workflow
GET    /workflows/{id}               # Workflow detail
PUT    /workflows/{id}               # Update workflow
POST   /workflows/{id}/execute       # Trigger execution
GET    /executions                   # Execution history
GET    /executions/{id}              # Execution detail with trace
GET    /executions/{id}/logs         # Execution logs
SSE    /stream/{session_id}          # Server-sent events stream
GET    /engines                      # Available engines
PUT    /engines/default              # Set default engine
GET    /health                       # Gateway health check
```

---

## 🛠️ TECH STACK SUMMARY

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 18 + Bootstrap 5 + SCSS |
| CRUD API | Python 3.12 + FastAPI + SQLAlchemy 2.0 + Pydantic v2 |
| Agent Gateway | Python 3.12 + FastAPI + WebSockets + SSE |
| Relational DB | PostgreSQL 16 |
| Document DB | MongoDB 7 |
| Cache | Redis 7 |
| ORM | SQLAlchemy 2.0 (async) |
| MongoDB Driver | Motor (async) |
| Migrations | Alembic |
| Auth | JWT (PyJWT) |
| API Docs | OpenAPI 3.1 + Swagger UI (built into FastAPI) |
| Agent Engines | n8n, LangGraph, AWS Bedrock |
| Monitoring | Prometheus + Grafana |
| Containers | Docker + docker-compose |

---

## 📋 IMPLEMENTATION SEQUENCE

```
PHASE 2A — Backend Scaffold (.sh script)
├── Create full directory structure
├── Create main.py, config.py, database.py, dependencies.py
├── Create shared utilities (pagination, responses, exceptions)
├── Create Dockerfiles + requirements.txt
└── Create alembic setup

PHASE 2B — Module 1: Command Center
├── OpenAPI YAML spec
├── SQLAlchemy models (kpis, action_items, briefings)
├── DTOs (Pydantic)
├── DAO layer
├── Service layer
├── Facade layer
├── Router layer
└── Alembic migration

PHASE 2C — Module 2: FP&A
├── Same pattern as above
└── budgets, variance, flux, forecasts, reports

PHASE 2D — Module 3: Treasury
└── cash_position, bank_accounts, ar_aging, liquidity, forecasts

PHASE 2E — Module 4: Accounting
└── gl, trial_balance, intercompany, reconciliation, close_management

PHASE 2F — Module 5: Risk Intelligence
└── alerts, rules, dashboard, history

PHASE 2G — Module 6: Monitoring
└── system_health, service_status, api_metrics

PHASE 2H — Module 7: Admin
└── users, roles, api_keys, connections, audit, settings

PHASE 2I — Agent Gateway
├── WebSocket chat
├── Engine abstraction (n8n, LangGraph, Bedrock adapters)
├── Workflow management
├── Execution history
└── SSE streaming

PHASE 3 — Database
├── PostgreSQL full schema + seed data
├── MongoDB collections + indexes
├── Redis configuration
└── Alembic migrations

PHASE 4 — DevOps
├── Docker compose for all services
├── Environment configuration
├── Health checks
└── CI/CD pipeline
```

---

## 🏷️ AGENT INVENTORY REFERENCE (200 Agents)

| Range | Module | Count | File |
|-------|--------|-------|------|
| AGT-001 → AGT-012 | Command Center | 12 | Batch1 |
| AGT-013 → AGT-025 | FP&A | 13 | Batch1 |
| AGT-026 → AGT-038 | Treasury | 13 | Batch1 |
| AGT-039 → AGT-050 | Accounting | 12 | Batch1 |
| AGT-051 → AGT-068 | Agent Studio | 18 | Batch2 |
| AGT-069 → AGT-082 | Risk Intelligence | 14 | Batch2 |
| AGT-083 → AGT-094 | Monitoring | 12 | Batch2 |
| AGT-095 → AGT-100 | Admin | 6 | Batch2 |
| AGT-101 → AGT-150 | Cross-Cutting | 50 | Batch3 |
| AGT-151 → AGT-200 | Cross-Cutting | 50 | Batch4 |

---

## 🎯 RESUME INSTRUCTIONS FOR CLAUDE

When resuming from this file:

1. **Read this file first** — it has everything needed
2. **Next task**: Generate `setup_backend.sh` — a shell script that creates the entire `Services/` directory with all boilerplate files
3. **Then**: Build each module one at a time starting with Command Center
4. **Pattern per module**: OpenAPI YAML → DTOs → Models → DAO → Service → Facade → Router
5. **All FastAPI** — both CRUD and Agent Gateway use FastAPI (not Flask)
6. **Async everything** — use async SQLAlchemy, Motor for MongoDB, aioredis
7. **Port 8000** = CRUD API, **Port 8001** = Agent Gateway

### Key Files Already Delivered:
- All 4 batch Excel + README files (agent inventory)
- `architecture-v2.md` (full architecture)
- `AFDA_Portal_Pages_AI_Matrix.xlsx` (page-agent mapping)
- All Angular component `.ts` files (37 pages)
- Portal shell zip files

### What the User Wants Next:
> "We will have a .sh file that creates all the Backend/Services/microservices python fastapi based and also other microservices for crud"

So the IMMEDIATE next step is: **Generate `setup_backend.sh`** that scaffolds the entire backend.

---

*AFDA — Agentic Finance Director App | Enterprise AI Platform | Feb 6, 2026*
