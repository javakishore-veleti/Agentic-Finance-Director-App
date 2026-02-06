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
