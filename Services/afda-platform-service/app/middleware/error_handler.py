from fastapi import Request
from fastapi.responses import JSONResponse
from app.shared.responses import error
import traceback


async def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    print(f"[ERROR] {request.method} {request.url.path}: {exc}\n{tb}")
    return JSONResponse(
        status_code=500,
        content=error(message="Internal server error"),
    )
