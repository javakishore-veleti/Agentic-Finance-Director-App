import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-accounting-gl',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/accounting/general-ledger">Accounting</a>
      <span class="separator">/</span>
      <span class="current">General Ledger</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">General Ledger</h1>
        <p class="afda-page-subtitle">Chart of accounts, journal entries, and GL activity</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>February 2026</option>
          <option>January 2026</option>
          <option>Q4 2025</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-download"></i> Export
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-plus-lg"></i> Journal Entry
        </button>
      </div>
    </div>

    <!-- GL Summary KPIs -->
    <div class="kpi-row stagger">
      @for (kpi of glKpis; track kpi.label) {
        <div class="afda-stat-card">
          <div class="accent-bar" [ngClass]="kpi.accent"></div>
          <div class="afda-stat-label">{{ kpi.label }}</div>
          <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-top: 8px;">
            <div class="afda-stat-value">{{ kpi.value }}</div>
            <span class="afda-stat-trend" [ngClass]="kpi.trendDir">{{ kpi.trend }}</span>
          </div>
          <div class="afda-stat-footnote">{{ kpi.footnote }}</div>
        </div>
      }
    </div>

    <!-- Two Column: Account Tree + Detail -->
    <div class="gl-layout">
      <!-- Account Tree -->
      <div class="afda-card tree-panel" style="animation: fadeUp 0.4s ease 0.08s both;">
        <div class="tree-search">
          <i class="bi bi-search"></i>
          <input type="text" placeholder="Search accounts..." class="tree-search-input"
                 (input)="onSearch($event)">
        </div>
        <div class="tree-list">
          @for (group of filteredGroups; track group.code) {
            <div class="tree-group">
              <div class="tree-group-header" (click)="toggleGroup(group.code)">
                <i [class]="'bi ' + (expandedGroups.includes(group.code) ? 'bi-chevron-down' : 'bi-chevron-right')"></i>
                <span class="tree-group-code font-mono">{{ group.code }}</span>
                <span class="tree-group-name">{{ group.name }}</span>
                <span class="tree-group-bal font-mono">{{ group.balance }}</span>
              </div>
              @if (expandedGroups.includes(group.code)) {
                @for (acct of group.accounts; track acct.code) {
                  <div class="tree-account" [class.active]="selectedAccount === acct.code"
                       (click)="selectedAccount = acct.code">
                    <span class="tree-acct-code font-mono">{{ acct.code }}</span>
                    <span class="tree-acct-name">{{ acct.name }}</span>
                    <span class="tree-acct-bal font-mono">{{ acct.balance }}</span>
                  </div>
                }
              }
            </div>
          }
        </div>
      </div>

      <!-- Account Detail -->
      <div class="detail-panel">
        <!-- Selected Account Header -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.1s both;">
          <div class="detail-header">
            <div>
              <div class="detail-code font-mono">{{ activeAccount.code }}</div>
              <div class="detail-name">{{ activeAccount.name }}</div>
              <div class="detail-type">{{ activeAccount.type }} · {{ activeAccount.subtype }}</div>
            </div>
            <div class="detail-balance-block">
              <div class="detail-bal-label">Current Balance</div>
              <div class="detail-bal-value font-mono">{{ activeAccount.balance }}</div>
              <div class="detail-bal-change font-mono" [class]="activeAccount.changePositive ? 'text-favorable' : 'text-unfavorable'">
                {{ activeAccount.change }} MTD
              </div>
            </div>
          </div>
          <!-- Mini period balances -->
          <div class="period-strip">
            @for (period of activeAccount.periods; track period.label) {
              <div class="period-item">
                <span class="period-label">{{ period.label }}</span>
                <span class="period-value font-mono">{{ period.value }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Journal Entries -->
        <div class="afda-card" style="margin-top: 14px; animation: fadeUp 0.4s ease 0.14s both;">
          <div class="afda-card-header">
            <div class="afda-card-title">Journal Entries</div>
            <div style="display: flex; gap: 6px;">
              @for (f of jeFilters; track f) {
                <button class="filter-chip" [class.active]="activeJeFilter === f" (click)="activeJeFilter = f">{{ f }}</button>
              }
            </div>
          </div>
          <table class="afda-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>JE #</th>
                <th>Description</th>
                <th>Source</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Credit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (je of journalEntries; track je.jeNumber) {
                <tr>
                  <td style="font-size: 12px; color: var(--text-secondary);">{{ je.date }}</td>
                  <td class="font-mono" style="font-size: 12px;">{{ je.jeNumber }}</td>
                  <td class="fw-600">{{ je.description }}</td>
                  <td>
                    <span class="source-chip">
                      <i [class]="'bi ' + je.sourceIcon"></i>
                      {{ je.source }}
                    </span>
                  </td>
                  <td class="text-right font-mono">{{ je.debit }}</td>
                  <td class="text-right font-mono">{{ je.credit }}</td>
                  <td><span class="afda-badge" [ngClass]="je.statusClass">{{ je.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Account Activity Chart -->
        <div class="afda-card" style="margin-top: 14px; animation: fadeUp 0.4s ease 0.18s both;">
          <div class="afda-card-title" style="margin-bottom: 14px;">Monthly Activity (6 Months)</div>
          <div class="activity-chart">
            @for (month of activityData; track month.label) {
              <div class="act-col">
                <div class="act-bars">
                  <div class="act-bar debit-bar" [style.height.%]="month.debitH">
                    <span class="act-val">{{ month.debit }}</span>
                  </div>
                  <div class="act-bar credit-bar" [style.height.%]="month.creditH">
                    <span class="act-val">{{ month.credit }}</span>
                  </div>
                </div>
                <div class="act-label">{{ month.label }}</div>
              </div>
            }
          </div>
          <div class="chart-legend" style="margin-top: 10px; justify-content: center;">
            <span><span class="legend-bar" style="background: var(--primary);"></span> Debits</span>
            <span><span class="legend-bar" style="background: #D97706;"></span> Credits</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .kpi-row {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px; margin-bottom: 20px;
    }

    .gl-layout {
      display: grid; grid-template-columns: 320px 1fr;
      gap: 16px;
    }

    /* Tree Panel */
    .tree-panel { padding: 0 !important; overflow: hidden; }

    .tree-search {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; border-bottom: 1px solid var(--border-light);
      i { color: var(--text-tertiary); font-size: 14px; }
    }

    .tree-search-input {
      flex: 1; border: none; outline: none; background: transparent;
      font-size: 13px; font-family: var(--font-sans);
      color: var(--text-primary);
      &::placeholder { color: var(--text-tertiary); }
    }

    .tree-list {
      max-height: 600px; overflow-y: auto;
    }

    .tree-group-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 16px; cursor: pointer;
      border-bottom: 1px solid var(--border-light);
      transition: background 0.1s;
      &:hover { background: var(--bg-section); }
      i { font-size: 12px; color: var(--text-tertiary); width: 14px; }
    }

    .tree-group-code { font-size: 11px; color: var(--text-tertiary); width: 40px; }
    .tree-group-name { font-size: 12.5px; font-weight: 600; color: var(--text-primary); flex: 1; }
    .tree-group-bal { font-size: 12px; color: var(--text-secondary); }

    .tree-account {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px 8px 38px; cursor: pointer;
      border-bottom: 1px solid var(--border-light);
      transition: all 0.1s;
      &:hover { background: var(--bg-section); }
      &.active { background: var(--primary-subtle); border-left: 3px solid var(--primary); }
    }

    .tree-acct-code { font-size: 11px; color: var(--text-tertiary); width: 48px; }
    .tree-acct-name { font-size: 12px; color: var(--text-primary); flex: 1; }
    .tree-acct-bal { font-size: 11.5px; color: var(--text-secondary); }

    /* Detail Panel */
    .detail-panel { display: flex; flex-direction: column; }

    .detail-header {
      display: flex; justify-content: space-between; align-items: flex-start;
    }

    .detail-code { font-size: 12px; color: var(--text-tertiary); margin-bottom: 2px; }
    .detail-name { font-size: 18px; font-weight: 700; color: var(--text-primary); }
    .detail-type { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }

    .detail-balance-block { text-align: right; }
    .detail-bal-label { font-size: 10.5px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; }
    .detail-bal-value { font-size: 24px; font-weight: 700; }
    .detail-bal-change { font-size: 12px; margin-top: 2px; }

    .period-strip {
      display: flex; gap: 8px; margin-top: 16px;
      padding-top: 14px; border-top: 1px solid var(--border-light);
    }

    .period-item {
      flex: 1; text-align: center; padding: 8px;
      background: var(--bg-section); border-radius: var(--radius-sm);
    }

    .period-label { display: block; font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; }
    .period-value { display: block; font-size: 13px; font-weight: 700; margin-top: 2px; }

    /* JE Filters */
    .filter-chip {
      padding: 4px 10px; font-size: 11.5px; font-weight: 500;
      border: 1px solid var(--border); border-radius: 20px;
      background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s; font-family: var(--font-sans);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 600; }
    }

    .source-chip {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11px; color: var(--text-secondary);
      background: var(--bg-section); padding: 3px 8px;
      border-radius: 20px;
      i { font-size: 11px; }
    }

    /* Activity Chart */
    .activity-chart {
      display: flex; align-items: flex-end; gap: 8px; height: 140px;
    }

    .act-col { flex: 1; text-align: center; height: 100%; display: flex; flex-direction: column; }

    .act-bars {
      flex: 1; display: flex; align-items: flex-end; justify-content: center;
      gap: 3px;
    }

    .act-bar {
      width: 20px; border-radius: 3px 3px 0 0;
      position: relative; min-height: 4px;
      transition: height 0.5s ease;
    }

    .debit-bar { background: var(--primary); }
    .credit-bar { background: #D97706; }

    .act-val {
      position: absolute; top: -16px; left: 50%;
      transform: translateX(-50%);
      font-size: 9px; font-family: var(--font-mono);
      color: var(--text-tertiary); white-space: nowrap;
    }

    .act-label { font-size: 11px; color: var(--text-secondary); margin-top: 6px; font-weight: 500; }

    .chart-legend {
      display: flex; gap: 14px; font-size: 11px; color: var(--text-tertiary);
    }

    .legend-bar {
      display: inline-block; width: 14px; height: 10px;
      border-radius: 2px; vertical-align: middle; margin-right: 4px;
    }

    @media (max-width: 1100px) {
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
      .gl-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class GeneralLedgerComponent {
  searchTerm = '';
  selectedAccount = '6100';
  activeJeFilter = 'All';
  jeFilters = ['All', 'Manual', 'Auto', 'Adjusting'];
  expandedGroups = ['6000'];

  glKpis = [
    { label: 'Total Accounts', value: '142', trend: '+4 new', trendDir: '', footnote: 'active GL accounts', accent: 'teal' },
    { label: 'MTD Journal Entries', value: '847', trend: '↑ 12%', trendDir: 'positive', footnote: 'Feb 1–5, 2026', accent: 'blue' },
    { label: 'Unposted Entries', value: '23', trend: 'Pending', trendDir: 'negative', footnote: 'awaiting approval', accent: 'amber' },
    { label: 'Auto-Generated', value: '78%', trend: '↑ 5%', trendDir: 'positive', footnote: 'AI-created JEs', accent: 'green' },
  ];

  activeAccount = {
    code: '6100', name: 'Payroll & Benefits', type: 'Expense', subtype: 'Operating',
    balance: '$1,848,000', change: '+$332,000', changePositive: false,
    periods: [
      { label: 'Sep', value: '$1.52M' },
      { label: 'Oct', value: '$1.54M' },
      { label: 'Nov', value: '$1.58M' },
      { label: 'Dec', value: '$1.62M' },
      { label: 'Jan', value: '$1.64M' },
      { label: 'Feb', value: '$1.85M' },
    ]
  };

  accountGroups = [
    {
      code: '1000', name: 'Assets', balance: '$12.4M',
      accounts: [
        { code: '1100', name: 'Cash & Equivalents', balance: '$4.82M' },
        { code: '1200', name: 'Accounts Receivable', balance: '$3.75M' },
        { code: '1300', name: 'Prepaid Expenses', balance: '$680K' },
        { code: '1400', name: 'Fixed Assets', balance: '$3.14M' },
      ]
    },
    {
      code: '2000', name: 'Liabilities', balance: '$5.8M',
      accounts: [
        { code: '2100', name: 'Accounts Payable', balance: '$1.42M' },
        { code: '2200', name: 'Accrued Expenses', balance: '$890K' },
        { code: '2300', name: 'Deferred Revenue', balance: '$2.1M' },
        { code: '2400', name: 'Long-term Debt', balance: '$1.39M' },
      ]
    },
    {
      code: '4000', name: 'Revenue', balance: '$12.4M',
      accounts: [
        { code: '4100', name: 'Subscription Revenue', balance: '$10.2M' },
        { code: '4200', name: 'Services Revenue', balance: '$1.6M' },
        { code: '4300', name: 'Other Revenue', balance: '$600K' },
      ]
    },
    {
      code: '5000', name: 'Cost of Revenue', balance: '$3.54M',
      accounts: [
        { code: '5100', name: 'Hosting & Infrastructure', balance: '$2.1M' },
        { code: '5200', name: 'Customer Support', balance: '$1.44M' },
      ]
    },
    {
      code: '6000', name: 'Operating Expenses', balance: '$7.12M',
      accounts: [
        { code: '6100', name: 'Payroll & Benefits', balance: '$1.85M' },
        { code: '6200', name: 'Contractors', balance: '$920K' },
        { code: '6300', name: 'Software & Tools', balance: '$540K' },
        { code: '6400', name: 'Rent & Facilities', balance: '$380K' },
        { code: '6500', name: 'Marketing', balance: '$1.28M' },
        { code: '6600', name: 'Travel & Entertainment', balance: '$210K' },
        { code: '6700', name: 'Professional Services', balance: '$340K' },
        { code: '6800', name: 'Depreciation', balance: '$420K' },
        { code: '6900', name: 'Other OpEx', balance: '$180K' },
      ]
    },
  ];

  journalEntries = [
    { date: 'Feb 5', jeNumber: 'JE-2026-0847', description: 'Monthly payroll accrual', source: 'Auto', sourceIcon: 'bi-robot', debit: '$332,000', credit: '', status: 'Posted', statusClass: 'afda-badge-success' },
    { date: 'Feb 5', jeNumber: 'JE-2026-0846', description: 'Benefits allocation — February', source: 'Auto', sourceIcon: 'bi-robot', debit: '$84,000', credit: '', status: 'Posted', statusClass: 'afda-badge-success' },
    { date: 'Feb 4', jeNumber: 'JE-2026-0832', description: 'Contractor invoice — DevOps', source: 'Manual', sourceIcon: 'bi-person', debit: '', credit: '$45,000', status: 'Posted', statusClass: 'afda-badge-success' },
    { date: 'Feb 3', jeNumber: 'JE-2026-0820', description: 'Stock comp expense recognition', source: 'Auto', sourceIcon: 'bi-robot', debit: '$62,000', credit: '', status: 'Posted', statusClass: 'afda-badge-success' },
    { date: 'Feb 3', jeNumber: 'JE-2026-0818', description: 'PTO accrual adjustment', source: 'Adjusting', sourceIcon: 'bi-pencil', debit: '$18,000', credit: '', status: 'Pending', statusClass: 'afda-badge-high' },
    { date: 'Feb 2', jeNumber: 'JE-2026-0805', description: 'Payroll tax deposit', source: 'Auto', sourceIcon: 'bi-robot', debit: '', credit: '$84,000', status: 'Posted', statusClass: 'afda-badge-success' },
    { date: 'Feb 1', jeNumber: 'JE-2026-0798', description: 'Opening balance carry-forward', source: 'Auto', sourceIcon: 'bi-robot', debit: '$1,516,000', credit: '', status: 'Posted', statusClass: 'afda-badge-success' },
  ];

  activityData = [
    { label: 'Sep', debit: '$1.4M', credit: '$1.3M', debitH: 70, creditH: 65 },
    { label: 'Oct', debit: '$1.5M', credit: '$1.4M', debitH: 75, creditH: 70 },
    { label: 'Nov', debit: '$1.5M', credit: '$1.4M', debitH: 75, creditH: 70 },
    { label: 'Dec', debit: '$1.6M', credit: '$1.5M', debitH: 80, creditH: 75 },
    { label: 'Jan', debit: '$1.6M', credit: '$1.5M', debitH: 80, creditH: 75 },
    { label: 'Feb', debit: '$1.8M', credit: '$0.1M', debitH: 90, creditH: 10 },
  ];

  get filteredGroups() {
    if (!this.searchTerm) return this.accountGroups;
    const term = this.searchTerm.toLowerCase();
    return this.accountGroups.map(g => ({
      ...g,
      accounts: g.accounts.filter(a =>
        a.name.toLowerCase().includes(term) || a.code.includes(term)
      )
    })).filter(g => g.accounts.length > 0 || g.name.toLowerCase().includes(term));
  }

  toggleGroup(code: string) {
    const idx = this.expandedGroups.indexOf(code);
    if (idx >= 0) this.expandedGroups.splice(idx, 1);
    else this.expandedGroups.push(code);
  }

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    if (this.searchTerm) {
      this.expandedGroups = this.accountGroups.map(g => g.code);
    }
  }
}