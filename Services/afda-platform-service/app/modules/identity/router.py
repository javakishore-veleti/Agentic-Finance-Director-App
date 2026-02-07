"""
Identity router:
  /auth/login, /auth/signup, /auth/refresh, /auth/me
  /users, /users/{id}
  /roles, /roles/{id}
  /user-orgs (assign/remove user to/from org)
"""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.shared.responses import ok, error
from app.shared.exceptions import NotFoundError, ConflictError, BadRequestError
from app.modules.identity.models import User, Role, UserOrganization
from app.modules.identity.dtos import (
    LoginRequest, SignupRequest, RefreshRequest,
    UserCreateRequest, UserUpdateRequest,
    RoleCreateRequest, RoleUpdateRequest,
    UserOrgAssignRequest,
)
from app.modules.identity.dao import UserDAO, RoleDAO, UserOrgDAO
from app.modules.identity.service import AuthService
from app.auth.password import hash_password

router = APIRouter()


# == Auth ==========================================================

@router.post("/auth/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    svc = AuthService(db)
    data = await svc.login(req.email, req.password)
    return ok(data=data, message="Login successful")


@router.post("/auth/signup")
async def signup(req: SignupRequest, db: AsyncSession = Depends(get_db)):
    svc = AuthService(db)
    data = await svc.signup(
        email=req.email,
        password=req.password,
        display_name=req.display_name,
        company_name=req.company_name,
    )
    return ok(data=data, message="Account created")


@router.post("/auth/refresh")
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    svc = AuthService(db)
    #data = await svc.refresh_token(req.refresh_token)
    data = await svc.refresh(req.refresh_token)
    return ok(data=data)


@router.get("/auth/me")
async def me(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    org_dao = UserOrgDAO(db)
    #orgs = await org_dao.list_with_details(user.id)
    orgs = await org_dao.get_user_orgs(user.id)
    return ok(data={
        "id": str(user.id),
        "email": user.email,
        "display_name": user.display_name,
        "customer_id": str(user.customer_id),
        "is_customer_admin": user.is_customer_admin,
        "status": user.status,
        "organizations": orgs,
    })


# == Users =========================================================

def _user(u: User) -> dict:
    return {
        "id": str(u.id),
        "email": u.email,
        "display_name": u.display_name,
        "department": getattr(u, "department", None),
        "status": u.status,
        "is_customer_admin": u.is_customer_admin,
        "avatar_url": getattr(u, "avatar_url", None),
        "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
        "created_at": u.created_at.isoformat() if u.created_at else None,
    }


@router.get("/users")
async def list_users(
    status: str = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = UserDAO(db)
    users = await dao.list_by_customer(user.customer_id)
    if status:
        users = [u for u in users if u.status == status]
    return ok(data=[_user(u) for u in users])


@router.post("/users")
async def create_user(
    req: UserCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can create users")

    dao = UserDAO(db)
    existing = await dao.get_by_email(req.email)
    if existing:
        raise ConflictError("Email already in use")

    new_user = User(
        customer_id=user.customer_id,
        email=req.email,
        display_name=req.display_name,
        password_hash=hash_password(req.password),
        is_customer_admin=getattr(req, "is_customer_admin", False),
        status="active",
    )
    # Set department if the field exists on User model
    if hasattr(req, "department") and req.department:
        new_user.department = req.department

    new_user = await dao.create(new_user)
    await db.commit()

    return ok(data=_user(new_user))


@router.put("/users/{user_id}")
async def update_user(
    user_id: uuid.UUID,
    req: UserUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = UserDAO(db)
    target = await dao.get_by_id(user_id)
    if not target or target.customer_id != user.customer_id:
        raise NotFoundError("User not found")

    updates = {}
    if hasattr(req, "display_name") and req.display_name is not None:
        updates["display_name"] = req.display_name
    if hasattr(req, "department") and req.department is not None:
        updates["department"] = req.department
    if hasattr(req, "status") and req.status is not None:
        updates["status"] = req.status

    if updates:
        updated = await dao.update(user_id, **updates)
        await db.commit()
        if updated:
            return ok(data=_user(updated))

    return ok(data=_user(target))


@router.delete("/users/{user_id}")
async def deactivate_user(
    user_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can deactivate users")
    if user_id == user.id:
        raise BadRequestError("Cannot deactivate yourself")

    dao = UserDAO(db)
    target = await dao.get_by_id(user_id)
    if not target or target.customer_id != user.customer_id:
        raise NotFoundError("User not found")

    await dao.update(user_id, status="inactive")
    await db.commit()
    return ok(message="User deactivated")


# == Roles =========================================================

def _role(r: Role) -> dict:
    perms = r.permissions_json or {}
    return {
        "id": str(r.id),
        "name": r.name,
        "description": r.description,
        "is_system": r.is_system,
        "permissions": perms,
        "permissions_json": perms,
    }


@router.get("/roles")
async def list_roles(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    dao = RoleDAO(db)
    roles = await dao.list_for_customer(user.customer_id)
    return ok(data=[_role(r) for r in roles])


@router.post("/roles")
async def create_role(
    req: RoleCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can create roles")

    dao = RoleDAO(db)
    perms = {}
    if hasattr(req, "permissions_json") and req.permissions_json:
        perms = req.permissions_json
    elif hasattr(req, "permissions") and req.permissions:
        perms = req.permissions

    role = Role(
        customer_id=user.customer_id,
        name=req.name,
        description=req.description,
        permissions_json=perms,
        is_system=False,
    )
    role = await dao.create(role)
    await db.commit()
    return ok(data=_role(role))


@router.put("/roles/{role_id}")
async def update_role(
    role_id: uuid.UUID,
    req: RoleUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = RoleDAO(db)
    role = await dao.get_by_id(role_id)
    if not role or role.customer_id != user.customer_id:
        raise NotFoundError("Role not found")
    if role.is_system:
        raise BadRequestError("Cannot modify system roles")

    updates = {}
    if hasattr(req, "description") and req.description is not None:
        updates["description"] = req.description
    perms = None
    if hasattr(req, "permissions_json") and req.permissions_json:
        perms = req.permissions_json
    elif hasattr(req, "permissions") and req.permissions:
        perms = req.permissions
    if perms is not None:
        updates["permissions_json"] = perms

    if updates:
        role = await dao.update(role_id, **updates)
        await db.commit()

    return ok(data=_role(role))


# == User-Org Mappings =============================================

@router.get("/user-orgs/{user_id}")
async def list_user_orgs(
    user_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = UserOrgDAO(db)
    mappings = await dao.list_by_user(user_id)
    return ok(data=[{
        "id": str(m.id),
        "user_id": str(m.user_id),
        "organization_id": str(m.organization_id),
        "role_id": str(m.role_id),
        "is_default": m.is_default,
        "status": m.status,
    } for m in mappings])


@router.post("/user-orgs")
async def assign_user_to_org(
    req: UserOrgAssignRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can assign users to organizations")

    dao = UserOrgDAO(db)
    mapping = UserOrganization(
        user_id=req.user_id,
        organization_id=req.organization_id,
        role_id=req.role_id,
        is_default=req.is_default,
        status="active",
    )
    mapping = await dao.create(mapping)
    await db.commit()
    return ok(data={"id": str(mapping.id)})


@router.delete("/user-orgs/{user_id}/{organization_id}")
async def remove_user_from_org(
    user_id: uuid.UUID,
    organization_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can remove user org assignments")

    dao = UserOrgDAO(db)
    await dao.remove(user_id, organization_id)
    await db.commit()
    return ok(message="User removed from organization")
