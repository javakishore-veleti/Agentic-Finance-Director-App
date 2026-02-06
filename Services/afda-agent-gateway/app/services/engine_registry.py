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
