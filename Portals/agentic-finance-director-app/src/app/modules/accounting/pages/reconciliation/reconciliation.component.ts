import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-accounting-reconciliation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/accounting/general-ledger">Accounting</a>
      <span class="separator">/</span>
      <span class="current">Reconciliation</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Reconciliation</h1>
        <p class="afda-page-subtitle">Account reconciliation status, auto-matching, and exception management</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>January 2026</option>
          <option>December 2025</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-play-fill"></i> Run Auto-Match
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-download"></i> Export
        </button>
      </div>
    </div>

    <!-- Progress Summary -->
    <div class="progress-banner stagger">
      <div class="pb-main">
        <div class="pb-ring">
          <svg viewBox="0 0 100 100" class="ring-svg">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" stroke-width="8"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--primary)" stroke-width="8"
                    stroke-linecap="round" stroke-dasharray="264" [attr.stroke-dashoffset]="ringOffset"
                    transform="rotate(-90 50 50)"/>
          </svg>
          <div class="ring-center">
            <span class="ring-pct font-mono">{{ reconPct }}%</span>
            <span class="ring-label">Complete</span>
          </div>
        </div>
        <div class="pb-stats">
          <div class="pb-title">January 2026 Reconciliation</div>
          <div class="pb-stat-row">
            <div class="pb-stat">
              <span class="pbs-value font-mono">18</span>
              <span class="pbs-label">Total Accounts</span>
            </div>
            <div class="pb-stat">
              <span class="pbs-value font-mono text-favorable">14</span>
              <span class="pbs-label">Reconciled</span>
            </div>
            <div class="pb-stat">
              <span class="pbs-value font-mono" style="color: var(--warning);">3</span>
              <span class="pbs-label">In Progress</span>
            </div>
            <div class="pb-stat">
              <span class="pbs-value font-mono text-unfavorable">1</span>
              <span class="pbs-label">Not Started</span>
            </div>
          </div>
        </div>
      </div>
      <div class="pb-kpis">
        @for (kpi of progressKpis; track kpi.label) {
          <div class="pb-kpi">
            <div class="pb-kpi-value font-mono">{{ kpi.value }}</div>
            <div class="pb-kpi-label">{{ kpi.label }}</div>
          </div>
        }
      </div>
    </div>

    <!-- Account Reconciliation Cards -->
    <div class="afda-card" style="animation: fadeUp 0.4s ease 0.08s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Account Status</div>
        <div style="display: flex; gap: 6px;">
          @for (f of statusFilters; track f) {
            <button class="filter-chip" [class.active]="activeFilter === f" (click)="activeFilter = f">{{ f }}</button>
          }
        </div>
      </div>
      <div class="recon-accounts">
        @for (acct of filteredAccounts; track acct.code) {
          <div class="recon-row">
            <div class="recon-status-icon" [style.background]="acct.statusBg">
              <i [class]="'bi ' + acct.statusIcon" [style.color]="acct.statusColor"></i>
            </div>
            <div class="recon-info">
              <div class="recon-name">{{ acct.name }}</div>
              <div class="recon-meta font-mono">{{ acct.code }} · {{ acct.type }}</div>
            </div>
            <div class="recon-balances">
              <div class="recon-bal">
                <span class="rb-label">GL Balance</span>
                <span class="rb-value font-mono">{{ acct.glBalance }}</span>
              </div>
              <div class="recon-bal">
                <span class="rb-label">Source</span>
                <span class="rb-value font-mono">{{ acct.sourceBalance }}</span>
              </div>
              <div class="recon-bal">
                <span class="rb-label">Difference</span>
                <span class="rb-value font-mono" [class]="acct.diff === '$0' ? 'text-favorable' : 'text-unfavorable'">
                  {{ acct.diff }}
                </span>
              </div>
            </div>
            <div class="recon-progress-wrap">
              <div class="recon-progress-bar">
                <div class="recon-progress-fill" [style.width.%]="acct.matchPct" [style.background]="acct.statusColor"></div>
              </div>
              <span class="recon-progress-label font-mono">{{ acct.matchPct }}%</span>
            </div>
            <div class="recon-unmatched">
              @if (acct.unmatchedCount > 0) {
                <span class="unmatched-badge">{{ acct.unmatchedCount }} items</span>
              } @else {
                <span style="font-size: 11px; color: var(--text-tertiary);">—</span>
              }
            </div>
            <span class="afda-badge" [ngClass]="acct.badgeClass">{{ acct.status }}</span>
            <div class="recon-assignee">
              <div class="assignee-avatar" [style.background]="acct.assigneeColor">{{ acct.assigneeInit }}</div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Two Column: Unmatched Items + Matching Rules -->
    <div class="recon-detail-grid">
      <!-- Unmatched Items -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.12s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Unmatched Items</div>
          <span class="afda-badge afda-badge-danger">12 items · $48,200</span>
        </div>
        <table class="afda-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Date</th>
              <th>Description</th>
              <th class="text-right">Amount</th>
              <th>Source</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            @for (item of unmatchedItems; track item.desc) {
              <tr>
                <td class="font-mono" style="font-size: 11px; color: var(--text-tertiary);">{{ item.account }}</td>
                <td style="font-size: 12px; color: var(--text-secondary);">{{ item.date }}</td>
                <td class="fw-600">{{ item.desc }}</td>
                <td class="text-right font-mono fw-600">{{ item.amount }}</td>
                <td>
                  <span class="source-tag" [style.background]="item.sourceBg" [style.color]="item.sourceColor">
                    {{ item.source }}
                  </span>
                </td>
                <td>
                  <span class="age-chip font-mono" [style.color]="item.ageColor" [style.background]="item.ageBg">
                    {{ item.age }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Matching Rules + AI -->
      <div class="recon-side">
        <!-- Matching Rules -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.14s both;">
          <div class="afda-card-header">
            <div class="afda-card-title">Matching Rules</div>
            <button class="afda-btn afda-btn-outline" style="font-size: 11px; padding: 4px 10px;">
              <i class="bi bi-gear"></i> Configure
            </button>
          </div>
          @for (rule of matchingRules; track rule.name) {
            <div class="rule-row">
              <div class="rule-icon" [style.background]="rule.iconBg">
                <i [class]="'bi ' + rule.icon" [style.color]="rule.iconColor"></i>
              </div>
              <div class="rule-info">
                <div class="rule-name">{{ rule.name }}</div>
                <div class="rule-desc">{{ rule.description }}</div>
              </div>
              <div class="rule-stats">
                <span class="rule-matched font-mono">{{ rule.matched }}</span>
                <span class="rule-label">matched</span>
              </div>
              <div class="toggle-switch" [class.active]="rule.active" (click)="rule.active = !rule.active">
                <div class="toggle-knob"></div>
              </div>
            </div>
          }
        </div>

        <!-- AI Insights -->
        <div class="afda-ai-panel" style="animation: fadeUp 0.4s ease 0.18s both;">
          <div class="afda-ai-panel-header">
            <div class="afda-ai-icon"><i class="bi bi-stars"></i></div>
            <span class="afda-ai-label">AI Matching Suggestions</span>
          </div>
          <div class="afda-ai-body">
            <p><strong>3 probable matches found</strong> based on pattern analysis:</p>
            <div class="ai-suggestion">
              <div class="ai-sugg-pair">
                <span class="font-mono" style="font-size: 11px;">GL: AWS credit memo $1,200</span>
                <i class="bi bi-arrow-left-right" style="font-size: 10px; color: var(--text-tertiary);"></i>
                <span class="font-mono" style="font-size: 11px;">Bank: AWS refund $1,200</span>
              </div>
              <span class="ai-confidence font-mono">98%</span>
            </div>
            <div class="ai-suggestion">
              <div class="ai-sugg-pair">
                <span class="font-mono" style="font-size: 11px;">GL: Vendor payment $8,400</span>
                <i class="bi bi-arrow-left-right" style="font-size: 10px; color: var(--text-tertiary);"></i>
                <span class="font-mono" style="font-size: 11px;">Bank: Check #4821 $8,400</span>
              </div>
              <span class="ai-confidence font-mono">95%</span>
            </div>
            <div class="ai-suggestion">
              <div class="ai-sugg-pair">
                <span class="font-mono" style="font-size: 11px;">GL: Client receipt $24,600</span>
                <i class="bi bi-arrow-left-right" style="font-size: 10px; color: var(--text-tertiary);"></i>
                <span class="font-mono" style="font-size: 11px;">Bank: Wire TXN-98321 $24,600</span>
              </div>
              <span class="ai-confidence font-mono">92%</span>
            </div>
            <button class="afda-btn afda-btn-primary" style="width: 100%; margin-top: 10px; font-size: 12px;">
              <i class="bi bi-check2-all"></i> Accept All Suggestions
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Progress Banner */
    .progress-banner {
      display: flex; align-items: center; gap: 24px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 24px;
      box-shadow: var(--shadow-card); margin-bottom: 20px;
      animation: fadeUp 0.4s ease both;
    }

    .pb-main { display: flex; align-items: center; gap: 20px; flex: 1; }

    .pb-ring { position: relative; width: 90px; height: 90px; flex-shrink: 0; }
    .ring-svg { width: 100%; height: 100%; }

    .ring-center {
      position: absolute; inset: 0; display: flex;
      flex-direction: column; align-items: center; justify-content: center;
    }

    .ring-pct { font-size: 20px; font-weight: 700; color: var(--primary); }
    .ring-label { font-size: 10px; color: var(--text-tertiary); }

    .pb-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; }

    .pb-stat-row { display: flex; gap: 20px; }
    .pb-stat { text-align: center; }
    .pbs-value { display: block; font-size: 20px; font-weight: 700; }
    .pbs-label { display: block; font-size: 10.5px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; }

    .pb-kpis {
      display: flex; gap: 16px;
      padding-left: 24px; border-left: 1px solid var(--border-light);
    }

    .pb-kpi { text-align: center; min-width: 80px; }
    .pb-kpi-value { font-size: 18px; font-weight: 700; color: var(--text-primary); }
    .pb-kpi-label { font-size: 10.5px; color: var(--text-tertiary); margin-top: 2px; }

    /* Recon Accounts */
    .recon-row {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .recon-status-icon {
      width: 34px; height: 34px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 15px; flex-shrink: 0;
    }

    .recon-info { flex: 1; min-width: 0; }
    .recon-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .recon-meta { font-size: 11px; color: var(--text-tertiary); }

    .recon-balances { display: flex; gap: 16px; }

    .recon-bal { text-align: center; min-width: 80px; }
    .rb-label { display: block; font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; }
    .rb-value { display: block; font-size: 12.5px; font-weight: 600; margin-top: 1px; }

    .recon-progress-wrap {
      display: flex; align-items: center; gap: 6px; width: 100px;
    }

    .recon-progress-bar {
      flex: 1; height: 6px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .recon-progress-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }
    .recon-progress-label { font-size: 11px; color: var(--text-secondary); width: 32px; }

    .unmatched-badge {
      display: inline-flex; padding: 2px 8px; font-size: 10.5px;
      font-weight: 600; background: #FEF3C7; color: #92400E;
      border-radius: 10px;
    }

    .assignee-avatar {
      width: 26px; height: 26px; border-radius: 50%;
      display: grid; place-items: center;
      color: white; font-size: 10px; font-weight: 700;
    }

    /* Filter Chips */
    .filter-chip {
      padding: 4px 10px; font-size: 11.5px; font-weight: 500;
      border: 1px solid var(--border); border-radius: 20px;
      background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s; font-family: var(--font-sans);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 600; }
    }

    /* Detail Grid */
    .recon-detail-grid {
      display: grid; grid-template-columns: 1fr 380px;
      gap: 16px; margin-top: 16px;
    }

    .recon-side { display: flex; flex-direction: column; gap: 16px; }

    .source-tag {
      display: inline-flex; padding: 2px 8px; font-size: 10px;
      font-weight: 600; border-radius: 10px; text-transform: uppercase;
    }

    .age-chip {
      display: inline-flex; padding: 2px 8px; font-size: 11px;
      font-weight: 600; border-radius: 4px;
    }

    /* Rules */
    .rule-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .rule-icon {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 14px; flex-shrink: 0;
    }

    .rule-info { flex: 1; }
    .rule-name { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
    .rule-desc { font-size: 11px; color: var(--text-tertiary); }

    .rule-stats { text-align: center; }
    .rule-matched { font-size: 14px; font-weight: 700; color: var(--primary); display: block; }
    .rule-label { font-size: 9.5px; color: var(--text-tertiary); }

    /* Toggle Switch */
    .toggle-switch {
      width: 36px; height: 20px; background: #D1D5DB;
      border-radius: 10px; position: relative; cursor: pointer;
      transition: background 0.2s;
      &.active { background: var(--primary); }
    }

    .toggle-knob {
      width: 16px; height: 16px; background: white;
      border-radius: 50%; position: absolute; top: 2px; left: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
      transition: left 0.2s;
    }

    .toggle-switch.active .toggle-knob { left: 18px; }

    /* AI Suggestions */
    .ai-suggestion {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 10px; margin-bottom: 6px;
      background: var(--bg-white); border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
    }

    .ai-sugg-pair {
      display: flex; align-items: center; gap: 6px;
    }

    .ai-confidence {
      font-size: 10.5px; font-weight: 600; color: var(--primary);
      background: var(--primary-light); padding: 2px 8px;
      border-radius: 10px;
    }

    @media (max-width: 1100px) {
      .progress-banner { flex-direction: column; }
      .pb-kpis { border-left: none; padding-left: 0; padding-top: 16px; border-top: 1px solid var(--border-light); }
      .recon-detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ReconciliationComponent {
  reconPct = 78;
  ringOffset = 264 - (264 * 0.78);
  activeFilter = 'All';
  statusFilters = ['All', 'Reconciled', 'In Progress', 'Not Started'];

  progressKpis = [
    { value: '92%', label: 'Auto-Match Rate' },
    { value: '12', label: 'Unmatched Items' },
    { value: '$48.2K', label: 'Unmatched Amt' },
    { value: '2.1 days', label: 'Avg Recon Time' },
  ];

  reconAccounts = [
    { code: '1100', name: 'Cash & Equivalents', type: 'Asset', glBalance: '$4,820,000', sourceBalance: '$4,820,000', diff: '$0', matchPct: 100, unmatchedCount: 0, status: 'Reconciled', badgeClass: 'afda-badge-success', statusBg: '#ECFDF5', statusIcon: 'bi-check-circle-fill', statusColor: '#059669', assigneeInit: 'SC', assigneeColor: '#0D6B5C', statusKey: 'Reconciled' },
    { code: '1200', name: 'Accounts Receivable', type: 'Asset', glBalance: '$3,750,000', sourceBalance: '$3,750,000', diff: '$0', matchPct: 100, unmatchedCount: 0, status: 'Reconciled', badgeClass: 'afda-badge-success', statusBg: '#ECFDF5', statusIcon: 'bi-check-circle-fill', statusColor: '#059669', assigneeInit: 'MP', assigneeColor: '#2563EB', statusKey: 'Reconciled' },
    { code: '1300', name: 'Prepaid Expenses', type: 'Asset', glBalance: '$680,000', sourceBalance: '$680,000', diff: '$0', matchPct: 100, unmatchedCount: 0, status: 'Reconciled', badgeClass: 'afda-badge-success', statusBg: '#ECFDF5', statusIcon: 'bi-check-circle-fill', statusColor: '#059669', assigneeInit: 'LW', assigneeColor: '#7C3AED', statusKey: 'Reconciled' },
    { code: '2100', name: 'Accounts Payable', type: 'Liability', glBalance: '$1,420,000', sourceBalance: '$1,411,600', diff: '$8,400', matchPct: 82, unmatchedCount: 4, status: 'In Progress', badgeClass: 'afda-badge-high', statusBg: '#FEF3C7', statusIcon: 'bi-clock-fill', statusColor: '#D97706', assigneeInit: 'SC', assigneeColor: '#0D6B5C', statusKey: 'In Progress' },
    { code: '2200', name: 'Accrued Expenses', type: 'Liability', glBalance: '$890,000', sourceBalance: '$874,200', diff: '$15,800', matchPct: 68, unmatchedCount: 5, status: 'In Progress', badgeClass: 'afda-badge-high', statusBg: '#FEF3C7', statusIcon: 'bi-clock-fill', statusColor: '#D97706', assigneeInit: 'MP', assigneeColor: '#2563EB', statusKey: 'In Progress' },
    { code: '2300', name: 'Deferred Revenue', type: 'Liability', glBalance: '$2,122,000', sourceBalance: '$2,098,000', diff: '$24,000', matchPct: 72, unmatchedCount: 3, status: 'In Progress', badgeClass: 'afda-badge-high', statusBg: '#FEF3C7', statusIcon: 'bi-clock-fill', statusColor: '#D97706', assigneeInit: 'LW', assigneeColor: '#7C3AED', statusKey: 'In Progress' },
    { code: '1400', name: 'Fixed Assets', type: 'Asset', glBalance: '$3,150,000', sourceBalance: '$3,150,000', diff: '$0', matchPct: 0, unmatchedCount: 0, status: 'Not Started', badgeClass: 'afda-badge-medium', statusBg: '#F3F4F6', statusIcon: 'bi-circle', statusColor: '#9CA3AF', assigneeInit: 'MP', assigneeColor: '#2563EB', statusKey: 'Not Started' },
  ];

  get filteredAccounts() {
    if (this.activeFilter === 'All') return this.reconAccounts;
    return this.reconAccounts.filter(a => a.statusKey === this.activeFilter);
  }

  unmatchedItems = [
    { account: '2100', date: 'Jan 28', desc: 'Vendor check #4821 — DataFlow', amount: '$8,400', source: 'Bank', sourceBg: '#EFF6FF', sourceColor: '#2563EB', age: '8d', ageColor: '#0D6B5C', ageBg: '#E8F5F1' },
    { account: '2200', date: 'Jan 26', desc: 'AWS credit memo adjustment', amount: '$1,200', source: 'GL', sourceBg: '#E8F5F1', sourceColor: '#0D6B5C', age: '10d', ageColor: '#D97706', ageBg: '#FFFBEB' },
    { account: '2200', date: 'Jan 24', desc: 'Accrued bonus reversal', amount: '$6,800', source: 'GL', sourceBg: '#E8F5F1', sourceColor: '#0D6B5C', age: '12d', ageColor: '#D97706', ageBg: '#FFFBEB' },
    { account: '2300', date: 'Jan 22', desc: 'Client payment — NovaSoft', amount: '$24,600', source: 'Bank', sourceBg: '#EFF6FF', sourceColor: '#2563EB', age: '14d', ageColor: '#DC2626', ageBg: '#FEE2E2' },
    { account: '2200', date: 'Jan 20', desc: 'Insurance premium adjustment', amount: '$3,400', source: 'GL', sourceBg: '#E8F5F1', sourceColor: '#0D6B5C', age: '16d', ageColor: '#DC2626', ageBg: '#FEE2E2' },
    { account: '2200', date: 'Jan 18', desc: 'Utility accrual timing diff', amount: '$3,800', source: 'GL', sourceBg: '#E8F5F1', sourceColor: '#0D6B5C', age: '18d', ageColor: '#DC2626', ageBg: '#FEE2E2' },
  ];

  matchingRules = [
    { name: 'Exact Amount Match', description: 'Match by identical amounts ± date window', icon: 'bi-bullseye', iconBg: '#E8F5F1', iconColor: '#0D6B5C', matched: 842, active: true },
    { name: 'Reference Number', description: 'Match by invoice/check reference ID', icon: 'bi-hash', iconBg: '#EFF6FF', iconColor: '#2563EB', matched: 324, active: true },
    { name: 'Vendor + Amount', description: 'Fuzzy match vendor name + amount range', icon: 'bi-person-check', iconBg: '#EDE9FE', iconColor: '#7C3AED', matched: 156, active: true },
    { name: 'AI Pattern Match', description: 'ML-based matching with 92% confidence threshold', icon: 'bi-stars', iconBg: '#FEF3C7', iconColor: '#D97706', matched: 48, active: true },
  ];
}