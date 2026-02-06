"""
AFDA Platform Service — Identity, Tenancy & Cross-Org Access Control
Port: 8002
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database import engine, Base
from app.middleware.error_handler import global_exception_handler

# Import all models so they're registered with SQLAlchemy
from app.modules.identity import models as identity_models  # noqa: F401
from app.modules.access import models as access_models  # noqa: F401
from app.modules.config import models as config_models  # noqa: F401

# Import routers
from app.modules.identity.router import router as identity_router
from app.modules.tenancy.router import router as tenancy_router
from app.modules.access.router import router as access_router
from app.modules.config.router import router as config_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables if they don't exist (dev convenience)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(f"🏢 {settings.APP_NAME} v{settings.APP_VERSION} started on :8002")
    print(f"   Database: {settings.POSTGRES_DB}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}")
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler
app.add_exception_handler(Exception, global_exception_handler)

# Mount routers under /api/v1/platform
PREFIX = "/api/v1/platform"
app.include_router(identity_router, prefix=f"{PREFIX}/identity", tags=["Identity"])
app.include_router(tenancy_router,  prefix=f"{PREFIX}/tenancy",  tags=["Tenancy"])
app.include_router(access_router,   prefix=f"{PREFIX}/access",   tags=["Access Policies"])
app.include_router(config_router,   prefix=f"{PREFIX}/config",   tags=["Platform Config"])


# Health check
@app.get("/health")
async def health():
    return {"status": "ok", "service": "afda-platform-service", "version": settings.APP_VERSION}


# Auth endpoints will be mounted at /api/v1/platform/auth in Script 23
