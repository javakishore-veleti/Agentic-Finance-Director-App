#!/bin/bash
###############################################################################
# 01_crud_api_foundation.sh
# Creates: afda-crud-api service skeleton — main.py, config, database, shared utils
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

BASE="Services/afda-crud-api"
APP="$BASE/app"

echo "🔧 [01] Creating CRUD API foundation..."

# --- Directory structure ---
mkdir -p "$APP/middleware"
mkdir -p "$APP/shared"
mkdir -p "$APP/modules/command_center"
mkdir -p "$APP/modules/fpa"
mkdir -p "$APP/modules/treasury"
mkdir -p "$APP/modules/accounting"
mkdir -p "$APP/modules/risk"
mkdir -p "$APP/modules/monitoring"
mkdir -p "$APP/modules/admin"
mkdir -p "$APP/openapi"
mkdir -p "$BASE/tests"
mkdir -p "$BASE/alembic/versions"

# --- requirements.txt ---
cat > "$BASE/requirements.txt" << 'EOF'
fastapi==0.115.6
uvicorn[standard]==0.34.0
sqlalchemy[asyncio]==2.0.36
asyncpg==0.30.0
alembic==1.14.0
pydantic==2.10.3
pydantic-settings==2.7.0
motor==3.6.0
redis[hiredis]==5.2.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.18
httpx==0.28.1
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
    # App
    APP_NAME: str = "AFDA CRUD API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"

    # PostgreSQL
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "afda"
    POSTGRES_PASSWORD: str = "afda_secret"
    POSTGRES_DB: str = "afda_db"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # MongoDB
    MONGO_HOST: str = "localhost"
    MONGO_PORT: int = 27017
    MONGO_DB: str = "afda_docs"

    @property
    def MONGO_URL(self) -> str:
        return f"mongodb://{self.MONGO_HOST}:{self.MONGO_PORT}"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    @property
    def REDIS_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    # JWT
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
PYEOF

# --- app/database.py ---
cat > "$APP/database.py" << 'PYEOF'
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from motor.motor_asyncio import AsyncIOMotorClient
from redis.asyncio import Redis
from app.config import get_settings

settings = get_settings()

# ── PostgreSQL ──
engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG, pool_size=20)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# ── MongoDB ──
mongo_client: AsyncIOMotorClient = None
mongo_db = None


def get_mongo():
    return mongo_db


# ── Redis ──
redis_client: Redis = None


def get_redis():
    return redis_client


# ── Lifecycle ──
async def connect_all():
    global mongo_client, mongo_db, redis_client
    mongo_client = AsyncIOMotorClient(settings.MONGO_URL)
    mongo_db = mongo_client[settings.MONGO_DB]
    redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)


async def disconnect_all():
    global mongo_client, redis_client
    if mongo_client:
        mongo_client.close()
    if redis_client:
        await redis_client.close()
PYEOF

# --- app/dependencies.py ---
cat > "$APP/dependencies.py" << 'PYEOF'
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import get_settings
from app.database import get_db

security = HTTPBearer()
settings = get_settings()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        payload = jwt.decode(
            credentials.credentials, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return {"user_id": user_id, "email": payload.get("email"), "role": payload.get("role")}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
PYEOF

# --- app/shared/__init__.py ---
cat > "$APP/shared/__init__.py" << 'EOF'
EOF

# --- app/shared/responses.py ---
cat > "$APP/shared/responses.py" << 'PYEOF'
from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: str = "OK"


class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    data: List[T] = []
    total: int = 0
    page: int = 1
    page_size: int = 20
    total_pages: int = 0
PYEOF

# --- app/shared/exceptions.py ---
cat > "$APP/shared/exceptions.py" << 'PYEOF'
from fastapi import HTTPException, status


class NotFoundException(HTTPException):
    def __init__(self, entity: str = "Resource", id: Any = None):
        detail = f"{entity} not found" + (f": {id}" if id else "")
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class BadRequestException(HTTPException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class ForbiddenException(HTTPException):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

from typing import Any
PYEOF

# --- app/shared/pagination.py ---
cat > "$APP/shared/pagination.py" << 'PYEOF'
import math
from fastapi import Query


class PaginationParams:
    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    ):
        self.page = page
        self.page_size = page_size
        self.offset = (page - 1) * page_size


def paginate(items: list, total: int, params: PaginationParams) -> dict:
    return {
        "success": True,
        "data": items,
        "total": total,
        "page": params.page,
        "page_size": params.page_size,
        "total_pages": math.ceil(total / params.page_size) if params.page_size else 0,
    }
PYEOF

# --- app/middleware/error_handler.py ---
cat > "$APP/middleware/__init__.py" << 'EOF'
EOF

cat > "$APP/middleware/error_handler.py" << 'PYEOF'
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import traceback
import logging

logger = logging.getLogger("afda")


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            logger.error(f"Unhandled error: {exc}\n{traceback.format_exc()}")
            return JSONResponse(
                status_code=500,
                content={"success": False, "message": "Internal server error", "data": None},
            )
PYEOF

# --- main.py ---
cat > "$BASE/main.py" << 'PYEOF'
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import get_settings
from app.database import connect_all, disconnect_all
from app.middleware.error_handler import ErrorHandlerMiddleware

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

# -- Middleware --
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(ErrorHandlerMiddleware)

# -- Prometheus --
Instrumentator().instrument(app).expose(app)

# -- Routers (uncomment as modules are built) --
# from app.modules.command_center.router import router as cc_router
# from app.modules.fpa.router import router as fpa_router
# from app.modules.treasury.router import router as treasury_router
# from app.modules.accounting.router import router as accounting_router
# from app.modules.risk.router import router as risk_router
# from app.modules.monitoring.router import router as monitoring_router
# from app.modules.admin.router import router as admin_router

# app.include_router(cc_router, prefix=f"{settings.API_PREFIX}/command-center", tags=["Command Center"])
# app.include_router(fpa_router, prefix=f"{settings.API_PREFIX}/fpa", tags=["FP&A"])
# app.include_router(treasury_router, prefix=f"{settings.API_PREFIX}/treasury", tags=["Treasury"])
# app.include_router(accounting_router, prefix=f"{settings.API_PREFIX}/accounting", tags=["Accounting"])
# app.include_router(risk_router, prefix=f"{settings.API_PREFIX}/risk", tags=["Risk Intelligence"])
# app.include_router(monitoring_router, prefix=f"{settings.API_PREFIX}/monitoring", tags=["Monitoring"])
# app.include_router(admin_router, prefix=f"{settings.API_PREFIX}/admin", tags=["Admin"])


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "service": settings.APP_NAME, "version": settings.APP_VERSION}
PYEOF

# --- Dockerfile ---
cat > "$BASE/Dockerfile" << 'EOF'
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
EOF

# --- .env ---
cat > "$BASE/.env" << 'EOF'
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=afda
POSTGRES_PASSWORD=afda_secret
POSTGRES_DB=afda_db
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=afda_docs
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=change-me-in-production
DEBUG=true
EOF

# --- Module __init__.py files ---
for mod in command_center fpa treasury accounting risk monitoring admin; do
    cat > "$APP/modules/${mod}/__init__.py" << 'EOF'
EOF
done

echo "✅ [01] CRUD API foundation created at $BASE"
echo "    → main.py, config.py, database.py, dependencies.py"
echo "    → shared/ (responses, exceptions, pagination)"
echo "    → middleware/ (error_handler)"
echo "    → 7 module directories ready"
echo "    → requirements.txt, Dockerfile, .env"
echo ""
echo "   Next: Run 02_command_center_module.sh"