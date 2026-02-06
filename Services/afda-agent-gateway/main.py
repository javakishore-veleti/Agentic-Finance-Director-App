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
