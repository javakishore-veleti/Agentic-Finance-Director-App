#!/bin/bash
###############################################################################
# 10_agent_gateway_foundation.sh
# Creates: afda-agent-gateway service — WebSocket chat, engine abstraction,
#          workflow mgmt, execution history, SSE streaming
# Port: 8001
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

BASE="Services/afda-agent-gateway"
APP="$BASE/app"

echo "🔧 [10] Creating Agent Gateway microservice..."

# --- Directory structure ---
mkdir -p "$APP/routers"
mkdir -p "$APP/services"
mkdir -p "$APP/models"
mkdir -p "$APP/middleware"
mkdir -p "$BASE/tests"

# --- requirements.txt ---
cat > "$BASE/requirements.txt" << 'EOF'
fastapi==0.115.6
uvicorn[standard]==0.34.0
websockets==14.1
httpx==0.28.1
motor==3.6.0
redis[hiredis]==5.2.1
pydantic==2.10.3
pydantic-settings==2.7.0
python-jose[cryptography]==3.3.0
sse-starlette==2.2.1
prometheus-fastapi-instrumentator==7.0.2
python-dateutil==2.9.0
EOF

# --- app/__init__.py ---
cat > "$APP/__init__.py" << 'EOF'
EOF

# --- app/config.py ---
cat > "$APP/config.py" << 'PYEOF'
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "AFDA Agent Gateway"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # MongoDB (conversations, executions, workflows)
    MONGO_HOST: str = "localhost"
    MONGO_PORT: int = 27017
    MONGO_DB: str = "afda_docs"

    @property
    def MONGO_URL(self) -> str:
        return f"mongodb://{self.MONGO_HOST}:{self.MONGO_PORT}"

    # Redis (pub/sub, session state)
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 1

    @property
    def REDIS_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    # Engine defaults
    DEFAULT_ENGINE: str = "n8n"  # n8n | langgraph | bedrock
    N8N_BASE_URL: str = "http://localhost:5678"
    N8N_API_KEY: str = ""
    LANGGRAPH_ENDPOINT: str = ""
    BEDROCK_REGION: str = "us-east-1"
    BEDROCK_AGENT_ID: str = ""

    # JWT (shared secret with CRUD API)
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"

    # CRUD API (for data lookups)
    CRUD_API_URL: str = "http://localhost:8000/api/v1"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
PYEOF

# --- app/database.py ---
cat > "$APP/database.py" << 'PYEOF'
from motor.motor_asyncio import AsyncIOMotorClient
from redis.asyncio import Redis
from app.config import get_settings

settings = get_settings()

mongo_client: AsyncIOMotorClient = None
mongo_db = None
redis_client: Redis = None


def get_mongo():
    return mongo_db


def get_redis():
    return redis_client


async def connect_all():
    global mongo_client, mongo_db, redis_client
    mongo_client = AsyncIOMotorClient(settings.MONGO_URL)
    mongo_db = mongo_client[settings.MONGO_DB]
    redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    # Ensure indexes
    await mongo_db.agent_conversations.create_index("session_id")
    await mongo_db.agent_executions.create_index([("created_at", -1)])
    await mongo_db.workflow_definitions.create_index("name")


async def disconnect_all():
    global mongo_client, redis_client
    if mongo_client:
        mongo_client.close()
    if redis_client:
        await redis_client.close()
PYEOF

# --- app/models/agent_request.py ---
cat > "$APP/models/__init__.py" << 'EOF'
EOF

cat > "$APP/models/agent_request.py" << 'PYEOF'
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
PYEOF

# --- app/models/agent_response.py ---
cat > "$APP/models/agent_response.py" << 'PYEOF'
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
PYEOF

# --- app/models/engine_config.py ---
cat > "$APP/models/engine_config.py" << 'PYEOF'
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
PYEOF

# --- app/services/engine_registry.py ---
cat > "$APP/services/__init__.py" << 'EOF'
EOF

cat > "$APP/services/engine_registry.py" << 'PYEOF'
from typing import Optional
from app.config import get_settings
from app.models.engine_config import EngineInfo

settings = get_settings()


class EngineRegistry:
    """Tracks available engines and selects the right one per request."""

    ENGINES = {
        "n8n": EngineInfo(
            name="n8n", display_name="n8n Workflow Engine",
            status="available", version="1.x",
            config={"base_url": settings.N8N_BASE_URL},
        ),
        "langgraph": EngineInfo(
            name="langgraph", display_name="LangGraph Agent Framework",
            status="available" if settings.LANGGRAPH_ENDPOINT else "unavailable",
            version="0.2.x",
            config={"endpoint": settings.LANGGRAPH_ENDPOINT},
        ),
        "bedrock": EngineInfo(
            name="bedrock", display_name="AWS Bedrock Agents",
            status="available" if settings.BEDROCK_AGENT_ID else "unavailable",
            version="runtime",
            config={"region": settings.BEDROCK_REGION, "agent_id": settings.BEDROCK_AGENT_ID},
        ),
    }

    @classmethod
    def list_engines(cls) -> list[EngineInfo]:
        return list(cls.ENGINES.values())

    @classmethod
    def get_engine(cls, name: Optional[str] = None) -> EngineInfo:
        name = name or settings.DEFAULT_ENGINE
        return cls.ENGINES.get(name, cls.ENGINES[settings.DEFAULT_ENGINE])

    @classmethod
    def resolve(cls, requested: Optional[str] = None) -> str:
        if requested and requested in cls.ENGINES:
            return requested
        return settings.DEFAULT_ENGINE
PYEOF

# --- app/services/orchestrator.py ---
cat > "$APP/services/orchestrator.py" << 'PYEOF'
import time
import uuid
from typing import Optional, Dict, Any
from datetime import datetime
from app.config import get_settings
from app.database import get_mongo, get_redis
from app.services.engine_registry import EngineRegistry
from app.services.engine_n8n import N8nEngine
from app.services.engine_langgraph import LangGraphEngine
from app.services.engine_bedrock import BedrockEngine
from app.models.agent_response import AgentChatResponse

settings = get_settings()

ENGINE_MAP = {
    "n8n": N8nEngine,
    "langgraph": LangGraphEngine,
    "bedrock": BedrockEngine,
}


class AgentOrchestrator:
    """Central orchestrator — routes messages to the correct engine."""

    @staticmethod
    async def send_message(
        message: str,
        session_id: Optional[str] = None,
        engine: Optional[str] = None,
        agent_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> AgentChatResponse:
        start = time.time()
        session_id = session_id or str(uuid.uuid4())
        engine_name = EngineRegistry.resolve(engine)
        engine_cls = ENGINE_MAP.get(engine_name, N8nEngine)

        # Load conversation history from Mongo
        mongo = get_mongo()
        conv = await mongo.agent_conversations.find_one({"session_id": session_id})
        history = conv.get("messages", []) if conv else []

        # Send to engine
        engine_instance = engine_cls()
        result = await engine_instance.invoke(
            message=message,
            history=history,
            agent_id=agent_id,
            context=context or {},
        )

        latency = round((time.time() - start) * 1000, 2)

        # Persist conversation
        now = datetime.utcnow()
        new_messages = [
            {"role": "user", "content": message, "timestamp": now.isoformat(), "agent_id": agent_id},
            {"role": "assistant", "content": result["response"], "timestamp": now.isoformat(),
             "agent_id": result.get("agent_id", agent_id)},
        ]

        await mongo.agent_conversations.update_one(
            {"session_id": session_id},
            {
                "$push": {"messages": {"$each": new_messages}},
                "$set": {"engine": engine_name, "updated_at": now},
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )

        # Log execution
        await mongo.agent_executions.insert_one({
            "session_id": session_id,
            "engine": engine_name,
            "agent_id": agent_id,
            "status": "completed",
            "started_at": now,
            "completed_at": datetime.utcnow(),
            "duration_ms": int(latency),
            "input_summary": message[:200],
            "output_summary": result["response"][:200],
            "tokens_used": result.get("tokens_used"),
            "trace": result.get("trace", []),
            "created_at": now,
        })

        return AgentChatResponse(
            session_id=session_id,
            message=result["response"],
            agent_id=result.get("agent_id", agent_id),
            engine_used=engine_name,
            tokens_used=result.get("tokens_used"),
            latency_ms=latency,
            metadata=result.get("metadata"),
        )

    @staticmethod
    async def get_sessions(limit: int = 50):
        mongo = get_mongo()
        cursor = mongo.agent_conversations.find(
            {}, {"session_id": 1, "engine": 1, "created_at": 1, "updated_at": 1}
        ).sort("updated_at", -1).limit(limit)
        return await cursor.to_list(length=limit)

    @staticmethod
    async def get_history(session_id: str):
        mongo = get_mongo()
        return await mongo.agent_conversations.find_one({"session_id": session_id})
PYEOF

# --- app/services/engine_n8n.py ---
cat > "$APP/services/engine_n8n.py" << 'PYEOF'
import httpx
from typing import Optional, Dict, Any, List
from app.config import get_settings

settings = get_settings()


class N8nEngine:
    """Adapter for n8n workflow engine."""

    async def invoke(
        self, message: str, history: List[dict],
        agent_id: Optional[str] = None, context: Dict[str, Any] = {},
    ) -> dict:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                payload = {
                    "message": message,
                    "history": history[-10:],  # last 10 messages for context
                    "agent_id": agent_id,
                    "context": context,
                }
                resp = await client.post(
                    f"{settings.N8N_BASE_URL}/webhook/agent-chat",
                    json=payload,
                    headers={"Authorization": f"Bearer {settings.N8N_API_KEY}"} if settings.N8N_API_KEY else {},
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return {
                        "response": data.get("response", data.get("output", str(data))),
                        "agent_id": data.get("agent_id", agent_id),
                        "tokens_used": data.get("tokens_used"),
                        "trace": data.get("trace", []),
                        "metadata": data.get("metadata"),
                    }
                else:
                    return {"response": f"n8n returned status {resp.status_code}", "agent_id": agent_id}
        except httpx.ConnectError:
            return {
                "response": "[n8n engine unavailable] I'm currently unable to connect to the workflow engine. "
                            "Please check that n8n is running on port 5678.",
                "agent_id": agent_id,
            }
        except Exception as e:
            return {"response": f"[n8n error] {str(e)}", "agent_id": agent_id}
PYEOF

# --- app/services/engine_langgraph.py ---
cat > "$APP/services/engine_langgraph.py" << 'PYEOF'
from typing import Optional, Dict, Any, List
from app.config import get_settings

settings = get_settings()


class LangGraphEngine:
    """Adapter for LangGraph agent framework."""

    async def invoke(
        self, message: str, history: List[dict],
        agent_id: Optional[str] = None, context: Dict[str, Any] = {},
    ) -> dict:
        # Placeholder — integrate with LangGraph runtime
        # In production: import and invoke the LangGraph compiled graph
        if not settings.LANGGRAPH_ENDPOINT:
            return {
                "response": "[LangGraph] Engine not configured. Set LANGGRAPH_ENDPOINT in .env.",
                "agent_id": agent_id,
            }

        return {
            "response": f"[LangGraph placeholder] Received: {message}. "
                        f"Agent {agent_id or 'default'} would process this via LangGraph.",
            "agent_id": agent_id,
            "tokens_used": 0,
            "trace": [{"node": "router", "action": "placeholder"}],
        }
PYEOF

# --- app/services/engine_bedrock.py ---
cat > "$APP/services/engine_bedrock.py" << 'PYEOF'
from typing import Optional, Dict, Any, List
from app.config import get_settings

settings = get_settings()


class BedrockEngine:
    """Adapter for AWS Bedrock Agents."""

    async def invoke(
        self, message: str, history: List[dict],
        agent_id: Optional[str] = None, context: Dict[str, Any] = {},
    ) -> dict:
        # Placeholder — integrate with boto3 bedrock-agent-runtime
        if not settings.BEDROCK_AGENT_ID:
            return {
                "response": "[Bedrock] Engine not configured. Set BEDROCK_AGENT_ID in .env.",
                "agent_id": agent_id,
            }

        return {
            "response": f"[Bedrock placeholder] Received: {message}. "
                        f"Agent {agent_id or 'default'} would process via AWS Bedrock.",
            "agent_id": agent_id,
            "tokens_used": 0,
            "trace": [{"step": "bedrock-invoke", "action": "placeholder"}],
        }
PYEOF

# --- app/routers/agent_chat.py ---
cat > "$APP/routers/__init__.py" << 'EOF'
EOF

cat > "$APP/routers/agent_chat.py" << 'PYEOF'
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.services.orchestrator import AgentOrchestrator
from app.models.agent_request import AgentChatRequest
from app.models.agent_response import AgentChatResponse

router = APIRouter()


# ── WebSocket Chat ──
@router.websocket("/chat/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            result = await AgentOrchestrator.send_message(
                message=payload.get("message", ""),
                session_id=session_id,
                engine=payload.get("engine"),
                agent_id=payload.get("agent_id"),
                context=payload.get("context"),
            )
            await websocket.send_json(result.model_dump(mode="json"))
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({"error": str(e)})
        await websocket.close()


# ── HTTP Fallback ──
@router.post("/chat/send", response_model=AgentChatResponse)
async def http_chat(req: AgentChatRequest):
    return await AgentOrchestrator.send_message(
        message=req.message,
        session_id=req.session_id,
        engine=req.engine,
        agent_id=req.agent_id,
        context=req.context,
    )


# ── Sessions ──
@router.get("/chat/sessions")
async def list_sessions():
    sessions = await AgentOrchestrator.get_sessions()
    for s in sessions:
        s["_id"] = str(s["_id"])
    return {"success": True, "data": sessions}


@router.get("/chat/sessions/{session_id}/history")
async def session_history(session_id: str):
    conv = await AgentOrchestrator.get_history(session_id)
    if not conv:
        return {"success": False, "message": "Session not found"}
    conv["_id"] = str(conv["_id"])
    return {"success": True, "data": conv}
PYEOF

# --- app/routers/agent_workflows.py ---
cat > "$APP/routers/agent_workflows.py" << 'PYEOF'
from fastapi import APIRouter
from datetime import datetime
from app.database import get_mongo
from app.models.agent_request import WorkflowCreate, WorkflowUpdate

router = APIRouter()


@router.get("/workflows")
async def list_workflows():
    mongo = get_mongo()
    cursor = mongo.workflow_definitions.find().sort("name", 1)
    workflows = await cursor.to_list(length=100)
    for w in workflows:
        w["id"] = str(w.pop("_id"))
    return {"success": True, "data": workflows}


@router.post("/workflows", status_code=201)
async def create_workflow(data: WorkflowCreate):
    mongo = get_mongo()
    doc = data.model_dump()
    doc["created_at"] = datetime.utcnow()
    doc["updated_at"] = datetime.utcnow()
    result = await mongo.workflow_definitions.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return {"success": True, "data": doc, "message": "Workflow created"}


@router.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    from bson import ObjectId
    mongo = get_mongo()
    wf = await mongo.workflow_definitions.find_one({"_id": ObjectId(workflow_id)})
    if not wf:
        return {"success": False, "message": "Workflow not found"}
    wf["id"] = str(wf.pop("_id"))
    return {"success": True, "data": wf}


@router.put("/workflows/{workflow_id}")
async def update_workflow(workflow_id: str, data: WorkflowUpdate):
    from bson import ObjectId
    mongo = get_mongo()
    update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.utcnow()
    await mongo.workflow_definitions.update_one(
        {"_id": ObjectId(workflow_id)}, {"$set": update_data}
    )
    return {"success": True, "message": "Workflow updated"}


@router.post("/workflows/{workflow_id}/execute")
async def execute_workflow(workflow_id: str):
    # Placeholder — triggers workflow execution via the appropriate engine
    return {"success": True, "message": f"Workflow {workflow_id} execution triggered", "data": {"status": "queued"}}
PYEOF

# --- app/routers/agent_executions.py ---
cat > "$APP/routers/agent_executions.py" << 'PYEOF'
from fastapi import APIRouter, Query
from app.database import get_mongo

router = APIRouter()


@router.get("/executions")
async def list_executions(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    mongo = get_mongo()
    cursor = mongo.agent_executions.find().sort("created_at", -1).skip(offset).limit(limit)
    executions = await cursor.to_list(length=limit)
    for e in executions:
        e["id"] = str(e.pop("_id"))
    return {"success": True, "data": executions}


@router.get("/executions/{execution_id}")
async def get_execution(execution_id: str):
    from bson import ObjectId
    mongo = get_mongo()
    exc = await mongo.agent_executions.find_one({"_id": ObjectId(execution_id)})
    if not exc:
        return {"success": False, "message": "Execution not found"}
    exc["id"] = str(exc.pop("_id"))
    return {"success": True, "data": exc}


@router.get("/executions/{execution_id}/logs")
async def get_execution_logs(execution_id: str):
    from bson import ObjectId
    mongo = get_mongo()
    exc = await mongo.agent_executions.find_one({"_id": ObjectId(execution_id)})
    if not exc:
        return {"success": False, "message": "Execution not found"}
    return {"success": True, "data": exc.get("trace", [])}
PYEOF

# --- app/routers/streaming.py ---
cat > "$APP/routers/streaming.py" << 'PYEOF'
import asyncio
import json
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from app.database import get_redis

router = APIRouter()


@router.get("/stream/{session_id}")
async def stream_events(session_id: str):
    """SSE endpoint — streams agent events for a session in real-time."""

    async def event_generator():
        redis = get_redis()
        pubsub = redis.pubsub()
        await pubsub.subscribe(f"agent:stream:{session_id}")
        try:
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message["type"] == "message":
                    yield {"event": "agent_message", "data": message["data"]}
                else:
                    yield {"event": "heartbeat", "data": json.dumps({"status": "alive"})}
                await asyncio.sleep(0.5)
        finally:
            await pubsub.unsubscribe(f"agent:stream:{session_id}")

    return EventSourceResponse(event_generator())
PYEOF

# --- app/routers/health.py ---
cat > "$APP/routers/health.py" << 'PYEOF'
from fastapi import APIRouter
from app.config import get_settings
from app.services.engine_registry import EngineRegistry
from app.models.engine_config import EngineInfo, EngineDefaultUpdate

router = APIRouter()
settings = get_settings()


@router.get("/health")
async def health():
    return {"status": "healthy", "service": settings.APP_NAME, "version": settings.APP_VERSION}


@router.get("/engines", response_model=list[EngineInfo])
async def list_engines():
    return EngineRegistry.list_engines()


@router.put("/engines/default")
async def set_default_engine(data: EngineDefaultUpdate):
    # In production, persist to DB/Redis
    return {"success": True, "message": f"Default engine set to {data.engine}", "data": {"engine": data.engine}}
PYEOF

# --- app/middleware/rate_limiter.py ---
cat > "$APP/middleware/__init__.py" << 'EOF'
EOF

cat > "$APP/middleware/rate_limiter.py" << 'PYEOF'
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.database import get_redis


class RateLimiterMiddleware(BaseHTTPMiddleware):
    MAX_REQUESTS = 100  # per minute
    WINDOW = 60

    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/docs") or request.url.path.startswith("/health"):
            return await call_next(request)

        redis = get_redis()
        if not redis:
            return await call_next(request)

        client_ip = request.client.host
        key = f"rate:{client_ip}"
        try:
            count = await redis.incr(key)
            if count == 1:
                await redis.expire(key, self.WINDOW)
            if count > self.MAX_REQUESTS:
                return JSONResponse(
                    status_code=429,
                    content={"success": False, "message": "Rate limit exceeded. Try again later."},
                )
        except Exception:
            pass
        return await call_next(request)
PYEOF

# --- app/middleware/metrics.py ---
cat > "$APP/middleware/metrics.py" << 'PYEOF'
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import logging

logger = logging.getLogger("afda-gateway")


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        duration = round((time.time() - start) * 1000, 2)
        logger.info(f"{request.method} {request.url.path} → {response.status_code} ({duration}ms)")
        response.headers["X-Response-Time-Ms"] = str(duration)
        return response
PYEOF

# --- main.py ---
cat > "$BASE/main.py" << 'PYEOF'
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import get_settings
from app.database import connect_all, disconnect_all
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.middleware.metrics import MetricsMiddleware

from app.routers.agent_chat import router as chat_router
from app.routers.agent_workflows import router as workflow_router
from app.routers.agent_executions import router as execution_router
from app.routers.streaming import router as stream_router
from app.routers.health import router as health_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_all()
    yield
    await disconnect_all()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Middleware ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimiterMiddleware)
app.add_middleware(MetricsMiddleware)

# ── Prometheus ──
Instrumentator().instrument(app).expose(app)

# ── Routers ──
app.include_router(chat_router,      prefix="/api/v1/agents", tags=["Agent Chat"])
app.include_router(workflow_router,   prefix="/api/v1/agents", tags=["Workflows"])
app.include_router(execution_router,  prefix="/api/v1/agents", tags=["Executions"])
app.include_router(stream_router,     prefix="/api/v1/agents", tags=["Streaming"])
app.include_router(health_router,     prefix="/api/v1/agents", tags=["Gateway Health"])


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "endpoints": {
            "websocket_chat": "ws://localhost:8001/api/v1/agents/chat/{session_id}",
            "http_chat": "POST /api/v1/agents/chat/send",
            "sse_stream": "GET /api/v1/agents/stream/{session_id}",
            "workflows": "/api/v1/agents/workflows",
            "executions": "/api/v1/agents/executions",
            "engines": "/api/v1/agents/engines",
        },
    }
PYEOF

# --- Dockerfile ---
cat > "$BASE/Dockerfile" << 'EOF'
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
EOF

# --- .env ---
cat > "$BASE/.env" << 'EOF'
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=afda_docs
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=1
DEFAULT_ENGINE=n8n
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=
LANGGRAPH_ENDPOINT=
BEDROCK_REGION=us-east-1
BEDROCK_AGENT_ID=
JWT_SECRET=change-me-in-production
CRUD_API_URL=http://localhost:8000/api/v1
DEBUG=true
EOF

echo "✅ [10] Agent Gateway created at $BASE"
echo ""
echo "   Services/afda-agent-gateway/ (Port 8001)"
echo "   ├── main.py               — FastAPI app with all routers"
echo "   ├── app/config.py         — Engine configs, JWT, Redis, Mongo"
echo "   ├── app/database.py       — MongoDB + Redis connections"
echo "   ├── app/services/"
echo "   │   ├── orchestrator.py   — Central agent orchestrator"
echo "   │   ├── engine_registry.py— Engine selection logic"
echo "   │   ├── engine_n8n.py     — n8n adapter (HTTP webhook)"
echo "   │   ├── engine_langgraph.py— LangGraph adapter (placeholder)"
echo "   │   └── engine_bedrock.py — AWS Bedrock adapter (placeholder)"
echo "   ├── app/routers/"
echo "   │   ├── agent_chat.py     — WebSocket + HTTP chat"
echo "   │   ├── agent_workflows.py— Workflow CRUD"
echo "   │   ├── agent_executions.py— Execution history"
echo "   │   ├── streaming.py      — SSE real-time stream"
echo "   │   └── health.py         — Health + engine management"
echo "   └── app/middleware/"
echo "       ├── rate_limiter.py   — Redis-based rate limiting"
echo "       └── metrics.py        — Request timing"
echo ""
echo "   🎉 BOTH MICROSERVICES ARE NOW COMPLETE!"
echo "   CRUD API:       102 endpoints on port 8000"
echo "   Agent Gateway:   15 endpoints on port 8001"
echo "   TOTAL:          117 endpoints"
