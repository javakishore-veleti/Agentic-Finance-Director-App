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
