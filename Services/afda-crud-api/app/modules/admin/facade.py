from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.admin.service import (
    UserService, RoleService, ApiKeyService, DataConnectionService, AuditLogService, SettingsService,
)


class AdminFacade:
    def __init__(self, db: AsyncSession):
        self.user_svc = UserService(db)
        self.role_svc = RoleService(db)
        self.key_svc = ApiKeyService(db)
        self.conn_svc = DataConnectionService(db)
        self.audit_svc = AuditLogService(db)
        self.settings_svc = SettingsService(db)
