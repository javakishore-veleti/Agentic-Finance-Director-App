from uuid import UUID
from datetime import datetime, date
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.accounting.dao import (
    JournalEntryDAO, TrialBalanceDAO, IntercompanyDAO, ReconciliationDAO, ClosePeriodDAO,
)
from app.modules.accounting.dtos import (
    JournalEntryCreate, ClosePeriodCreate, CloseTaskUpdate, CloseDashboard,
)
from app.shared.exceptions import NotFoundException, BadRequestException


class GeneralLedgerService:
    def __init__(self, db: AsyncSession):
        self.dao = JournalEntryDAO(db)

    async def list_entries(self, status=None, limit=50, offset=0):
        return await self.dao.get_all(status, limit, offset)

    async def get_entry(self, entry_id: UUID):
        entry = await self.dao.get_by_id(entry_id)
        if not entry:
            raise NotFoundException("Journal Entry", entry_id)
        return entry

    async def create_entry(self, data: JournalEntryCreate):
        lines = [l.model_dump() for l in data.lines]
        # Validate debits == credits
        total_debit = sum(l["debit"] for l in lines)
        total_credit = sum(l["credit"] for l in lines)
        if abs(total_debit - total_credit) > 0.01:
            raise BadRequestException(
                f"Entry unbalanced: debits ({total_debit}) != credits ({total_credit})"
            )
        entry_data = data.model_dump(exclude={"lines"})
        return await self.dao.create(entry_data, lines)


class TrialBalanceService:
    def __init__(self, db: AsyncSession):
        self.dao = TrialBalanceDAO(db)

    async def get_trial_balance(self, period: str):
        records = await self.dao.get_by_period(period)
        if not records:
            raise NotFoundException("Trial Balance", period)
        return records

    async def get_comparison(self, period1: str, period2: str):
        return await self.dao.get_comparison(period1, period2)


class IntercompanyService:
    def __init__(self, db: AsyncSession):
        self.dao = IntercompanyDAO(db)

    async def list_transactions(self, status=None):
        return await self.dao.get_all(status)

    async def auto_match(self):
        return await self.dao.auto_match()


class ReconciliationService:
    def __init__(self, db: AsyncSession):
        self.dao = ReconciliationDAO(db)

    async def list_reconciliations(self, status=None):
        return await self.dao.get_all(status)

    async def execute_reconciliation(self, recon_id: UUID):
        recon = await self.dao.get_by_id(recon_id)
        if not recon:
            raise NotFoundException("Reconciliation", recon_id)
        # Placeholder — AGT-045 (Auto-Reconciliation Agent) handles this
        return {"recon_id": str(recon_id), "status": "in_progress", "message": "Reconciliation started"}

    async def get_items(self, recon_id: UUID):
        return await self.dao.get_items(recon_id)


class CloseManagementService:
    def __init__(self, db: AsyncSession):
        self.dao = ClosePeriodDAO(db)

    async def get_dashboard(self) -> CloseDashboard:
        periods = await self.dao.get_all()
        current = next((p for p in periods if p.status.value in ("open", "in_progress")), None)
        if not current:
            return CloseDashboard(
                current_period=None, status=None, total_tasks=0,
                completed_tasks=0, blocked_tasks=0, completion_pct=0, days_remaining=None,
            )
        tasks = await self.dao.get_tasks(current.id)
        completed = sum(1 for t in tasks if t.status == "completed")
        blocked = sum(1 for t in tasks if t.status == "blocked")
        total = len(tasks)
        pct = round((completed / total) * 100, 2) if total else 0
        days_left = None
        if current.target_close_date:
            days_left = (current.target_close_date - date.today()).days
        return CloseDashboard(
            current_period=current.period,
            status=current.status.value,
            total_tasks=total,
            completed_tasks=completed,
            blocked_tasks=blocked,
            completion_pct=pct,
            days_remaining=days_left,
        )

    async def list_periods(self):
        return await self.dao.get_all()

    async def create_period(self, data: ClosePeriodCreate):
        return await self.dao.create(data.model_dump())

    async def get_tasks(self, period_id: UUID):
        return await self.dao.get_tasks(period_id)

    async def update_task(self, task_id: UUID, data: CloseTaskUpdate):
        update_data = data.model_dump(exclude_unset=True)
        if update_data.get("status") == "completed":
            update_data["completed_at"] = datetime.utcnow()
        task = await self.dao.update_task(task_id, update_data)
        if not task:
            raise NotFoundException("Close Task", task_id)
        return task
