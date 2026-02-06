#!/bin/bash
###############################################################################
# 14_integration_piece2_command_fpa.sh
# Creates: Angular HTTP services for Command Center + FP&A modules
# Maps to: /api/v1/command-center/* and /api/v1/fpa/* backend endpoints
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

SRC="Portals/agentic-finance-director-app/src/app"

echo "🔧 [14] Integration Piece 2 — Command Center + FP&A services..."

# =============================================================================
# 1. Command Center service (13 endpoints)
# =============================================================================
mkdir -p "$SRC/modules/command-center/services"

cat > "$SRC/modules/command-center/services/command-center.service.ts" << 'EOF'
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
EOF

echo "  ✅ command-center.service.ts — KPIs, briefings, action items, dashboard"

# =============================================================================
# 2. FP&A service (17 endpoints)
# =============================================================================
mkdir -p "$SRC/modules/fpa/services"

cat > "$SRC/modules/fpa/services/fpa.service.ts" << 'EOF'
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// ── DTOs ──
export interface Budget {
  id: string;
  name: string;
  fiscal_year: number;
  status: string;
  total_amount: number;
  currency: string;
  created_by: string;
  approved_by: string | null;
  created_at: string;
}

export interface BudgetLineItem {
  id: string;
  budget_id: string;
  department: string;
  category: string;
  gl_account: string;
  budget_amount: number;
  actual_amount: number;
  variance_amount: number;
  variance_pct: number;
  period: string;
}

export interface VarianceRecord {
  id: string;
  department: string;
  category: string;
  budget_amount: number;
  actual_amount: number;
  variance_amount: number;
  variance_pct: number;
  explanation: string | null;
  ai_commentary: string | null;
  period: string;
  fiscal_year: number;
  severity: string;
}

export interface ForecastScenario {
  id: string;
  name: string;
  scenario_type: string;
  description: string;
  assumptions: Record<string, any>;
  projected_revenue: number;
  projected_expenses: number;
  projected_net_income: number;
  confidence_score: number;
  generated_by: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class FpaService {
  private readonly prefix = '/fpa';

  constructor(private api: ApiService) {}

  // ── Budgets ──
  getBudgets(fiscal_year?: number, status?: string): Observable<Budget[]> {
    const params: any = {};
    if (fiscal_year) params.fiscal_year = fiscal_year;
    if (status) params.status = status;
    return this.api.get<Budget[]>(`${this.prefix}/budgets`, params);
  }

  getBudget(id: string): Observable<Budget> {
    return this.api.get<Budget>(`${this.prefix}/budgets/${id}`);
  }

  createBudget(data: Partial<Budget>): Observable<Budget> {
    return this.api.post<Budget>(`${this.prefix}/budgets`, data);
  }

  getBudgetLineItems(budgetId: string, department?: string): Observable<BudgetLineItem[]> {
    const params: any = {};
    if (department) params.department = department;
    return this.api.get<BudgetLineItem[]>(`${this.prefix}/budgets/${budgetId}/line-items`, params);
  }

  // ── Budget vs Actual ──
  getBudgetVsActual(budgetId: string, period?: string): Observable<any> {
    const params: any = {};
    if (period) params.period = period;
    return this.api.get<any>(`${this.prefix}/budgets/${budgetId}/vs-actual`, params);
  }

  // ── Variance Analysis ──
  getVariances(fiscal_year?: number, department?: string, severity?: string): Observable<VarianceRecord[]> {
    const params: any = {};
    if (fiscal_year) params.fiscal_year = fiscal_year;
    if (department) params.department = department;
    if (severity) params.severity = severity;
    return this.api.get<VarianceRecord[]>(`${this.prefix}/variances`, params);
  }

  getVariance(id: string): Observable<VarianceRecord> {
    return this.api.get<VarianceRecord>(`${this.prefix}/variances/${id}`);
  }

  getVarianceSummary(fiscal_year?: number): Observable<any> {
    const params: any = {};
    if (fiscal_year) params.fiscal_year = fiscal_year;
    return this.api.get<any>(`${this.prefix}/variances/summary`, params);
  }

  // ── Flux Commentary ──
  getFluxCommentary(department?: string, period?: string): Observable<any[]> {
    const params: any = {};
    if (department) params.department = department;
    if (period) params.period = period;
    return this.api.get<any[]>(`${this.prefix}/flux-commentary`, params);
  }

  generateFluxCommentary(department: string, period: string): Observable<any> {
    return this.api.post<any>(`${this.prefix}/flux-commentary/generate`, { department, period });
  }

  // ── Forecasting ──
  getForecasts(scenario_type?: string): Observable<ForecastScenario[]> {
    const params: any = {};
    if (scenario_type) params.scenario_type = scenario_type;
    return this.api.get<ForecastScenario[]>(`${this.prefix}/forecasts`, params);
  }

  getForecast(id: string): Observable<ForecastScenario> {
    return this.api.get<ForecastScenario>(`${this.prefix}/forecasts/${id}`);
  }

  generateForecast(scenario_type: string): Observable<ForecastScenario> {
    return this.api.post<ForecastScenario>(`${this.prefix}/forecasts/generate`, { scenario_type });
  }

  compareForecasts(ids: string[]): Observable<any> {
    return this.api.post<any>(`${this.prefix}/forecasts/compare`, { scenario_ids: ids });
  }

  // ── Reports ──
  getReports(): Observable<any[]> {
    return this.api.get<any[]>(`${this.prefix}/reports`);
  }

  generateReport(type: string, params?: any): Observable<any> {
    return this.api.post<any>(`${this.prefix}/reports/generate`, { type, ...params });
  }
}
EOF

echo "  ✅ fpa.service.ts — budgets, line items, variances, flux, forecasts, reports"

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "✅ [14] Integration Piece 2 complete!"
echo ""
echo "  Command Center service (13 endpoints):"
echo "    → getKpis(), getKpi(), getKpiTrend()"
echo "    → getBriefings(), getLatestBriefing(), generateBriefing()"
echo "    → getActionItems(), createActionItem(), updateActionItem()"
echo "    → getDashboardSummary(), getOverviewStats()"
echo ""
echo "  FP&A service (17 endpoints):"
echo "    → getBudgets(), getBudgetLineItems(), getBudgetVsActual()"
echo "    → getVariances(), getVarianceSummary()"
echo "    → getFluxCommentary(), generateFluxCommentary()"
echo "    → getForecasts(), generateForecast(), compareForecasts()"
echo "    → getReports(), generateReport()"
echo ""
echo "  Usage:"
echo "    constructor(private cc: CommandCenterService, private fpa: FpaService) {}"
echo "    this.cc.getKpis().subscribe(kpis => ...)"
echo "    this.fpa.getVariances(2025, 'Engineering').subscribe(vars => ...)"
echo ""
echo "  Next: Run 15_integration_piece3_treasury_accounting.sh"
