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
