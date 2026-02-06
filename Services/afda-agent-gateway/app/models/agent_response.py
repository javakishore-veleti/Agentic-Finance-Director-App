from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel


class AgentChatResponse(BaseModel):
    session_id: str
    message: str
    agent_id: Optional[str] = None
    engine_used: str
    tokens_used: Optional[int] = None
    latency_ms: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None


class ConversationMessage(BaseModel):
    role: str
    content: str
    agent_id: Optional[str] = None
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None


class ConversationOut(BaseModel):
    session_id: str
    messages: List[ConversationMessage]
    engine: str
    created_at: datetime
    updated_at: datetime


class WorkflowOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    engine: str
    agent_ids: List[str]
    config: Dict[str, Any]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ExecutionOut(BaseModel):
    id: str
    workflow_id: Optional[str]
    session_id: Optional[str]
    engine: str
    status: str  # running, completed, failed
    started_at: datetime
    completed_at: Optional[datetime]
    duration_ms: Optional[int]
    input_summary: Optional[str]
    output_summary: Optional[str]
    trace: Optional[List[Dict[str, Any]]]
    error: Optional[str]


class ExecutionLogEntry(BaseModel):
    timestamp: datetime
    level: str  # info, warn, error
    agent_id: Optional[str]
    message: str
    data: Optional[Dict[str, Any]] = None
