import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// ── DTOs ──
export interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number_masked: string;
  account_type: string;
  currency: string;
  current_balance: number;
  available_balance: number;
  status: string;
  last_synced_at: string | null;
  created_at: string;
}

export interface CashPositionSummary {
  total_cash: number;
  total_investments: number;
  total_credit_available: number;
  net_position: number;
  accounts_count: number;
  last_updated: string | null;
}

export interface CashPositionHistory {
  id: string;
  snapshot_date: string;
  total_cash: number;
  total_investments: number;
  total_credit_available: number;
  net_position: number;
  currency: string;
  created_at: string;
}

export interface CashForecast {
  id: string;
  forecast_date: string;
  projected_inflow: number;
  projected_outflow: number;
  projected_balance: number;
  scenario: string;
  confidence_score: number | null;
  generated_by: string;
  created_at: string;
}

export interface ArInvoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  amount: number;
  amount_paid: number;
  currency: string;
  issue_date: string;
  due_date: string;
  status: string;
  days_outstanding: number;
  aging_bucket: string;
  created_at: string;
}

export interface AgingBucketSummary {
  bucket: string;
  count: number;
  total_amount: number;
  percentage: number;
}

export interface ArAgingSummary {
  total_receivables: number;
  total_overdue: number;
  buckets: AgingBucketSummary[];
}

export interface LiquidityRatios {
  current_ratio: number | null;
  quick_ratio: number | null;
  cash_ratio: number | null;
  working_capital: number | null;
  days_cash_on_hand: number | null;
  burn_rate: number | null;
  runway_months: number | null;
  as_of: string;
}

@Injectable({ providedIn: 'root' })
export class TreasuryService {
  private readonly prefix = '/treasury';

  constructor(private api: ApiService) {}

  // ── Cash Position ──
  getCashPosition(): Observable<CashPositionSummary> {
    return this.api.get<CashPositionSummary>(`${this.prefix}/cash-position`);
  }

  getCashPositionHistory(days = 90): Observable<CashPositionHistory[]> {
    return this.api.get<CashPositionHistory[]>(`${this.prefix}/cash-position/history`, { days });
  }

  // ── Bank Accounts ──
  getBankAccounts(status?: string): Observable<BankAccount[]> {
    const params: any = {};
    if (status) params.status = status;
    return this.api.get<BankAccount[]>(`${this.prefix}/bank-accounts`, params);
  }

  getBankAccount(id: string): Observable<BankAccount> {
    return this.api.get<BankAccount>(`${this.prefix}/bank-accounts/${id}`);
  }

  createBankAccount(data: Partial<BankAccount>): Observable<BankAccount> {
    return this.api.post<BankAccount>(`${this.prefix}/bank-accounts`, data);
  }

  // ── Cash Forecast ──
  getCashForecast(scenario = 'base', days = 90): Observable<CashForecast[]> {
    return this.api.get<CashForecast[]>(`${this.prefix}/cash-forecast`, { scenario, days });
  }

  generateCashForecast(): Observable<CashForecast[]> {
    return this.api.post<CashForecast[]>(`${this.prefix}/cash-forecast/generate`, {});
  }

  // ── AR Aging ──
  getArAgingSummary(): Observable<ArAgingSummary> {
    return this.api.get<ArAgingSummary>(`${this.prefix}/ar-aging`);
  }

  getArAgingBuckets(): Observable<any[]> {
    return this.api.get<any[]>(`${this.prefix}/ar-aging/buckets`);
  }

  getArInvoices(status?: string, limit = 100, offset = 0): Observable<ArInvoice[]> {
    const params: any = { limit, offset };
    if (status) params.status = status;
    return this.api.get<ArInvoice[]>(`${this.prefix}/ar-aging/invoices`, params);
  }

  // ── Liquidity ──
  getLiquidityMetrics(): Observable<any[]> {
    return this.api.get<any[]>(`${this.prefix}/liquidity`);
  }

  getLiquidityRatios(): Observable<LiquidityRatios> {
    return this.api.get<LiquidityRatios>(`${this.prefix}/liquidity/ratios`);
  }
}
