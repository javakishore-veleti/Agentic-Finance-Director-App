from uuid import UUID
from datetime import date
from typing import Optional, List
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.treasury.models import (
    BankAccount, CashPosition, CashTransaction, CashForecast, ArInvoice, LiquidityMetric,
)


class BankAccountDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, status: Optional[str] = None) -> List[BankAccount]:
        q = select(BankAccount)
        if status:
            q = q.where(BankAccount.status == status)
        result = await self.db.execute(q.order_by(BankAccount.bank_name))
        return list(result.scalars().all())

    async def get_by_id(self, account_id: UUID) -> Optional[BankAccount]:
        result = await self.db.execute(select(BankAccount).where(BankAccount.id == account_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> BankAccount:
        account = BankAccount(**data)
        self.db.add(account)
        await self.db.commit()
        await self.db.refresh(account)
        return account

    async def update(self, account_id: UUID, data: dict) -> Optional[BankAccount]:
        await self.db.execute(update(BankAccount).where(BankAccount.id == account_id).values(**data))
        await self.db.commit()
        return await self.get_by_id(account_id)


class CashPositionDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_current(self) -> Optional[CashPosition]:
        result = await self.db.execute(
            select(CashPosition).order_by(CashPosition.snapshot_date.desc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def get_history(self, days: int = 90) -> List[CashPosition]:
        result = await self.db.execute(
            select(CashPosition).order_by(CashPosition.snapshot_date.desc()).limit(days)
        )
        return list(result.scalars().all())


class CashForecastDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_forecast(self, scenario: str = "base", days: int = 90) -> List[CashForecast]:
        result = await self.db.execute(
            select(CashForecast)
                .where(CashForecast.scenario == scenario)
                .order_by(CashForecast.forecast_date)
                .limit(days)
        )
        return list(result.scalars().all())

    async def create(self, data: dict) -> CashForecast:
        forecast = CashForecast(**data)
        self.db.add(forecast)
        await self.db.commit()
        await self.db.refresh(forecast)
        return forecast


class ArInvoiceDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, status: Optional[str] = None, limit: int = 100, offset: int = 0) -> List[ArInvoice]:
        q = select(ArInvoice)
        if status:
            q = q.where(ArInvoice.status == status)
        result = await self.db.execute(q.order_by(ArInvoice.due_date).offset(offset).limit(limit))
        return list(result.scalars().all())

    async def get_aging_summary(self) -> list:
        result = await self.db.execute(
            select(
                ArInvoice.aging_bucket,
                func.count().label("count"),
                func.sum(ArInvoice.amount - ArInvoice.amount_paid).label("total_amount"),
            )
            .where(ArInvoice.status.in_(["open", "partial", "overdue"]))
            .group_by(ArInvoice.aging_bucket)
        )
        return [dict(row._mapping) for row in result.all()]

    async def get_total_receivables(self) -> float:
        result = await self.db.execute(
            select(func.sum(ArInvoice.amount - ArInvoice.amount_paid))
                .where(ArInvoice.status.in_(["open", "partial", "overdue"]))
        )
        return result.scalar() or 0.0

    async def get_total_overdue(self) -> float:
        result = await self.db.execute(
            select(func.sum(ArInvoice.amount - ArInvoice.amount_paid))
                .where(ArInvoice.status == "overdue")
        )
        return result.scalar() or 0.0


class LiquidityDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_latest(self) -> Optional[LiquidityMetric]:
        result = await self.db.execute(
            select(LiquidityMetric).order_by(LiquidityMetric.metric_date.desc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def get_history(self, days: int = 90) -> List[LiquidityMetric]:
        result = await self.db.execute(
            select(LiquidityMetric).order_by(LiquidityMetric.metric_date.desc()).limit(days)
        )
        return list(result.scalars().all())
