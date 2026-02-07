#!/bin/bash
###############################################################################
# 27_hotfix_admin_tenant_isolation.sh
# Fixes: Admin pages showing ALL users across tenants
# Root cause: AdminService calls /api/v1/admin/users (CRUD API, no filtering)
# Fix: Rewire to /api/v1/platform/identity/users (Platform Service, filtered)
#
# Endpoint mapping:
#   OLD (CRUD API :8000)              NEW (Platform Service :8002)
#   /admin/users                  →   /platform/identity/users
#   /admin/roles                  →   /platform/identity/roles
#   /admin/api-keys               →   /platform/config/api-keys
#   /admin/data-connections       →   /platform/config/data-connections
#   /admin/audit-log              →   /platform/config/audit-log
#   /admin/settings               →   /platform/config/settings
###############################################################################
set -e

ADMIN_SVC="Portals/agentic-finance-director-app/src/app/modules/admin/services/admin.service.ts"

echo "🔧 [27-hotfix] Rewiring admin service to Platform Service..."

if [ ! -f "$ADMIN_SVC" ]; then
    echo "  ❌ $ADMIN_SVC not found"
    exit 1
fi

cat > "$ADMIN_SVC" << 'TSEOF'
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// ── DTOs ──

export interface UserOut {
  id: string;
  email: string;
  display_name: string;
  department: string | null;
  status: string;
  avatar_url?: string | null;
  is_customer_admin?: boolean;
  last_login_at: string | null;
  created_at: string | null;
}

export interface RoleOut {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: Record<string, string[]>;
  permissions_json?: Record<string, string[]>;
}

export interface ApiKeyOut {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  status: string;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface ApiKeyCreatedOut extends ApiKeyOut {
  full_key: string;
}

export interface DataConnectionOut {
  id: string;
  name: string;
  connection_type: string;
  provider: string | null;
  status: string;
  sync_frequency: string;
  last_sync_at: string | null;
  config_json: Record<string, any>;
  created_at: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency_ms?: number;
}

export interface AuditLogOut {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  actor_email: string;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

export interface SettingOut {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string | null;
}

/**
 * AdminService — now routes to Platform Service (:8002)
 * which filters all data by customer_id from the JWT token.
 *
 * Old: /api/v1/admin/*         → CRUD API (no tenant isolation)
 * New: /api/v1/platform/*/*    → Platform Service (tenant-isolated)
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  // Route prefixes → Platform Service
  private readonly identity = '/platform/identity';
  private readonly config = '/platform/config';

  constructor(private api: ApiService) {}

  // ── Users → /platform/identity/users ──
  getUsers(status?: string): Observable<UserOut[]> {
    const params: any = {};
    if (status) params.status = status;
    return this.api.get<UserOut[]>(`${this.identity}/users`, params);
  }

  createUser(data: {
    email: string;
    display_name: string;
    password: string;
    department?: string;
    role_ids?: string[];
  }): Observable<UserOut> {
    return this.api.post<UserOut>(`${this.identity}/users`, data);
  }

  updateUser(
    id: string,
    data: Partial<{ display_name: string; department: string; status: string }>
  ): Observable<UserOut> {
    return this.api.put<UserOut>(`${this.identity}/users/${id}`, data);
  }

  deactivateUser(id: string): Observable<any> {
    return this.api.delete<any>(`${this.identity}/users/${id}`);
  }

  // ── Roles → /platform/identity/roles ──
  getRoles(): Observable<RoleOut[]> {
    return this.api.get<RoleOut[]>(`${this.identity}/roles`);
  }

  createRole(data: {
    name: string;
    description?: string;
    permissions?: Record<string, string[]>;
  }): Observable<RoleOut> {
    return this.api.post<RoleOut>(`${this.identity}/roles`, data);
  }

  updateRole(
    id: string,
    data: Partial<{ description: string; permissions: Record<string, string[]> }>
  ): Observable<RoleOut> {
    return this.api.put<RoleOut>(`${this.identity}/roles/${id}`, data);
  }

  // ── API Keys → /platform/config/api-keys ──
  getApiKeys(): Observable<ApiKeyOut[]> {
    return this.api.get<ApiKeyOut[]>(`${this.config}/api-keys`);
  }

  createApiKey(data: {
    name: string;
    scopes: string[];
    expires_in_days?: number;
  }): Observable<ApiKeyCreatedOut> {
    return this.api.post<ApiKeyCreatedOut>(`${this.config}/api-keys`, data);
  }

  revokeApiKey(id: string): Observable<any> {
    return this.api.delete<any>(`${this.config}/api-keys/${id}`);
  }

  // ── Data Connections → /platform/config/data-connections ──
  getDataConnections(): Observable<DataConnectionOut[]> {
    return this.api.get<DataConnectionOut[]>(
      `${this.config}/data-connections`
    );
  }

  createDataConnection(data: {
    name: string;
    connection_type: string;
    provider?: string;
    config_json: Record<string, any>;
    sync_frequency?: string;
  }): Observable<DataConnectionOut> {
    return this.api.post<DataConnectionOut>(
      `${this.config}/data-connections`,
      data
    );
  }

  updateDataConnection(
    id: string,
    data: Partial<{
      name: string;
      config_json: Record<string, any>;
      sync_frequency: string;
    }>
  ): Observable<DataConnectionOut> {
    return this.api.put<DataConnectionOut>(
      `${this.config}/data-connections/${id}`,
      data
    );
  }

  testDataConnection(id: string): Observable<ConnectionTestResult> {
    return this.api.post<ConnectionTestResult>(
      `${this.config}/data-connections/${id}/test`,
      {}
    );
  }

  // ── Audit Log → /platform/config/audit-log ──
  getAuditLog(params?: {
    action?: string;
    resource_type?: string;
    limit?: number;
    offset?: number;
  }): Observable<AuditLogOut[]> {
    return this.api.get<AuditLogOut[]>(`${this.config}/audit-log`, params);
  }

  // ── Platform Settings → /platform/config/settings ──
  getSettings(): Observable<SettingOut[]> {
    return this.api.get<SettingOut[]>(`${this.config}/settings`);
  }

  updateSettings(settings: Record<string, string>): Observable<SettingOut[]> {
    return this.api.put<SettingOut[]>(`${this.config}/settings`, { settings });
  }
}
TSEOF

echo "  ✅ admin.service.ts rewired to Platform Service"
echo ""
echo "  Route changes:"
echo "    Users:            /admin/users            → /platform/identity/users"
echo "    Roles:            /admin/roles            → /platform/identity/roles"
echo "    API Keys:         /admin/api-keys         → /platform/config/api-keys"
echo "    Data Connections: /admin/data-connections  → /platform/config/data-connections"
echo "    Audit Log:        /admin/audit-log        → /platform/config/audit-log"
echo "    Settings:         /admin/settings         → /platform/config/settings"
echo ""
echo "  Angular will auto-rebuild. Refresh the admin page to see only YOUR tenant's users."
