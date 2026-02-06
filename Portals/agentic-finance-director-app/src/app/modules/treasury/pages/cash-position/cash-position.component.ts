import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-treasury-cash-position',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/treasury/cash-position">Treasury</a>
      <span class="separator">/</span>
      <span class="current">Cash Position</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Cash Position</h1>
        <p class="afda-page-subtitle">Real-time cash balances and daily movement — as of Feb 5, 2026</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>All Currencies</option>
          <option>USD Only</option>
          <option>EUR Only</option>
          <option>GBP Only</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-arrow-repeat"></i> Refresh
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-download"></i> Export
        </button>
      </div>
    </div>

    <!-- Total Cash KPIs -->
    <div class="kpi-row stagger">
      @for (kpi of cashKpis; track kpi.label) {
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

    <!-- Two column: Accounts + Currency -->
    <div class="cash-grid">
      <!-- Account Balances -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.08s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Account Balances</div>
          <span style="font-size: 11px; color: var(--text-tertiary);">6 accounts</span>
        </div>
        @for (acct of accounts; track acct.name) {
          <div class="account-row">
            <div class="acct-icon" [style.background]="acct.iconBg">
              <i [class]="'bi ' + acct.icon" [style.color]="acct.iconColor"></i>
            </div>
            <div class="acct-info">
              <div class="acct-name">{{ acct.name }}</div>
              <div class="acct-meta">{{ acct.bank }} · {{ acct.type }}</div>
            </div>
            <div class="acct-balance">
              <div class="acct-amount font-mono">{{ acct.balance }}</div>
              <div class="acct-change font-mono" [class]="acct.changePositive ? 'text-favorable' : 'text-unfavorable'">
                {{ acct.change }}
              </div>
            </div>
            <div class="acct-bar-wrapper">
              <div class="acct-bar">
                <div class="acct-bar-fill" [style.width.%]="acct.pctOfTotal" [style.background]="acct.iconColor"></div>
              </div>
              <span class="acct-bar-pct font-mono">{{ acct.pctOfTotal }}%</span>
            </div>
          </div>
        }
      </div>

      <!-- Currency Breakdown + Daily Movement -->
      <div class="cash-right">
        <!-- Currency Breakdown -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.1s both;">
          <div class="afda-card-title" style="margin-bottom: 14px;">Currency Breakdown</div>
          <div class="currency-chart">
            @for (cur of currencies; track cur.code) {
              <div class="currency-row">
                <div class="cur-flag">{{ cur.flag }}</div>
                <div class="cur-info">
                  <span class="cur-code">{{ cur.code }}</span>
                  <span class="cur-name">{{ cur.name }}</span>
                </div>
                <div class="cur-bar-wrapper">
                  <div class="cur-bar">
                    <div class="cur-bar-fill" [style.width.%]="cur.pct" [style.background]="cur.color"></div>
                  </div>
                </div>
                <div class="cur-amount font-mono">{{ cur.amount }}</div>
                <span class="cur-pct font-mono">{{ cur.pct }}%</span>
              </div>
            }
          </div>
        </div>

        <!-- Daily Cash Movement -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.14s both;">
          <div class="afda-card-title" style="margin-bottom: 14px;">Today's Cash Movement</div>
          <div class="movement-summary">
            <div class="mv-item inflow">
              <i class="bi bi-arrow-down-circle-fill"></i>
              <div>
                <div class="mv-label">Total Inflows</div>
                <div class="mv-value font-mono">+$842,000</div>
              </div>
            </div>
            <div class="mv-item outflow">
              <i class="bi bi-arrow-up-circle-fill"></i>
              <div>
                <div class="mv-label">Total Outflows</div>
                <div class="mv-value font-mono">-$522,000</div>
              </div>
            </div>
            <div class="mv-item net">
              <i class="bi bi-arrow-left-right"></i>
              <div>
                <div class="mv-label">Net Movement</div>
                <div class="mv-value font-mono text-favorable">+$320,000</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 7-Day Cash Trend -->
    <div class="afda-card" style="margin-top: 16px; animation: fadeUp 0.4s ease 0.16s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">7-Day Cash Trend</div>
        <div class="chart-legend">
          <span><span class="legend-bar" style="background: var(--primary);"></span> Closing Balance</span>
          <span><span class="legend-bar" style="background: #D1D5DB;"></span> Opening Balance</span>
        </div>
      </div>
      <div class="trend-chart">
        @for (day of dailyTrend; track day.date) {
          <div class="trend-col">
            <div class="trend-bars">
              <div class="trend-bar opening" [style.height.%]="day.openH">
                <span class="trend-val">{{ day.open }}</span>
              </div>
              <div class="trend-bar closing" [style.height.%]="day.closeH">
                <span class="trend-val">{{ day.close }}</span>
              </div>
            </div>
            <div class="trend-date">{{ day.date }}</div>
            <div class="trend-net font-mono" [class]="day.netPositive ? 'text-favorable' : 'text-unfavorable'">
              {{ day.net }}
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="afda-card" style="margin-top: 16px; animation: fadeUp 0.4s ease 0.2s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Recent Transactions</div>
        <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 5px 12px;">
          View all →
        </button>
      </div>
      <table class="afda-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Account</th>
            <th>Type</th>
            <th class="text-right">Amount</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          @for (txn of transactions; track txn.desc) {
            <tr>
              <td class="fw-600">{{ txn.desc }}</td>
              <td style="font-size: 12px; color: var(--text-secondary);">{{ txn.account }}</td>
              <td>
                <span class="txn-type-chip" [class]="txn.isInflow ? 'inflow-chip' : 'outflow-chip'">
                  <i [class]="'bi ' + (txn.isInflow ? 'bi-arrow-down-left' : 'bi-arrow-up-right')"></i>
                  {{ txn.type }}
                </span>
              </td>
              <td class="text-right font-mono fw-600" [class]="txn.isInflow ? 'text-favorable' : 'text-unfavorable'">
                {{ txn.amount }}
              </td>
              <td style="font-size: 12px; color: var(--text-tertiary);">{{ txn.time }}</td>
              <td>
                <span class="afda-badge" [ngClass]="txn.statusClass">{{ txn.status }}</span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .kpi-row {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px; margin-bottom: 20px;
    }

    .cash-grid {
      display: grid; grid-template-columns: 1fr 380px;
      gap: 16px;
    }

    .cash-right { display: flex; flex-direction: column; gap: 16px; }

    /* Account Rows */
    .account-row {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .acct-icon {
      width: 38px; height: 38px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 16px; flex-shrink: 0;
    }

    .acct-info { flex: 1; min-width: 0; }
    .acct-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .acct-meta { font-size: 11.5px; color: var(--text-tertiary); margin-top: 1px; }

    .acct-balance { text-align: right; margin-right: 12px; }
    .acct-amount { font-size: 14px; font-weight: 700; }
    .acct-change { font-size: 11px; margin-top: 1px; }

    .acct-bar-wrapper {
      display: flex; align-items: center; gap: 8px; width: 120px; flex-shrink: 0;
    }

    .acct-bar {
      flex: 1; height: 6px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .acct-bar-fill { height: 100%; border-radius: 10px; }
    .acct-bar-pct { font-size: 11px; color: var(--text-tertiary); width: 32px; }

    /* Currency */
    .currency-row {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .cur-flag { font-size: 18px; }
    .cur-info { min-width: 60px; }
    .cur-code { font-size: 12.5px; font-weight: 600; color: var(--text-primary); display: block; }
    .cur-name { font-size: 10.5px; color: var(--text-tertiary); display: block; }

    .cur-bar-wrapper { flex: 1; }
    .cur-bar { height: 6px; background: var(--border-light); border-radius: 10px; overflow: hidden; }
    .cur-bar-fill { height: 100%; border-radius: 10px; }

    .cur-amount { font-size: 12px; font-weight: 600; color: var(--text-primary); width: 64px; text-align: right; }
    .cur-pct { font-size: 11px; color: var(--text-tertiary); width: 32px; text-align: right; }

    /* Movement Summary */
    .movement-summary { display: flex; flex-direction: column; gap: 10px; }

    .mv-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; border-radius: var(--radius-sm);
      i { font-size: 20px; }
    }

    .mv-item.inflow  { background: #ECFDF5; i { color: #059669; } }
    .mv-item.outflow { background: #FEF2F2; i { color: #DC2626; } }
    .mv-item.net     { background: var(--bg-section); i { color: var(--text-secondary); } }

    .mv-label { font-size: 11.5px; color: var(--text-secondary); }
    .mv-value { font-size: 16px; font-weight: 700; }

    /* 7-Day Trend */
    .trend-chart {
      display: grid; grid-template-columns: repeat(7, 1fr);
      gap: 8px; padding: 8px 0;
    }

    .trend-col { text-align: center; }

    .trend-bars {
      display: flex; align-items: flex-end; justify-content: center;
      gap: 3px; height: 140px; margin-bottom: 8px;
    }

    .trend-bar {
      width: 20px; border-radius: 3px 3px 0 0;
      position: relative; min-height: 4px;
      transition: height 0.5s cubic-bezier(0.16,1,0.3,1);
    }

    .trend-bar.opening { background: #D1D5DB; }
    .trend-bar.closing { background: var(--primary); }

    .trend-val {
      position: absolute; top: -16px; left: 50%;
      transform: translateX(-50%);
      font-size: 9px; font-family: var(--font-mono);
      color: var(--text-tertiary); white-space: nowrap;
    }

    .trend-date { font-size: 11px; font-weight: 500; color: var(--text-secondary); }
    .trend-net { font-size: 10.5px; margin-top: 2px; }

    /* Transaction chips */
    .txn-type-chip {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11px; font-weight: 600; padding: 3px 8px;
      border-radius: 20px;
      i { font-size: 11px; }
    }

    .inflow-chip  { background: #ECFDF5; color: #059669; }
    .outflow-chip { background: #FEF2F2; color: #DC2626; }

    .chart-legend {
      display: flex; gap: 14px; font-size: 11px; color: var(--text-tertiary);
    }

    .legend-bar {
      display: inline-block; width: 14px; height: 10px;
      border-radius: 2px; vertical-align: middle; margin-right: 4px;
    }

    @media (max-width: 1100px) {
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
      .cash-grid { grid-template-columns: 1fr; }
      .trend-chart { grid-template-columns: repeat(4, 1fr); }
    }
  `]
})
export class CashPositionComponent {
  cashKpis = [
    { label: 'Total Cash', value: '$4.82M', trend: '↑ $320K', trendDir: 'positive', footnote: 'across all accounts', accent: 'teal' },
    { label: 'Available Cash', value: '$4.14M', trend: '86% of total', trendDir: '', footnote: 'unrestricted balance', accent: 'green' },
    { label: 'Restricted Cash', value: '$680K', trend: '14% of total', trendDir: '', footnote: 'escrow + deposits', accent: 'amber' },
    { label: 'Net Change Today', value: '+$320K', trend: '↑ 7.1%', trendDir: 'positive', footnote: 'inflows minus outflows', accent: 'blue' },
  ];

  accounts = [
    { name: 'Operating Account',     bank: 'JPMorgan Chase', type: 'Checking',   balance: '$2,840,000', change: '+$210K', changePositive: true,  pctOfTotal: 59, icon: 'bi-building',     iconBg: '#E8F5F1', iconColor: '#0D6B5C' },
    { name: 'Payroll Account',       bank: 'JPMorgan Chase', type: 'Checking',   balance: '$620,000',   change: '-$180K', changePositive: false, pctOfTotal: 13, icon: 'bi-people',       iconBg: '#EFF6FF', iconColor: '#2563EB' },
    { name: 'Savings Reserve',       bank: 'SVB',            type: 'Savings',    balance: '$480,000',   change: '+$0',    changePositive: true,  pctOfTotal: 10, icon: 'bi-piggy-bank',   iconBg: '#FEF3C7', iconColor: '#D97706' },
    { name: 'EUR Operating',         bank: 'Deutsche Bank',  type: 'Checking',   balance: '$412,000',   change: '+$86K',  changePositive: true,  pctOfTotal: 9,  icon: 'bi-currency-euro', iconBg: '#EDE9FE', iconColor: '#7C3AED' },
    { name: 'GBP Operating',         bank: 'Barclays',       type: 'Checking',   balance: '$288,000',   change: '+$24K',  changePositive: true,  pctOfTotal: 6,  icon: 'bi-currency-pound', iconBg: '#FCE7F3', iconColor: '#DB2777' },
    { name: 'Escrow Account',        bank: 'JPMorgan Chase', type: 'Restricted', balance: '$180,000',   change: '+$0',    changePositive: true,  pctOfTotal: 4,  icon: 'bi-lock',         iconBg: '#FEE2E2', iconColor: '#DC2626' },
  ];

  currencies = [
    { code: 'USD', name: 'US Dollar',      flag: '🇺🇸', amount: '$3.94M', pct: 82, color: '#0D6B5C' },
    { code: 'EUR', name: 'Euro',           flag: '🇪🇺', amount: '$412K',  pct: 9,  color: '#7C3AED' },
    { code: 'GBP', name: 'British Pound',  flag: '🇬🇧', amount: '$288K',  pct: 6,  color: '#DB2777' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', amount: '$160K',  pct: 3,  color: '#D97706' },
  ];

  dailyTrend = [
    { date: 'Jan 30', open: '$4.28M', close: '$4.32M', openH: 72, closeH: 74, net: '+$40K',  netPositive: true },
    { date: 'Jan 31', open: '$4.32M', close: '$4.38M', openH: 74, closeH: 76, net: '+$60K',  netPositive: true },
    { date: 'Feb 1',  open: '$4.38M', close: '$4.30M', openH: 76, closeH: 73, net: '-$80K',  netPositive: false },
    { date: 'Feb 2',  open: '$4.30M', close: '$4.42M', openH: 73, closeH: 78, net: '+$120K', netPositive: true },
    { date: 'Feb 3',  open: '$4.42M', close: '$4.50M', openH: 78, closeH: 80, net: '+$80K',  netPositive: true },
    { date: 'Feb 4',  open: '$4.50M', close: '$4.50M', openH: 80, closeH: 80, net: '$0',     netPositive: true },
    { date: 'Feb 5',  open: '$4.50M', close: '$4.82M', openH: 80, closeH: 88, net: '+$320K', netPositive: true },
  ];

  transactions = [
    { desc: 'Enterprise license — Acme Corp',    account: 'Operating',  type: 'Inflow',  amount: '+$420,000', isInflow: true,  time: '2:15 PM', status: 'Cleared',  statusClass: 'afda-badge-success' },
    { desc: 'AWS infrastructure payment',         account: 'Operating',  type: 'Outflow', amount: '-$182,000', isInflow: false, time: '11:30 AM', status: 'Cleared',  statusClass: 'afda-badge-success' },
    { desc: 'Monthly payroll disbursement',        account: 'Payroll',    type: 'Outflow', amount: '-$280,000', isInflow: false, time: '9:00 AM',  status: 'Cleared',  statusClass: 'afda-badge-success' },
    { desc: 'Client payment — TechVentures',      account: 'Operating',  type: 'Inflow',  amount: '+$340,000', isInflow: true,  time: '8:45 AM',  status: 'Pending',  statusClass: 'afda-badge-high' },
    { desc: 'Office lease payment',                account: 'Operating',  type: 'Outflow', amount: '-$60,000',  isInflow: false, time: '8:00 AM',  status: 'Cleared',  statusClass: 'afda-badge-success' },
    { desc: 'EUR wire — Munich client',            account: 'EUR Ops',    type: 'Inflow',  amount: '+€74,000',  isInflow: true,  time: '7:30 AM',  status: 'Pending',  statusClass: 'afda-badge-high' },
  ];
}