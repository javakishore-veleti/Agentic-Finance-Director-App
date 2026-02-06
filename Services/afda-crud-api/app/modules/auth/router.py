from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.shared.responses import ApiResponse
from app.modules.auth.dtos import LoginRequest, SignupRequest, TokenResponse, RefreshRequest, UserProfile
from app.modules.auth.service import AuthService
from app.modules.auth.jwt_utils import verify_refresh_token
from app.modules.auth.dependencies import get_current_user
from app.modules.admin.models import User
from app.shared.exceptions import NotFoundException

router = APIRouter()


@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    svc = AuthService(db)
    try:
        tokens = await svc.login(data)
        return ApiResponse(data=tokens, message="Login successful")
    except NotFoundException:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/signup", response_model=ApiResponse[TokenResponse], status_code=201)
async def signup(data: SignupRequest, db: AsyncSession = Depends(get_db)):
    svc = AuthService(db)
    try:
        tokens = await svc.signup(data)
        return ApiResponse(data=tokens, message="Account created")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/refresh", response_model=ApiResponse[TokenResponse])
async def refresh_token(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = verify_refresh_token(data.refresh_token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    svc = AuthService(db)
    try:
        tokens = await svc.refresh(payload["sub"])
        return ApiResponse(data=tokens, message="Token refreshed")
    except NotFoundException:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")


@router.get("/me", response_model=ApiResponse[UserProfile])
async def get_me(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from app.modules.admin.models import Role, UserRole
    role_result = await db.execute(
        select(Role.name).join(UserRole, UserRole.role_id == Role.id).where(UserRole.user_id == user.id).limit(1)
    )
    role_name = role_result.scalar() or "analyst"
    profile = UserProfile(
        id=str(user.id),
        email=user.email,
        full_name=user.display_name,
        role=role_name,
        department=user.department,
        status=user.status,
        last_login_at=str(user.last_login_at) if user.last_login_at else None,
        created_at=str(user.created_at),
    )
    return ApiResponse(data=profile)


@router.post("/logout")
async def logout():
    # JWT is stateless — client just deletes the token
    # For blacklisting, you'd add Redis token invalidation here
    return ApiResponse(data=None, message="Logged out")
