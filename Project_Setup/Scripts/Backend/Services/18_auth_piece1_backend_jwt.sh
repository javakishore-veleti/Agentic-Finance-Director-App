#!/bin/bash
###############################################################################
# 18_auth_piece1_backend_jwt.sh
# Creates: JWT authentication on CRUD API
# Endpoints: /api/v1/auth/login, /signup, /refresh, /me, /logout
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

BASE="Services/afda-crud-api"
APP="$BASE/app"

echo "🔧 [18] Auth Piece 1 — Backend JWT authentication..."

# =============================================================================
# 1. Auth module directory
# =============================================================================
mkdir -p "$APP/modules/auth"
touch "$APP/modules/auth/__init__.py"

# =============================================================================
# 2. Auth config additions — add JWT settings to config.py
# =============================================================================
# We append JWT settings if not already present
if ! grep -q "JWT_SECRET" "$APP/config.py"; then
  # Find the line with "class Settings" and add JWT fields after Mongo fields
  python3 << 'PYEOF'
import re

with open("Services/afda-crud-api/app/config.py", "r") as f:
    content = f.read()

# Add JWT settings before the @property line for MONGO_URL or DATABASE_URL
jwt_block = '''
    # JWT Authentication
    JWT_SECRET: str = "afda-super-secret-change-in-production-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
'''

# Insert before the first @property
if "JWT_SECRET" not in content:
    content = content.replace("    @property", jwt_block + "\n    @property", 1)

with open("Services/afda-crud-api/app/config.py", "w") as f:
    f.write(content)

print("  ✅ JWT settings added to config.py")
PYEOF
else
  echo "  ⏭️  JWT settings already in config.py"
fi

# =============================================================================
# 3. Auth utilities — JWT token creation/validation
# =============================================================================
cat > "$APP/modules/auth/jwt_utils.py" << 'EOF'
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from app.config import get_settings

settings = get_settings()


def create_access_token(user_id: str, email: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def verify_access_token(token: str) -> Optional[dict]:
    payload = decode_token(token)
    if payload and payload.get("type") == "access":
        return payload
    return None


def verify_refresh_token(token: str) -> Optional[dict]:
    payload = decode_token(token)
    if payload and payload.get("type") == "refresh":
        return payload
    return None
EOF

echo "  ✅ jwt_utils.py — create/verify access + refresh tokens"

# =============================================================================
# 4. Auth dependencies — get current user from request
# =============================================================================
cat > "$APP/modules/auth/dependencies.py" << 'EOF'
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.modules.auth.jwt_utils import verify_access_token
from app.modules.admin.models import User

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = verify_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    result = await db.execute(select(User).where(User.email == payload["email"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if user.status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Same as get_current_user but returns None instead of raising."""
    if not credentials:
        return None
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


def require_role(*roles: str):
    """Dependency factory: require user to have one of the specified roles."""
    async def checker(user: User = Depends(get_current_user)) -> User:
        if user.role_name not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Requires role: {', '.join(roles)}")
        return user
    return checker
EOF

echo "  ✅ dependencies.py — get_current_user, get_optional_user, require_role"

# =============================================================================
# 5. Auth DTOs
# =============================================================================
cat > "$APP/modules/auth/dtos.py" << 'EOF'
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=200)
    department: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class RefreshRequest(BaseModel):
    refresh_token: str


class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    department: str | None
    status: str
    last_login_at: str | None
    created_at: str

    model_config = {"from_attributes": True}
EOF

echo "  ✅ dtos.py — LoginRequest, SignupRequest, TokenResponse, UserProfile"

# =============================================================================
# 6. Auth service
# =============================================================================
cat > "$APP/modules/auth/service.py" << 'EOF'
import bcrypt
from datetime import datetime, timezone
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.admin.models import User
from app.modules.auth.jwt_utils import create_access_token, create_refresh_token
from app.modules.auth.dtos import LoginRequest, SignupRequest, TokenResponse
from app.config import get_settings
from app.shared.exceptions import NotFoundException

settings = get_settings()


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

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
            update(User).where(User.id == user.id).values(last_login_at=datetime.now(timezone.utc))
        )
        await self.db.commit()

        access_token = create_access_token(str(user.id), user.email, user.role_name)
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
            role_name="analyst",  # default role
            department=data.department,
            status="active",
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        access_token = create_access_token(str(user.id), user.email, user.role_name)
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

        access_token = create_access_token(str(user.id), user.email, user.role_name)
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
EOF

echo "  ✅ service.py — login, signup, refresh, password hashing with bcrypt"

# =============================================================================
# 7. Auth router
# =============================================================================
cat > "$APP/modules/auth/router.py" << 'EOF'
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
async def get_me(user: User = Depends(get_current_user)):
    profile = UserProfile(
        id=str(user.id),
        email=user.email,
        full_name=user.display_name,
        role=user.role_name,
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
EOF

echo "  ✅ router.py — /login, /signup, /refresh, /me, /logout"

# =============================================================================
# 8. Register auth router in main.py
# =============================================================================
python3 << 'PYEOF'
with open("Services/afda-crud-api/main.py", "r") as f:
    content = f.read()

if "auth" not in content:
    # Add import
    content = content.replace(
        "from app.modules.command_center.router import router as command_center_router",
        "from app.modules.auth.router import router as auth_router\nfrom app.modules.command_center.router import router as command_center_router"
    )
    # Add router include (before command_center, no prefix needed for /api/v1/auth)
    content = content.replace(
        'app.include_router(command_center_router',
        'app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])\napp.include_router(command_center_router'
    )
    with open("Services/afda-crud-api/main.py", "w") as f:
        f.write(content)
    print("  ✅ Auth router registered in main.py")
else:
    print("  ⏭️  Auth router already in main.py")
PYEOF

# =============================================================================
# 9. Install python-jose if not present
# =============================================================================
echo ""
echo "  📦 Checking python-jose dependency..."
VENV="$HOME/runtime_data/python_venvs/Agentic-Finance-Director-App_venv"
if ! "$VENV/bin/python" -c "import jose" 2>/dev/null; then
  echo "  Installing python-jose[cryptography]..."
  "$VENV/bin/pip" install "python-jose[cryptography]" --quiet
  echo "  ✅ python-jose installed"
else
  echo "  ✅ python-jose already installed"
fi

# Also ensure pydantic[email] for EmailStr
if ! "$VENV/bin/python" -c "from pydantic import EmailStr" 2>/dev/null; then
  echo "  Installing pydantic[email]..."
  "$VENV/bin/pip" install "pydantic[email]" --quiet
  echo "  ✅ pydantic[email] installed"
else
  echo "  ✅ pydantic[email] already installed"
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "✅ [18] Auth Piece 1 complete!"
echo ""
echo "  Backend auth endpoints:"
echo "    POST /api/v1/auth/login    — email + password → access + refresh tokens"
echo "    POST /api/v1/auth/signup   — email + password + name → auto-login"
echo "    POST /api/v1/auth/refresh  — refresh_token → new token pair"
echo "    GET  /api/v1/auth/me       — Bearer token → user profile"
echo "    POST /api/v1/auth/logout   — client-side token removal"
echo ""
echo "  Auth dependencies (for protecting other routes):"
echo "    get_current_user     — requires valid Bearer token"
echo "    get_optional_user    — returns None if no token"
echo "    require_role('admin') — requires specific role"
echo ""
echo "  Test:"
echo "    curl -X POST http://localhost:8000/api/v1/auth/login \\"
echo "      -H 'Content-Type: application/json' \\"
echo "      -d '{\"email\":\"admin@afda.io\",\"password\":\"admin123\"}'"
echo ""
echo "  Next: Run 19_auth_piece2_angular_service.sh"
