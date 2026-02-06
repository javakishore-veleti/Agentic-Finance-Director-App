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
