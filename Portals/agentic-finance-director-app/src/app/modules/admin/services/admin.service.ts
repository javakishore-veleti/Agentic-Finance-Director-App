import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// ── DTOs (matching backend exactly) ──
export interface UserOut {
  id: string;
  email: string;
  display_name: string;
  status: string;
  department: string | null;
  last_login_at: string | null;
  created_at: string;
}

export interface RoleOut {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, any>;
  is_system: boolean;
  created_at: string;
}

export interface ApiKeyOut {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ApiKeyCreatedOut {
  id: string;
  name: string;
  key: string;          // only shown once
  key_prefix: string;
  scopes: string[];
  expires_at: string | null;
  created_at: string;
}

export interface DataConnectionOut {
  id: string;
  name: string;
  connection_type: string;
  provider: string | null;
  status: string;
  last_sync_at: string | null;
  last_error: string | null;
  sync_frequency: string;
  created_at: string;
}

export interface ConnectionTestResult {
  connection_id: string;
  success: boolean;
  latency_ms: number | null;
  message: string;
}

export interface SettingOut {
  key: string;
  value: string;
  category: string;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface AuditLogOut {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly prefix = '/admin';

  constructor(private api: ApiService) {}

  // ── Users ──
  getUsers(status?: string): Observable<UserOut[]> {
    const params: any = {};
    if (status) params.status = status;
    return this.api.get<UserOut[]>(`${this.prefix}/users`, params);
  }

  createUser(data: { email: string; display_name: string; password: string; department?: string; role_ids?: string[] }): Observable<UserOut> {
    return this.api.post<UserOut>(`${this.prefix}/users`, data);
  }

  updateUser(id: string, data: Partial<{ display_name: string; department: string; status: string }>): Observable<UserOut> {
    return this.api.put<UserOut>(`${this.prefix}/users/${id}`, data);
  }

  deactivateUser(id: string): Observable<any> {
    return this.api.delete<any>(`${this.prefix}/users/${id}`);
  }

  // ── Roles ──
  getRoles(): Observable<RoleOut[]> {
    return this.api.get<RoleOut[]>(`${this.prefix}/roles`);
  }

  createRole(data: { name: string; description?: string; permissions?: Record<string, string[]> }): Observable<RoleOut> {
    return this.api.post<RoleOut>(`${this.prefix}/roles`, data);
  }

  updateRole(id: string, data: Partial<{ description: string; permissions: Record<string, string[]> }>): Observable<RoleOut> {
    return this.api.put<RoleOut>(`${this.prefix}/roles/${id}`, data);
  }

  // ── API Keys ──
  getApiKeys(): Observable<ApiKeyOut[]> {
    return this.api.get<ApiKeyOut[]>(`${this.prefix}/api-keys`);
  }

  createApiKey(data: { name: string; scopes: string[]; expires_in_days?: number }): Observable<ApiKeyCreatedOut> {
    return this.api.post<ApiKeyCreatedOut>(`${this.prefix}/api-keys`, data);
  }

  revokeApiKey(id: string): Observable<any> {
    return this.api.delete<any>(`${this.prefix}/api-keys/${id}`);
  }

  // ── Data Connections ──
  getDataConnections(): Observable<DataConnectionOut[]> {
    return this.api.get<DataConnectionOut[]>(`${this.prefix}/data-connections`);
  }

  createDataConnection(data: { name: string; connection_type: string; provider?: string; config_json: Record<string, any>; sync_frequency?: string }): Observable<DataConnectionOut> {
    return this.api.post<DataConnectionOut>(`${this.prefix}/data-connections`, data);
  }

  updateDataConnection(id: string, data: Partial<{ name: string; config_json: Record<string, any>; sync_frequency: string }>): Observable<DataConnectionOut> {
    return this.api.put<DataConnectionOut>(`${this.prefix}/data-connections/${id}`, data);
  }

  testDataConnection(id: string): Observable<ConnectionTestResult> {
    return this.api.post<ConnectionTestResult>(`${this.prefix}/data-connections/${id}/test`, {});
  }

  // ── Audit Log ──
  getAuditLog(params?: { action?: string; resource_type?: string; limit?: number; offset?: number }): Observable<AuditLogOut[]> {
    return this.api.get<AuditLogOut[]>(`${this.prefix}/audit-log`, params);
  }

  // ── Platform Settings ──
  getSettings(): Observable<SettingOut[]> {
    return this.api.get<SettingOut[]>(`${this.prefix}/settings`);
  }

  updateSettings(settings: Record<string, string>): Observable<SettingOut[]> {
    return this.api.put<SettingOut[]>(`${this.prefix}/settings`, { settings });
  }
}
