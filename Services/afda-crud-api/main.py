from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import get_settings
from app.database import connect_all, disconnect_all
from app.middleware.error_handler import ErrorHandlerMiddleware

# ── Module Routers ──
from app.modules.command_center.router import router as cc_router
from app.modules.fpa.router import router as fpa_router
from app.modules.treasury.router import router as treasury_router
from app.modules.accounting.router import router as accounting_router
from app.modules.risk.router import router as risk_router
from app.modules.monitoring.router import router as monitoring_router
from app.modules.admin.router import router as admin_router
from app.modules.auth.router import router as auth_router

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
app.add_middleware(ErrorHandlerMiddleware)

# ── Prometheus ──
Instrumentator().instrument(app).expose(app)

# ── Register All Routers ──
app.include_router(auth_router,     prefix=f"{settings.API_PREFIX}/auth",           tags=["Authentication"])
app.include_router(cc_router,        prefix=f"{settings.API_PREFIX}/command-center", tags=["Command Center"])
app.include_router(fpa_router,       prefix=f"{settings.API_PREFIX}/fpa",            tags=["FP&A"])
app.include_router(treasury_router,  prefix=f"{settings.API_PREFIX}/treasury",       tags=["Treasury"])
app.include_router(accounting_router,prefix=f"{settings.API_PREFIX}/accounting",     tags=["Accounting"])
app.include_router(risk_router,      prefix=f"{settings.API_PREFIX}/risk",           tags=["Risk Intelligence"])
app.include_router(monitoring_router,prefix=f"{settings.API_PREFIX}/monitoring",     tags=["Monitoring"])
app.include_router(admin_router,     prefix=f"{settings.API_PREFIX}/admin",          tags=["Admin"])

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "service": settings.APP_NAME, "version": settings.APP_VERSION}


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "modules": [
            {"name": "Command Center", "prefix": f"{settings.API_PREFIX}/command-center"},
            {"name": "FP&A",           "prefix": f"{settings.API_PREFIX}/fpa"},
            {"name": "Treasury",       "prefix": f"{settings.API_PREFIX}/treasury"},
            {"name": "Accounting",     "prefix": f"{settings.API_PREFIX}/accounting"},
            {"name": "Risk Intelligence","prefix": f"{settings.API_PREFIX}/risk"},
            {"name": "Monitoring",     "prefix": f"{settings.API_PREFIX}/monitoring"},
            {"name": "Admin",          "prefix": f"{settings.API_PREFIX}/admin"},
        ],
    }
