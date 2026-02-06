# ⚠️ ADMIN MODULE DEPRECATED

**This module has been superseded by the Platform Service (port :8002).**

The following functionality has moved:
- Users → /api/v1/platform/identity/users
- Roles → /api/v1/platform/identity/roles
- API Keys → /api/v1/platform/config/api-keys
- Data Connections → /api/v1/platform/config/data-connections
- Settings → /api/v1/platform/config/settings
- Audit Log → /api/v1/platform/config/audit-log

Auth endpoints:
- Login → /api/v1/platform/identity/auth/login
- Signup → /api/v1/platform/identity/auth/signup
- Refresh → /api/v1/platform/identity/auth/refresh
- Me → /api/v1/platform/identity/auth/me

The old admin endpoints at /api/v1/admin/* remain functional as a
compatibility shim until the Angular frontend is rewired in Script 26.
