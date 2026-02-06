# Agentic Finance Director App — Architecture Blueprint

## 1. Overview

**Repo name:** `Agentic-Finance-Director-App`
**Type:** Monorepo (infra + frontend dashboard + AI agents + API + observability + docs)
**Purpose:** An autonomous AI-powered finance decision engine that connects FP&A, Treasury, and Accounting into one unified system — producing executive-ready insights, flagging risks, and automating cross-functional finance analysis 24/7.

---

## 2. Repository Structure

```
Agentic-Finance-Director-App/
│
├── package.json                              # Root-level orchestration scripts
├── .env.example                              # Master env template
├── .gitignore
├── README.md
│
├── DevOps/
│   └── Local/
│       ├── .env.example                      # Docker-specific env template
│       ├── docker-all-start.sh
│       ├── docker-all-shutdown.sh
│       ├── docker-all-status.sh
│       ├── docker-all-delete.sh
│       │
│       ├── n8n/
│       │   └── docker-compose.yml
│       ├── Postgres/
│       │   ├── docker-compose.yml
│       │   ├── init/
│       │   │   └── 01-init-schema.sql
│       │   └── migrations/
│       ├── MongoDB/
│       │   ├── docker-compose.yml
│       │   └── init/
│       │       └── 01-init-collections.js
│       ├── Redis/
│       │   └── docker-compose.yml
│       ├── PythonAPI/
│       │   ├── Dockerfile
│       │   └── docker-compose.yml
│       ├── Prometheus/
│       │   ├── docker-compose.yml
│       │   └── prometheus.yml
│       └── Grafana/
│           ├── docker-compose.yml
│           ├── provisioning/
│           │   ├── datasources/
│           │   │   └── prometheus.yml
│           │   └── dashboards/
│           │       └── dashboards.yml
│           └── dashboards/
│               └── system-overview.json
│
├── api/                                      # Python FastAPI (CRUD + operations)
│   ├── requirements.txt
│   ├── main.py
│   └── app/
│       ├── routers/
│       │   ├── fpa.py
│       │   ├── treasury.py
│       │   ├── accounting.py
│       │   ├── executive.py
│       │   └── health.py
│       ├── models/
│       ├── services/
│       └── core/
│           └── config.py
│
├── agents/                                   # n8n workflows + AI prompts
│   ├── workflows/
│   │   └── finance-director-main.json
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
├── apps/
│   └── dashboard/                            # Angular 18 + Bootstrap 5
│       ├── package.json
│       ├── angular.json
│       └── src/
│           └── app/
│               ├── core/                     # Services, models, interceptors
│               ├── features/                 # Pages: executive, fpa, treasury, etc.
│               └── shared/                   # Reusable components, pipes
│
├── .github/
│   └── workflows/                            # AWS deployment workflows
│
├── packages/
│   └── finance-types/                        # Shared TypeScript interfaces
│
└── docs/
    ├── architecture.md
    ├── setup-guide.md
    └── data-model.md
```

---

## 3. Service Matrix

| #  | Service     | Container Name  | Image               | Port  | Purpose                                       |
|----|-------------|-----------------|----------------------|-------|-----------------------------------------------|
| 1  | PostgreSQL  | afda-postgres   | postgres:16-alpine   | 5432  | n8n backend + FP&A/Treasury/Accounting data    |
| 2  | MongoDB     | afda-mongodb    | mongo:7              | 27017 | Conversations, reports, audit log              |
| 3  | Redis       | afda-redis      | redis:7-alpine       | 6379  | Session cache, rate limiting, job queues       |
| 4  | n8n         | afda-n8n        | n8nio/n8n:latest     | 5678  | Workflow orchestration, AI Agent host          |
| 5  | FastAPI     | afda-api        | python:3.12-slim     | 8000  | CRUD API, data feeds, operational services     |
| 6  | Prometheus  | afda-prometheus | prom/prometheus       | 9090  | Metrics collection (n8n + FastAPI)             |
| 7  | Grafana     | afda-grafana    | grafana/grafana       | 3000  | Monitoring dashboards                          |

**Network:** `afda-network` (shared bridge, local dev)
**Prefix:** `afda` (Agentic Finance Director App)

---

## 4. Startup Order

```
1. PostgreSQL  → healthcheck: pg_isready
2. MongoDB     → healthcheck: mongosh ping
3. Redis       → healthcheck: redis-cli ping
4. n8n         → depends on Postgres
5. FastAPI     → depends on Postgres, MongoDB, Redis
6. Prometheus  → scrapes n8n + FastAPI
7. Grafana     → reads from Prometheus
```

---

## 5. package.json Scripts

| Script                            | Purpose                                          |
|-----------------------------------|--------------------------------------------------|
| `setup:local-docker-all-start`    | Create network, start all 7 services in order    |
| `setup:local-docker-all-stop`     | Gracefully stop all containers                   |
| `setup:local-docker-all-status`   | Show container status, ports, health             |
| `setup:local-docker-all-delete`   | Stop + remove containers, volumes, network       |
| `dev:dashboard`                   | Run Angular dashboard on localhost:4200           |
| `agents:export`                   | Export n8n workflows to JSON files               |
| `agents:import`                   | Import workflow JSONs into running n8n           |
| `db:seed`                         | Load sample finance data                         |
| `db:migrate`                      | Run pending SQL migrations                       |
| `logs`                            | Tail logs from all containers                    |
| `clean`                           | Prune Docker images and dangling volumes         |

---

## 6. Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Dashboard :4200                    │
│            (Executive, FP&A, Treasury, Accounting, Chat)     │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   ┌─────────────┐          ┌─────────────┐
   │  FastAPI     │          │   n8n       │
   │  :8000       │          │   :5678     │
   │  CRUD + Ops  │          │  AI Agents  │
   └──────┬──────┘          └──────┬──────┘
          │                        │
    ┌─────┴─────┬─────┐     ┌─────┴─────┐
    ▼           ▼     ▼     ▼           │
 Postgres   MongoDB  Redis  OpenAI     Tools
  :5432      :27017  :6379  API     (FP&A, Treasury,
                                    Accounting)
          │                        │
          └────────┬───────────────┘
                   ▼
          ┌────────────────┐
          │  Prometheus     │──▶ Grafana :3000
          │  :9090          │
          └────────────────┘
```

---

## 7. Implementation Phases

| Phase | Scope                                                  |
|-------|--------------------------------------------------------|
| 1     | DevOps: docker-compose files, shell scripts, package.json |
| 2     | Database: Postgres schema, Mongo init, Redis config, seed data |
| 3     | FastAPI: project scaffolding, CRUD routers, health checks |
| 4     | n8n Agent: workflow JSON, prompts, tool configurations  |
| 5     | Observability: Prometheus config, Grafana dashboards    |
| 6     | Angular Dashboard: shell, routing, Bootstrap theme      |
| 7     | Dashboard Features: pages, charts, agent chat UI        |
| 8     | AWS deployment workflows                                |
