from fastapi import APIRouter
from datetime import datetime
from app.database import get_mongo
from app.models.agent_request import WorkflowCreate, WorkflowUpdate

router = APIRouter()


@router.get("/workflows")
async def list_workflows():
    mongo = get_mongo()
    cursor = mongo.workflow_definitions.find().sort("name", 1)
    workflows = await cursor.to_list(length=100)
    for w in workflows:
        w["id"] = str(w.pop("_id"))
    return {"success": True, "data": workflows}


@router.post("/workflows", status_code=201)
async def create_workflow(data: WorkflowCreate):
    mongo = get_mongo()
    doc = data.model_dump()
    doc["created_at"] = datetime.utcnow()
    doc["updated_at"] = datetime.utcnow()
    result = await mongo.workflow_definitions.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return {"success": True, "data": doc, "message": "Workflow created"}


@router.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    from bson import ObjectId
    mongo = get_mongo()
    wf = await mongo.workflow_definitions.find_one({"_id": ObjectId(workflow_id)})
    if not wf:
        return {"success": False, "message": "Workflow not found"}
    wf["id"] = str(wf.pop("_id"))
    return {"success": True, "data": wf}


@router.put("/workflows/{workflow_id}")
async def update_workflow(workflow_id: str, data: WorkflowUpdate):
    from bson import ObjectId
    mongo = get_mongo()
    update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.utcnow()
    await mongo.workflow_definitions.update_one(
        {"_id": ObjectId(workflow_id)}, {"$set": update_data}
    )
    return {"success": True, "message": "Workflow updated"}


@router.post("/workflows/{workflow_id}/execute")
async def execute_workflow(workflow_id: str):
    # Placeholder — triggers workflow execution via the appropriate engine
    return {"success": True, "message": f"Workflow {workflow_id} execution triggered", "data": {"status": "queued"}}
