#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================"
echo "  AFDA — Starting All Local Docker Services"
echo "============================================"

# Load .env if present
if [ -f "$SCRIPT_DIR/.env" ]; then
  echo "📄 Loading .env file..."
  set -a; source "$SCRIPT_DIR/.env"; set +a
fi

# Create shared network if it doesn't exist
if ! docker network inspect afda-network >/dev/null 2>&1; then
  echo "🌐 Creating Docker network: afda-network"
  docker network create afda-network
fi

# ── 1. PostgreSQL ────────────────────────────────────────────
echo ""
echo "🐘 [1/7] Starting PostgreSQL..."
docker compose -f "$SCRIPT_DIR/Postgres/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" up -d 2>/dev/null || \
docker compose -f "$SCRIPT_DIR/Postgres/docker-compose.yml" up -d

echo "   Waiting for Postgres health..."
for i in $(seq 1 30); do
  if docker exec afda-postgres pg_isready -U "${POSTGRES_USER:-afda_user}" >/dev/null 2>&1; then
    echo "   ✅ PostgreSQL is ready"
    break
  fi
  [ "$i" -eq 30 ] && echo "   ⚠️  Postgres health timeout — continuing anyway"
  sleep 1
done

# ── 2. MongoDB ───────────────────────────────────────────────
echo ""
echo "🍃 [2/7] Starting MongoDB..."
docker compose -f "$SCRIPT_DIR/MongoDB/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" up -d 2>/dev/null || \
docker compose -f "$SCRIPT_DIR/MongoDB/docker-compose.yml" up -d

# ── 3. Redis ─────────────────────────────────────────────────
echo ""
echo "🔴 [3/7] Starting Redis..."
docker compose -f "$SCRIPT_DIR/Redis/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" up -d 2>/dev/null || \
docker compose -f "$SCRIPT_DIR/Redis/docker-compose.yml" up -d

# ── 4. n8n ───────────────────────────────────────────────────
echo ""
echo "⚡ [4/7] Starting n8n..."
docker compose -f "$SCRIPT_DIR/n8n/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" up -d 2>/dev/null || \
docker compose -f "$SCRIPT_DIR/n8n/docker-compose.yml" up -d

# ── 5. Prometheus ────────────────────────────────────────────
echo ""
echo "📊 [6/7] Starting Prometheus..."
docker compose -f "$SCRIPT_DIR/Prometheus/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" up -d 2>/dev/null || \
docker compose -f "$SCRIPT_DIR/Prometheus/docker-compose.yml" up -d

# ── 6. Grafana ───────────────────────────────────────────────
echo ""
echo "📈 [7/7] Starting Grafana..."
docker compose -f "$SCRIPT_DIR/Grafana/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" up -d 2>/dev/null || \
docker compose -f "$SCRIPT_DIR/Grafana/docker-compose.yml" up -d

# ── Summary ──────────────────────────────────────────────────
echo ""
echo "============================================"
echo "  ✅ All 6 services started!"
echo ""
echo "  n8n:         http://localhost:${N8N_PORT:-5678}"
echo "  Grafana:     http://localhost:${GRAFANA_PORT:-3000}"
echo "  Prometheus:  http://localhost:${PROMETHEUS_PORT:-9090}"
echo "  PostgreSQL:  localhost:${POSTGRES_PORT:-5432}"
echo "  MongoDB:     localhost:${MONGO_PORT:-27017}"
echo "  Redis:       localhost:${REDIS_PORT:-6379}"
echo "============================================"
