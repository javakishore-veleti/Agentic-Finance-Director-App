"""
Seed script — populates PostgreSQL + MongoDB with sample data.
Run: cd Services/afda-crud-api && python -m scripts.seed_data
"""
import asyncio
import uuid
from datetime import datetime, date, timedelta
from sqlalchemy import text

# ── Bootstrap ──
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import get_settings
from app.database import engine, AsyncSessionLocal, connect_all, disconnect_all, Base, get_mongo


async def seed_postgres():
    from app.modules.command_center.models import KpiDefinition, KpiStatus, ActionItem, ActionItemStatus, ActionItemPriority, ExecutiveBriefing
    from app.modules.fpa.models import Budget, BudgetStatus, BudgetLineItem, VarianceRecord, Forecast
    from app.modules.treasury.models import BankAccount, AccountType, CashPosition, ArInvoice, LiquidityMetric
    from app.modules.accounting.models import ChartOfAccount, AccountCategory, ClosePeriod, CloseTask
    from app.modules.risk.models import Alert, AlertSeverity, AlertStatus, AlertCategory, AlertRule, RiskScore
    from app.modules.monitoring.models import ServiceRegistry, ServiceHealth
    from app.modules.admin.models import User, UserStatus, Role, PlatformSetting
    from passlib.context import CryptContext

    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # ── KPIs ──
        kpis = [
            KpiDefinition(name="Revenue Growth", category="revenue", unit="%", target_value=15.0, current_value=12.3, previous_value=10.1, status=KpiStatus.AT_RISK, trend_direction="up"),
            KpiDefinition(name="Gross Margin", category="margin", unit="%", target_value=65.0, current_value=67.2, previous_value=64.8, status=KpiStatus.ON_TRACK, trend_direction="up"),
            KpiDefinition(name="Operating Expenses", category="cost", unit="$", target_value=5000000, current_value=4800000, previous_value=4900000, status=KpiStatus.ON_TRACK, trend_direction="down"),
            KpiDefinition(name="Net Profit Margin", category="margin", unit="%", target_value=20.0, current_value=18.5, previous_value=19.2, status=KpiStatus.AT_RISK, trend_direction="down"),
            KpiDefinition(name="Cash Conversion Cycle", category="liquidity", unit="days", target_value=45, current_value=52, previous_value=48, status=KpiStatus.OFF_TRACK, trend_direction="up"),
            KpiDefinition(name="EBITDA", category="revenue", unit="$", target_value=8000000, current_value=7600000, previous_value=7200000, status=KpiStatus.ON_TRACK, trend_direction="up"),
        ]
        db.add_all(kpis)

        # ── Action Items ──
        actions = [
            ActionItem(title="Review Q1 variance report", status=ActionItemStatus.OPEN, priority=ActionItemPriority.HIGH, assignee="CFO", source_agent="AGT-001", due_date=datetime.utcnow() + timedelta(days=3)),
            ActionItem(title="Approve FY2026 budget", status=ActionItemStatus.IN_PROGRESS, priority=ActionItemPriority.CRITICAL, assignee="VP Finance", source_agent="AGT-013", due_date=datetime.utcnow() + timedelta(days=7)),
            ActionItem(title="Reconcile intercompany balances", status=ActionItemStatus.OPEN, priority=ActionItemPriority.MEDIUM, assignee="Controller", source_agent="AGT-044"),
            ActionItem(title="Update cash forecast model", status=ActionItemStatus.COMPLETED, priority=ActionItemPriority.HIGH, assignee="Treasury Analyst", source_agent="AGT-030", completed_at=datetime.utcnow()),
        ]
        db.add_all(actions)

        # ── Executive Briefing ──
        db.add(ExecutiveBriefing(
            title="Executive Briefing — 2025-Q4",
            summary="Revenue growth at 12.3% trailing target of 15%. Gross margin healthy at 67.2%. Cash conversion cycle deteriorating — needs attention.",
            key_insights='["Revenue 2.7% below target","Margin expansion driven by procurement savings","Working capital tightening"]',
            risk_highlights='["Cash cycle at 52 days vs 45 target","FX exposure increasing 12% QoQ"]',
            generated_by="AGT-001", period="2025-Q4", is_latest=True,
        ))

        # ── Budgets ──
        budget = Budget(name="FY2025 Operating Budget", fiscal_year=2025, department="All", status=BudgetStatus.ACTIVE, total_amount=24000000, currency="USD", created_by="VP Finance")
        db.add(budget)
        await db.flush()
        for month in range(1, 13):
            db.add(BudgetLineItem(budget_id=budget.id, account_code="5000", account_name="Operating Expenses", period=f"2025-{month:02d}", budgeted_amount=2000000, actual_amount=2000000 + (month * 15000 - 90000)))
            db.add(BudgetLineItem(budget_id=budget.id, account_code="4000", account_name="Revenue", period=f"2025-{month:02d}", budgeted_amount=3500000, actual_amount=3500000 + (month * 25000 - 150000)))

        # ── Variance Records ──
        for dept in ["Engineering", "Sales", "Marketing", "Finance", "Operations"]:
            db.add(VarianceRecord(period="2025-Q4", department=dept, account_code="5000", account_name="OpEx",
                budgeted=500000, actual=500000 + (hash(dept) % 80000 - 40000),
                variance_amount=(hash(dept) % 80000 - 40000), variance_pct=round((hash(dept) % 80000 - 40000) / 500000 * 100, 2)))

        # ── Forecasts ──
        for scenario in ["base", "optimistic", "pessimistic"]:
            multiplier = {"base": 1.0, "optimistic": 1.15, "pessimistic": 0.88}[scenario]
            db.add(Forecast(name="FY2026 Revenue Forecast", forecast_type="revenue", scenario=scenario,
                fiscal_year=2026, total_projected=42000000 * multiplier, confidence_score=85 if scenario == "base" else 70, methodology="ml", generated_by="AGT-018"))

        # ── Bank Accounts ──
        accounts = [
            BankAccount(bank_name="JP Morgan Chase", account_name="Operating Account", account_number_masked="****4521", account_type=AccountType.CHECKING, current_balance=3200000, available_balance=3200000, last_synced_at=datetime.utcnow()),
            BankAccount(bank_name="Bank of America", account_name="Payroll Account", account_number_masked="****7833", account_type=AccountType.CHECKING, current_balance=890000, available_balance=890000, last_synced_at=datetime.utcnow()),
            BankAccount(bank_name="Goldman Sachs", account_name="Investment Account", account_number_masked="****1290", account_type=AccountType.INVESTMENT, current_balance=5400000, available_balance=5400000, last_synced_at=datetime.utcnow()),
            BankAccount(bank_name="Wells Fargo", account_name="Credit Line", account_number_masked="****6012", account_type=AccountType.CREDIT_LINE, current_balance=0, available_balance=2000000, last_synced_at=datetime.utcnow()),
        ]
        db.add_all(accounts)

        # ── Cash Position ──
        for i in range(30):
            d = date.today() - timedelta(days=29 - i)
            db.add(CashPosition(snapshot_date=d, total_cash=4000000 + i * 20000, total_investments=5400000, total_credit_available=2000000, net_position=9400000 + i * 20000))

        # ── AR Invoices ──
        customers = ["Acme Corp", "GlobalTech Inc", "Summit Holdings", "Vertex Solutions", "Pinnacle Ltd"]
        for idx, cust in enumerate(customers):
            days_out = idx * 25
            db.add(ArInvoice(invoice_number=f"INV-2025-{1001+idx}", customer_name=cust, amount=150000 + idx * 30000,
                amount_paid=(150000 + idx * 30000) * (0 if idx > 2 else 0.5), issue_date=date.today() - timedelta(days=days_out + 30),
                due_date=date.today() - timedelta(days=days_out), days_outstanding=days_out,
                aging_bucket="current" if days_out < 1 else "1-30" if days_out < 31 else "31-60" if days_out < 61 else "61-90" if days_out < 91 else "90+",
                status="open" if days_out < 31 else "overdue"))

        # ── Liquidity ──
        db.add(LiquidityMetric(metric_date=date.today(), current_ratio=2.1, quick_ratio=1.8, cash_ratio=0.9,
            working_capital=4200000, days_cash_on_hand=95, burn_rate=420000, runway_months=22.5))

        # ── Chart of Accounts ──
        coa = [
            ("1000", "Cash & Equivalents", AccountCategory.ASSET),
            ("1100", "Accounts Receivable", AccountCategory.ASSET),
            ("1200", "Investments", AccountCategory.ASSET),
            ("2000", "Accounts Payable", AccountCategory.LIABILITY),
            ("2100", "Accrued Liabilities", AccountCategory.LIABILITY),
            ("3000", "Retained Earnings", AccountCategory.EQUITY),
            ("4000", "Revenue", AccountCategory.REVENUE),
            ("5000", "Operating Expenses", AccountCategory.EXPENSE),
            ("5100", "Cost of Goods Sold", AccountCategory.EXPENSE),
            ("5200", "Sales & Marketing", AccountCategory.EXPENSE),
        ]
        for code, name, cat in coa:
            db.add(ChartOfAccount(account_code=code, account_name=name, category=cat))

        # ── Close Period ──
        cp = ClosePeriod(period="2025-Q4", fiscal_year=2025, target_close_date=date(2026, 1, 15))
        db.add(cp)
        await db.flush()
        tasks = [
            ("Post final journal entries", "journal", 1),
            ("Complete bank reconciliations", "recon", 2),
            ("Reconcile intercompany", "recon", 3),
            ("Review trial balance", "review", 4),
            ("Generate financial statements", "review", 5),
            ("CFO sign-off", "approval", 6),
        ]
        for name, cat, order in tasks:
            db.add(CloseTask(period_id=cp.id, task_name=name, category=cat, sort_order=order, assignee="Controller"))

        # ── Alerts ──
        alerts = [
            Alert(title="Cash balance below threshold", severity=AlertSeverity.HIGH, category=AlertCategory.FINANCIAL, source_agent="AGT-069", affected_entity="Operating Account"),
            Alert(title="Unusual vendor payment pattern detected", severity=AlertSeverity.CRITICAL, category=AlertCategory.FRAUD, source_agent="AGT-070", affected_entity="AP-Vendor-0042"),
            Alert(title="Compliance filing deadline approaching", severity=AlertSeverity.MEDIUM, category=AlertCategory.COMPLIANCE, source_agent="AGT-080"),
            Alert(title="Budget overrun: Marketing dept 12% over", severity=AlertSeverity.HIGH, category=AlertCategory.FINANCIAL, source_agent="AGT-069", affected_entity="Marketing"),
        ]
        db.add_all(alerts)

        # ── Alert Rules ──
        rules = [
            AlertRule(name="Low Cash Alert", category=AlertCategory.FINANCIAL, severity=AlertSeverity.HIGH, condition_type="threshold", condition_config={"metric": "cash_balance", "operator": "<", "value": 1000000}),
            AlertRule(name="Large Transaction Alert", category=AlertCategory.FRAUD, severity=AlertSeverity.CRITICAL, condition_type="threshold", condition_config={"metric": "transaction_amount", "operator": ">", "value": 500000}),
            AlertRule(name="Variance Anomaly", category=AlertCategory.FINANCIAL, severity=AlertSeverity.MEDIUM, condition_type="anomaly", condition_config={"metric": "budget_variance_pct", "std_devs": 2}),
        ]
        db.add_all(rules)

        # ── Risk Scores ──
        scores = [
            RiskScore(entity_type="department", entity_name="Engineering", overall_score=35, financial_risk=20, operational_risk=45, compliance_risk=30, trend="stable"),
            RiskScore(entity_type="department", entity_name="Sales", overall_score=52, financial_risk=60, operational_risk=40, compliance_risk=50, trend="deteriorating"),
            RiskScore(entity_type="department", entity_name="Marketing", overall_score=68, financial_risk=75, operational_risk=55, compliance_risk=60, trend="deteriorating"),
            RiskScore(entity_type="vendor", entity_name="CloudHost Inc", overall_score=25, financial_risk=15, operational_risk=30, compliance_risk=20, trend="improving"),
            RiskScore(entity_type="process", entity_name="Month-End Close", overall_score=42, financial_risk=35, operational_risk=50, compliance_risk=45, trend="stable"),
        ]
        db.add_all(scores)

        # ── Service Registry ──
        services = [
            ServiceRegistry(service_name="afda-crud-api", display_name="CRUD API", service_type="api", host="localhost", port=8000, health_endpoint="/health", status=ServiceHealth.HEALTHY, uptime_pct=99.9, last_check_at=datetime.utcnow(), depends_on=["afda-postgres", "afda-redis"]),
            ServiceRegistry(service_name="afda-agent-gw", display_name="Agent Gateway", service_type="api", host="localhost", port=8001, health_endpoint="/api/v1/agents/health", status=ServiceHealth.HEALTHY, uptime_pct=99.8, last_check_at=datetime.utcnow(), depends_on=["afda-mongodb", "afda-redis", "afda-n8n"]),
            ServiceRegistry(service_name="afda-postgres", display_name="PostgreSQL", service_type="database", host="localhost", port=5432, status=ServiceHealth.HEALTHY, uptime_pct=99.99, last_check_at=datetime.utcnow()),
            ServiceRegistry(service_name="afda-mongodb", display_name="MongoDB", service_type="database", host="localhost", port=27017, status=ServiceHealth.HEALTHY, uptime_pct=99.95, last_check_at=datetime.utcnow()),
            ServiceRegistry(service_name="afda-redis", display_name="Redis", service_type="cache", host="localhost", port=6379, status=ServiceHealth.HEALTHY, uptime_pct=99.99, last_check_at=datetime.utcnow()),
            ServiceRegistry(service_name="afda-n8n", display_name="n8n Workflow Engine", service_type="agent_engine", host="localhost", port=5678, health_endpoint="/healthz", status=ServiceHealth.HEALTHY, uptime_pct=99.5, last_check_at=datetime.utcnow()),
            ServiceRegistry(service_name="afda-prometheus", display_name="Prometheus", service_type="monitoring", host="localhost", port=9090, status=ServiceHealth.HEALTHY, uptime_pct=99.9, last_check_at=datetime.utcnow()),
            ServiceRegistry(service_name="afda-grafana", display_name="Grafana", service_type="monitoring", host="localhost", port=3000, status=ServiceHealth.HEALTHY, uptime_pct=99.9, last_check_at=datetime.utcnow()),
        ]
        db.add_all(services)

        # ── Users & Roles ──
        admin_role = Role(name="admin", description="Full platform access", is_system=True,
            permissions={"command_center": ["read","write"], "fpa": ["read","write"], "treasury": ["read","write"], "accounting": ["read","write"], "risk": ["read","write"], "monitoring": ["read","write"], "admin": ["read","write"]})
        analyst_role = Role(name="analyst", description="Read access + FP&A write", is_system=True,
            permissions={"command_center": ["read"], "fpa": ["read","write"], "treasury": ["read"], "accounting": ["read"], "risk": ["read"], "monitoring": ["read"], "admin": []})
        viewer_role = Role(name="viewer", description="Read-only access", is_system=True,
            permissions={"command_center": ["read"], "fpa": ["read"], "treasury": ["read"], "accounting": ["read"], "risk": ["read"], "monitoring": ["read"], "admin": []})
        db.add_all([admin_role, analyst_role, viewer_role])

        db.add(User(email="admin@afda.io", display_name="System Admin", password_hash=pwd.hash("admin123"), department="IT"))
        db.add(User(email="cfo@afda.io", display_name="Jane Chen (CFO)", password_hash=pwd.hash("cfo123"), department="Finance"))
        db.add(User(email="analyst@afda.io", display_name="Alex Kim (Analyst)", password_hash=pwd.hash("analyst123"), department="FP&A"))

        # ── Platform Settings ──
        settings_data = [
            ("default_engine", "n8n", "agent", "Default agent orchestration engine"),
            ("session_timeout_minutes", "60", "security", "User session timeout"),
            ("max_tokens_per_request", "4096", "agent", "Max LLM tokens per agent request"),
            ("enable_audit_logging", "true", "security", "Enable audit trail"),
            ("default_currency", "USD", "general", "Default display currency"),
            ("fiscal_year_start_month", "1", "general", "Fiscal year start month"),
        ]
        for key, val, cat, desc in settings_data:
            db.add(PlatformSetting(key=key, value=val, category=cat, description=desc))

        await db.commit()
        print("  ✅ PostgreSQL seeded — all 7 modules")


async def seed_mongodb():
    mongo = get_mongo()

    # ── Sample conversation ──
    await mongo.agent_conversations.insert_one({
        "session_id": "demo-session-001",
        "engine": "n8n",
        "messages": [
            {"role": "user", "content": "What's our current cash position?", "timestamp": datetime.utcnow().isoformat(), "agent_id": None},
            {"role": "assistant", "content": "Your total cash across all accounts is $4.09M. Operating account holds $3.2M, payroll account $890K. Investment account at $5.4M. Credit line of $2M fully available. Net liquid position: $9.49M.", "timestamp": datetime.utcnow().isoformat(), "agent_id": "AGT-004"},
        ],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })

    # ── Sample workflow ──
    await mongo.workflow_definitions.insert_one({
        "name": "Monthly Financial Review",
        "description": "Automated month-end review: variance analysis → flux commentary → executive briefing",
        "engine": "n8n",
        "agent_ids": ["AGT-015", "AGT-017", "AGT-001"],
        "config": {"schedule": "0 8 1 * *", "notify_on_complete": True},
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })

    # ── Sample execution ──
    await mongo.agent_executions.insert_one({
        "session_id": "demo-session-001",
        "engine": "n8n",
        "agent_id": "AGT-004",
        "status": "completed",
        "started_at": datetime.utcnow(),
        "completed_at": datetime.utcnow(),
        "duration_ms": 1250,
        "input_summary": "What's our current cash position?",
        "output_summary": "Total cash $4.09M across all accounts...",
        "tokens_used": 320,
        "trace": [
            {"node": "router", "action": "classified as treasury query"},
            {"node": "AGT-004", "action": "queried cash_positions + bank_accounts"},
            {"node": "responder", "action": "formatted response"},
        ],
        "created_at": datetime.utcnow(),
    })

    print("  ✅ MongoDB seeded — conversations, workflows, executions")


async def main():
    print("\n🌱 Seeding AFDA database...")
    await connect_all()
    await seed_postgres()
    await seed_mongodb()
    await disconnect_all()
    print("\n🎉 Seed complete!\n")


if __name__ == "__main__":
    asyncio.run(main())
