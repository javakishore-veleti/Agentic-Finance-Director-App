from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.org_context import get_org_context, OrgContext
from app.database import get_db
from app.shared.responses import ApiResponse
from app.modules.command_center.facade import CommandCenterFacade
from app.modules.command_center.service import KpiService, BriefingService, ActionItemService
from app.modules.command_center.dtos import (
    KpiCreate, KpiUpdate, KpiOut,
    BriefingOut, BriefingGenerate,
    ActionItemCreate, ActionItemUpdate, ActionItemOut,
    OverviewStats,
)

router = APIRouter()


# ── Overview ──
@router.get("/overview/stats", response_model=ApiResponse[OverviewStats])
async def get_overview(db: AsyncSession = Depends(get_db)):
    facade = CommandCenterFacade(db)
    stats = await facade.get_overview()
    return ApiResponse(data=stats)


# ── KPIs ──
@router.get("/kpis", response_model=ApiResponse[list[KpiOut]])
async def list_kpis(is_active: Optional[bool] = True, db: AsyncSession = Depends(get_db)):
    svc = KpiService(db)
    kpis = await svc.list_kpis(is_active)
    return ApiResponse(data=kpis)


@router.get("/kpis/{kpi_id}", response_model=ApiResponse[KpiOut])
async def get_kpi(kpi_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = KpiService(db)
    kpi = await svc.get_kpi(kpi_id)
    return ApiResponse(data=kpi)


@router.post("/kpis", response_model=ApiResponse[KpiOut], status_code=201)
async def create_kpi(data: KpiCreate, db: AsyncSession = Depends(get_db)):
    svc = KpiService(db)
    kpi = await svc.create_kpi(data)
    return ApiResponse(data=kpi, message="KPI created")


@router.put("/kpis/{kpi_id}", response_model=ApiResponse[KpiOut])
async def update_kpi(kpi_id: UUID, data: KpiUpdate, db: AsyncSession = Depends(get_db)):
    svc = KpiService(db)
    kpi = await svc.update_kpi(kpi_id, data)
    return ApiResponse(data=kpi, message="KPI updated")


# ── Executive Briefings ──
@router.get("/executive-briefings", response_model=ApiResponse[list[BriefingOut]])
async def list_briefings(db: AsyncSession = Depends(get_db)):
    svc = BriefingService(db)
    briefings = await svc.list_briefings()
    return ApiResponse(data=briefings)


@router.get("/executive-briefings/latest", response_model=ApiResponse[BriefingOut])
async def get_latest_briefing(db: AsyncSession = Depends(get_db)):
    svc = BriefingService(db)
    briefing = await svc.get_latest()
    return ApiResponse(data=briefing)


@router.post("/executive-briefings/generate", response_model=ApiResponse[BriefingOut], status_code=201)
async def generate_briefing(data: BriefingGenerate, db: AsyncSession = Depends(get_db)):
    svc = BriefingService(db)
    briefing = await svc.generate_briefing(data.period)
    return ApiResponse(data=briefing, message="Briefing generated")


# ── Action Items ──
@router.get("/action-items", response_model=ApiResponse[list[ActionItemOut]])
async def list_action_items(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    svc = ActionItemService(db)
    items = await svc.list_items(status, priority, limit, offset)
    return ApiResponse(data=items)


@router.post("/action-items", response_model=ApiResponse[ActionItemOut], status_code=201)
async def create_action_item(data: ActionItemCreate, db: AsyncSession = Depends(get_db)):
    svc = ActionItemService(db)
    item = await svc.create_item(data)
    return ApiResponse(data=item, message="Action item created")


@router.put("/action-items/{item_id}", response_model=ApiResponse[ActionItemOut])
async def update_action_item(item_id: UUID, data: ActionItemUpdate, db: AsyncSession = Depends(get_db)):
    svc = ActionItemService(db)
    item = await svc.update_item(item_id, data)
    return ApiResponse(data=item, message="Action item updated")


@router.delete("/action-items/{item_id}")
async def delete_action_item(item_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = ActionItemService(db)
    await svc.delete_item(item_id)
    return ApiResponse(message="Action item deleted")


@router.get("/action-items/summary")
async def action_item_summary(db: AsyncSession = Depends(get_db)):
    svc = ActionItemService(db)
    summary = await svc.get_summary()
    return ApiResponse(data=summary)
