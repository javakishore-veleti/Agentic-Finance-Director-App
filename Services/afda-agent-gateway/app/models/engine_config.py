from typing import Optional, Dict, Any
from pydantic import BaseModel


class EngineInfo(BaseModel):
    name: str
    display_name: str
    status: str  # available, unavailable, degraded
    version: Optional[str] = None
    config: Dict[str, Any] = {}


class EngineDefaultUpdate(BaseModel):
    engine: str  # n8n | langgraph | bedrock
