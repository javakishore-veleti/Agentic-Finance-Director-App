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
