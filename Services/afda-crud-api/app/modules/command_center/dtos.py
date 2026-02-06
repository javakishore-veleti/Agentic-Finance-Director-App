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
