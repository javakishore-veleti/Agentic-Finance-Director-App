from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = "user"  # user | assistant | system
    content: str
    metadata: Optional[Dict[str, Any]] = None


class AgentChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    engine: Optional[str] = None  # override default engine
    agent_id: Optional[str] = None  # specific agent e.g. AGT-001
    context: Optional[Dict[str, Any]] = None  # extra context


class WorkflowCreate(BaseModel):
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    engine: str = "n8n"
    agent_ids: list[str] = []  # agents involved
    config: Dict[str, Any] = {}
    is_active: bool = True


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    engine: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
