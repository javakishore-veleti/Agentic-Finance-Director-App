import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-accounting-intercompany',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/accounting/general-ledger">Accounting</a>
      <span class="separator">/</span>
      <span class="current">Intercompany</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Intercompany</h1>
        <p class="afda-page-subtitle">Entity balances, elimination entries, and consolidation netting</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>January 2026</option>
          <option>December 2025</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-arrow-repeat"></i> Reconcile
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-journal-plus"></i> Create IC Entry
        </button>
      </div>
    </div>

    <!-- IC Summary KPIs -->
    <div class="kpi-row stagger">
      @for (kpi of icKpis; track kpi.label) {
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

    <!-- Entity Map + Netting Matrix -->
    <div class="ic-grid">
      <!-- Entity Cards -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.08s both;">
        <div class="afda-card-title" style="margin-bottom: 14px;">Legal Entities</div>
        @for (entity of entities; track entity.code) {
          <div class="entity-card" [class.active]="selectedEntity === entity.code"
               (click)="selectedEntity = entity.code">
            <div class="entity-flag">{{ entity.flag }}</div>
            <div class="entity-info">
              <div class="entity-name">{{ entity.name }}</div>
              <div class="entity-meta">{{ entity.code }} · {{ entity.jurisdiction }}</div>
            </div>
            <div class="entity-balance">
              <div class="entity-bal-label">IC Balance</div>
              <div class="entity-bal-value font-mono" [class]="entity.balancePositive ? 'text-favorable' : 'text-unfavorable'">
                {{ entity.balance }}
              </div>
            </div>
            <span class="afda-badge" [ngClass]="entity.statusClass">{{ entity.status }}</span>
          </div>
        }
      </div>

      <!-- Netting Matrix -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.1s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">IC Netting Matrix</div>
          <span style="font-size: 11px; color: var(--text-tertiary);">Amounts in $000s</span>
        </div>
        <div class="matrix-wrapper">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="matrix-corner">From \ To</th>
                @for (h of matrixHeaders; track h) {
                  <th class="matrix-header">{{ h }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of matrixData; track row.entity; let i = $index) {
                <tr>
                  <td class="matrix-row-header">{{ row.entity }}</td>
                  @for (cell of row.values; track $index; let j = $index) {
                    <td class="matrix-cell" [class.diagonal]="i === j"
                        [class.has-value]="cell !== '—' && cell !== '0'"
                        [style.background]="getCellBg(cell, i, j)">
                      <span class="font-mono">{{ cell }}</span>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="matrix-legend">
          <span><span class="ml-dot" style="background: #ECFDF5;"></span> Receivable</span>
          <span><span class="ml-dot" style="background: #FEF2F2;"></span> Payable</span>
          <span><span class="ml-dot" style="background: var(--bg-section);"></span> Self</span>
        </div>
      </div>
    </div>

    <!-- IC Transactions -->
    <div class="afda-card" style="margin-top: 16px; animation: fadeUp 0.4s ease 0.14s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Intercompany Transactions</div>
        <div style="display: flex; gap: 6px;">
          @for (f of txnFilters; track f) {
            <button class="filter-chip" [class.active]="activeTxnFilter === f" (click)="activeTxnFilter = f">{{ f }}</button>
          }
        </div>
      </div>
      <table class="afda-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>IC Ref</th>
            <th>From Entity</th>
            <th>To Entity</th>
            <th>Description</th>
            <th class="text-right">Amount</th>
            <th>Type</th>
            <th>Match Status</th>
          </tr>
        </thead>
        <tbody>
          @for (txn of filteredTransactions; track txn.ref) {
            <tr>
              <td style="font-size: 12px; color: var(--text-secondary);">{{ txn.date }}</td>
              <td class="font-mono" style="font-size: 12px;">{{ txn.ref }}</td>
              <td>
                <span class="entity-chip">{{ txn.fromFlag }} {{ txn.from }}</span>
              </td>
              <td>
                <span class="entity-chip">{{ txn.toFlag }} {{ txn.to }}</span>
              </td>
              <td class="fw-600">{{ txn.description }}</td>
              <td class="text-right font-mono fw-600">{{ txn.amount }}</td>
              <td>
                <span class="type-chip" [style.background]="txn.typeBg" [style.color]="txn.typeColor">
                  {{ txn.type }}
                </span>
              </td>
              <td>
                <span class="afda-badge" [ngClass]="txn.matchClass">{{ txn.matchStatus }}</span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Elimination Entries -->
    <div class="afda-card" style="margin-top: 16px; animation: fadeUp 0.4s ease 0.18s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Elimination Entries</div>
        <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 5px 12px;">
          <i class="bi bi-play-fill"></i> Auto-Generate
        </button>
      </div>
      <table class="afda-table">
        <thead>
          <tr>
            <th>JE #</th>
            <th>Description</th>
            <th>Entities</th>
            <th class="text-right">Debit</th>
            <th class="text-right">Credit</th>
            <th>Source</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          @for (elim of eliminations; track elim.je) {
            <tr>
              <td class="font-mono" style="font-size: 12px;">{{ elim.je }}</td>
              <td class="fw-600">{{ elim.description }}</td>
              <td>
                <div class="entity-pair">
                  <span class="entity-chip small">{{ elim.entity1 }}</span>
                  <i class="bi bi-arrow-left-right" style="font-size: 10px; color: var(--text-tertiary);"></i>
                  <span class="entity-chip small">{{ elim.entity2 }}</span>
                </div>
              </td>
              <td class="text-right font-mono">{{ elim.debit }}</td>
              <td class="text-right font-mono">{{ elim.credit }}</td>
              <td>
                <span class="source-chip">
                  <i [class]="'bi ' + elim.sourceIcon"></i>
                  {{ elim.source }}
                </span>
              </td>
              <td><span class="afda-badge" [ngClass]="elim.statusClass">{{ elim.status }}</span></td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- AI Panel -->
    <div class="afda-ai-panel" style="margin-top: 16px; animation: fadeUp 0.4s ease 0.22s both;">
      <div class="afda-ai-panel-header">
        <div class="afda-ai-icon"><i class="bi bi-stars"></i></div>
        <span class="afda-ai-label">AI Reconciliation Notes</span>
      </div>
      <div class="afda-ai-body">
        <p>All intercompany balances for January 2026 are <strong>matched within tolerance</strong> ($500 threshold). Two items to note:</p>
        <p><strong>AFDA-DE → AFDA-US:</strong> $42K management fee is booked but the corresponding entry in AFDA-US is pending approval. Recommend expediting to avoid close delay.</p>
        <p><strong>AFDA-UK → AFDA-US:</strong> FX translation difference of $1,200 on the IP royalty — within tolerance but trending higher. Monitor GBP/USD rate exposure.</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .kpi-row {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px; margin-bottom: 20px;
    }

    .ic-grid {
      display: grid; grid-template-columns: 360px 1fr;
      gap: 16px;
    }

    /* Entity Cards */
    .entity-card {
      display: flex; align-items: center; gap: 12px;
      padding: 14px; border: 1px solid var(--border-light);
      border-radius: var(--radius-md); margin-bottom: 8px;
      cursor: pointer; transition: all 0.15s;
      &:last-child { margin-bottom: 0; }
      &:hover { border-color: var(--primary); }
      &.active { border-color: var(--primary); background: var(--primary-subtle); }
    }

    .entity-flag { font-size: 22px; }

    .entity-info { flex: 1; min-width: 0; }
    .entity-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .entity-meta { font-size: 11px; color: var(--text-tertiary); }

    .entity-balance { text-align: right; margin-right: 4px; }
    .entity-bal-label { font-size: 10px; color: var(--text-tertiary); }
    .entity-bal-value { font-size: 14px; font-weight: 700; }

    /* Netting Matrix */
    .matrix-wrapper { overflow-x: auto; }

    .matrix-table {
      width: 100%; border-collapse: collapse;
      font-size: 12px;
    }

    .matrix-corner {
      background: var(--bg-section); padding: 10px;
      font-size: 10.5px; font-weight: 600;
      color: var(--text-tertiary); text-align: left;
      border: 1px solid var(--border-light);
    }

    .matrix-header {
      background: var(--bg-section); padding: 10px 8px;
      font-size: 11px; font-weight: 600;
      color: var(--text-primary); text-align: center;
      border: 1px solid var(--border-light);
      min-width: 70px;
    }

    .matrix-row-header {
      background: var(--bg-section); padding: 10px;
      font-size: 11px; font-weight: 600;
      color: var(--text-primary);
      border: 1px solid var(--border-light);
    }

    .matrix-cell {
      padding: 10px 8px; text-align: center;
      border: 1px solid var(--border-light);
      transition: background 0.1s;
      &.diagonal { background: var(--bg-section) !important; }
      &.has-value { font-weight: 600; }
      &:hover:not(.diagonal) { background: var(--primary-subtle) !important; }
    }

    .matrix-legend {
      display: flex; gap: 16px; margin-top: 10px;
      font-size: 11px; color: var(--text-tertiary);
    }

    .ml-dot {
      display: inline-block; width: 12px; height: 12px;
      border-radius: 3px; vertical-align: middle; margin-right: 4px;
      border: 1px solid var(--border-light);
    }

    /* Chips */
    .entity-chip {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11.5px; color: var(--text-primary);
      background: var(--bg-section); padding: 3px 8px;
      border-radius: 20px;
      &.small { font-size: 10.5px; padding: 2px 6px; }
    }

    .type-chip {
      display: inline-flex; padding: 2px 8px;
      font-size: 10px; font-weight: 600;
      border-radius: 10px; text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .entity-pair {
      display: flex; align-items: center; gap: 4px;
    }

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

    @media (max-width: 1100px) {
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
      .ic-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class IntercompanyComponent {
  selectedEntity = 'AFDA-US';
  activeTxnFilter = 'All';
  txnFilters = ['All', 'Unmatched', 'Services', 'Royalties', 'Funding'];

  icKpis = [
    { label: 'Total IC Balance', value: '$2.84M', trend: 'Gross', trendDir: '', footnote: 'across all entities', accent: 'teal' },
    { label: 'Net IC Exposure', value: '$0', trend: 'Balanced', trendDir: 'positive', footnote: 'after netting', accent: 'green' },
    { label: 'Unmatched Items', value: '2', trend: 'Pending', trendDir: 'negative', footnote: 'awaiting counterparty', accent: 'amber' },
    { label: 'Elimination Entries', value: '6', trend: '4 auto', trendDir: 'positive', footnote: 'generated this period', accent: 'blue' },
  ];

  entities = [
    { code: 'AFDA-US', name: 'AFDA Inc. (US)', flag: '🇺🇸', jurisdiction: 'Delaware, USA', balance: '+$1.42M', balancePositive: true, status: 'Reconciled', statusClass: 'afda-badge-success' },
    { code: 'AFDA-DE', name: 'AFDA GmbH (DE)', flag: '🇩🇪', jurisdiction: 'Berlin, Germany', balance: '-$680K', balancePositive: false, status: 'Reconciled', statusClass: 'afda-badge-success' },
    { code: 'AFDA-UK', name: 'AFDA Ltd (UK)', flag: '🇬🇧', jurisdiction: 'London, UK', balance: '-$420K', balancePositive: false, status: '1 Pending', statusClass: 'afda-badge-high' },
    { code: 'AFDA-CA', name: 'AFDA Canada Inc.', flag: '🇨🇦', jurisdiction: 'Toronto, Canada', balance: '-$320K', balancePositive: false, status: 'Reconciled', statusClass: 'afda-badge-success' },
  ];

  matrixHeaders = ['AFDA-US', 'AFDA-DE', 'AFDA-UK', 'AFDA-CA'];

  matrixData = [
    { entity: 'AFDA-US', values: ['—',   '680',  '420',  '320'] },
    { entity: 'AFDA-DE', values: ['680',  '—',    '—',    '—'] },
    { entity: 'AFDA-UK', values: ['420',  '—',    '—',    '—'] },
    { entity: 'AFDA-CA', values: ['320',  '—',    '—',    '—'] },
  ];

  getCellBg(cell: string, i: number, j: number): string {
    if (i === j) return 'var(--bg-section)';
    if (cell === '—' || cell === '0') return 'transparent';
    return i < j ? '#ECFDF5' : '#FEF2F2';
  }

  transactions = [
    { date: 'Jan 28', ref: 'IC-2026-0142', from: 'AFDA-US', fromFlag: '🇺🇸', to: 'AFDA-DE', toFlag: '🇩🇪', description: 'Management services fee — Q4', amount: '$420,000', type: 'Services', typeBg: '#E8F5F1', typeColor: '#0D6B5C', matchStatus: 'Matched', matchClass: 'afda-badge-success', typeKey: 'Services' },
    { date: 'Jan 25', ref: 'IC-2026-0138', from: 'AFDA-US', fromFlag: '🇺🇸', to: 'AFDA-UK', toFlag: '🇬🇧', description: 'IP royalty payment — January', amount: '$180,000', type: 'Royalties', typeBg: '#EDE9FE', typeColor: '#7C3AED', matchStatus: 'Matched', matchClass: 'afda-badge-success', typeKey: 'Royalties' },
    { date: 'Jan 22', ref: 'IC-2026-0135', from: 'AFDA-US', fromFlag: '🇺🇸', to: 'AFDA-CA', toFlag: '🇨🇦', description: 'Shared services allocation', amount: '$140,000', type: 'Services', typeBg: '#E8F5F1', typeColor: '#0D6B5C', matchStatus: 'Matched', matchClass: 'afda-badge-success', typeKey: 'Services' },
    { date: 'Jan 20', ref: 'IC-2026-0130', from: 'AFDA-DE', fromFlag: '🇩🇪', to: 'AFDA-US', toFlag: '🇺🇸', description: 'R&D cost sharing — AI models', amount: '$260,000', type: 'Services', typeBg: '#E8F5F1', typeColor: '#0D6B5C', matchStatus: 'Matched', matchClass: 'afda-badge-success', typeKey: 'Services' },
    { date: 'Jan 18', ref: 'IC-2026-0126', from: 'AFDA-US', fromFlag: '🇺🇸', to: 'AFDA-UK', toFlag: '🇬🇧', description: 'Capital contribution — expansion', amount: '$240,000', type: 'Funding', typeBg: '#EFF6FF', typeColor: '#2563EB', matchStatus: 'Pending', matchClass: 'afda-badge-high', typeKey: 'Funding' },
    { date: 'Jan 15', ref: 'IC-2026-0120', from: 'AFDA-US', fromFlag: '🇺🇸', to: 'AFDA-CA', toFlag: '🇨🇦', description: 'Working capital advance', amount: '$180,000', type: 'Funding', typeBg: '#EFF6FF', typeColor: '#2563EB', matchStatus: 'Matched', matchClass: 'afda-badge-success', typeKey: 'Funding' },
    { date: 'Jan 10', ref: 'IC-2026-0112', from: 'AFDA-US', fromFlag: '🇺🇸', to: 'AFDA-DE', toFlag: '🇩🇪', description: 'Software license sub-license', amount: '$42,000', type: 'Royalties', typeBg: '#EDE9FE', typeColor: '#7C3AED', matchStatus: 'Pending', matchClass: 'afda-badge-high', typeKey: 'Royalties' },
  ];

  get filteredTransactions() {
    if (this.activeTxnFilter === 'All') return this.transactions;
    if (this.activeTxnFilter === 'Unmatched') return this.transactions.filter(t => t.matchStatus === 'Pending');
    return this.transactions.filter(t => t.typeKey === this.activeTxnFilter);
  }

  eliminations = [
    { je: 'ELIM-0042', description: 'Eliminate IC receivable/payable — US↔DE', entity1: '🇺🇸 US', entity2: '🇩🇪 DE', debit: '$680,000', credit: '$680,000', source: 'Auto', sourceIcon: 'bi-robot', status: 'Posted', statusClass: 'afda-badge-success' },
    { je: 'ELIM-0043', description: 'Eliminate IC receivable/payable — US↔UK', entity1: '🇺🇸 US', entity2: '🇬🇧 UK', debit: '$420,000', credit: '$420,000', source: 'Auto', sourceIcon: 'bi-robot', status: 'Posted', statusClass: 'afda-badge-success' },
    { je: 'ELIM-0044', description: 'Eliminate IC receivable/payable — US↔CA', entity1: '🇺🇸 US', entity2: '🇨🇦 CA', debit: '$320,000', credit: '$320,000', source: 'Auto', sourceIcon: 'bi-robot', status: 'Posted', statusClass: 'afda-badge-success' },
    { je: 'ELIM-0045', description: 'Eliminate IC management fee revenue', entity1: '🇺🇸 US', entity2: '🇩🇪 DE', debit: '$420,000', credit: '$420,000', source: 'Auto', sourceIcon: 'bi-robot', status: 'Posted', statusClass: 'afda-badge-success' },
    { je: 'ELIM-0046', description: 'Eliminate IC royalty income/expense', entity1: '🇺🇸 US', entity2: '🇬🇧 UK', debit: '$180,000', credit: '$180,000', source: 'Manual', sourceIcon: 'bi-person', status: 'Pending', statusClass: 'afda-badge-high' },
    { je: 'ELIM-0047', description: 'FX translation adjustment — GBP', entity1: '🇬🇧 UK', entity2: '🇺🇸 US', debit: '$1,200', credit: '$1,200', source: 'Auto', sourceIcon: 'bi-robot', status: 'Posted', statusClass: 'afda-badge-success' },
  ];
}