from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.org_context import get_org_context, OrgContext
from app.database import get_db
from app.shared.responses import ApiResponse
from app.modules.treasury.service import (
    BankAccountService, CashPositionService, CashForecastService, ArAgingService, LiquidityService,
)
from app.modules.treasury.dtos import (
    BankAccountCreate, BankAccountUpdate, BankAccountOut,
    CashPositionOut, CashPositionSummary,
    CashForecastOut,
    ArInvoiceOut, ArAgingSummary,
    LiquidityOut, LiquidityRatios,
)

router = APIRouter()


# ── Cash Position ──
@router.get("/cash-position", response_model=ApiResponse[CashPositionSummary])
async def get_cash_position(db: AsyncSession = Depends(get_db)):
    svc = CashPositionService(db)
    summary = await svc.get_current()
    return ApiResponse(data=summary)


@router.get("/cash-position/history", response_model=ApiResponse[list[CashPositionOut]])
async def cash_position_history(days: int = Query(90, ge=1, le=365), db: AsyncSession = Depends(get_db)):
    svc = CashPositionService(db)
    history = await svc.get_history(days)
    return ApiResponse(data=history)


# ── Bank Accounts ──
@router.get("/bank-accounts", response_model=ApiResponse[list[BankAccountOut]])
async def list_bank_accounts(status: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    svc = BankAccountService(db)
    accounts = await svc.list_accounts(status)
    return ApiResponse(data=accounts)


@router.post("/bank-accounts", response_model=ApiResponse[BankAccountOut], status_code=201)
async def create_bank_account(data: BankAccountCreate, db: AsyncSession = Depends(get_db)):
    svc = BankAccountService(db)
    account = await svc.create_account(data)
    return ApiResponse(data=account, message="Bank account created")


@router.get("/bank-accounts/{account_id}", response_model=ApiResponse[BankAccountOut])
async def get_bank_account(account_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = BankAccountService(db)
    account = await svc.get_account(account_id)
    return ApiResponse(data=account)


# ── Cash Forecast ──
@router.get("/cash-forecast", response_model=ApiResponse[list[CashForecastOut]])
async def get_cash_forecast(
    scenario: str = "base",
    days: int = Query(90, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
):
    svc = CashForecastService(db)
    forecast = await svc.get_forecast(scenario, days)
    return ApiResponse(data=forecast)


@router.post("/cash-forecast/generate", response_model=ApiResponse[list[CashForecastOut]], status_code=201)
async def generate_cash_forecast(db: AsyncSession = Depends(get_db)):
    svc = CashForecastService(db)
    forecast = await svc.generate_forecast()
    return ApiResponse(data=forecast, message="Cash forecast generated")


# ── AR Aging ──
@router.get("/ar-aging", response_model=ApiResponse[ArAgingSummary])
async def ar_aging_summary(db: AsyncSession = Depends(get_db)):
    svc = ArAgingService(db)
    summary = await svc.get_summary()
    return ApiResponse(data=summary)


@router.get("/ar-aging/buckets")
async def ar_aging_buckets(db: AsyncSession = Depends(get_db)):
    svc = ArAgingService(db)
    buckets = await svc.get_buckets()
    return ApiResponse(data=buckets)


@router.get("/ar-aging/invoices", response_model=ApiResponse[list[ArInvoiceOut]])
async def ar_invoices(
    status: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    svc = ArAgingService(db)
    invoices = await svc.get_invoices(status, limit, offset)
    return ApiResponse(data=invoices)


# ── Liquidity ──
@router.get("/liquidity", response_model=ApiResponse[list[LiquidityOut]])
async def get_liquidity(db: AsyncSession = Depends(get_db)):
    svc = LiquidityService(db)
    metrics = await svc.get_metrics()
    return ApiResponse(data=metrics)


@router.get("/liquidity/ratios", response_model=ApiResponse[LiquidityRatios])
async def get_liquidity_ratios(db: AsyncSession = Depends(get_db)):
    svc = LiquidityService(db)
    ratios = await svc.get_ratios()
    return ApiResponse(data=ratios)
