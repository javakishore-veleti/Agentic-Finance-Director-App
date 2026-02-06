#!/bin/bash
###############################################################################
# 02_command_center_module.sh
# Creates: Command Center module — models, dtos, dao, service, facade, router
# Endpoints: /api/v1/command-center/*
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

MOD="Services/afda-crud-api/app/modules/command_center"

echo "🔧 [02] Creating Command Center module..."

# --- models.py (SQLAlchemy ORM) ---
cat > "$MOD/models.py" << 'PYEOF'
import uuid
from datetime import datetime
from sqlalchemy import String, Text, Float, Integer, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


class KpiStatus(str, enum.Enum):
    ON_TRACK = "on_track"
    AT_RISK = "at_risk"
    OFF_TRACK = "off_track"


class ActionItemStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ActionItemPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class KpiDefinition(Base):
    __tablename__ = "kpi_definitions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)  # revenue, cost, margin, liquidity
    unit: Mapped[str] = mapped_column(String(50), default="%")  # %, $, ratio, count
    target_value: Mapped[float] = mapped_column(Float, nullable=True)
    current_value: Mapped[float] = mapped_column(Float, nullable=True)
    previous_value: Mapped[float] = mapped_column(Float, nullable=True)
    status: Mapped[KpiStatus] = mapped_column(SAEnum(KpiStatus), default=KpiStatus.ON_TRACK)
    trend_direction: Mapped[str] = mapped_column(String(10), default="flat")  # up, down, flat
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    values: Mapped[list["KpiValue"]] = relationship(back_populates="kpi", cascade="all, delete-orphan")


class KpiValue(Base):
    __tablename__ = "kpi_values"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kpi_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("kpi_definitions.id"))
    value: Mapped[float] = mapped_column(Float, nullable=False)
    period: Mapped[str] = mapped_column(String(20), nullable=False)  # 2025-Q1, 2025-01
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    kpi: Mapped["KpiDefinition"] = relationship(back_populates="values")


class ExecutiveBriefing(Base):
    __tablename__ = "executive_briefings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    key_insights: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array stored as text
    risk_highlights: Mapped[str] = mapped_column(Text, nullable=True)
    generated_by: Mapped[str] = mapped_column(String(50), default="AGT-001")  # agent ID
    period: Mapped[str] = mapped_column(String(20), nullable=False)
    is_latest: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ActionItem(Base):
    __tablename__ = "action_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[ActionItemStatus] = mapped_column(SAEnum(ActionItemStatus), default=ActionItemStatus.OPEN)
    priority: Mapped[ActionItemPriority] = mapped_column(SAEnum(ActionItemPriority), default=ActionItemPriority.MEDIUM)
    assignee: Mapped[str] = mapped_column(String(200), nullable=True)
    source_agent: Mapped[str] = mapped_column(String(50), nullable=True)  # which agent created it
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
PYEOF

# --- dtos.py (Pydantic schemas) ---
cat > "$MOD/dtos.py" << 'PYEOF'
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# ── KPI ──
class KpiCreate(BaseModel):
    name: str = Field(..., max_length=200)
    category: str = Field(..., max_length=100)
    unit: str = Field(default="%", max_length=50)
    target_value: Optional[float] = None
    current_value: Optional[float] = None


class KpiUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    previous_value: Optional[float] = None
    status: Optional[str] = None
    trend_direction: Optional[str] = None
    is_active: Optional[bool] = None


class KpiOut(BaseModel):
    id: UUID
    name: str
    category: str
    unit: str
    target_value: Optional[float]
    current_value: Optional[float]
    previous_value: Optional[float]
    status: str
    trend_direction: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class KpiValueOut(BaseModel):
    id: UUID
    kpi_id: UUID
    value: float
    period: str
    recorded_at: datetime

    model_config = {"from_attributes": True}


# ── Executive Briefing ──
class BriefingOut(BaseModel):
    id: UUID
    title: str
    summary: str
    key_insights: Optional[str]
    risk_highlights: Optional[str]
    generated_by: str
    period: str
    is_latest: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class BriefingGenerate(BaseModel):
    period: str = Field(..., description="e.g. 2025-Q1")


# ── Action Item ──
class ActionItemCreate(BaseModel):
    title: str = Field(..., max_length=300)
    description: Optional[str] = None
    priority: str = Field(default="medium")
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None


class ActionItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None


class ActionItemOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    status: str
    priority: str
    assignee: Optional[str]
    source_agent: Optional[str]
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Overview ──
class OverviewStats(BaseModel):
    total_kpis: int
    on_track: int
    at_risk: int
    off_track: int
    open_action_items: int
    critical_action_items: int
    latest_briefing_date: Optional[datetime]
PYEOF

# --- dao.py (Data Access) ---
cat > "$MOD/dao.py" << 'PYEOF'
from uuid import UUID
from typing import Optional, List
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.command_center.models import (
    KpiDefinition, KpiValue, ExecutiveBriefing, ActionItem,
    KpiStatus, ActionItemStatus, ActionItemPriority,
)


class KpiDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, is_active: Optional[bool] = True) -> List[KpiDefinition]:
        q = select(KpiDefinition)
        if is_active is not None:
            q = q.where(KpiDefinition.is_active == is_active)
        result = await self.db.execute(q.order_by(KpiDefinition.category, KpiDefinition.name))
        return list(result.scalars().all())

    async def get_by_id(self, kpi_id: UUID) -> Optional[KpiDefinition]:
        result = await self.db.execute(select(KpiDefinition).where(KpiDefinition.id == kpi_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> KpiDefinition:
        kpi = KpiDefinition(**data)
        self.db.add(kpi)
        await self.db.commit()
        await self.db.refresh(kpi)
        return kpi

    async def update(self, kpi_id: UUID, data: dict) -> Optional[KpiDefinition]:
        await self.db.execute(update(KpiDefinition).where(KpiDefinition.id == kpi_id).values(**data))
        await self.db.commit()
        return await self.get_by_id(kpi_id)

    async def count_by_status(self) -> dict:
        result = await self.db.execute(
            select(KpiDefinition.status, func.count()).where(KpiDefinition.is_active == True).group_by(KpiDefinition.status)
        )
        return {row[0]: row[1] for row in result.all()}


class BriefingDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, limit: int = 20) -> List[ExecutiveBriefing]:
        result = await self.db.execute(
            select(ExecutiveBriefing).order_by(ExecutiveBriefing.created_at.desc()).limit(limit)
        )
        return list(result.scalars().all())

    async def get_latest(self) -> Optional[ExecutiveBriefing]:
        result = await self.db.execute(
            select(ExecutiveBriefing).where(ExecutiveBriefing.is_latest == True).limit(1)
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> ExecutiveBriefing:
        # Mark old ones as not latest
        await self.db.execute(
            update(ExecutiveBriefing).where(ExecutiveBriefing.is_latest == True).values(is_latest=False)
        )
        briefing = ExecutiveBriefing(**data, is_latest=True)
        self.db.add(briefing)
        await self.db.commit()
        await self.db.refresh(briefing)
        return briefing


class ActionItemDAO:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, status: Optional[str] = None, priority: Optional[str] = None,
                      limit: int = 50, offset: int = 0) -> List[ActionItem]:
        q = select(ActionItem)
        if status:
            q = q.where(ActionItem.status == status)
        if priority:
            q = q.where(ActionItem.priority == priority)
        result = await self.db.execute(q.order_by(ActionItem.created_at.desc()).offset(offset).limit(limit))
        return list(result.scalars().all())

    async def count(self, status: Optional[str] = None) -> int:
        q = select(func.count()).select_from(ActionItem)
        if status:
            q = q.where(ActionItem.status == status)
        result = await self.db.execute(q)
        return result.scalar()

    async def get_by_id(self, item_id: UUID) -> Optional[ActionItem]:
        result = await self.db.execute(select(ActionItem).where(ActionItem.id == item_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> ActionItem:
        item = ActionItem(**data)
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def update(self, item_id: UUID, data: dict) -> Optional[ActionItem]:
        await self.db.execute(update(ActionItem).where(ActionItem.id == item_id).values(**data))
        await self.db.commit()
        return await self.get_by_id(item_id)

    async def delete(self, item_id: UUID) -> bool:
        result = await self.db.execute(delete(ActionItem).where(ActionItem.id == item_id))
        await self.db.commit()
        return result.rowcount > 0

    async def summary(self) -> dict:
        status_q = await self.db.execute(
            select(ActionItem.status, func.count()).group_by(ActionItem.status)
        )
        priority_q = await self.db.execute(
            select(ActionItem.priority, func.count()).group_by(ActionItem.priority)
        )
        return {
            "by_status": {row[0]: row[1] for row in status_q.all()},
            "by_priority": {row[0]: row[1] for row in priority_q.all()},
        }
PYEOF

# --- service.py (Business Logic) ---
cat > "$MOD/service.py" << 'PYEOF'
from uuid import UUID
from typing import Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.command_center.dao import KpiDAO, BriefingDAO, ActionItemDAO
from app.modules.command_center.dtos import KpiCreate, KpiUpdate, ActionItemCreate, ActionItemUpdate
from app.shared.exceptions import NotFoundException


class KpiService:
    def __init__(self, db: AsyncSession):
        self.dao = KpiDAO(db)

    async def list_kpis(self, is_active: Optional[bool] = True):
        return await self.dao.get_all(is_active)

    async def get_kpi(self, kpi_id: UUID):
        kpi = await self.dao.get_by_id(kpi_id)
        if not kpi:
            raise NotFoundException("KPI", kpi_id)
        return kpi

    async def create_kpi(self, data: KpiCreate):
        return await self.dao.create(data.model_dump())

    async def update_kpi(self, kpi_id: UUID, data: KpiUpdate):
        existing = await self.dao.get_by_id(kpi_id)
        if not existing:
            raise NotFoundException("KPI", kpi_id)
        update_data = data.model_dump(exclude_unset=True)
        # Auto-calculate trend
        if "current_value" in update_data and existing.previous_value is not None:
            new_val = update_data["current_value"]
            if new_val > existing.previous_value:
                update_data["trend_direction"] = "up"
            elif new_val < existing.previous_value:
                update_data["trend_direction"] = "down"
            else:
                update_data["trend_direction"] = "flat"
        return await self.dao.update(kpi_id, update_data)


class BriefingService:
    def __init__(self, db: AsyncSession):
        self.dao = BriefingDAO(db)

    async def list_briefings(self):
        return await self.dao.get_all()

    async def get_latest(self):
        briefing = await self.dao.get_latest()
        if not briefing:
            raise NotFoundException("Executive Briefing")
        return briefing

    async def generate_briefing(self, period: str):
        # Placeholder — in production, AGT-001 (Executive Briefing Agent) generates this
        data = {
            "title": f"Executive Briefing — {period}",
            "summary": f"AI-generated briefing for {period}. Placeholder until agent integration.",
            "key_insights": '["Revenue trending 5% above target","Operating costs reduced by 3%"]',
            "risk_highlights": '["Cash flow tightening in Q2","FX exposure increasing"]',
            "generated_by": "AGT-001",
            "period": period,
        }
        return await self.dao.create(data)


class ActionItemService:
    def __init__(self, db: AsyncSession):
        self.dao = ActionItemDAO(db)

    async def list_items(self, status=None, priority=None, limit=50, offset=0):
        return await self.dao.get_all(status, priority, limit, offset)

    async def get_item(self, item_id: UUID):
        item = await self.dao.get_by_id(item_id)
        if not item:
            raise NotFoundException("Action Item", item_id)
        return item

    async def create_item(self, data: ActionItemCreate):
        return await self.dao.create(data.model_dump())

    async def update_item(self, item_id: UUID, data: ActionItemUpdate):
        existing = await self.dao.get_by_id(item_id)
        if not existing:
            raise NotFoundException("Action Item", item_id)
        update_data = data.model_dump(exclude_unset=True)
        if update_data.get("status") == "completed":
            update_data["completed_at"] = datetime.utcnow()
        return await self.dao.update(item_id, update_data)

    async def delete_item(self, item_id: UUID):
        success = await self.dao.delete(item_id)
        if not success:
            raise NotFoundException("Action Item", item_id)
        return True

    async def get_summary(self):
        return await self.dao.summary()
PYEOF

# --- facade.py (Orchestration) ---
cat > "$MOD/facade.py" << 'PYEOF'
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.command_center.service import KpiService, BriefingService, ActionItemService
from app.modules.command_center.dtos import OverviewStats


class CommandCenterFacade:
    def __init__(self, db: AsyncSession):
        self.kpi_service = KpiService(db)
        self.briefing_service = BriefingService(db)
        self.action_service = ActionItemService(db)

    async def get_overview(self) -> OverviewStats:
        kpis = await self.kpi_service.list_kpis(is_active=True)
        on_track = sum(1 for k in kpis if k.status.value == "on_track")
        at_risk = sum(1 for k in kpis if k.status.value == "at_risk")
        off_track = sum(1 for k in kpis if k.status.value == "off_track")

        open_items = await self.action_service.dao.count(status="open")
        critical_items = await self.action_service.dao.count(status=None)  # will refine

        try:
            latest = await self.briefing_service.get_latest()
            latest_date = latest.created_at
        except Exception:
            latest_date = None

        return OverviewStats(
            total_kpis=len(kpis),
            on_track=on_track,
            at_risk=at_risk,
            off_track=off_track,
            open_action_items=open_items,
            critical_action_items=critical_items,
            latest_briefing_date=latest_date,
        )
PYEOF

# --- router.py (API Endpoints) ---
cat > "$MOD/router.py" << 'PYEOF'
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
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
PYEOF

echo "✅ [02] Command Center module created at $MOD"
echo "    → models.py  — KpiDefinition, KpiValue, ExecutiveBriefing, ActionItem"
echo "    → dtos.py    — Pydantic request/response schemas"
echo "    → dao.py     — KpiDAO, BriefingDAO, ActionItemDAO"
echo "    → service.py — Business logic + validation"
echo "    → facade.py  — Orchestrates overview stats across services"
echo "    → router.py  — 13 endpoints under /api/v1/command-center"
echo ""
echo "   ⚡ Uncomment command_center router in main.py to activate"
echo "   Next: Run 03_fpa_module.sh"
