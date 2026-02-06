from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.database import get_redis


class RateLimiterMiddleware(BaseHTTPMiddleware):
    MAX_REQUESTS = 100  # per minute
    WINDOW = 60

    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/docs") or request.url.path.startswith("/health"):
            return await call_next(request)

        redis = get_redis()
        if not redis:
            return await call_next(request)

        client_ip = request.client.host
        key = f"rate:{client_ip}"
        try:
            count = await redis.incr(key)
            if count == 1:
                await redis.expire(key, self.WINDOW)
            if count > self.MAX_REQUESTS:
                return JSONResponse(
                    status_code=429,
                    content={"success": False, "message": "Rate limit exceeded. Try again later."},
                )
        except Exception:
            pass
        return await call_next(request)
