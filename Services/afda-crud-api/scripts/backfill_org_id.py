"""
Backfill organization_id on all existing CRUD API domain tables.

Sets all rows to the Acme US (HQ) organization — the default org
from the platform service seed data.

Run:
  cd Services/afda-crud-api
  python -m scripts.backfill_org_id
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# The default organization UUID from platform seed
DEFAULT_ORG_ID = "00000000-0000-4000-a000-000000000010"

# All domain tables that got the organization_id column
DOMAIN_TABLES = [
    # Command Center
    "kpi_definitions",
    "kpi_values",
    "executive_briefings",
    "action_items",
    # FPA
    "budgets",
    "budget_line_items",
    "variance_records",
    "flux_commentaries",
    "forecasts",
    "fpa_reports",
    # Treasury
    "bank_accounts",
    "cash_positions",
    "cash_transactions",
    "cash_forecasts",
    "ar_invoices",
    "liquidity_metrics",
    # Accounting
    "chart_of_accounts",
    "journal_entries",
    "journal_lines",
    "trial_balances",
    "intercompany_transactions",
    "reconciliations",
    "recon_items",
    "close_periods",
    "close_tasks",
    # Risk
    "alerts",
    "alert_rules",
    "risk_scores",
    "alert_history",
    # Monitoring
    "service_registry",
    "incidents",
    "api_metrics_log",
]


async def backfill():
    from app.database import engine
    from sqlalchemy import text

    print("\n🔄 Backfilling organization_id on CRUD API tables...\n")

    async with engine.begin() as conn:
        for table in DOMAIN_TABLES:
            try:
                # Check if column exists
                check = await conn.execute(text(f"""
                    SELECT column_name FROM information_schema.columns
                    WHERE table_name = '{table}' AND column_name = 'organization_id'
                """))
                if not check.fetchone():
                    # Column doesn't exist yet — add it
                    await conn.execute(text(f"""
                        ALTER TABLE {table}
                        ADD COLUMN IF NOT EXISTS organization_id UUID
                    """))
                    # Create index
                    await conn.execute(text(f"""
                        CREATE INDEX IF NOT EXISTS idx_{table}_org_id
                        ON {table}(organization_id)
                    """))

                # Backfill NULL rows
                result = await conn.execute(text(f"""
                    UPDATE {table}
                    SET organization_id = :org_id
                    WHERE organization_id IS NULL
                """), {"org_id": DEFAULT_ORG_ID})

                rows = result.rowcount
                status = f"  ✅ {table:40s} — {rows} rows updated" if rows > 0 else f"  ⏭️  {table:40s} — no rows to update"
                print(status)

            except Exception as e:
                print(f"  ⚠️  {table:40s} — {e}")

    print("\n✅ Backfill complete — all existing data assigned to Acme US (HQ) org")
    print(f"   Organization ID: {DEFAULT_ORG_ID}")


if __name__ == "__main__":
    asyncio.run(backfill())
