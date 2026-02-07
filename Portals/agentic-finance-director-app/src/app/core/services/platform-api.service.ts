import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';

/**
 * Service for calling Platform Service APIs (:8002).
 * Used by admin screens: users, roles, orgs, settings, etc.
 * Auth + X-Organization-Id headers are added automatically by interceptor.
 */
@Injectable({ providedIn: 'root' })
export class PlatformApiService {
  private http = inject(HttpClient);
  private readonly BASE = environment.platformApiUrl;

  // ── Identity ──
  listUsers(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/identity/users`);
  }
  createUser(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.BASE}/identity/users`, data);
  }
  updateUser(id: string, data: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.BASE}/identity/users/${id}`, data);
  }
  deleteUser(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.BASE}/identity/users/${id}`);
  }

  listRoles(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/identity/roles`);
  }
  createRole(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.BASE}/identity/roles`, data);
  }

  listUserOrgs(userId: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/identity/user-orgs/${userId}`);
  }
  assignUserOrg(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.BASE}/identity/user-orgs`, data);
  }

  // ── Tenancy ──
  getCustomer(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/tenancy/customer`);
  }
  updateCustomer(data: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.BASE}/tenancy/customer`, data);
  }

  listOrganizations(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/tenancy/organizations`);
  }
  createOrganization(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.BASE}/tenancy/organizations`, data);
  }
  updateOrganization(id: string, data: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.BASE}/tenancy/organizations/${id}`, data);
  }

  listCurrencies(orgId: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/tenancy/organizations/${orgId}/currencies`);
  }

  // ── Access ──
  listPolicies(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/access/policies`);
  }
  createPolicy(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.BASE}/access/policies`, data);
  }

  // ── Config ──
  listApiKeys(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/config/api-keys`);
  }
  createApiKey(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.BASE}/config/api-keys`, data);
  }
  revokeApiKey(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.BASE}/config/api-keys/${id}`);
  }

  listSettings(orgId?: string): Observable<ApiResponse> {
    const params = orgId ? `?org_id=${orgId}` : '';
    return this.http.get<ApiResponse>(`${this.BASE}/config/settings${params}`);
  }
  upsertSetting(data: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.BASE}/config/settings`, data);
  }

  listAuditLog(limit = 100): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/config/audit-log?limit=${limit}`);
  }

  listDataConnections(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/config/data-connections`);
  }
  createDataConnection(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.BASE}/config/data-connections`, data);
  }
}
