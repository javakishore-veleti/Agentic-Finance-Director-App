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
