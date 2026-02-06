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


# ── Auth ───────────────────────────────────────────────────────

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
    return ok(data=data, message="Account created successfully")


@router.post("/auth/refresh")
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    svc = AuthService(db)
    data = await svc.refresh(req.refresh_token)
    return ok(data=data)


@router.get("/auth/me")
async def me(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    svc = AuthService(db)
    data = await svc.get_profile(user)
    return ok(data=data)


# ── Users ──────────────────────────────────────────────────────

@router.get("/users")
async def list_users(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    dao = UserDAO(db)
    users = await dao.list_by_customer(user.customer_id)
    return ok(data=[{
        "id": str(u.id), "email": u.email, "display_name": u.display_name,
        "status": u.status, "is_customer_admin": u.is_customer_admin,
        "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
        "created_at": u.created_at.isoformat() if u.created_at else None,
    } for u in users])


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
        is_customer_admin=req.is_customer_admin,
        status="active",
    )
    new_user = await dao.create(new_user)
    await db.commit()

    return ok(data={"id": str(new_user.id), "email": new_user.email,
                     "display_name": new_user.display_name})


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
        raise NotFoundError("User")

    updates = req.model_dump(exclude_none=True)
    if updates:
        updated = await dao.update(user_id, **updates)
        await db.commit()
    return ok(message="User updated")


@router.delete("/users/{user_id}")
async def deactivate_user(
    user_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can deactivate users")
    dao = UserDAO(db)
    await dao.update(user_id, status="inactive")
    await db.commit()
    return ok(message="User deactivated")


# ── Roles ──────────────────────────────────────────────────────

@router.get("/roles")
async def list_roles(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    dao = RoleDAO(db)
    roles = await dao.list_for_customer(user.customer_id)
    return ok(data=[{
        "id": str(r.id), "name": r.name, "description": r.description,
        "permissions_json": r.permissions_json, "is_system": r.is_system,
    } for r in roles])


@router.post("/roles")
async def create_role(
    req: RoleCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = RoleDAO(db)
    role = Role(
        customer_id=user.customer_id,
        name=req.name,
        description=req.description,
        permissions_json=req.permissions_json,
    )
    role = await dao.create(role)
    await db.commit()
    return ok(data={"id": str(role.id), "name": role.name})


@router.put("/roles/{role_id}")
async def update_role(
    role_id: uuid.UUID,
    req: RoleUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = RoleDAO(db)
    updates = req.model_dump(exclude_none=True)
    if updates:
        await dao.update(role_id, **updates)
        await db.commit()
    return ok(message="Role updated")


# ── User-Organization Assignments ─────────────────────────────

@router.get("/user-orgs/{user_id}")
async def list_user_orgs(
    user_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = UserOrgDAO(db)
    uos = await dao.get_user_orgs(user_id)
    return ok(data=[{
        "id": str(uo.id), "user_id": str(uo.user_id),
        "organization_id": str(uo.organization_id),
        "role_id": str(uo.role_id), "is_default": uo.is_default,
        "status": uo.status,
    } for uo in uos])


@router.post("/user-orgs")
async def assign_user_to_org(
    req: UserOrgAssignRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = UserOrgDAO(db)
    uo = UserOrganization(
        user_id=req.user_id,
        organization_id=req.organization_id,
        role_id=req.role_id,
        is_default=req.is_default,
        status="active",
    )
    uo = await dao.assign(uo)
    await db.commit()
    return ok(data={"id": str(uo.id)}, message="User assigned to organization")


@router.delete("/user-orgs/{user_id}/{organization_id}")
async def remove_user_from_org(
    user_id: uuid.UUID,
    organization_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = UserOrgDAO(db)
    await dao.remove(user_id, organization_id)
    await db.commit()
    return ok(message="User removed from organization")
