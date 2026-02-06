"""
Access router: CRUD for OrgAccessPolicy (cross-org sharing).
"""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.shared.responses import ok
from app.shared.exceptions import NotFoundError, BadRequestError
from app.modules.identity.models import User
from app.modules.access.models import OrgAccessPolicy
from app.modules.access.dao import AccessPolicyDAO
from app.modules.access.dtos import AccessPolicyCreateRequest, AccessPolicyUpdateRequest

router = APIRouter()


@router.get("/policies")
async def list_policies(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    dao = AccessPolicyDAO(db)
    policies = await dao.list_by_customer(user.customer_id)
    return ok(data=[{
        "id": str(p.id),
        "from_organization_id": str(p.from_organization_id),
        "to_organization_id": str(p.to_organization_id),
        "domain": p.domain, "row_type": p.row_type,
        "access_level": p.access_level,
        "access_config_json": p.access_config_json,
        "is_active": p.is_active,
        "expires_at": p.expires_at.isoformat() if p.expires_at else None,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    } for p in policies])


@router.post("/policies")
async def create_policy(
    req: AccessPolicyCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can create access policies")

    if req.from_organization_id == req.to_organization_id:
        raise BadRequestError("Cannot create self-sharing policy")

    if req.row_type not in ("role", "user"):
        raise BadRequestError("row_type must be 'role' or 'user'")

    dao = AccessPolicyDAO(db)
    policy = OrgAccessPolicy(
        customer_id=user.customer_id,
        from_organization_id=req.from_organization_id,
        to_organization_id=req.to_organization_id,
        domain=req.domain,
        row_type=req.row_type,
        access_level=req.access_level,
        access_config_json=req.access_config_json,
        is_active=True,
        granted_by_user_id=user.id,
        expires_at=req.expires_at,
    )
    policy = await dao.create(policy)
    await db.commit()
    return ok(data={"id": str(policy.id)}, message="Access policy created")


@router.put("/policies/{policy_id}")
async def update_policy(
    policy_id: uuid.UUID,
    req: AccessPolicyUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = AccessPolicyDAO(db)
    policy = await dao.get_by_id(policy_id)
    if not policy or policy.customer_id != user.customer_id:
        raise NotFoundError("Access policy")

    updates = req.model_dump(exclude_none=True)
    if updates:
        await dao.update(policy_id, **updates)
        await db.commit()
    return ok(message="Access policy updated")


@router.delete("/policies/{policy_id}")
async def delete_policy(
    policy_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = AccessPolicyDAO(db)
    policy = await dao.get_by_id(policy_id)
    if not policy or policy.customer_id != user.customer_id:
        raise NotFoundError("Access policy")
    await dao.delete(policy_id)
    await db.commit()
    return ok(message="Access policy deleted")


@router.get("/policies/org/{org_id}")
async def list_policies_for_org(
    org_id: uuid.UUID,
    direction: str = "to",
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get policies where org is receiving ('to') or granting ('from') access."""
    dao = AccessPolicyDAO(db)
    policies = await dao.list_for_org(org_id, direction)
    return ok(data=[{
        "id": str(p.id),
        "from_organization_id": str(p.from_organization_id),
        "to_organization_id": str(p.to_organization_id),
        "domain": p.domain, "row_type": p.row_type,
        "access_level": p.access_level,
        "access_config_json": p.access_config_json,
        "is_active": p.is_active,
    } for p in policies])
