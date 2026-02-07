#!/bin/bash
###############################################################################
# 29_platform_alembic_setup.sh
#
# Wires platform service DB management into Alembic + package.json
#
# Creates:
#   Services/afda-platform-service/alembic/versions/001_initial_schema.py
#   Services/afda-platform-service/scripts/seed_platform.py (updated)
#
# Adds to package.json:
#   npm run db:platform:migrate   -> alembic upgrade head
#   npm run db:platform:reset     -> drop + create DB + migrate + seed
#   npm run db:platform:seed      -> seed initial data
#
# After this script:
#   npm run db:platform:reset     -> fresh DB (your laptop or new laptop)
#   npm run dev:all               -> starts everything
#
# Run from: git repo root
###############################################################################
set -e

SVC="Services/afda-platform-service"
VERSIONS="$SVC/alembic/versions"
ROOT_PKG="package.json"

echo "========================================"
echo "  [29] Platform Alembic + DB Scripts"
echo "========================================"

mkdir -p "$VERSIONS"
mkdir -p "$SVC/scripts"

# ==============================================================
# PART 1: Alembic migration — 001_initial_schema.py
# ==============================================================
echo ""
echo "--- 1/5 Alembic migration (001) ---"

cat > "$VERSIONS/001_initial_schema.py" << 'PYEOF'
"""Initial platform schema - all 11 tables.

Revision ID: 001_initial_schema
Revises: None
Create Date: 2025-01-15 00:00:00

Tables:
  Identity: customer, organization, organization_currency,
            platform_user, role, user_organization
  Access:   org_access_policy
  Config:   api_key, data_connection, platform_setting, audit_log
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # -- customer --
    op.create_table(
        'customer',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(300), nullable=False),
        sa.Column('slug', sa.String(100), unique=True, nullable=False),
        sa.Column('legal_name', sa.String(500), nullable=True),
        sa.Column('industry', sa.String(100), nullable=True),
        sa.Column('plan', sa.String(50), server_default='free'),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.Column('default_organization_id', UUID(as_uuid=True), nullable=True),
        sa.Column('config_json', JSONB, server_default='{}'),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()')),
    )

    # -- organization --
    op.create_table(
        'organization',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=False),
        sa.Column('name', sa.String(300), nullable=False),
        sa.Column('code', sa.String(20), nullable=False),
        sa.Column('legal_entity_name', sa.String(500), nullable=True),
        sa.Column('country', sa.String(3), nullable=True),
        sa.Column('timezone', sa.String(50), server_default='America/New_York'),
        sa.Column('fiscal_year_end_month', sa.SmallInteger, server_default='12'),
        sa.Column('default_currency_code', sa.String(3), server_default='USD'),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.Column('is_default', sa.Boolean, server_default='false'),
        sa.Column('settings_json', JSONB, server_default='{}'),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()')),
        sa.UniqueConstraint('customer_id', 'code', name='uq_org_customer_code'),
    )
    op.create_index('idx_org_customer', 'organization', ['customer_id'])

    # -- organization_currency --
    op.create_table(
        'organization_currency',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('organization_id', UUID(as_uuid=True), sa.ForeignKey('organization.id'), nullable=False),
        sa.Column('currency_code', sa.String(3), nullable=False),
        sa.Column('is_primary', sa.Boolean, server_default='false'),
        sa.Column('is_reporting', sa.Boolean, server_default='false'),
        sa.Column('exchange_rate_source', sa.String(50), server_default='manual'),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.UniqueConstraint('organization_id', 'currency_code', name='uq_org_currency'),
    )
    op.create_index('idx_orgcurr_org', 'organization_currency', ['organization_id'])

    # -- platform_user --
    op.create_table(
        'platform_user',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=False),
        sa.Column('email', sa.String(300), unique=True, nullable=False),
        sa.Column('display_name', sa.String(200), nullable=False),
        sa.Column('password_hash', sa.String(500), nullable=False),
        sa.Column('department', sa.String(100), nullable=True),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.Column('is_customer_admin', sa.Boolean, server_default='false'),
        sa.Column('last_login_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()')),
    )
    op.create_index('idx_user_customer', 'platform_user', ['customer_id'])
    op.create_index('idx_user_email', 'platform_user', ['email'])

    # -- role --
    op.create_table(
        'role',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('permissions_json', JSONB, server_default='{}'),
        sa.Column('is_system', sa.Boolean, server_default='false'),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
    )
    op.create_index('idx_role_customer', 'role', ['customer_id'])

    # -- user_organization --
    op.create_table(
        'user_organization',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('platform_user.id'), nullable=False),
        sa.Column('organization_id', UUID(as_uuid=True), sa.ForeignKey('organization.id'), nullable=False),
        sa.Column('role_id', UUID(as_uuid=True), sa.ForeignKey('role.id'), nullable=False),
        sa.Column('is_default', sa.Boolean, server_default='false'),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
        sa.UniqueConstraint('user_id', 'organization_id', name='uq_user_org'),
    )
    op.create_index('idx_userog_user', 'user_organization', ['user_id'])
    op.create_index('idx_userog_org', 'user_organization', ['organization_id'])

    # -- org_access_policy --
    op.create_table(
        'org_access_policy',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=False),
        sa.Column('from_organization_id', UUID(as_uuid=True), sa.ForeignKey('organization.id'), nullable=False),
        sa.Column('to_organization_id', UUID(as_uuid=True), sa.ForeignKey('organization.id'), nullable=False),
        sa.Column('domain', sa.String(50), nullable=False),
        sa.Column('row_type', sa.String(20), nullable=False),
        sa.Column('access_level', sa.String(20), server_default='view'),
        sa.Column('access_config_json', JSONB, server_default='{}'),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('granted_by_user_id', UUID(as_uuid=True), sa.ForeignKey('platform_user.id'), nullable=True),
        sa.Column('expires_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()')),
        sa.UniqueConstraint(
            'from_organization_id', 'to_organization_id', 'domain', 'row_type',
            name='uq_access_policy'
        ),
        sa.CheckConstraint(
            'from_organization_id != to_organization_id',
            name='ck_no_self_sharing'
        ),
    )
    op.create_index('idx_access_from_org', 'org_access_policy', ['from_organization_id'])
    op.create_index('idx_access_to_org', 'org_access_policy', ['to_organization_id'])
    op.create_index('idx_access_customer', 'org_access_policy', ['customer_id'])

    # -- api_key --
    op.create_table(
        'api_key',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=False),
        sa.Column('organization_id', UUID(as_uuid=True), sa.ForeignKey('organization.id'), nullable=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('key_prefix', sa.String(20), nullable=False),
        sa.Column('key_hash', sa.String(64), nullable=False),
        sa.Column('scopes', JSONB, server_default='[]'),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('expires_at', sa.DateTime, nullable=True),
        sa.Column('created_by', UUID(as_uuid=True), sa.ForeignKey('platform_user.id'), nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
        sa.Column('last_used_at', sa.DateTime, nullable=True),
    )
    op.create_index('idx_apikey_customer', 'api_key', ['customer_id'])
    op.create_index('idx_apikey_prefix', 'api_key', ['key_prefix'])

    # -- data_connection --
    op.create_table(
        'data_connection',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=False),
        sa.Column('organization_id', UUID(as_uuid=True), sa.ForeignKey('organization.id'), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('connection_type', sa.String(50), nullable=False),
        sa.Column('provider', sa.String(100), nullable=True),
        sa.Column('config_json', JSONB, server_default='{}'),
        sa.Column('status', sa.String(20), server_default='pending'),
        sa.Column('sync_frequency', sa.String(20), server_default='daily'),
        sa.Column('last_sync_at', sa.DateTime, nullable=True),
        sa.Column('last_error', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()')),
    )
    op.create_index('idx_dataconn_customer', 'data_connection', ['customer_id'])

    # -- platform_setting --
    op.create_table(
        'platform_setting',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=True),
        sa.Column('organization_id', UUID(as_uuid=True), sa.ForeignKey('organization.id'), nullable=True),
        sa.Column('key', sa.String(200), nullable=False),
        sa.Column('value', sa.Text, nullable=True),
        sa.Column('category', sa.String(50), server_default='general'),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('updated_by', UUID(as_uuid=True), sa.ForeignKey('platform_user.id'), nullable=True),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()')),
    )
    op.create_index('idx_setting_lookup', 'platform_setting', ['customer_id', 'organization_id', 'key'])

    # -- audit_log --
    op.create_table(
        'audit_log',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('platform_user.id'), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('resource_type', sa.String(50), nullable=True),
        sa.Column('resource_id', sa.String(100), nullable=True),
        sa.Column('details_json', JSONB, server_default='{}'),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('actor_email', sa.String(300), nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
    )
    op.create_index('idx_audit_customer', 'audit_log', ['customer_id'])
    op.create_index('idx_audit_user', 'audit_log', ['user_id'])
    op.create_index('idx_audit_action', 'audit_log', ['action'])


def downgrade() -> None:
    op.drop_table('audit_log')
    op.drop_table('platform_setting')
    op.drop_table('data_connection')
    op.drop_table('api_key')
    op.drop_table('org_access_policy')
    op.drop_table('user_organization')
    op.drop_table('role')
    op.drop_table('platform_user')
    op.drop_table('organization_currency')
    op.drop_table('organization')
    op.drop_table('customer')
PYEOF

echo "  Done: alembic/versions/001_initial_schema.py (11 tables)"

# ==============================================================
# PART 2: Update main.py — remove create_all, use Alembic only
# ==============================================================
echo ""
echo "--- 2/5 Update main.py (remove create_all) ---"

MAIN="$SVC/app/main.py"
if [ -f "$MAIN" ]; then
    # Replace create_all block with a comment
    if grep -q "Base.metadata.create_all" "$MAIN"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' 's/async with engine.begin() as conn:/# Tables managed by Alembic — run: npm run db:platform:migrate/g' "$MAIN"
            sed -i '' 's/.*await conn.run_sync(Base.metadata.create_all).*/#     cd Services\/afda-platform-service \&\& alembic upgrade head/g' "$MAIN"
        else
            sed -i 's/async with engine.begin() as conn:/# Tables managed by Alembic — run: npm run db:platform:migrate/g' "$MAIN"
            sed -i 's/.*await conn.run_sync(Base.metadata.create_all).*/#     cd Services\/afda-platform-service \&\& alembic upgrade head/g' "$MAIN"
        fi
        echo "  Done: removed Base.metadata.create_all from main.py"
    else
        echo "  Skipped: create_all not found (already removed?)"
    fi
else
    echo "  Warning: main.py not found at $MAIN"
fi

# ==============================================================
# PART 3: Seed script — create demo customer + user + org
# ==============================================================
echo ""
echo "--- 3/5 Seed script ---"

cat > "$SVC/scripts/seed_platform.py" << 'PYEOF'
"""
Seed platform database with demo data.
Run: cd Services/afda-platform-service && python -m scripts.seed_platform

Creates:
  - Customer: Acme Financial Corp
  - Organization: ACME-HQ (default)
  - Admin user: admin@acmefinancial.com / admin123
  - Roles: Admin, Analyst, Viewer (system roles)
"""
import asyncio
import uuid
from datetime import datetime

from app.database import engine, async_session_factory
from app.auth.password import hash_password


async def seed():
    async with async_session_factory() as session:
        from sqlalchemy import text, select

        # Check if already seeded
        result = await session.execute(
            text("SELECT id FROM customer WHERE slug = 'acme-financial' LIMIT 1")
        )
        if result.scalar():
            print("Already seeded. Skipping.")
            return

        # Fixed UUIDs for reproducibility
        customer_id = uuid.UUID("11111111-1111-1111-1111-111111111111")
        org_id = uuid.UUID("22222222-2222-2222-2222-222222222222")
        admin_user_id = uuid.UUID("24bffd20-b3bc-4b04-8cb7-1e8f44e9d084")
        admin_role_id = uuid.UUID("33333333-3333-3333-3333-333333333333")
        analyst_role_id = uuid.UUID("33333333-3333-3333-3333-333333333334")
        viewer_role_id = uuid.UUID("33333333-3333-3333-3333-333333333335")
        now = datetime.utcnow()

        # 1. Customer
        await session.execute(text("""
            INSERT INTO customer (id, name, slug, legal_name, industry, plan, status, default_organization_id, config_json, created_at, updated_at)
            VALUES (:id, :name, :slug, :legal_name, :industry, 'pro', 'active', :org_id, '{}', :now, :now)
        """), {
            "id": customer_id, "name": "Acme Financial Corp",
            "slug": "acme-financial", "legal_name": "Acme Financial Corporation Inc.",
            "industry": "Financial Services", "org_id": org_id, "now": now,
        })

        # 2. Organization
        await session.execute(text("""
            INSERT INTO organization (id, customer_id, name, code, legal_entity_name, country, timezone, fiscal_year_end_month, default_currency_code, status, is_default, settings_json, created_at, updated_at)
            VALUES (:id, :cid, :name, :code, :legal, 'USA', 'America/New_York', 12, 'USD', 'active', true, '{}', :now, :now)
        """), {
            "id": org_id, "cid": customer_id, "name": "Acme HQ",
            "code": "ACME-HQ", "legal": "Acme Financial Corporation Inc.", "now": now,
        })

        # 3. Roles
        for rid, rname, rdesc in [
            (admin_role_id, "Admin", "Full platform access"),
            (analyst_role_id, "Analyst", "Read/write access to financial data"),
            (viewer_role_id, "Viewer", "Read-only access"),
        ]:
            perms = '{}'
            if rname == "Admin":
                perms = '{"admin": true, "users.manage": true, "settings.manage": true, "connections.manage": true}'
            elif rname == "Analyst":
                perms = '{"data.read": true, "data.write": true, "reports.create": true}'
            else:
                perms = '{"data.read": true}'
            await session.execute(text("""
                INSERT INTO role (id, customer_id, name, description, permissions_json, is_system, created_at)
                VALUES (:id, :cid, :name, :desc, :perms::jsonb, true, :now)
            """), {
                "id": rid, "cid": customer_id, "name": rname,
                "desc": rdesc, "perms": perms, "now": now,
            })

        # 4. Admin user
        pw_hash = hash_password("admin123")
        await session.execute(text("""
            INSERT INTO platform_user (id, customer_id, email, display_name, password_hash, department, avatar_url, status, is_customer_admin, created_at, updated_at)
            VALUES (:id, :cid, :email, :name, :pw, :dept, null, 'active', true, :now, :now)
        """), {
            "id": admin_user_id, "cid": customer_id,
            "email": "admin@acmefinancial.com", "name": "Platform Admin",
            "pw": pw_hash, "dept": "Engineering", "now": now,
        })

        # 5. User-Org mapping
        await session.execute(text("""
            INSERT INTO user_organization (id, user_id, organization_id, role_id, is_default, status, created_at)
            VALUES (:id, :uid, :oid, :rid, true, 'active', :now)
        """), {
            "id": uuid.uuid4(), "uid": admin_user_id,
            "oid": org_id, "rid": admin_role_id, "now": now,
        })

        await session.commit()

        print("Seed complete:")
        print(f"  Customer: Acme Financial Corp ({customer_id})")
        print(f"  Org:      ACME-HQ ({org_id})")
        print(f"  Admin:    admin@acmefinancial.com / admin123")
        print(f"  Roles:    Admin, Analyst, Viewer")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
PYEOF

echo "  Done: scripts/seed_platform.py"

# ==============================================================
# PART 4: DB reset script (drop + create + migrate + seed)
# ==============================================================
echo ""
echo "--- 4/5 DB reset script ---"

cat > "$SVC/scripts/reset_platform_db.sh" << 'BASHEOF'
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
BASHEOF

chmod +x "$SVC/scripts/reset_platform_db.sh"
echo "  Done: scripts/reset_platform_db.sh"

# ==============================================================
# PART 5: Add npm scripts to root package.json
# ==============================================================
echo ""
echo "--- 5/5 Update package.json ---"

if [ -f "$ROOT_PKG" ]; then
    python3 << 'PYEOF'
import json

with open("package.json", "r") as f:
    pkg = json.load(f)

scripts = pkg.get("scripts", {})

venv = "$HOME/runtime_data/python_venvs/Agentic-Finance-Director-App_venv"
svc = "Services/afda-platform-service"

# DB management scripts
scripts["db:platform:migrate"] = f"VENV={venv} && cd {svc} && $VENV/bin/alembic upgrade head"
scripts["db:platform:reset"] = f"VENV={venv} && cd {svc} && bash scripts/reset_platform_db.sh"
scripts["db:platform:seed"] = f"VENV={venv} && cd {svc} && $VENV/bin/python -m scripts.seed_platform"
scripts["db:platform:current"] = f"VENV={venv} && cd {svc} && $VENV/bin/alembic current"

pkg["scripts"] = scripts

with open("package.json", "w") as f:
    json.dump(pkg, f, indent=2)

print("  Added to package.json:")
print("    npm run db:platform:migrate  -> alembic upgrade head")
print("    npm run db:platform:reset    -> drop + create + migrate + seed")
print("    npm run db:platform:seed     -> seed demo data")
print("    npm run db:platform:current  -> show current migration")
PYEOF
else
    echo "  Warning: package.json not found."
    echo "  Add these scripts manually:"
    echo '    "db:platform:migrate": "cd Services/afda-platform-service && alembic upgrade head"'
    echo '    "db:platform:reset": "cd Services/afda-platform-service && bash scripts/reset_platform_db.sh"'
    echo '    "db:platform:seed": "cd Services/afda-platform-service && python -m scripts.seed_platform"'
fi

echo ""
echo "========================================"
echo "  [29] Complete!"
echo "========================================"
echo ""
echo "  Files created:"
echo "    $VERSIONS/001_initial_schema.py"
echo "    $SVC/scripts/seed_platform.py"
echo "    $SVC/scripts/reset_platform_db.sh"
echo ""
echo "  NOW RUN (to reset your DB fresh):"
echo "    npm run db:platform:reset"
echo ""
echo "  THEN:"
echo "    npm run dev:all"
echo ""
echo "  ON A NEW LAPTOP:"
echo "    1. docker compose up -d        (start Postgres)"
echo "    2. npm run db:platform:reset   (create + migrate + seed)"
echo "    3. npm run dev:all             (start all services)"
echo ""
echo "  FUTURE SCHEMA CHANGES:"
echo "    cd Services/afda-platform-service"
echo "    alembic revision -m 'add_xyz_column'"
echo "    # edit the generated migration file"
echo "    npm run db:platform:migrate"
echo "========================================"
