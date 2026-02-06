from fastapi import HTTPException, status
from typing import Any

class NotFoundException(HTTPException):
    def __init__(self, entity: str = "Resource", id: Any = None):
        detail = f"{entity} not found" + (f": {id}" if id else "")
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class BadRequestException(HTTPException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class ForbiddenException(HTTPException):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

from typing import Any
