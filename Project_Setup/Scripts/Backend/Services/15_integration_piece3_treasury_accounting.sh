#!/bin/bash
###############################################################################
# 15_integration_piece3_treasury_accounting.sh
# Creates: Angular HTTP services for Treasury + Accounting modules
# Maps to: /api/v1/treasury/* and /api/v1/accounting/* backend endpoints
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

SRC="Portals/agentic-finance-director-app/src/app"

echo "🔧 [15] Integration Piece 3 — Treasury + Accounting services..."

# =============================================================================
# 1. Treasury service (13 endpoints)
# =============================================================================
mkdir -p "$SRC/modules/treasury/services"

cat > "$SRC/modules/treasury/services/treasury.service.ts" << 'EOF'
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
EOF

echo "  ✅ treasury.service.ts — cash position, bank accounts, forecast, AR aging, liquidity"

# =============================================================================
# 2. Accounting service (18 endpoints)
# =============================================================================
mkdir -p "$SRC/modules/accounting/services"

cat > "$SRC/modules/accounting/services/accounting.service.ts" << 'EOF'
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// ── DTOs ──
export interface ChartOfAccount {
  id: string;
  account_number: string;
  account_name: string;
  account_type: string;
  parent_account_id: string | null;
  currency: string;
  is_active: boolean;
  department: string | null;
  normal_balance: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  debit_account: string;
  credit_account: string;
  amount: number;
  currency: string;
  status: string;
  posted_by: string;
  created_at: string;
}

export interface TrialBalanceRow {
  account_number: string;
  account_name: string;
  account_type: string;
  debit_balance: number;
  credit_balance: number;
  net_balance: number;
}

export interface IntercompanyTransaction {
  id: string;
  from_entity: string;
  to_entity: string;
  transaction_type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  transaction_date: string;
  created_at: string;
}

export interface ReconciliationRecord {
  id: string;
  account_id: string;
  account_name: string;
  period: string;
  book_balance: number;
  bank_balance: number;
  difference: number;
  status: string;
  reconciled_by: string | null;
  reconciled_at: string | null;
  items_count: number;
  created_at: string;
}

export interface ClosePeriod {
  id: string;
  period: string;
  fiscal_year: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  started_by: string | null;
  tasks_total: number;
  tasks_completed: number;
  created_at: string;
}

export interface CloseTask {
  id: string;
  close_period_id: string;
  task_name: string;
  description: string;
  assigned_to: string;
  status: string;
  due_date: string;
  completed_at: string | null;
  order_index: number;
  is_blocking: boolean;
}

@Injectable({ providedIn: 'root' })
export class AccountingService {
  private readonly prefix = '/accounting';

  constructor(private api: ApiService) {}

  // ── Chart of Accounts / General Ledger ──
  getChartOfAccounts(account_type?: string): Observable<ChartOfAccount[]> {
    const params: any = {};
    if (account_type) params.account_type = account_type;
    return this.api.get<ChartOfAccount[]>(`${this.prefix}/gl/accounts`, params);
  }

  getAccount(id: string): Observable<ChartOfAccount> {
    return this.api.get<ChartOfAccount>(`${this.prefix}/gl/accounts/${id}`);
  }

  getJournalEntries(status?: string, limit = 100, offset = 0): Observable<JournalEntry[]> {
    const params: any = { limit, offset };
    if (status) params.status = status;
    return this.api.get<JournalEntry[]>(`${this.prefix}/gl/journal-entries`, params);
  }

  createJournalEntry(data: Partial<JournalEntry>): Observable<JournalEntry> {
    return this.api.post<JournalEntry>(`${this.prefix}/gl/journal-entries`, data);
  }

  // ── Trial Balance ──
  getTrialBalance(period?: string): Observable<TrialBalanceRow[]> {
    const params: any = {};
    if (period) params.period = period;
    return this.api.get<TrialBalanceRow[]>(`${this.prefix}/trial-balance`, params);
  }

  getTrialBalanceSummary(period?: string): Observable<any> {
    const params: any = {};
    if (period) params.period = period;
    return this.api.get<any>(`${this.prefix}/trial-balance/summary`, params);
  }

  // ── Intercompany ──
  getIntercompanyTransactions(status?: string, entity?: string): Observable<IntercompanyTransaction[]> {
    const params: any = {};
    if (status) params.status = status;
    if (entity) params.entity = entity;
    return this.api.get<IntercompanyTransaction[]>(`${this.prefix}/intercompany`, params);
  }

  getIntercompanyBalance(): Observable<any> {
    return this.api.get<any>(`${this.prefix}/intercompany/balance`);
  }

  createIntercompanyTransaction(data: Partial<IntercompanyTransaction>): Observable<IntercompanyTransaction> {
    return this.api.post<IntercompanyTransaction>(`${this.prefix}/intercompany`, data);
  }

  // ── Reconciliation ──
  getReconciliations(status?: string, period?: string): Observable<ReconciliationRecord[]> {
    const params: any = {};
    if (status) params.status = status;
    if (period) params.period = period;
    return this.api.get<ReconciliationRecord[]>(`${this.prefix}/reconciliation`, params);
  }

  getReconciliation(id: string): Observable<ReconciliationRecord> {
    return this.api.get<ReconciliationRecord>(`${this.prefix}/reconciliation/${id}`);
  }

  startReconciliation(accountId: string, period: string): Observable<ReconciliationRecord> {
    return this.api.post<ReconciliationRecord>(`${this.prefix}/reconciliation/start`, { account_id: accountId, period });
  }

  // ── Close Management ──
  getClosePeriods(fiscal_year?: number): Observable<ClosePeriod[]> {
    const params: any = {};
    if (fiscal_year) params.fiscal_year = fiscal_year;
    return this.api.get<ClosePeriod[]>(`${this.prefix}/close`, params);
  }

  getClosePeriod(id: string): Observable<ClosePeriod> {
    return this.api.get<ClosePeriod>(`${this.prefix}/close/${id}`);
  }

  getCloseTasks(closePeriodId: string): Observable<CloseTask[]> {
    return this.api.get<CloseTask[]>(`${this.prefix}/close/${closePeriodId}/tasks`);
  }

  updateCloseTask(closePeriodId: string, taskId: string, data: Partial<CloseTask>): Observable<CloseTask> {
    return this.api.put<CloseTask>(`${this.prefix}/close/${closePeriodId}/tasks/${taskId}`, data);
  }

  startClose(period: string, fiscal_year: number): Observable<ClosePeriod> {
    return this.api.post<ClosePeriod>(`${this.prefix}/close/start`, { period, fiscal_year });
  }
}
EOF

echo "  ✅ accounting.service.ts — GL, trial balance, intercompany, reconciliation, close mgmt"

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "✅ [15] Integration Piece 3 complete!"
echo ""
echo "  Treasury service (13 endpoints):"
echo "    → getCashPosition(), getCashPositionHistory()"
echo "    → getBankAccounts(), createBankAccount()"
echo "    → getCashForecast(), generateCashForecast()"
echo "    → getArAgingSummary(), getArInvoices()"
echo "    → getLiquidityMetrics(), getLiquidityRatios()"
echo ""
echo "  Accounting service (18 endpoints):"
echo "    → getChartOfAccounts(), getJournalEntries(), createJournalEntry()"
echo "    → getTrialBalance(), getTrialBalanceSummary()"
echo "    → getIntercompanyTransactions(), getIntercompanyBalance()"
echo "    → getReconciliations(), startReconciliation()"
echo "    → getClosePeriods(), getCloseTasks(), updateCloseTask(), startClose()"
echo ""
echo "  Next: Run 16_integration_piece4_agent_risk.sh"
