"""
Platform Service Seed Script
Creates: 1 customer, 2 orgs, 4 roles, 3 users, user-org mappings, currencies.

Migrates the existing users from the old CRUD API users table to the new
platform_users table with proper customer/org/role bindings.

Run:
  cd Services/afda-platform-service
  python -m scripts.seed_platform
"""
import asyncio
import uuid
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import get_settings
from app.database import engine, AsyncSessionLocal, Base
from app.auth.password import hash_password
from app.modules.identity.models import (
    Customer, Organization, OrganizationCurrency,
    User, Role, UserOrganization,
)

settings = get_settings()

# ── Fixed UUIDs for deterministic seeding (same IDs across re-runs) ──
CUSTOMER_ID = uuid.UUID("00000000-0000-4000-a000-000000000001")
ORG_US_ID   = uuid.UUID("00000000-0000-4000-a000-000000000010")
ORG_EU_ID   = uuid.UUID("00000000-0000-4000-a000-000000000020")

ROLE_ADMIN_ID      = uuid.UUID("00000000-0000-4000-b000-000000000001")
ROLE_CONTROLLER_ID = uuid.UUID("00000000-0000-4000-b000-000000000002")
ROLE_ANALYST_ID    = uuid.UUID("00000000-0000-4000-b000-000000000003")
ROLE_VIEWER_ID     = uuid.UUID("00000000-0000-4000-b000-000000000004")

USER_ADMIN_ID   = uuid.UUID("00000000-0000-4000-c000-000000000001")
USER_CFO_ID     = uuid.UUID("00000000-0000-4000-c000-000000000002")
USER_ANALYST_ID = uuid.UUID("00000000-0000-4000-c000-000000000003")


async def seed():
    print("\n🌱 Seeding Platform Service database...\n")

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("  ✅ Tables created/verified")

    async with AsyncSessionLocal() as db:
        # ── Check if already seeded ──
        from sqlalchemy import select
        existing = await db.execute(select(Customer).where(Customer.id == CUSTOMER_ID))
        if existing.scalar_one_or_none():
            print("  ⏭️  Already seeded — skipping")
            return

        # ══════════════════════════════════════════════
        # 1. CUSTOMER
        # ══════════════════════════════════════════════
        customer = Customer(
            id=CUSTOMER_ID,
            name="Acme Financial Corp",
            slug="acme-financial",
            legal_name="Acme Financial Corporation, Inc.",
            industry="Financial Services",
            plan="enterprise",
            status="active",
            config_json={
                "branding": {"primary_color": "#1a56db", "logo_url": None},
                "limits": {"max_users": 50, "max_orgs": 10},
            },
        )
        db.add(customer)
        await db.flush()
        print("  ✅ Customer: Acme Financial Corp")

        # ══════════════════════════════════════════════
        # 2. ORGANIZATIONS
        # ══════════════════════════════════════════════
        org_us = Organization(
            id=ORG_US_ID,
            customer_id=CUSTOMER_ID,
            name="Acme US (HQ)",
            code="ACME-US",
            legal_entity_name="Acme Financial Corp — US Operations",
            country="US",
            timezone="America/New_York",
            fiscal_year_end_month=12,
            default_currency_code="USD",
            is_default=True,
            status="active",
        )
        db.add(org_us)

        org_eu = Organization(
            id=ORG_EU_ID,
            customer_id=CUSTOMER_ID,
            name="Acme EU",
            code="ACME-EU",
            legal_entity_name="Acme Financial GmbH",
            country="DE",
            timezone="Europe/Berlin",
            fiscal_year_end_month=12,
            default_currency_code="EUR",
            is_default=False,
            status="active",
        )
        db.add(org_eu)
        await db.flush()

        # Set default_organization_id on customer
        customer.default_organization_id = ORG_US_ID
        print("  ✅ Orgs: Acme US (HQ) + Acme EU")

        # ══════════════════════════════════════════════
        # 3. CURRENCIES
        # ══════════════════════════════════════════════
        currencies = [
            OrganizationCurrency(organization_id=ORG_US_ID, currency_code="USD", is_primary=True, is_reporting=True, status="active"),
            OrganizationCurrency(organization_id=ORG_US_ID, currency_code="EUR", is_primary=False, is_reporting=False, exchange_rate_source="ecb", status="active"),
            OrganizationCurrency(organization_id=ORG_EU_ID, currency_code="EUR", is_primary=True, is_reporting=True, status="active"),
            OrganizationCurrency(organization_id=ORG_EU_ID, currency_code="USD", is_primary=False, is_reporting=False, exchange_rate_source="ecb", status="active"),
        ]
        db.add_all(currencies)
        print("  ✅ Currencies: USD+EUR for US, EUR+USD for EU")

        # ══════════════════════════════════════════════
        # 4. ROLES
        # ══════════════════════════════════════════════
        roles = [
            Role(
                id=ROLE_ADMIN_ID,
                customer_id=CUSTOMER_ID,
                name="admin",
                description="Full access to all modules",
                permissions_json={
                    "command_center": ["read", "write", "delete"],
                    "fpa": ["read", "write", "delete"],
                    "treasury": ["read", "write", "delete"],
                    "accounting": ["read", "write", "delete"],
                    "risk": ["read", "write", "delete"],
                    "monitoring": ["read", "write", "delete"],
                    "agent_studio": ["read", "write", "delete"],
                    "admin": ["read", "write", "delete"],
                },
                is_system=True,
            ),
            Role(
                id=ROLE_CONTROLLER_ID,
                customer_id=CUSTOMER_ID,
                name="controller",
                description="Financial controller — full accounting + treasury access",
                permissions_json={
                    "command_center": ["read"],
                    "fpa": ["read", "write"],
                    "treasury": ["read", "write"],
                    "accounting": ["read", "write", "delete"],
                    "risk": ["read"],
                    "monitoring": ["read"],
                },
                is_system=True,
            ),
            Role(
                id=ROLE_ANALYST_ID,
                customer_id=CUSTOMER_ID,
                name="analyst",
                description="Financial analyst — read + FP&A write",
                permissions_json={
                    "command_center": ["read"],
                    "fpa": ["read", "write"],
                    "treasury": ["read"],
                    "accounting": ["read"],
                    "risk": ["read"],
                    "monitoring": ["read"],
                },
                is_system=True,
            ),
            Role(
                id=ROLE_VIEWER_ID,
                customer_id=CUSTOMER_ID,
                name="viewer",
                description="Read-only access",
                permissions_json={
                    "command_center": ["read"],
                    "fpa": ["read"],
                    "treasury": ["read"],
                },
                is_system=True,
            ),
        ]
        db.add_all(roles)
        print("  ✅ Roles: admin, controller, analyst, viewer")

        # ══════════════════════════════════════════════
        # 5. USERS (matching existing CRUD API users)
        # ══════════════════════════════════════════════
        users = [
            User(
                id=USER_ADMIN_ID,
                customer_id=CUSTOMER_ID,
                email="admin@afda.io",
                display_name="Aruna Kishore Veleti",
                password_hash=hash_password("admin123"),
                is_customer_admin=True,
                status="active",
            ),
            User(
                id=USER_CFO_ID,
                customer_id=CUSTOMER_ID,
                email="cfo@afda.io",
                display_name="Jane Chen (CFO)",
                password_hash=hash_password("cfo123"),
                is_customer_admin=False,
                status="active",
            ),
            User(
                id=USER_ANALYST_ID,
                customer_id=CUSTOMER_ID,
                email="analyst@afda.io",
                display_name="Alex Kim (Analyst)",
                password_hash=hash_password("analyst123"),
                is_customer_admin=False,
                status="active",
            ),
        ]
        db.add_all(users)
        print("  ✅ Users: admin@afda.io, cfo@afda.io, analyst@afda.io")

        # ══════════════════════════════════════════════
        # 6. USER-ORGANIZATION MAPPINGS
        # ══════════════════════════════════════════════
        mappings = [
            # Admin → both orgs
            UserOrganization(user_id=USER_ADMIN_ID, organization_id=ORG_US_ID, role_id=ROLE_ADMIN_ID, is_default=True, status="active"),
            UserOrganization(user_id=USER_ADMIN_ID, organization_id=ORG_EU_ID, role_id=ROLE_ADMIN_ID, is_default=False, status="active"),
            # CFO → US org as controller
            UserOrganization(user_id=USER_CFO_ID, organization_id=ORG_US_ID, role_id=ROLE_CONTROLLER_ID, is_default=True, status="active"),
            # Analyst → US org as analyst
            UserOrganization(user_id=USER_ANALYST_ID, organization_id=ORG_US_ID, role_id=ROLE_ANALYST_ID, is_default=True, status="active"),
        ]
        db.add_all(mappings)
        print("  ✅ User-Org mappings: Admin→US+EU, CFO→US, Analyst→US")

        # ── Commit all ──
        await db.commit()

    print("\n✅ Platform Service seeding complete!")
    print(f"\n  Login credentials:")
    print(f"    admin@afda.io    / admin123    (customer admin, US + EU orgs)")
    print(f"    cfo@afda.io      / cfo123      (controller, US org)")
    print(f"    analyst@afda.io  / analyst123   (analyst, US org)")
    print(f"\n  Organization IDs:")
    print(f"    US (HQ): {ORG_US_ID}")
    print(f"    EU:      {ORG_EU_ID}")
    print(f"\n  Customer ID: {CUSTOMER_ID}")


if __name__ == "__main__":
    asyncio.run(seed())
