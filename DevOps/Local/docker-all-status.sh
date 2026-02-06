#!/usr/bin/env bash
set -euo pipefail

echo "============================================"
echo "  AFDA — Local Docker Service Status"
echo "============================================"
echo ""

# ── Container status ─────────────────────────────────────────
CONTAINERS=("afda-postgres" "afda-mongodb" "afda-redis" "afda-n8n" "afda-prometheus" "afda-grafana")
LABELS=("PostgreSQL" "MongoDB" "Redis" "n8n" "Prometheus" "Grafana")
PORTS=(5432 27017 6379 5678 8000 9090 3000)

for i in "${!CONTAINERS[@]}"; do
  NAME="${CONTAINERS[$i]}"
  LABEL="${LABELS[$i]}"
  PORT="${PORTS[$i]}"

  STATUS=$(docker inspect --format='{{.State.Status}}' "$NAME" 2>/dev/null || echo "not found")
  HEALTH=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}n/a{{end}}' "$NAME" 2>/dev/null || echo "n/a")

  case "$STATUS" in
    running) ICON="🟢" ;;
    exited)  ICON="🔴" ;;
    *)       ICON="⚪" ;;
  esac

  printf "  %s %-12s  :%-5s  status=%-10s health=%s\n" "$ICON" "$LABEL" "$PORT" "$STATUS" "$HEALTH"
done

# ── Network ──────────────────────────────────────────────────
echo ""
echo "  Network:"
if docker network inspect afda-network >/dev/null 2>&1; then
  CONNECTED=$(docker network inspect afda-network --format='{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null)
  echo "    ✅ afda-network exists ($CONNECTED)"
else
  echo "    ❌ afda-network not found"
fi

# ── Disk usage ───────────────────────────────────────────────
echo ""
echo "  Volumes:"
docker system df --format '{{.Type}}\t{{.Size}}\t{{.Reclaimable}}' 2>/dev/null | head -5 || true

echo ""
