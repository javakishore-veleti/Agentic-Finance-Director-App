import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// ── DTOs ──
export interface KPI {
  id: string;
  name: string;
  category: string;
  current_value: number;
  previous_value: number;
  target_value: number;
  unit: string;
  trend: string;
  trend_direction: string;
  period: string;
  is_favorite: boolean;
  updated_at: string;
}

export interface ExecutiveBriefing {
  id: string;
  title: string;
  summary: string;
  key_highlights: string[];
  risk_flags: string[];
  recommendations: string[];
  generated_by: string;
  period: string;
  status: string;
  created_at: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assigned_to: string;
  due_date: string;
  source: string;
  source_agent: string;
  module: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class CommandCenterService {
  private readonly prefix = '/command-center';

  constructor(private api: ApiService) {}

  // ── KPIs ──
  getKpis(category?: string): Observable<KPI[]> {
    const params: any = {};
    if (category) params.category = category;
    return this.api.get<KPI[]>(`${this.prefix}/kpis`, params);
  }

  getKpi(id: string): Observable<KPI> {
    return this.api.get<KPI>(`${this.prefix}/kpis/${id}`);
  }

  getKpiTrend(id: string, days = 30): Observable<any[]> {
    return this.api.get<any[]>(`${this.prefix}/kpis/${id}/trend`, { days });
  }

  // ── Executive Briefings ──
  getBriefings(status?: string): Observable<ExecutiveBriefing[]> {
    const params: any = {};
    if (status) params.status = status;
    return this.api.get<ExecutiveBriefing[]>(`${this.prefix}/briefings`, params);
  }

  getBriefing(id: string): Observable<ExecutiveBriefing> {
    return this.api.get<ExecutiveBriefing>(`${this.prefix}/briefings/${id}`);
  }

  getLatestBriefing(): Observable<ExecutiveBriefing> {
    return this.api.get<ExecutiveBriefing>(`${this.prefix}/briefings/latest`);
  }

  generateBriefing(): Observable<ExecutiveBriefing> {
    return this.api.post<ExecutiveBriefing>(`${this.prefix}/briefings/generate`, {});
  }

  // ── Action Items ──
  getActionItems(status?: string, priority?: string): Observable<ActionItem[]> {
    const params: any = {};
    if (status) params.status = status;
    if (priority) params.priority = priority;
    return this.api.get<ActionItem[]>(`${this.prefix}/action-items`, params);
  }

  getActionItem(id: string): Observable<ActionItem> {
    return this.api.get<ActionItem>(`${this.prefix}/action-items/${id}`);
  }

  createActionItem(data: Partial<ActionItem>): Observable<ActionItem> {
    return this.api.post<ActionItem>(`${this.prefix}/action-items`, data);
  }

  updateActionItem(id: string, data: Partial<ActionItem>): Observable<ActionItem> {
    return this.api.put<ActionItem>(`${this.prefix}/action-items/${id}`, data);
  }

  // ── Dashboard Summary ──
  getDashboardSummary(): Observable<any> {
    return this.api.get<any>(`${this.prefix}/dashboard`);
  }

  getOverviewStats(): Observable<any> {
    return this.api.get<any>(`${this.prefix}/overview`);
  }
}
