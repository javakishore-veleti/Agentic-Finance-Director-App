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
