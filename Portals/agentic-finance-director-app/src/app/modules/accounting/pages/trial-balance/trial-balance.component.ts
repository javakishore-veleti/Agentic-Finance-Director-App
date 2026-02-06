import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-accounting-tb',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/accounting/general-ledger">Accounting</a>
      <span class="separator">/</span>
      <span class="current">Trial Balance</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Trial Balance</h1>
        <p class="afda-page-subtitle">Period-end account balances with debit/credit verification</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm" (change)="onPeriodChange($event)">
          <option>January 2026</option>
          <option>December 2025</option>
          <option>November 2025</option>
        </select>
        <div class="toggle-group">
          @for (v of viewModes; track v) {
            <button class="toggle-btn" [class.active]="activeView === v" (click)="activeView = v">{{ v }}</button>
          }
        </div>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-download"></i> Export
        </button>
      </div>
    </div>

    <!-- Validation Banner -->
    <div class="validation-banner stagger" [class.balanced]="isBalanced" [class.unbalanced]="!isBalanced">
      <div class="val-icon">
        <i [class]="'bi ' + (isBalanced ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill')"></i>
      </div>
      <div class="val-info">
        <div class="val-title">{{ isBalanced ? 'Trial Balance is Balanced' : 'Trial Balance Imbalance Detected' }}</div>
        <div class="val-subtitle">{{ isBalanced ? 'Total debits equal total credits — no adjustments required' : 'Difference of $1,600 detected — review pending entries' }}</div>
      </div>
      <div class="val-totals">
        <div class="val-total-item">
          <span class="val-total-label">Total Debits</span>
          <span class="val-total-value font-mono">$18,642,400</span>
        </div>
        <div class="val-total-item">
          <span class="val-total-label">Total Credits</span>
          <span class="val-total-value font-mono">$18,642,400</span>
        </div>
        <div class="val-total-item">
          <span class="val-total-label">Difference</span>
          <span class="val-total-value font-mono" [class]="isBalanced ? 'text-favorable' : 'text-unfavorable'">
            {{ isBalanced ? '$0' : '$1,600' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Summary Breakdown -->
    <div class="breakdown-row stagger">
      @for (section of sectionSummaries; track section.name) {
        <div class="breakdown-card">
          <div class="bd-header">
            <span class="bd-dot" [style.background]="section.color"></span>
            <span class="bd-name">{{ section.name }}</span>
          </div>
          <div class="bd-value font-mono">{{ section.total }}</div>
          <div class="bd-bar">
            <div class="bd-bar-fill" [style.width.%]="section.pct" [style.background]="section.color"></div>
          </div>
          <div class="bd-meta">{{ section.accounts }} accounts · {{ section.pct }}% of total</div>
        </div>
      }
    </div>

    <!-- Trial Balance Table -->
    <div class="afda-card" style="animation: fadeUp 0.4s ease 0.12s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">{{ activeView }} Trial Balance — January 2026</div>
        <div class="tb-search">
          <i class="bi bi-search"></i>
          <input type="text" placeholder="Filter accounts..." class="tb-search-input"
                 (input)="onFilter($event)">
        </div>
      </div>
      <div style="overflow-x: auto;">
        <table class="afda-table">
          <thead>
            <tr>
              <th style="width: 80px;">Account</th>
              <th>Description</th>
              <th class="text-right">Debit</th>
              <th class="text-right">Credit</th>
              @if (activeView === 'Adjusted') {
                <th class="text-right">Adjustments</th>
                <th class="text-right">Adj. Debit</th>
                <th class="text-right">Adj. Credit</th>
              }
              <th class="text-right">Prior Period</th>
              <th class="text-right">Variance</th>
            </tr>
          </thead>
          <tbody>
            @for (section of filteredSections; track section.name) {
              <!-- Section Header -->
              <tr class="section-header-row">
                <td [attr.colspan]="activeView === 'Adjusted' ? 9 : 7" class="section-header-cell">
                  <span class="section-dot" [style.background]="section.color"></span>
                  {{ section.name }}
                </td>
              </tr>
              @for (row of section.rows; track row.account) {
                <tr>
                  <td class="font-mono" style="font-size: 12px; color: var(--text-tertiary);">{{ row.account }}</td>
                  <td class="fw-600">{{ row.description }}</td>
                  <td class="text-right font-mono">{{ row.debit }}</td>
                  <td class="text-right font-mono">{{ row.credit }}</td>
                  @if (activeView === 'Adjusted') {
                    <td class="text-right font-mono" [class]="row.adjustment ? 'text-adjustment' : ''">{{ row.adjustment || '—' }}</td>
                    <td class="text-right font-mono">{{ row.adjDebit || row.debit }}</td>
                    <td class="text-right font-mono">{{ row.adjCredit || row.credit }}</td>
                  }
                  <td class="text-right font-mono" style="color: var(--text-tertiary);">{{ row.priorPeriod }}</td>
                  <td class="text-right font-mono" [class]="getVarianceClass(row.variance)">{{ row.variance }}</td>
                </tr>
              }
              <!-- Section Subtotal -->
              <tr class="subtotal-row">
                <td></td>
                <td class="fw-600">Subtotal — {{ section.name }}</td>
                <td class="text-right font-mono fw-600">{{ section.totalDebit }}</td>
                <td class="text-right font-mono fw-600">{{ section.totalCredit }}</td>
                @if (activeView === 'Adjusted') {
                  <td></td>
                  <td class="text-right font-mono fw-600">{{ section.adjTotalDebit || section.totalDebit }}</td>
                  <td class="text-right font-mono fw-600">{{ section.adjTotalCredit || section.totalCredit }}</td>
                }
                <td class="text-right font-mono" style="color: var(--text-tertiary);">{{ section.priorTotal }}</td>
                <td></td>
              </tr>
            }
            <!-- Grand Total -->
            <tr class="grand-total-row">
              <td></td>
              <td class="fw-600" style="font-size: 14px;">Grand Total</td>
              <td class="text-right font-mono fw-600" style="font-size: 14px;">$18,642,400</td>
              <td class="text-right font-mono fw-600" style="font-size: 14px;">$18,642,400</td>
              @if (activeView === 'Adjusted') {
                <td></td>
                <td class="text-right font-mono fw-600" style="font-size: 14px;">$18,724,400</td>
                <td class="text-right font-mono fw-600" style="font-size: 14px;">$18,724,400</td>
              }
              <td class="text-right font-mono" style="color: var(--text-tertiary); font-size: 14px;">$17,886,200</td>
              <td class="text-right font-mono text-favorable" style="font-size: 14px;">+$756,200</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- AI Insights -->
    <div class="afda-ai-panel" style="margin-top: 16px; animation: fadeUp 0.4s ease 0.16s both;">
      <div class="afda-ai-panel-header">
        <div class="afda-ai-icon"><i class="bi bi-stars"></i></div>
        <span class="afda-ai-label">AI Balance Analysis</span>
      </div>
      <div class="afda-ai-body">
        <p>The trial balance for January 2026 is <strong>in balance</strong> after adjustments. Key observations:</p>
        <p><strong>Accounts Receivable</strong> increased 5.6% MoM ($200K), driven by delayed enterprise collections. The deferred revenue balance grew 8.2% reflecting strong bookings that will recognize in Q2.</p>
        <p><strong>Recommendation:</strong> Review accrued expenses account 2200 — the $42K adjustment suggests a timing difference that should be validated with the vendor invoice log before close.</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Toggle Group */
    .toggle-group {
      display: flex; border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden;
    }

    .toggle-btn {
      padding: 6px 14px; font-size: 12px; font-weight: 500;
      border: none; background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; font-family: var(--font-sans);
      transition: all 0.15s;
      &:not(:last-child) { border-right: 1px solid var(--border); }
      &:hover { background: var(--bg-section); }
      &.active { background: var(--primary); color: white; font-weight: 600; }
    }

    /* Validation Banner */
    .validation-banner {
      display: flex; align-items: center; gap: 16px;
      padding: 18px 24px; border-radius: var(--radius-lg);
      margin-bottom: 20px; animation: fadeUp 0.4s ease both;
      &.balanced { background: #ECFDF5; border: 1px solid #A7F3D0; }
      &.unbalanced { background: #FEF2F2; border: 1px solid #FECACA; }
    }

    .val-icon { font-size: 28px; }
    .balanced .val-icon { color: #059669; }
    .unbalanced .val-icon { color: #DC2626; }

    .val-info { flex: 1; }
    .val-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .val-subtitle { font-size: 12.5px; color: var(--text-secondary); margin-top: 2px; }

    .val-totals { display: flex; gap: 24px; }

    .val-total-item { text-align: center; }
    .val-total-label { display: block; font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; }
    .val-total-value { display: block; font-size: 16px; font-weight: 700; margin-top: 2px; }

    /* Breakdown Cards */
    .breakdown-row {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 12px; margin-bottom: 20px;
    }

    .breakdown-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-md); padding: 14px;
      box-shadow: var(--shadow-sm);
      animation: fadeUp 0.4s ease both;
    }

    .bd-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
    }

    .bd-dot { width: 10px; height: 10px; border-radius: 3px; }
    .bd-name { font-size: 12px; font-weight: 600; color: var(--text-primary); }
    .bd-value { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }

    .bd-bar {
      height: 6px; background: var(--border-light);
      border-radius: 10px; overflow: hidden; margin-bottom: 6px;
    }

    .bd-bar-fill { height: 100%; border-radius: 10px; }
    .bd-meta { font-size: 10.5px; color: var(--text-tertiary); }

    /* TB Search */
    .tb-search {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 12px; border: 1px solid var(--border);
      border-radius: var(--radius-sm); background: var(--bg-white);
      i { font-size: 13px; color: var(--text-tertiary); }
    }

    .tb-search-input {
      border: none; outline: none; background: transparent;
      font-size: 12.5px; font-family: var(--font-sans);
      color: var(--text-primary); width: 140px;
      &::placeholder { color: var(--text-tertiary); }
    }

    /* Section Headers */
    .section-header-row {
      background: var(--bg-section) !important;
    }

    .section-header-cell {
      font-size: 12px !important; font-weight: 700 !important;
      color: var(--text-primary) !important;
      text-transform: uppercase; letter-spacing: 0.3px;
      padding: 10px 12px !important;
    }

    .section-dot {
      display: inline-block; width: 8px; height: 8px;
      border-radius: 3px; margin-right: 6px; vertical-align: middle;
    }

    .subtotal-row {
      background: var(--bg-section) !important;
      td { border-top: 2px solid var(--border) !important; }
    }

    .grand-total-row {
      background: var(--primary-subtle) !important;
      td { border-top: 3px double var(--primary) !important; font-weight: 700 !important; }
    }

    .text-adjustment { color: #7C3AED; font-weight: 600; }

    @media (max-width: 1100px) {
      .breakdown-row { grid-template-columns: repeat(3, 1fr); }
      .validation-banner { flex-wrap: wrap; }
    }
  `]
})
export class TrialBalanceComponent {
  activeView = 'Unadjusted';
  viewModes = ['Unadjusted', 'Adjusted'];
  isBalanced = true;
  filterTerm = '';

  sectionSummaries = [
    { name: 'Assets',        total: '$12.4M', accounts: 4, pct: 33, color: '#0D6B5C' },
    { name: 'Liabilities',   total: '$5.8M',  accounts: 4, pct: 16, color: '#2563EB' },
    { name: 'Equity',        total: '$3.1M',  accounts: 2, pct: 8,  color: '#7C3AED' },
    { name: 'Revenue',       total: '$12.4M', accounts: 3, pct: 33, color: '#059669' },
    { name: 'Expenses',      total: '$10.7M', accounts: 9, pct: 29, color: '#D97706' },
  ];

  sections = [
    {
      name: 'Assets', color: '#0D6B5C', totalDebit: '$12,400,000', totalCredit: '', adjTotalDebit: '$12,400,000', adjTotalCredit: '', priorTotal: '$11,820,000',
      rows: [
        { account: '1100', description: 'Cash & Equivalents',  debit: '$4,820,000',  credit: '', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$4,500,000',  variance: '+$320,000' },
        { account: '1200', description: 'Accounts Receivable', debit: '$3,750,000',  credit: '', adjustment: '+$82,000', adjDebit: '$3,832,000', adjCredit: '', priorPeriod: '$3,550,000',  variance: '+$200,000' },
        { account: '1300', description: 'Prepaid Expenses',    debit: '$680,000',    credit: '', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$720,000',    variance: '-$40,000' },
        { account: '1400', description: 'Fixed Assets (net)',  debit: '$3,150,000',  credit: '', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$3,050,000',  variance: '+$100,000' },
      ]
    },
    {
      name: 'Liabilities', color: '#2563EB', totalDebit: '', totalCredit: '$5,822,000', adjTotalDebit: '', adjTotalCredit: '$5,864,000', priorTotal: '$5,480,000',
      rows: [
        { account: '2100', description: 'Accounts Payable',   debit: '', credit: '$1,420,000', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$1,380,000', variance: '+$40,000' },
        { account: '2200', description: 'Accrued Expenses',   debit: '', credit: '$890,000',   adjustment: '+$42,000', adjDebit: '', adjCredit: '$932,000', priorPeriod: '$810,000',   variance: '+$80,000' },
        { account: '2300', description: 'Deferred Revenue',   debit: '', credit: '$2,122,000', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$1,960,000', variance: '+$162,000' },
        { account: '2400', description: 'Long-term Debt',     debit: '', credit: '$1,390,000', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$1,330,000', variance: '+$60,000' },
      ]
    },
    {
      name: 'Equity', color: '#7C3AED', totalDebit: '', totalCredit: '$3,120,400', adjTotalDebit: '', adjTotalCredit: '$3,120,400', priorTotal: '$2,906,200',
      rows: [
        { account: '3100', description: 'Common Stock',       debit: '', credit: '$500,000',   adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$500,000',   variance: '$0' },
        { account: '3200', description: 'Retained Earnings',  debit: '', credit: '$2,620,400', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$2,406,200', variance: '+$214,200' },
      ]
    },
    {
      name: 'Revenue', color: '#059669', totalDebit: '', totalCredit: '$12,400,000', adjTotalDebit: '', adjTotalCredit: '$12,400,000', priorTotal: '$11,800,000',
      rows: [
        { account: '4100', description: 'Subscription Revenue', debit: '', credit: '$10,200,000', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$9,680,000',  variance: '+$520,000' },
        { account: '4200', description: 'Services Revenue',     debit: '', credit: '$1,600,000',  adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$1,540,000',  variance: '+$60,000' },
        { account: '4300', description: 'Other Revenue',        debit: '', credit: '$600,000',    adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$580,000',    variance: '+$20,000' },
      ]
    },
    {
      name: 'Expenses', color: '#D97706', totalDebit: '$10,700,000', totalCredit: '', adjTotalDebit: '$10,700,000', adjTotalCredit: '', priorTotal: '$10,200,000',
      rows: [
        { account: '5100', description: 'Hosting & Infra',      debit: '$2,100,000', credit: '', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$1,980,000', variance: '+$120,000' },
        { account: '5200', description: 'Customer Support',     debit: '$1,440,000', credit: '', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$1,400,000', variance: '+$40,000' },
        { account: '6100', description: 'Payroll & Benefits',   debit: '$1,848,000', credit: '', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$1,640,000', variance: '+$208,000' },
        { account: '6200', description: 'Contractors',          debit: '$920,000',   credit: '', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$880,000',   variance: '+$40,000' },
        { account: '6300', description: 'Software & Tools',     debit: '$540,000',   credit: '', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$560,000',   variance: '-$20,000' },
        { account: '6400', description: 'Rent & Facilities',    debit: '$380,000',   credit: '', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$380,000',   variance: '$0' },
        { account: '6500', description: 'Marketing',            debit: '$1,280,000', credit: '', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$1,200,000', variance: '+$80,000' },
        { account: '6700', description: 'Professional Services', debit: '$340,000',   credit: '', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$320,000',   variance: '+$20,000' },
        { account: '6800', description: 'Depreciation',          debit: '$420,000',   credit: '', adjustment: '', adjDebit: '', adjCredit: '', priorPeriod: '$400,000',   variance: '+$20,000' },
      ]
    },
  ];

  get filteredSections() {
    if (!this.filterTerm) return this.sections;
    const term = this.filterTerm.toLowerCase();
    return this.sections.map(s => ({
      ...s,
      rows: s.rows.filter(r => r.description.toLowerCase().includes(term) || r.account.includes(term))
    })).filter(s => s.rows.length > 0);
  }

  getVarianceClass(variance: string): string {
    if (variance.startsWith('+')) return 'text-favorable';
    if (variance.startsWith('-')) return 'text-unfavorable';
    return '';
  }

  onPeriodChange(event: Event) { }

  onFilter(event: Event) {
    this.filterTerm = (event.target as HTMLInputElement).value;
  }
}