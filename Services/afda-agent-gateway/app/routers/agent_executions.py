from fastapi import APIRouter, Query
from app.database import get_mongo

router = APIRouter()


@router.get("/executions")
async def list_executions(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    mongo = get_mongo()
    cursor = mongo.agent_executions.find().sort("created_at", -1).skip(offset).limit(limit)
    executions = await cursor.to_list(length=limit)
    for e in executions:
        e["id"] = str(e.pop("_id"))
    return {"success": True, "data": executions}


@router.get("/executions/{execution_id}")
async def get_execution(execution_id: str):
    from bson import ObjectId
    mongo = get_mongo()
    exc = await mongo.agent_executions.find_one({"_id": ObjectId(execution_id)})
    if not exc:
        return {"success": False, "message": "Execution not found"}
    exc["id"] = str(exc.pop("_id"))
    return {"success": True, "data": exc}


@router.get("/executions/{execution_id}/logs")
async def get_execution_logs(execution_id: str):
    from bson import ObjectId
    mongo = get_mongo()
    exc = await mongo.agent_executions.find_one({"_id": ObjectId(execution_id)})
    if not exc:
        return {"success": False, "message": "Execution not found"}
    return {"success": True, "data": exc.get("trace", [])}
