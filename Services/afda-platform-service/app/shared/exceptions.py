from fastapi import HTTPException, status


class NotFoundError(HTTPException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource} not found")


class ConflictError(HTTPException):
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=message)


class ForbiddenError(HTTPException):
    def __init__(self, message: str = "Access denied"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=message)


class BadRequestError(HTTPException):
    def __init__(self, message: str = "Bad request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
