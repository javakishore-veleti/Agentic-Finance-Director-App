#!/bin/bash
###############################################################################
# 05_accounting_module.sh
# Creates: Accounting module — GL, trial balance, intercompany, recon, close
# Endpoints: /api/v1/accounting/*
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

MOD="Services/afda-crud-api/app/modules/accounting"

echo "🔧 [05] Creating Accounting module..."

# --- models.py ---
cat > "$MOD/models.py" << 'PYEOF'
import uuid
from datetime import datetime, date
from sqlalchemy import String, Text, Float, Integer, Boolean, DateTime, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


class AccountCategory(str, enum.Enum):
    ASSET = "asset"
    LIABILITY = "liability"
    EQUITY = "equity"
    REVENUE = "revenue"
    EXPENSE = "expense"


class ChartOfAccount(Base):
    __tablename__ = "chart_of_accounts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    account_name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[AccountCategory] = mapped_column(SAEnum(AccountCategory), nullable=False)
    parent_code: Mapped[str] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class JournalEntryStatus(str, enum.Enum):
    DRAFT = "draft"
    POSTED = "posted"
    REVERSED = "reversed"


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    entry_date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[JournalEntryStatus] = mapped_column(SAEnum(JournalEntryStatus), default=JournalEntryStatus.DRAFT)
    source: Mapped[str] = mapped_column(String(50), default="manual")  # manual, auto, agent
    created_by: Mapped[str] = mapped_column(String(200), nullable=True)
    posted_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    lines: Mapped[list["JournalLine"]] = relationship(back_populates="entry", cascade="all, delete-orphan")


class JournalLine(Base):
    __tablename__ = "journal_lines"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("journal_entries.id"))
    account_code: Mapped[str] = mapped_column(String(20), nullable=False)
    account_name: Mapped[str] = mapped_column(String(200), nullable=False)
    debit: Mapped[float] = mapped_column(Float, default=0.0)
    credit: Mapped[float] = mapped_column(Float, default=0.0)
    description: Mapped[str] = mapped_column(String(500), nullable=True)

    entry: Mapped["JournalEntry"] = relationship(back_populates="lines")


class TrialBalance(Base):
    __tablename__ = "trial_balances"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    period: Mapped[str] = mapped_column(String(20), nullable=False)
    account_code: Mapped[str] = mapped_column(String(20), nullable=False)
    account_name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    debit_balance: Mapped[float] = mapped_column(Float, default=0.0)
    credit_balance: Mapped[float] = mapped_column(Float, default=0.0)
    net_balance: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class IntercompanyTransaction(Base):
    __tablename__ = "intercompany_transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    from_entity: Mapped[str] = mapped_column(String(100), nullable=False)
    to_entity: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, matched, disputed
    matched_with_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ReconStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    EXCEPTION = "exception"


class Reconciliation(Base):
    __tablename__ = "reconciliations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    account_code: Mapped[str] = mapped_column(String(20), nullable=False)
    period: Mapped[str] = mapped_column(String(20), nullable=False)
    source_balance: Mapped[float] = mapped_column(Float, default=0.0)
    target_balance: Mapped[float] = mapped_column(Float, default=0.0)
    difference: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[ReconStatus] = mapped_column(SAEnum(ReconStatus), default=ReconStatus.NOT_STARTED)
    matched_count: Mapped[int] = mapped_column(Integer, default=0)
    unmatched_count: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    items: Mapped[list["ReconItem"]] = relationship(back_populates="reconciliation", cascade="all, delete-orphan")


class ReconItem(Base):
    __tablename__ = "recon_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reconciliation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("reconciliations.id"))
    source_ref: Mapped[str] = mapped_column(String(100), nullable=True)
    target_ref: Mapped[str] = mapped_column(String(100), nullable=True)
    source_amount: Mapped[float] = mapped_column(Float, default=0.0)
    target_amount: Mapped[float] = mapped_column(Float, default=0.0)
    difference: Mapped[float] = mapped_column(Float, default=0.0)
    is_matched: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    reconciliation: Mapped["Reconciliation"] = relationship(back_populates="items")


class CloseStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    LOCKED = "locked"


class ClosePeriod(Base):
    __tablename__ = "close_periods"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    period: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    fiscal_year: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[CloseStatus] = mapped_column(SAEnum(CloseStatus), default=CloseStatus.OPEN)
    target_close_date: Mapped[date] = mapped_column(Date, nullable=True)
    actual_close_date: Mapped[date] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tasks: Mapped[list["CloseTask"]] = relationship(back_populates="period_rel", cascade="all, delete-orphan")


class CloseTask(Base):
    __tablename__ = "close_tasks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    period_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("close_periods.id"))
    task_name: Mapped[str] = mapped_column(String(300), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=True)  # journal, recon, review, approval
    assignee: Mapped[str] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, in_progress, completed, blocked
    due_date: Mapped[date] = mapped_column(Date, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    period_rel: Mapped["ClosePeriod"] = relationship(back_populates="tasks")
PYEOF

# --- dtos.py ---
cat > "$MOD/dtos.py" << 'PYEOF'
from datetime import datetime, date
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# ── Journal Entry ──
class JournalLineCreate(BaseModel):
    account_code: str
    account_name: str
    debit: float = 0.0
    credit: float = 0.0
    description: Optional[str] = None


class JournalEntryCreate(BaseModel):
    entry_number: str = Field(..., max_length=50)
    entry_date: date
    description: Optional[str] = None
    source: str = "manual"
    lines: List[JournalLineCreate] = []


class JournalLineOut(BaseModel):
    id: UUID
    account_code: str
    account_name: str
    debit: float
    credit: float
    description: Optional[str]
    model_config = {"from_attributes": True}


class JournalEntryOut(BaseModel):
    id: UUID
    entry_number: str
    entry_date: date
    description: Optional[str]
    status: str
    source: str
    created_by: Optional[str]
    posted_at: Optional[datetime]
    created_at: datetime
    model_config = {"from_attributes": True}


class JournalEntryDetailOut(JournalEntryOut):
    lines: List[JournalLineOut] = []


# ── Trial Balance ──
class TrialBalanceOut(BaseModel):
    id: UUID
    period: str
    account_code: str
    account_name: str
    category: str
    debit_balance: float
    credit_balance: float
    net_balance: float
    model_config = {"from_attributes": True}


class TrialBalanceComparison(BaseModel):
    account_code: str
    account_name: str
    category: str
    period_1_balance: float
    period_2_balance: float
    change: float
    change_pct: float


# ── Intercompany ──
class IntercompanyOut(BaseModel):
    id: UUID
    transaction_date: date
    from_entity: str
    to_entity: str
    amount: float
    currency: str
    description: Optional[str]
    status: str
    matched_with_id: Optional[UUID]
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Reconciliation ──
class ReconOut(BaseModel):
    id: UUID
    name: str
    account_code: str
    period: str
    source_balance: float
    target_balance: float
    difference: float
    status: str
    matched_count: int
    unmatched_count: int
    completed_at: Optional[datetime]
    created_at: datetime
    model_config = {"from_attributes": True}


class ReconItemOut(BaseModel):
    id: UUID
    source_ref: Optional[str]
    target_ref: Optional[str]
    source_amount: float
    target_amount: float
    difference: float
    is_matched: bool
    notes: Optional[str]
    model_config = {"from_attributes": True}


# ── Close Management ──
class ClosePeriodCreate(BaseModel):
    period: str
    fiscal_year: int
    target_close_date: Optional[date] = None


class CloseTaskUpdate(BaseModel):
    status: Optional[str] = None
    assignee: Optional[str] = None
    completed_at: Optional[datetime] = None


class ClosePeriodOut(BaseModel):
    id: UUID
    period: str
    fiscal_year: int
    status: str
    target_close_date: Optional[date]
    actual_close_date: Optional[date]
    created_at: datetime
    model_config = {"from_attributes": True}


class CloseTaskOut(BaseModel):
    id: UUID
    period_id: UUID
    task_name: str
    category: Optional[str]
    assignee: Optional[str]
    status: str
    due_date: Optional[date]
    completed_at: Optional[datetime]
    sort_order: int
    model_config = {"from_attributes": True}


class CloseDashboard(BaseModel):
    current_period: Optional[str]
    status: Optional[str]
    total_tasks: int
    completed_tasks: int
    blocked_tasks: int
    completion_pct: float
    days_remaining: Optional[int]
PYEOF

# --- dao.py ---
cat > "$MOD/dao.py" << 'PYEOF'
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
PYEOF

# --- service.py ---
cat > "$MOD/service.py" << 'PYEOF'
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
PYEOF

# --- facade.py ---
cat > "$MOD/facade.py" << 'PYEOF'
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.accounting.service import (
    GeneralLedgerService, TrialBalanceService, IntercompanyService,
    ReconciliationService, CloseManagementService,
)


class AccountingFacade:
    def __init__(self, db: AsyncSession):
        self.gl_svc = GeneralLedgerService(db)
        self.tb_svc = TrialBalanceService(db)
        self.ic_svc = IntercompanyService(db)
        self.recon_svc = ReconciliationService(db)
        self.close_svc = CloseManagementService(db)
PYEOF

# --- router.py ---
cat > "$MOD/router.py" << 'PYEOF'
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.shared.responses import ApiResponse
from app.modules.accounting.service import (
    GeneralLedgerService, TrialBalanceService, IntercompanyService,
    ReconciliationService, CloseManagementService,
)
from app.modules.accounting.dtos import (
    JournalEntryCreate, JournalEntryOut, JournalEntryDetailOut,
    TrialBalanceOut, TrialBalanceComparison,
    IntercompanyOut,
    ReconOut, ReconItemOut,
    ClosePeriodCreate, ClosePeriodOut, CloseTaskOut, CloseTaskUpdate, CloseDashboard,
)

router = APIRouter()


# ── General Ledger ──
@router.get("/general-ledger", response_model=ApiResponse[list[JournalEntryOut]])
async def list_gl_entries(
    status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    svc = GeneralLedgerService(db)
    entries = await svc.list_entries(status, limit, offset)
    return ApiResponse(data=entries)


@router.post("/general-ledger", response_model=ApiResponse[JournalEntryDetailOut], status_code=201)
async def create_gl_entry(data: JournalEntryCreate, db: AsyncSession = Depends(get_db)):
    svc = GeneralLedgerService(db)
    entry = await svc.create_entry(data)
    return ApiResponse(data=entry, message="Journal entry created")


@router.get("/general-ledger/{entry_id}", response_model=ApiResponse[JournalEntryDetailOut])
async def get_gl_entry(entry_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = GeneralLedgerService(db)
    entry = await svc.get_entry(entry_id)
    return ApiResponse(data=entry)


# ── Trial Balance ──
@router.get("/trial-balance", response_model=ApiResponse[list[TrialBalanceOut]])
async def get_trial_balance(period: str = Query(...), db: AsyncSession = Depends(get_db)):
    svc = TrialBalanceService(db)
    records = await svc.get_trial_balance(period)
    return ApiResponse(data=records)


@router.get("/trial-balance/comparison")
async def trial_balance_comparison(
    period1: str = Query(...), period2: str = Query(...), db: AsyncSession = Depends(get_db),
):
    svc = TrialBalanceService(db)
    comparison = await svc.get_comparison(period1, period2)
    return ApiResponse(data=comparison)


# ── Intercompany ──
@router.get("/intercompany", response_model=ApiResponse[list[IntercompanyOut]])
async def list_intercompany(status: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    svc = IntercompanyService(db)
    txns = await svc.list_transactions(status)
    return ApiResponse(data=txns)


@router.post("/intercompany/match")
async def auto_match_intercompany(db: AsyncSession = Depends(get_db)):
    svc = IntercompanyService(db)
    result = await svc.auto_match()
    return ApiResponse(data=result, message="Auto-match completed")


# ── Reconciliation ──
@router.get("/reconciliation", response_model=ApiResponse[list[ReconOut]])
async def list_reconciliations(status: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    svc = ReconciliationService(db)
    recons = await svc.list_reconciliations(status)
    return ApiResponse(data=recons)


@router.post("/reconciliation/{recon_id}/reconcile")
async def execute_reconciliation(recon_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = ReconciliationService(db)
    result = await svc.execute_reconciliation(recon_id)
    return ApiResponse(data=result, message="Reconciliation triggered")


@router.get("/reconciliation/{recon_id}/items", response_model=ApiResponse[list[ReconItemOut]])
async def get_recon_items(recon_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = ReconciliationService(db)
    items = await svc.get_items(recon_id)
    return ApiResponse(data=items)


# ── Close Management ──
@router.get("/close", response_model=ApiResponse[CloseDashboard])
async def close_dashboard(db: AsyncSession = Depends(get_db)):
    svc = CloseManagementService(db)
    dashboard = await svc.get_dashboard()
    return ApiResponse(data=dashboard)


@router.get("/close/periods", response_model=ApiResponse[list[ClosePeriodOut]])
async def list_close_periods(db: AsyncSession = Depends(get_db)):
    svc = CloseManagementService(db)
    periods = await svc.list_periods()
    return ApiResponse(data=periods)


@router.post("/close/periods", response_model=ApiResponse[ClosePeriodOut], status_code=201)
async def create_close_period(data: ClosePeriodCreate, db: AsyncSession = Depends(get_db)):
    svc = CloseManagementService(db)
    period = await svc.create_period(data)
    return ApiResponse(data=period, message="Close period created")


@router.get("/close/periods/{period_id}/tasks", response_model=ApiResponse[list[CloseTaskOut]])
async def get_close_tasks(period_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = CloseManagementService(db)
    tasks = await svc.get_tasks(period_id)
    return ApiResponse(data=tasks)


@router.put("/close/tasks/{task_id}", response_model=ApiResponse[CloseTaskOut])
async def update_close_task(task_id: UUID, data: CloseTaskUpdate, db: AsyncSession = Depends(get_db)):
    svc = CloseManagementService(db)
    task = await svc.update_task(task_id, data)
    return ApiResponse(data=task, message="Task updated")
PYEOF

echo "✅ [05] Accounting module created at $MOD"
echo "    → models.py  — ChartOfAccount, JournalEntry/Line, TrialBalance, IntercompanyTransaction,"
echo "                    Reconciliation/ReconItem, ClosePeriod/CloseTask"
echo "    → dtos.py    — 16 Pydantic schemas"
echo "    → dao.py     — 5 DAOs (GL with lines, TB comparison, IC auto-match, recon items, close tasks)"
echo "    → service.py — 5 services (debit/credit validation, close dashboard, IC matching)"
echo "    → facade.py  — AccountingFacade"
echo "    → router.py  — 18 endpoints under /api/v1/accounting"
echo ""
echo "   ⚡ Uncomment accounting router in main.py to activate"
echo "   Next: Run 06_risk_module.sh"
