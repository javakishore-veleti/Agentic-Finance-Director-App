#!/bin/bash
###############################################################################
# 17_integration_piece5_monitoring_admin.sh
# Creates: Angular HTTP services for Monitoring + Admin modules
# Maps to: /api/v1/monitoring/* and /api/v1/admin/* backend endpoints
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

SRC="Portals/agentic-finance-director-app/src/app"

echo "🔧 [17] Integration Piece 5 — Monitoring + Admin services..."

# =============================================================================
# 1. Monitoring service (8 endpoints)
# =============================================================================
mkdir -p "$SRC/modules/monitoring/services"

cat > "$SRC/modules/monitoring/services/monitoring.service.ts" << 'EOF'
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// ── DTOs ──
export interface SystemHealth {
  status: string;
  uptime_seconds: number;
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  active_connections: number;
  error_rate_1h: number;
  last_checked: string;
}

export interface ServiceStatus {
  id: string;
  service_name: string;
  service_type: string;
  status: string;
  endpoint_url: string;
  response_time_ms: number | null;
  uptime_pct: number;
  last_check: string;
  last_error: string | null;
  version: string | null;
  metadata: Record<string, any>;
}

export interface ApiMetric {
  endpoint: string;
  method: string;
  request_count: number;
  avg_response_ms: number;
  p95_response_ms: number;
  p99_response_ms: number;
  error_count: number;
  error_rate: number;
  tokens_used: number;
  period: string;
}

export interface ApiMetricsSummary {
  total_requests: number;
  avg_response_ms: number;
  error_rate: number;
  total_tokens: number;
  top_endpoints: ApiMetric[];
  period: string;
}

@Injectable({ providedIn: 'root' })
export class MonitoringService {
  private readonly prefix = '/monitoring';

  constructor(private api: ApiService) {}

  // ── System Health ──
  getSystemHealth(): Observable<SystemHealth> {
    return this.api.get<SystemHealth>(`${this.prefix}/health`);
  }

  getHealthHistory(hours = 24): Observable<any[]> {
    return this.api.get<any[]>(`${this.prefix}/health/history`, { hours });
  }

  // ── Service Status ──
  getServiceStatuses(): Observable<ServiceStatus[]> {
    return this.api.get<ServiceStatus[]>(`${this.prefix}/services`);
  }

  getServiceStatus(id: string): Observable<ServiceStatus> {
    return this.api.get<ServiceStatus>(`${this.prefix}/services/${id}`);
  }

  checkServiceHealth(id: string): Observable<ServiceStatus> {
    return this.api.post<ServiceStatus>(`${this.prefix}/services/${id}/check`, {});
  }

  // ── API Metrics ──
  getApiMetrics(period = '1h'): Observable<ApiMetricsSummary> {
    return this.api.get<ApiMetricsSummary>(`${this.prefix}/api-metrics`, { period });
  }

  getEndpointMetrics(endpoint: string, period = '24h'): Observable<ApiMetric[]> {
    return this.api.get<ApiMetric[]>(`${this.prefix}/api-metrics/endpoint`, { endpoint, period });
  }

  getTokenUsage(period = '7d'): Observable<any> {
    return this.api.get<any>(`${this.prefix}/api-metrics/tokens`, { period });
  }
}
EOF

echo "  ✅ monitoring.service.ts — system health, service status, API metrics, tokens"

# =============================================================================
# 2. Admin service (18 endpoints)
# =============================================================================
mkdir -p "$SRC/modules/admin/services"

cat > "$SRC/modules/admin/services/admin.service.ts" << 'EOF'
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
EOF

echo "  ✅ admin.service.ts — users, roles, API keys, data connections, audit log, settings"

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "✅ [17] Integration Piece 5 complete!"
echo ""
echo "  Monitoring service (8 endpoints):"
echo "    → getSystemHealth(), getHealthHistory()"
echo "    → getServiceStatuses(), checkServiceHealth()"
echo "    → getApiMetrics(), getEndpointMetrics(), getTokenUsage()"
echo ""
echo "  Admin service (18 endpoints):"
echo "    → getUsers(), createUser(), updateUser()"
echo "    → getRoles(), getRole()"
echo "    → getApiKeys(), createApiKey(), revokeApiKey(), rotateApiKey()"
echo "    → getDataConnections(), testDataConnection(), syncDataConnection()"
echo "    → getAuditLog(), getAuditLogEntry()"
echo "    → getSettings(), updateSetting()"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🎉 INTEGRATION COMPLETE — All 8 modules wired!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  Scripts 13-17 created:"
echo "    13 → Proxy config + core services (api, agent, notifications, interceptor)"
echo "    14 → Command Center service (13 endpoints)"
echo "    14 → FP&A service (17 endpoints)"
echo "    15 → Treasury service (13 endpoints)"
echo "    15 → Accounting service (18 endpoints)"
echo "    16 → Agent Studio service (chat + WS + SSE + prompts)"
echo "    16 → Risk Intelligence service (15 endpoints)"
echo "    17 → Monitoring service (8 endpoints)"
echo "    17 → Admin service (18 endpoints)"
echo ""
echo "  Total: 117+ endpoint mappings across 8 Angular services"
echo ""
echo "  Architecture:"
echo "    Component → ModuleService → ApiService → proxy → FastAPI backend"
echo "    Component → AgentStudioService → AgentService → proxy → Agent Gateway"
echo ""
echo "  Next steps:"
echo "    1. Wire services into page components (inject + subscribe)"
echo "    2. Replace mock data with live API calls"
echo "    3. Run: npm run dev:all (proxy routes automatically)"
