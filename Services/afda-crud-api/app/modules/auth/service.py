import bcrypt
from datetime import datetime
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.admin.models import User, Role, UserRole
from app.modules.auth.jwt_utils import create_access_token, create_refresh_token
from app.modules.auth.dtos import LoginRequest, SignupRequest, TokenResponse
from app.config import get_settings
from app.shared.exceptions import NotFoundException

settings = get_settings()


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_user_role(self, user_id) -> str:
        """Query role name directly via SQL — avoids async lazy-load issues."""
        result = await self.db.execute(
            select(Role.name)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(UserRole.user_id == user_id)
            .limit(1)
        )
        return result.scalar() or "analyst"

    async def login(self, data: LoginRequest) -> TokenResponse:
        result = await self.db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()

        if not user:
            raise NotFoundException("User", data.email)

        if not self._verify_password(data.password, user.password_hash):
            raise ValueError("Invalid credentials")

        if user.status != "active":
            raise ValueError("Account is disabled")

        # Update last login
        await self.db.execute(
            update(User).where(User.id == user.id).values(last_login_at=datetime.utcnow())
        )
        await self.db.commit()

        role_name = await self._get_user_role(user.id)
        access_token = create_access_token(str(user.id), user.email, role_name)
        refresh_token = create_refresh_token(str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def signup(self, data: SignupRequest) -> TokenResponse:
        # Check if email exists
        result = await self.db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none():
            raise ValueError("Email already registered")

        # Create user
        password_hash = self._hash_password(data.password)
        user = User(
            email=data.email,
            display_name=data.full_name,
            password_hash=password_hash,
            department=data.department,
            status="active",
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        # New signups get "analyst" role — no role row yet
        access_token = create_access_token(str(user.id), user.email, "analyst")
        refresh_token = create_refresh_token(str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def refresh(self, user_id: str) -> TokenResponse:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundException("User", user_id)

        role_name = await self._get_user_role(user.id)
        access_token = create_access_token(str(user.id), user.email, role_name)
        refresh_token = create_refresh_token(str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    @staticmethod
    def _hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    @staticmethod
    def _verify_password(password: str, hashed: str) -> bool:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))