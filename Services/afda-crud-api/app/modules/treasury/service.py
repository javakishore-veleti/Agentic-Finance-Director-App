from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.treasury.dao import (
    BankAccountDAO, CashPositionDAO, CashForecastDAO, ArInvoiceDAO, LiquidityDAO,
)
from app.modules.treasury.dtos import (
    BankAccountCreate, BankAccountUpdate, CashPositionSummary,
    ArAgingSummary, AgingBucketSummary, LiquidityRatios,
)
from app.shared.exceptions import NotFoundException


class BankAccountService:
    def __init__(self, db: AsyncSession):
        self.dao = BankAccountDAO(db)

    async def list_accounts(self, status=None):
        return await self.dao.get_all(status)

    async def get_account(self, account_id: UUID):
        account = await self.dao.get_by_id(account_id)
        if not account:
            raise NotFoundException("Bank Account", account_id)
        return account

    async def create_account(self, data: BankAccountCreate):
        return await self.dao.create(data.model_dump())

    async def update_account(self, account_id: UUID, data: BankAccountUpdate):
        existing = await self.dao.get_by_id(account_id)
        if not existing:
            raise NotFoundException("Bank Account", account_id)
        return await self.dao.update(account_id, data.model_dump(exclude_unset=True))


class CashPositionService:
    def __init__(self, db: AsyncSession):
        self.position_dao = CashPositionDAO(db)
        self.account_dao = BankAccountDAO(db)

    async def get_current(self) -> CashPositionSummary:
        accounts = await self.account_dao.get_all(status="active")
        total_cash = sum(a.current_balance for a in accounts if a.account_type.value in ("checking", "savings"))
        total_inv = sum(a.current_balance for a in accounts if a.account_type.value == "investment")
        total_credit = sum(a.available_balance for a in accounts if a.account_type.value == "credit_line")
        last_sync = max((a.last_synced_at for a in accounts if a.last_synced_at), default=None)
        return CashPositionSummary(
            total_cash=total_cash,
            total_investments=total_inv,
            total_credit_available=total_credit,
            net_position=total_cash + total_inv,
            accounts_count=len(accounts),
            last_updated=last_sync,
        )

    async def get_history(self, days=90):
        return await self.position_dao.get_history(days)


class CashForecastService:
    def __init__(self, db: AsyncSession):
        self.dao = CashForecastDAO(db)

    async def get_forecast(self, scenario="base", days=90):
        return await self.dao.get_forecast(scenario, days)

    async def generate_forecast(self):
        # Placeholder — AGT-030 (Cash Flow Forecast Agent) generates this
        from datetime import date, timedelta
        entries = []
        base_balance = 2_500_000.0
        for i in range(30):
            d = date.today() + timedelta(days=i)
            inflow = 85000 + (i * 1000)
            outflow = 72000 + (i * 800)
            base_balance += inflow - outflow
            entry = await self.dao.create({
                "forecast_date": d,
                "projected_inflow": inflow,
                "projected_outflow": outflow,
                "projected_balance": base_balance,
                "scenario": "base",
                "confidence_score": max(95 - i, 60),
                "generated_by": "AGT-030",
            })
            entries.append(entry)
        return entries


class ArAgingService:
    def __init__(self, db: AsyncSession):
        self.dao = ArInvoiceDAO(db)

    async def get_summary(self) -> ArAgingSummary:
        total_recv = await self.dao.get_total_receivables()
        total_overdue = await self.dao.get_total_overdue()
        raw_buckets = await self.dao.get_aging_summary()
        buckets = [
            AgingBucketSummary(
                bucket=b["aging_bucket"],
                count=b["count"],
                total_amount=b["total_amount"] or 0,
                percentage=round((b["total_amount"] or 0) / total_recv * 100, 2) if total_recv else 0,
            )
            for b in raw_buckets
        ]
        return ArAgingSummary(total_receivables=total_recv, total_overdue=total_overdue, buckets=buckets)

    async def get_buckets(self):
        return await self.dao.get_aging_summary()

    async def get_invoices(self, status=None, limit=100, offset=0):
        return await self.dao.get_all(status, limit, offset)


class LiquidityService:
    def __init__(self, db: AsyncSession):
        self.dao = LiquidityDAO(db)

    async def get_metrics(self):
        return await self.dao.get_history()

    async def get_ratios(self) -> LiquidityRatios:
        latest = await self.dao.get_latest()
        if not latest:
            raise NotFoundException("Liquidity Metrics")
        return LiquidityRatios(
            current_ratio=latest.current_ratio,
            quick_ratio=latest.quick_ratio,
            cash_ratio=latest.cash_ratio,
            working_capital=latest.working_capital,
            days_cash_on_hand=latest.days_cash_on_hand,
            burn_rate=latest.burn_rate,
            runway_months=latest.runway_months,
            as_of=latest.metric_date,
        )
