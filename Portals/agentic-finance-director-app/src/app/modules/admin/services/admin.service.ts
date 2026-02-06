import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// ── DTOs ──
export interface User {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  role_name: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
  is_system: boolean;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  status: string;
  expires_at: string | null;
  last_used_at: string | null;
  usage_count: number;
  rate_limit_rpm: number;
  created_by: string;
  created_at: string;
}

export interface DataConnection {
  id: string;
  name: string;
  connection_type: string;
  status: string;
  endpoint_url: string;
  last_sync_at: string | null;
  sync_frequency: string;
  records_synced: number;
  health_status: string;
  config: Record<string, any>;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

export interface PlatformSettings {
  id: string;
  category: string;
  key: string;
  value: any;
  description: string;
  updated_by: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly prefix = '/admin';

  constructor(private api: ApiService) {}

  // ── Users ──
  getUsers(status?: string, role?: string): Observable<User[]> {
    const params: any = {};
    if (status) params.status = status;
    if (role) params.role = role;
    return this.api.get<User[]>(`${this.prefix}/users`, params);
  }

  getUser(id: string): Observable<User> {
    return this.api.get<User>(`${this.prefix}/users/${id}`);
  }

  createUser(data: Partial<User> & { password: string }): Observable<User> {
    return this.api.post<User>(`${this.prefix}/users`, data);
  }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.api.put<User>(`${this.prefix}/users/${id}`, data);
  }

  // ── Roles ──
  getRoles(): Observable<Role[]> {
    return this.api.get<Role[]>(`${this.prefix}/roles`);
  }

  getRole(id: string): Observable<Role> {
    return this.api.get<Role>(`${this.prefix}/roles/${id}`);
  }

  // ── API Keys ──
  getApiKeys(): Observable<ApiKey[]> {
    return this.api.get<ApiKey[]>(`${this.prefix}/api-keys`);
  }

  createApiKey(data: { name: string; scopes: string[]; expires_in_days?: number }): Observable<ApiKey & { full_key: string }> {
    return this.api.post<ApiKey & { full_key: string }>(`${this.prefix}/api-keys`, data);
  }

  revokeApiKey(id: string): Observable<void> {
    return this.api.delete<void>(`${this.prefix}/api-keys/${id}`);
  }

  rotateApiKey(id: string): Observable<ApiKey & { full_key: string }> {
    return this.api.post<ApiKey & { full_key: string }>(`${this.prefix}/api-keys/${id}/rotate`, {});
  }

  // ── Data Connections ──
  getDataConnections(): Observable<DataConnection[]> {
    return this.api.get<DataConnection[]>(`${this.prefix}/data-connections`);
  }

  getDataConnection(id: string): Observable<DataConnection> {
    return this.api.get<DataConnection>(`${this.prefix}/data-connections/${id}`);
  }

  testDataConnection(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>(`${this.prefix}/data-connections/${id}/test`, {});
  }

  syncDataConnection(id: string): Observable<any> {
    return this.api.post<any>(`${this.prefix}/data-connections/${id}/sync`, {});
  }

  // ── Audit Log ──
  getAuditLog(action?: string, user_id?: string, limit = 100, offset = 0): Observable<AuditLogEntry[]> {
    const params: any = { limit, offset };
    if (action) params.action = action;
    if (user_id) params.user_id = user_id;
    return this.api.get<AuditLogEntry[]>(`${this.prefix}/audit-log`, params);
  }

  getAuditLogEntry(id: string): Observable<AuditLogEntry> {
    return this.api.get<AuditLogEntry>(`${this.prefix}/audit-log/${id}`);
  }

  // ── Platform Settings ──
  getSettings(category?: string): Observable<PlatformSettings[]> {
    const params: any = {};
    if (category) params.category = category;
    return this.api.get<PlatformSettings[]>(`${this.prefix}/settings`, params);
  }

  updateSetting(id: string, value: any): Observable<PlatformSettings> {
    return this.api.put<PlatformSettings>(`${this.prefix}/settings/${id}`, { value });
  }
}
