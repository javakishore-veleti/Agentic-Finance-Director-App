import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// ── DTOs ──
export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  source: string;
  source_agent: string;
  status: string;
  assigned_to: string | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  category: string;
  condition_type: string;
  condition_config: Record<string, any>;
  severity: string;
  is_active: boolean;
  notification_channels: string[];
  cooldown_minutes: number;
  last_triggered_at: string | null;
  trigger_count: number;
  created_by: string;
  created_at: string;
}

export interface RiskScore {
  id: string;
  category: string;
  score: number;
  previous_score: number;
  trend: string;
  factors: string[];
  mitigation_status: string;
  assessed_by: string;
  assessed_at: string;
}

export interface RiskDashboardSummary {
  composite_score: number;
  composite_trend: string;
  active_alerts: number;
  critical_alerts: number;
  categories: RiskScore[];
}

@Injectable({ providedIn: 'root' })
export class RiskService {
  private readonly prefix = '/risk';

  constructor(private api: ApiService) {}

  // ── Alerts ──
  getAlerts(severity?: string, status?: string, category?: string, limit = 100, offset = 0): Observable<Alert[]> {
    const params: any = { limit, offset };
    if (severity) params.severity = severity;
    if (status) params.status = status;
    if (category) params.category = category;
    return this.api.get<Alert[]>(`${this.prefix}/alerts`, params);
  }

  getAlert(id: string): Observable<Alert> {
    return this.api.get<Alert>(`${this.prefix}/alerts/${id}`);
  }

  acknowledgeAlert(id: string): Observable<Alert> {
    return this.api.put<Alert>(`${this.prefix}/alerts/${id}/acknowledge`, {});
  }

  resolveAlert(id: string, resolution?: string): Observable<Alert> {
    return this.api.put<Alert>(`${this.prefix}/alerts/${id}/resolve`, { resolution });
  }

  getAlertHistory(days = 30): Observable<Alert[]> {
    return this.api.get<Alert[]>(`${this.prefix}/alerts/history`, { days });
  }

  getAlertStats(): Observable<any> {
    return this.api.get<any>(`${this.prefix}/alerts/stats`);
  }

  // ── Alert Rules ──
  getAlertRules(category?: string, is_active?: boolean): Observable<AlertRule[]> {
    const params: any = {};
    if (category) params.category = category;
    if (is_active !== undefined) params.is_active = is_active;
    return this.api.get<AlertRule[]>(`${this.prefix}/rules`, params);
  }

  getAlertRule(id: string): Observable<AlertRule> {
    return this.api.get<AlertRule>(`${this.prefix}/rules/${id}`);
  }

  createAlertRule(data: Partial<AlertRule>): Observable<AlertRule> {
    return this.api.post<AlertRule>(`${this.prefix}/rules`, data);
  }

  updateAlertRule(id: string, data: Partial<AlertRule>): Observable<AlertRule> {
    return this.api.put<AlertRule>(`${this.prefix}/rules/${id}`, data);
  }

  toggleAlertRule(id: string, is_active: boolean): Observable<AlertRule> {
    return this.api.patch<AlertRule>(`${this.prefix}/rules/${id}`, { is_active });
  }

  // ── Risk Dashboard ──
  getRiskDashboard(): Observable<RiskDashboardSummary> {
    return this.api.get<RiskDashboardSummary>(`${this.prefix}/dashboard`);
  }

  getRiskScores(): Observable<RiskScore[]> {
    return this.api.get<RiskScore[]>(`${this.prefix}/scores`);
  }

  getRiskTrend(category: string, days = 30): Observable<any[]> {
    return this.api.get<any[]>(`${this.prefix}/scores/${category}/trend`, { days });
  }
}
