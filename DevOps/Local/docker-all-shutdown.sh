#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================"
echo "  AFDA — Stopping All Local Docker Services"
echo "============================================"

echo "📈 Stopping Grafana..."
docker compose -f "$SCRIPT_DIR/Grafana/docker-compose.yml" down 2>/dev/null || true

echo "📊 Stopping Prometheus..."
docker compose -f "$SCRIPT_DIR/Prometheus/docker-compose.yml" down 2>/dev/null || true

echo "⚡ Stopping n8n..."
docker compose -f "$SCRIPT_DIR/n8n/docker-compose.yml" down 2>/dev/null || true

echo "🔴 Stopping Redis..."
docker compose -f "$SCRIPT_DIR/Redis/docker-compose.yml" down 2>/dev/null || true

echo "🍃 Stopping MongoDB..."
docker compose -f "$SCRIPT_DIR/MongoDB/docker-compose.yml" down 2>/dev/null || true

echo "🐘 Stopping PostgreSQL..."
docker compose -f "$SCRIPT_DIR/Postgres/docker-compose.yml" down 2>/dev/null || true

echo ""
echo "✅ All services stopped."
