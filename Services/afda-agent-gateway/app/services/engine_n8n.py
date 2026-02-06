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
