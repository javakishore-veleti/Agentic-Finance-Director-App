# Agentic Finance Director App — Enterprise Product Architecture v2

## 1. Product Vision

This is not a dashboard. This is an **enterprise finance intelligence platform** with an AI-native agentic core. It operates as a modular product suite where each finance function (FP&A, Treasury, Accounting) is a full sub-application with its own agent workflows, data pipelines, and operational automation.

The platform is **engine-agnostic** — the agentic AI layer abstracts across n8n, LangGraph, and AWS Bedrock Agents so teams can swap orchestration engines without rewriting business logic.

---

## 2. Updated Repository Structure

```
Agentic-Finance-Director-App/
│
├── package.json                                  # Root orchestration scripts
├── .env.example
├── .gitignore
├── README.md
│
├── Portals/
│   └── agentic-finance-director-app/             # Angular 18 + Bootstrap 5
│       ├── package.json
│       ├── angular.json
│       └── src/
│           ├── index.html
│           ├── main.ts
│           ├── styles.scss
│           └── app/
│               ├── app.component.ts
│               ├── app.config.ts
│               ├── app.routes.ts
│               │
│               ├── core/                         # Singleton services, guards, interceptors
│               │   ├── auth/
│               │   │   ├── auth.guard.ts
│               │   │   └── auth.service.ts
│               │   ├── services/
│               │   │   ├── api-gateway.service.ts        # Unified HTTP client
│               │   │   ├── agent.service.ts              # Agent communication
│               │   │   ├── websocket.service.ts          # Real-time events
│               │   │   └── notification.service.ts       # Toast/alert system
│               │   ├── interceptors/
│               │   │   ├── auth.interceptor.ts
│               │   │   └── error.interceptor.ts
│               │   └── models/
│               │       ├── api-response.model.ts
│               │       ├── user.model.ts
│               │       └── agent-message.model.ts
│               │
│               ├── layout/                       # App shell (navbar, sidebar frames)
│               │   ├── app-layout/
│               │   │   └── app-layout.component.ts
│               │   ├── top-navbar/
│               │   │   └── top-navbar.component.ts
│               │   ├── module-sidebar/
│               │   │   └── module-sidebar.component.ts
│               │   └── breadcrumb/
│               │       └── breadcrumb.component.ts
│               │
│               ├── modules/                      # Feature modules (product areas)
│               │   │
│               │   ├── command-center/           # Executive intelligence hub
│               │   │   ├── command-center.routes.ts
│               │   │   ├── pages/
│               │   │   │   ├── overview/
│               │   │   │   ├── kpi-scorecard/
│               │   │   │   ├── executive-briefing/
│               │   │   │   └── action-items/
│               │   │   └── components/
│               │   │       ├── kpi-card/
│               │   │       ├── risk-summary-widget/
│               │   │       └── ai-briefing-panel/
│               │   │
│               │   ├── fpa/                      # Financial Planning & Analysis
│               │   │   ├── fpa.routes.ts
│               │   │   ├── pages/
│               │   │   │   ├── budget-vs-actual/
│               │   │   │   ├── variance-analysis/
│               │   │   │   ├── flux-commentary/
│               │   │   │   ├── forecasting/
│               │   │   │   └── reports/
│               │   │   └── components/
│               │   │       ├── variance-table/
│               │   │       ├── department-heatmap/
│               │   │       └── ai-commentary-card/
│               │   │
│               │   ├── treasury/                 # Treasury & Cash Management
│               │   │   ├── treasury.routes.ts
│               │   │   ├── pages/
│               │   │   │   ├── cash-position/
│               │   │   │   ├── cash-forecast/
│               │   │   │   ├── liquidity-risk/
│               │   │   │   ├── ar-aging/
│               │   │   │   └── bank-accounts/
│               │   │   └── components/
│               │   │       ├── cash-position-table/
│               │   │       ├── forecast-chart/
│               │   │       └── aging-bucket-chart/
│               │   │
│               │   ├── accounting/               # Accounting & Close Management
│               │   │   ├── accounting.routes.ts
│               │   │   ├── pages/
│               │   │   │   ├── general-ledger/
│               │   │   │   ├── trial-balance/
│               │   │   │   ├── intercompany/
│               │   │   │   ├── reconciliation/
│               │   │   │   └── close-management/
│               │   │   └── components/
│               │   │       ├── gl-table/
│               │   │       ├── recon-status-card/
│               │   │       └── close-checklist/
│               │   │
│               │   ├── agent-studio/             # Agent configuration & monitoring
│               │   │   ├── agent-studio.routes.ts
│               │   │   ├── pages/
│               │   │   │   ├── agent-console/        # Chat with AI agents
│               │   │   │   ├── workflow-manager/     # View/manage agent workflows
│               │   │   │   ├── prompt-library/       # Manage system prompts
│               │   │   │   ├── execution-history/    # Agent run logs
│               │   │   │   └── engine-config/        # Switch between n8n/LangGraph/Bedrock
│               │   │   └── components/
│               │   │       ├── chat-interface/
│               │   │       ├── workflow-card/
│               │   │       ├── execution-log-table/
│               │   │       └── engine-selector/
│               │   │
│               │   ├── risk-intelligence/        # Risk monitoring & alerts
│               │   │   ├── risk.routes.ts
│               │   │   ├── pages/
│               │   │   │   ├── alert-center/
│               │   │   │   ├── risk-dashboard/
│               │   │   │   ├── alert-rules/
│               │   │   │   └── alert-history/
│               │   │   └── components/
│               │   │       ├── alert-table/
│               │   │       ├── severity-badge/
│               │   │       └── risk-heatmap/
│               │   │
│               │   ├── monitoring/               # System observability
│               │   │   ├── monitoring.routes.ts
│               │   │   ├── pages/
│               │   │   │   ├── system-health/
│               │   │   │   ├── service-status/
│               │   │   │   ├── api-metrics/
│               │   │   │   └── grafana-embed/
│               │   │   └── components/
│               │   │       ├── health-card/
│               │   │       └── metrics-chart/
│               │   │
│               │   └── admin/                    # Platform administration
│               │       ├── admin.routes.ts
│               │       ├── pages/
│               │       │   ├── settings/
│               │       │   ├── users-roles/
│               │       │   ├── api-keys/
│               │       │   ├── data-connections/
│               │       │   └── audit-log/
│               │       └── components/
│               │           ├── connection-status-card/
│               │           └── user-table/
│               │
│               └── shared/                       # Cross-module reusable components
│                   ├── components/
│                   │   ├── data-table/               # Enterprise sortable/filterable table
│                   │   ├── stat-card/                # Generic metric card
│                   │   ├── ai-insight-panel/         # Reusable AI commentary block
│                   │   ├── empty-state/              # No-data placeholder
│                   │   ├── loading-skeleton/         # Skeleton loaders
│                   │   ├── confirmation-dialog/
│                   │   └── export-button/            # CSV/PDF export
│                   ├── pipes/
│                   │   ├── currency.pipe.ts
│                   │   ├── variance.pipe.ts
│                   │   └── relative-time.pipe.ts
│                   └── directives/
│                       └── click-outside.directive.ts
│
├── Services/
│   ├── flask-crud-api/                           # Flask — CRUD & operational services
│   │   ├── requirements.txt
│   │   ├── wsgi.py
│   │   ├── app/
│   │   │   ├── __init__.py                       # Flask app factory
│   │   │   ├── config.py
│   │   │   ├── extensions.py                     # DB connections, Redis, etc.
│   │   │   ├── routes/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── fpa.py
│   │   │   │   ├── treasury.py
│   │   │   │   ├── accounting.py
│   │   │   │   ├── executive.py
│   │   │   │   ├── alerts.py
│   │   │   │   ├── users.py
│   │   │   │   └── health.py
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── fpa.py
│   │   │   │   ├── treasury.py
│   │   │   │   ├── accounting.py
│   │   │   │   └── alert.py
│   │   │   ├── services/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── fpa_service.py
│   │   │   │   ├── treasury_service.py
│   │   │   │   ├── accounting_service.py
│   │   │   │   └── alert_service.py
│   │   │   └── utils/
│   │   │       ├── pagination.py
│   │   │       └── validators.py
│   │   └── tests/
│   │
│   └── fastapi-agent-gateway/                    # FastAPI — Real-time & agent proxy
│       ├── requirements.txt
│       ├── main.py
│       ├── app/
│       │   ├── config.py
│       │   ├── routers/
│       │   │   ├── agent_chat.py                 # WebSocket + HTTP agent proxy
│       │   │   ├── agent_workflows.py            # Workflow management API
│       │   │   ├── agent_executions.py           # Execution history
│       │   │   ├── streaming.py                  # SSE for real-time updates
│       │   │   └── health.py
│       │   ├── services/
│       │   │   ├── agent_orchestrator.py         # ← THE ABSTRACTION LAYER
│       │   │   ├── engine_n8n.py                 # n8n adapter
│       │   │   ├── engine_langgraph.py           # LangGraph adapter
│       │   │   ├── engine_bedrock.py             # AWS Bedrock adapter
│       │   │   └── engine_registry.py            # Engine selection logic
│       │   ├── models/
│       │   │   ├── agent_request.py
│       │   │   ├── agent_response.py
│       │   │   └── engine_config.py
│       │   └── middleware/
│       │       ├── rate_limiter.py
│       │       └── metrics.py                    # Prometheus instrumentation
│       └── tests/
│
├── Agents/
│   ├── workflows/
│   │   ├── n8n/
│   │   │   └── finance-director-main.json        # n8n exported workflow
│   │   ├── langgraph/
│   │   │   ├── finance_director_graph.py         # LangGraph graph definition
│   │   │   ├── tools/
│   │   │   │   ├── fpa_tool.py
│   │   │   │   ├── treasury_tool.py
│   │   │   │   └── accounting_tool.py
│   │   │   └── nodes/
│   │   │       ├── router.py
│   │   │       ├── thinker.py
│   │   │       └── responder.py
│   │   └── bedrock/
│   │       ├── agent-definition.json             # Bedrock agent config
│   │       └── action-groups/
│   │           ├── fpa-actions.json
│   │           ├── treasury-actions.json
│   │           └── accounting-actions.json
│   ├── prompts/
│   │   ├── system-prompt-director.md
│   │   ├── tool-fpa.md
│   │   ├── tool-treasury.md
│   │   └── tool-accounting.md
│   └── seed/
│       ├── fpa-sample-data.sql
│       ├── treasury-sample-data.sql
│       ├── accounting-sample-data.sql
│       └── seed-all.sh
│
├── DevOps/
│   └── Local/
│       ├── .env.example
│       ├── docker-all-start.sh
│       ├── docker-all-shutdown.sh
│       ├── docker-all-status.sh
│       ├── docker-all-delete.sh
│       ├── n8n/docker-compose.yml
│       ├── Postgres/docker-compose.yml + init/
│       ├── MongoDB/docker-compose.yml + init/
│       ├── Redis/docker-compose.yml
│       ├── FlaskAPI/Dockerfile + docker-compose.yml
│       ├── FastAPI/Dockerfile + docker-compose.yml
│       ├── Prometheus/docker-compose.yml + prometheus.yml
│       └── Grafana/docker-compose.yml + provisioning/
│
├── .github/
│   └── workflows/                                # AWS deployment
│
└── docs/
    ├── architecture.md
    ├── setup-guide.md
    ├── agent-abstraction.md                      # How the multi-engine layer works
    ├── api-reference.md
    └── data-model.md
```

---

## 3. Top Navigation — Enterprise Product Modules

This is not "pages." These are **product areas**, each a self-contained sub-application:

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🔺 Finance Director    Command Center │ FP&A │ Treasury │ Accounting │  │
│                        Agent Studio │ Risk Intel │ Monitoring │ Admin   │
│                                                          🔔  👤 Admin  │
└──────────────────────────────────────────────────────────────────────────┘
```

| Module              | URL Prefix      | Purpose                                        | Sidebar Depth |
|---------------------|-----------------|------------------------------------------------|---------------|
| **Command Center**  | `/command`      | Executive intelligence hub — KPIs, briefings, action items | 4 sub-pages |
| **FP&A**            | `/fpa`          | Budget management, variance, flux, forecasting  | 5 sub-pages |
| **Treasury**        | `/treasury`     | Cash, liquidity, AR aging, bank accounts        | 5 sub-pages |
| **Accounting**      | `/accounting`   | GL, trial balance, intercompany, recon, close   | 5 sub-pages |
| **Agent Studio**    | `/agent-studio` | Chat console, workflow management, prompt library, engine config | 5 sub-pages |
| **Risk Intelligence** | `/risk`       | Alert center, risk dashboard, rules, history    | 4 sub-pages |
| **Monitoring**      | `/monitoring`   | System health, service status, API metrics, Grafana | 4 sub-pages |
| **Admin**           | `/admin`        | Settings, users, API keys, connections, audit   | 5 sub-pages |

---

## 4. Agent Abstraction Layer (Multi-Engine)

The key enterprise differentiator. The FastAPI agent gateway provides a **unified interface** regardless of which engine runs underneath:

```
┌─────────────────────────────────────────────────────┐
│                Angular Portal                        │
│          (Agent Studio / Chat Console)               │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP / WebSocket
                   ▼
┌─────────────────────────────────────────────────────┐
│           FastAPI Agent Gateway :8001                 │
│                                                      │
│   ┌──────────────────────────────────────────────┐  │
│   │         AgentOrchestrator (abstract)           │  │
│   │                                                │  │
│   │   send_message(msg, session, engine) → Result  │  │
│   │   list_workflows(engine) → Workflow[]          │  │
│   │   get_execution(id) → ExecutionLog             │  │
│   └──────┬────────────┬────────────┬─────────────┘  │
│          │            │            │                  │
│   ┌──────▼──┐  ┌──────▼──┐  ┌─────▼────┐           │
│   │ N8nEngine│  │LangGraph│  │ Bedrock  │           │
│   │ Adapter  │  │ Engine  │  │ Engine   │           │
│   └─────────┘  └─────────┘  └──────────┘           │
│                                                      │
└─────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
    n8n :5678     Python runtime   AWS Bedrock API
```

**Engine selection** can be:
- Per-request (header: `X-Agent-Engine: langgraph`)
- Per-workflow (configured in Agent Studio)
- Global default (set in Admin → Settings)

---

## 5. Backend Split — Flask + FastAPI

Two Python services, clean separation:

| Service                  | Port  | Framework | Responsibility                              |
|--------------------------|-------|-----------|---------------------------------------------|
| `flask-crud-api`         | 8000  | Flask     | CRUD operations, data queries, reports, user mgmt, basic REST |
| `fastapi-agent-gateway`  | 8001  | FastAPI   | Agent chat (WebSocket), workflow mgmt, real-time streaming, engine abstraction |

**Why two services:**
- Flask handles predictable request/response CRUD — boring, reliable, well-tested
- FastAPI handles async WebSocket connections, SSE streaming, and the agent orchestration layer where async/await matters
- They share the same databases but serve different purposes
- Can scale independently (agents need more compute, CRUD is lightweight)

---

## 6. Service Matrix (Updated — 9 Services)

| #  | Service        | Container       | Port  | Purpose                              |
|----|----------------|-----------------|-------|--------------------------------------|
| 1  | PostgreSQL     | afda-postgres   | 5432  | Structured finance data              |
| 2  | MongoDB        | afda-mongodb    | 27017 | Documents, conversations, audit      |
| 3  | Redis          | afda-redis      | 6379  | Cache, sessions, rate limiting       |
| 4  | n8n            | afda-n8n        | 5678  | Workflow engine (agent engine #1)    |
| 5  | Flask CRUD API | afda-flask-api  | 8000  | REST CRUD, data operations           |
| 6  | FastAPI Gateway| afda-agent-gw   | 8001  | Agent proxy, WebSocket, streaming    |
| 7  | Prometheus     | afda-prometheus | 9090  | Metrics collection                   |
| 8  | Grafana        | afda-grafana    | 3000  | Monitoring dashboards                |
| 9  | Angular Portal | (ng serve)      | 4200  | Frontend (dev mode, not containerized) |

---

## 7. Package.json Scripts (Updated)

| Script                            | Description                                       |
|-----------------------------------|---------------------------------------------------|
| `setup:local-docker-all-start`    | Start all 8 Docker services                       |
| `setup:local-docker-all-stop`     | Stop all services                                 |
| `setup:local-docker-all-status`   | Health check all services                         |
| `setup:local-docker-all-delete`   | Tear down everything                              |
| `dev:portal`                      | `cd Portals/agentic-finance-director-app && ng serve` |
| `dev:flask`                       | `cd Services/flask-crud-api && flask run`         |
| `dev:fastapi`                     | `cd Services/fastapi-agent-gateway && uvicorn`    |
| `agents:export`                   | Export n8n workflows                              |
| `agents:import`                   | Import workflows into n8n                         |
| `db:seed`                         | Load sample data                                  |
| `db:migrate`                      | Run SQL migrations                                |
| `logs`                            | Tail all container logs                           |
| `logs:flask`                      | Tail Flask API logs                               |
| `logs:fastapi`                    | Tail FastAPI gateway logs                         |
| `logs:n8n`                        | Tail n8n logs                                     |
| `clean`                           | Docker prune                                      |

---

## 8. What Makes This Enterprise

| Academic                                  | Enterprise (this design)                          |
|-------------------------------------------|---------------------------------------------------|
| "Dashboard with pages"                    | **Product modules** with routing depth             |
| Single API backend                        | **Split services** (CRUD vs real-time)            |
| One agent engine hardcoded                | **Multi-engine abstraction** with runtime swap     |
| Mock data in components                   | **Service layer** → API → database pipeline       |
| Chat as a page                            | **Agent Studio** — a full agent management suite  |
| Alert list                                | **Risk Intelligence** — rules, thresholds, history |
| Basic settings page                       | **Admin module** — users, roles, API keys, audit  |
| No auth                                   | **Auth guards** + interceptors + role-based access |
| No error handling                         | **Error interceptor** + empty states + skeletons  |
| No loading states                         | **Loading skeletons** + optimistic UI             |

---

## 9. Implementation Phases (Revised)

| Phase | Scope                                                          |
|-------|----------------------------------------------------------------|
| 1     | ✅ DevOps: Docker infrastructure (done)                        |
| 2     | Portal shell: layout, navigation, routing for all 8 modules   |
| 3     | Command Center module (executive hub)                          |
| 4     | FP&A module (budget, variance, flux)                           |
| 5     | Treasury module (cash, forecast, AR)                           |
| 6     | Accounting module (GL, recon, close)                           |
| 7     | Flask CRUD API scaffolding + all REST endpoints                |
| 8     | FastAPI Agent Gateway + abstraction layer                      |
| 9     | Agent Studio module (chat, workflow mgr, engine config)        |
| 10    | Risk Intelligence module                                       |
| 11    | Monitoring module + Grafana integration                        |
| 12    | Admin module (users, roles, connections, audit)                |
| 13    | Agent implementations (n8n → LangGraph → Bedrock)             |
| 14    | AWS deployment workflows                                       |
