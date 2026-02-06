from uuid import UUID
from typing import Optional, List
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.modules.accounting.models import (
    JournalEntry, JournalLine, TrialBalance, IntercompanyTransaction,
    Reconciliation, ReconItem, ClosePeriod, CloseTask,
)


class JournalEntryDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, status: Optional[str] = None, limit: int = 50, offset: int = 0) -> List[JournalEntry]:
        q = select(JournalEntry)
        if status:
            q = q.where(JournalEntry.status == status)
        result = await self.db.execute(q.order_by(JournalEntry.entry_date.desc()).offset(offset).limit(limit))
        return list(result.scalars().all())

    async def get_by_id(self, entry_id: UUID) -> Optional[JournalEntry]:
        result = await self.db.execute(
            select(JournalEntry).options(selectinload(JournalEntry.lines)).where(JournalEntry.id == entry_id)
        )
        return result.scalar_one_or_none()

    async def create(self, entry_data: dict, lines_data: list) -> JournalEntry:
        entry = JournalEntry(**entry_data)
        self.db.add(entry)
        await self.db.flush()
        for line in lines_data:
            self.db.add(JournalLine(**line, entry_id=entry.id))
        await self.db.commit()
        await self.db.refresh(entry)
        return await self.get_by_id(entry.id)


class TrialBalanceDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_period(self, period: str) -> List[TrialBalance]:
        result = await self.db.execute(
            select(TrialBalance).where(TrialBalance.period == period).order_by(TrialBalance.account_code)
        )
        return list(result.scalars().all())

    async def get_comparison(self, period1: str, period2: str) -> list:
        tb1 = {r.account_code: r for r in await self.get_by_period(period1)}
        tb2 = {r.account_code: r for r in await self.get_by_period(period2)}
        all_codes = sorted(set(list(tb1.keys()) + list(tb2.keys())))
        comparison = []
        for code in all_codes:
            r1 = tb1.get(code)
            r2 = tb2.get(code)
            b1 = r1.net_balance if r1 else 0
            b2 = r2.net_balance if r2 else 0
            change = b2 - b1
            pct = round((change / b1) * 100, 2) if b1 != 0 else 0
            comparison.append({
                "account_code": code,
                "account_name": (r1 or r2).account_name,
                "category": (r1 or r2).category,
                "period_1_balance": b1,
                "period_2_balance": b2,
                "change": change,
                "change_pct": pct,
            })
        return comparison


class IntercompanyDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, status: Optional[str] = None) -> List[IntercompanyTransaction]:
        q = select(IntercompanyTransaction)
        if status:
            q = q.where(IntercompanyTransaction.status == status)
        result = await self.db.execute(q.order_by(IntercompanyTransaction.transaction_date.desc()))
        return list(result.scalars().all())

    async def auto_match(self) -> dict:
        pending = await self.get_all(status="pending")
        matched = 0
        for i, t1 in enumerate(pending):
            for t2 in pending[i + 1:]:
                if (t1.from_entity == t2.to_entity and t1.to_entity == t2.from_entity
                        and abs(t1.amount - t2.amount) < 0.01 and t1.matched_with_id is None):
                    await self.db.execute(
                        update(IntercompanyTransaction).where(IntercompanyTransaction.id == t1.id)
                            .values(status="matched", matched_with_id=t2.id)
                    )
                    await self.db.execute(
                        update(IntercompanyTransaction).where(IntercompanyTransaction.id == t2.id)
                            .values(status="matched", matched_with_id=t1.id)
                    )
                    matched += 1
        await self.db.commit()
        return {"matched_pairs": matched, "total_pending": len(pending)}


class ReconciliationDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, status: Optional[str] = None) -> List[Reconciliation]:
        q = select(Reconciliation)
        if status:
            q = q.where(Reconciliation.status == status)
        result = await self.db.execute(q.order_by(Reconciliation.created_at.desc()))
        return list(result.scalars().all())

    async def get_by_id(self, recon_id: UUID) -> Optional[Reconciliation]:
        result = await self.db.execute(
            select(Reconciliation).options(selectinload(Reconciliation.items)).where(Reconciliation.id == recon_id)
        )
        return result.scalar_one_or_none()

    async def get_items(self, recon_id: UUID) -> List[ReconItem]:
        result = await self.db.execute(
            select(ReconItem).where(ReconItem.reconciliation_id == recon_id)
        )
        return list(result.scalars().all())


class ClosePeriodDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[ClosePeriod]:
        result = await self.db.execute(select(ClosePeriod).order_by(ClosePeriod.period.desc()))
        return list(result.scalars().all())

    async def get_by_id(self, period_id: UUID) -> Optional[ClosePeriod]:
        result = await self.db.execute(
            select(ClosePeriod).options(selectinload(ClosePeriod.tasks)).where(ClosePeriod.id == period_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> ClosePeriod:
        period = ClosePeriod(**data)
        self.db.add(period)
        await self.db.commit()
        await self.db.refresh(period)
        return period

    async def get_tasks(self, period_id: UUID) -> List[CloseTask]:
        result = await self.db.execute(
            select(CloseTask).where(CloseTask.period_id == period_id).order_by(CloseTask.sort_order)
        )
        return list(result.scalars().all())

    async def update_task(self, task_id: UUID, data: dict) -> Optional[CloseTask]:
        await self.db.execute(update(CloseTask).where(CloseTask.id == task_id).values(**data))
        await self.db.commit()
        result = await self.db.execute(select(CloseTask).where(CloseTask.id == task_id))
        return result.scalar_one_or_none()
