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

#from app.database import engine, async_session_factory
from app.database import engine, AsyncSessionLocal as async_session_factory
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
                VALUES (:id, :cid, :name, :desc, CAST(:perms AS jsonb), true, :now)
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
