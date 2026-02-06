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
