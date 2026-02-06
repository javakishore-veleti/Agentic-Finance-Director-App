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
