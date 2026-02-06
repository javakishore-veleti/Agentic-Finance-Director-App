from typing import Any, Optional
from pydantic import BaseModel


class ApiResponse(BaseModel):
    success: bool = True
    data: Any = None
    message: Optional[str] = None
    meta: Optional[dict] = None


def ok(data: Any = None, message: str = None, meta: dict = None) -> dict:
    return ApiResponse(success=True, data=data, message=message, meta=meta).model_dump()


def error(message: str, data: Any = None) -> dict:
    return ApiResponse(success=False, data=data, message=message).model_dump()
