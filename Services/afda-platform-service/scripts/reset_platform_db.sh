#!/bin/bash
###############################################################################
# Reset platform database: drop -> create -> migrate -> seed
#
# Usage: cd Services/afda-platform-service && bash scripts/reset_platform_db.sh
# Or:    npm run db:platform:reset  (from repo root)
###############################################################################
set -e

DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5433}"
DB_USER="${POSTGRES_USER:-afda_platform}"
DB_PASS="${POSTGRES_PASSWORD:-platform_secret}"
DB_NAME="${POSTGRES_DB:-afda_platform_db}"

export PGPASSWORD="$DB_PASS"

echo ""
echo "  Resetting platform DB: $DB_NAME @ $DB_HOST:$DB_PORT"
echo ""

# 1. Drop existing database (terminate connections first)
echo "  [1/4] Dropping database..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
" 2>/dev/null || true

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "
    DROP DATABASE IF EXISTS $DB_NAME;
" 2>/dev/null || true

# 2. Create fresh database
echo "  [2/4] Creating database..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "
    CREATE DATABASE $DB_NAME OWNER $DB_USER;
"

# 3. Run Alembic migrations
echo "  [3/4] Running migrations (alembic upgrade head)..."
alembic upgrade head

# 4. Seed data
echo "  [4/4] Seeding demo data..."
python -m scripts.seed_platform

echo ""
echo "  Platform DB reset complete!"
echo "  Login: admin@acmefinancial.com / admin123"
echo ""
