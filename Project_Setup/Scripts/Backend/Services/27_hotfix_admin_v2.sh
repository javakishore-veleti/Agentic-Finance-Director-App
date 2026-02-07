#!/bin/bash
###############################################################################
# 27_hotfix_admin_v2.sh — Clean rewrite, no special chars, all DTO fields
###############################################################################
set -e

ADMIN_SVC="Portals/agentic-finance-director-app/src/app/modules/admin/services/admin.service.ts"

echo "Fixing admin.service.ts..."

cat > "$ADMIN_SVC" << 'TSEOF'
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// -- DTOs --

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
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface ApiKeyCreatedOut extends ApiKeyOut {
  full_key: string;
  key: string;
}

export interface DataConnectionOut {
  id: string;
  name: string;
  connection_type: string;
  provider: string | null;
  status: string;
  sync_frequency: string;
  last_sync_at: string | null;
  last_error: string | null;
  config_json: Record<string, any>;
  created_at: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency_ms: number | null;
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
 * AdminService - routes to Platform Service for tenant isolation.
 *
 * Users and Roles go to /platform/identity/*
 * Config endpoints go to /platform/config/*
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly identity = '/platform/identity';
  private readonly config = '/platform/config';

  constructor(private api: ApiService) {}

  // -- Users --
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

  // -- Roles --
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

  // -- API Keys --
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

  // -- Data Connections --
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

  // -- Audit Log --
  getAuditLog(params?: {
    action?: string;
    resource_type?: string;
    limit?: number;
    offset?: number;
  }): Observable<AuditLogOut[]> {
    return this.api.get<AuditLogOut[]>(`${this.config}/audit-log`, params);
  }

  // -- Platform Settings --
  getSettings(): Observable<SettingOut[]> {
    return this.api.get<SettingOut[]>(`${this.config}/settings`);
  }

  updateSettings(settings: Record<string, string>): Observable<SettingOut[]> {
    return this.api.put<SettingOut[]>(`${this.config}/settings`, { settings });
  }
}
TSEOF

echo "Done. Fixed:"
echo "  - Removed arrow chars that broke TypeScript parser"
echo "  - Added ApiKeyOut.is_active field"
echo "  - Added ApiKeyCreatedOut.key field"
echo "  - Added DataConnectionOut.last_error field"
echo "  - Changed ConnectionTestResult.latency_ms to number|null"
