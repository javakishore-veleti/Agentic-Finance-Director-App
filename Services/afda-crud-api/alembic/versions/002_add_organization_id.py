"""Add organization_id to all domain tables.

Revision ID: 002_add_org_id
Revises: None
Create Date: 2024-01-01 00:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '002_add_org_id'
down_revision = None
branch_labels = None
depends_on = None

# All domain tables that need organization_id
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


def upgrade() -> None:
    for table in DOMAIN_TABLES:
        # Add nullable first (for existing data)
        op.add_column(table, sa.Column(
            'organization_id',
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ))
        # Add index
        op.create_index(
            f'idx_{table}_org_id',
            table,
            ['organization_id'],
        )


def downgrade() -> None:
    for table in DOMAIN_TABLES:
        op.drop_index(f'idx_{table}_org_id', table_name=table)
        op.drop_column(table, 'organization_id')
