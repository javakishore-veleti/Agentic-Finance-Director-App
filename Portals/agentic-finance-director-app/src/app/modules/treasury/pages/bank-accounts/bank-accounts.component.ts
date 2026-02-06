import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-treasury-bank-accounts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/treasury/cash-position">Treasury</a>
      <span class="separator">/</span>
      <span class="current">Bank Accounts</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Bank Accounts</h1>
        <p class="afda-page-subtitle">Account directory, connectivity status, and reconciliation overview</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-arrow-repeat"></i> Sync All
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-plus-lg"></i> Add Account
        </button>
      </div>
    </div>

    <!-- Summary Strip -->
    <div class="summary-strip stagger">
      @for (s of summaryItems; track s.label) {
        <div class="summary-card">
          <div class="sc-icon" [style.background]="s.iconBg">
            <i [class]="'bi ' + s.icon" [style.color]="s.iconColor"></i>
          </div>
          <div>
            <div class="sc-value font-mono">{{ s.value }}</div>
            <div class="sc-label">{{ s.label }}</div>
          </div>
        </div>
      }
    </div>

    <!-- Account Cards -->
    <div class="accounts-grid stagger">
      @for (acct of accounts; track acct.id) {
        <div class="account-card">
          <!-- Card Header -->
          <div class="ac-header">
            <div class="ac-bank-logo" [style.background]="acct.logoBg">
              <i [class]="'bi ' + acct.logoIcon" [style.color]="acct.logoColor"></i>
            </div>
            <div class="ac-header-info">
              <div class="ac-name">{{ acct.name }}</div>
              <div class="ac-bank">{{ acct.bank }}</div>
            </div>
            <div class="ac-status-dot" [style.background]="acct.connected ? '#059669' : '#DC2626'"
                 [title]="acct.connected ? 'Connected' : 'Disconnected'"></div>
          </div>

          <!-- Balance -->
          <div class="ac-balance-section">
            <div class="ac-balance-label">Current Balance</div>
            <div class="ac-balance font-mono">{{ acct.balance }}</div>
            <div class="ac-balance-change font-mono" [class]="acct.changePositive ? 'text-favorable' : 'text-unfavorable'">
              {{ acct.change }} today
            </div>
          </div>

          <!-- Mini Sparkline -->
          <div class="ac-sparkline">
            @for (pt of acct.sparkline; track $index) {
              <div class="spark-bar" [style.height.%]="pt" [style.background]="acct.sparkColor"></div>
            }
          </div>

          <!-- Details Grid -->
          <div class="ac-details">
            <div class="ac-detail">
              <span class="acd-label">Account #</span>
              <span class="acd-value font-mono">{{ acct.accountNum }}</span>
            </div>
            <div class="ac-detail">
              <span class="acd-label">Currency</span>
              <span class="acd-value">{{ acct.currency }}</span>
            </div>
            <div class="ac-detail">
              <span class="acd-label">Type</span>
              <span class="acd-value">{{ acct.type }}</span>
            </div>
            <div class="ac-detail">
              <span class="acd-label">Last Synced</span>
              <span class="acd-value">{{ acct.lastSync }}</span>
            </div>
          </div>

          <!-- Recon Status -->
          <div class="ac-recon">
            <div class="ac-recon-header">
              <span class="ac-recon-label">Reconciliation</span>
              <span class="afda-badge" [ngClass]="acct.reconClass">{{ acct.reconStatus }}</span>
            </div>
            <div class="ac-recon-bar">
              <div class="ac-recon-fill" [style.width.%]="acct.reconPct" [style.background]="acct.reconColor"></div>
            </div>
            <div class="ac-recon-meta">{{ acct.reconPct }}% matched · {{ acct.reconPending }} items pending</div>
          </div>

          <!-- Actions -->
          <div class="ac-actions">
            <button class="afda-btn afda-btn-outline" style="flex: 1; font-size: 11.5px; padding: 6px 10px; justify-content: center;">
              <i class="bi bi-arrow-repeat"></i> Sync
            </button>
            <button class="afda-btn afda-btn-outline" style="flex: 1; font-size: 11.5px; padding: 6px 10px; justify-content: center;">
              <i class="bi bi-journal-check"></i> Reconcile
            </button>
            <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 6px 10px;">
              <i class="bi bi-three-dots"></i>
            </button>
          </div>
        </div>
      }
    </div>

    <!-- Integration + Activity Log -->
    <div class="connect-grid">
      <!-- Integration Status -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.16s both;">
        <div class="afda-card-title" style="margin-bottom: 14px;">Bank Integration Status</div>
        @for (intg of integrations; track intg.bank) {
          <div class="intg-row">
            <div class="intg-bank">
              <div class="intg-icon" [style.background]="intg.iconBg">
                <i [class]="'bi ' + intg.icon" [style.color]="intg.iconColor"></i>
              </div>
              <div>
                <div class="intg-name">{{ intg.bank }}</div>
                <div class="intg-method">{{ intg.method }}</div>
              </div>
            </div>
            <div class="intg-stats">
              <div class="intg-stat">
                <span class="intg-stat-val font-mono">{{ intg.uptime }}</span>
                <span class="intg-stat-label">Uptime</span>
              </div>
              <div class="intg-stat">
                <span class="intg-stat-val font-mono">{{ intg.latency }}</span>
                <span class="intg-stat-label">Latency</span>
              </div>
            </div>
            <span class="afda-badge" [ngClass]="intg.statusClass">{{ intg.statusLabel }}</span>
          </div>
        }
      </div>

      <!-- Activity Log -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.18s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Sync Activity Log</div>
          <button class="afda-btn afda-btn-outline" style="font-size: 11px; padding: 4px 10px;">View all</button>
        </div>
        @for (log of activityLog; track log.time) {
          <div class="log-item">
            <div class="log-dot" [style.background]="log.color"></div>
            <div class="log-content">
              <span class="log-msg">{{ log.message }}</span>
              <span class="log-time">{{ log.time }}</span>
            </div>
            <span class="afda-badge" [ngClass]="log.badgeClass" style="font-size: 9px;">{{ log.badge }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Summary Strip */
    .summary-strip {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px; margin-bottom: 20px;
    }

    .summary-card {
      display: flex; align-items: center; gap: 14px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 16px 20px;
      box-shadow: var(--shadow-card);
      animation: fadeUp 0.4s ease both;
    }

    .sc-icon {
      width: 42px; height: 42px; border-radius: var(--radius-md);
      display: grid; place-items: center; font-size: 18px; flex-shrink: 0;
    }

    .sc-value { font-size: 20px; font-weight: 700; color: var(--text-primary); }
    .sc-label { font-size: 11.5px; color: var(--text-tertiary); margin-top: 1px; }

    /* Account Cards */
    .accounts-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 14px; margin-bottom: 20px;
    }

    .account-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 20px;
      box-shadow: var(--shadow-card);
      animation: fadeUp 0.4s ease both;
      transition: border-color 0.15s, box-shadow 0.15s;
      &:hover { border-color: #D1D5DB; box-shadow: var(--shadow-md); }
    }

    .ac-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
    }

    .ac-bank-logo {
      width: 40px; height: 40px; border-radius: var(--radius-md);
      display: grid; place-items: center; font-size: 18px; flex-shrink: 0;
    }

    .ac-header-info { flex: 1; }
    .ac-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .ac-bank { font-size: 11.5px; color: var(--text-tertiary); }

    .ac-status-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
      box-shadow: 0 0 0 3px rgba(5,150,105,0.15);
    }

    .ac-balance-section { margin-bottom: 12px; }
    .ac-balance-label { font-size: 10.5px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; }
    .ac-balance { font-size: 24px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.5px; }
    .ac-balance-change { font-size: 12px; margin-top: 2px; }

    /* Sparkline */
    .ac-sparkline {
      display: flex; align-items: flex-end; gap: 2px;
      height: 32px; margin-bottom: 14px; padding: 4px 0;
    }

    .spark-bar {
      flex: 1; border-radius: 2px; min-height: 3px;
      opacity: 0.6; transition: height 0.3s ease;
    }

    /* Details Grid */
    .ac-details {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      padding: 12px; background: var(--bg-section);
      border-radius: var(--radius-sm); margin-bottom: 14px;
    }

    .acd-label { display: block; font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; }
    .acd-value { display: block; font-size: 12px; font-weight: 600; color: var(--text-primary); margin-top: 1px; }

    /* Recon */
    .ac-recon { margin-bottom: 14px; }

    .ac-recon-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;
    }

    .ac-recon-label { font-size: 11px; font-weight: 600; color: var(--text-secondary); }

    .ac-recon-bar {
      height: 6px; background: var(--border-light);
      border-radius: 10px; overflow: hidden; margin-bottom: 4px;
    }

    .ac-recon-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }
    .ac-recon-meta { font-size: 10.5px; color: var(--text-tertiary); }

    .ac-actions { display: flex; gap: 6px; }

    /* Integration Grid */
    .connect-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    }

    .intg-row {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .intg-bank { display: flex; align-items: center; gap: 10px; flex: 1; }

    .intg-icon {
      width: 34px; height: 34px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 15px;
    }

    .intg-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .intg-method { font-size: 11px; color: var(--text-tertiary); }

    .intg-stats { display: flex; gap: 16px; }
    .intg-stat { text-align: center; }
    .intg-stat-val { font-size: 13px; font-weight: 700; color: var(--text-primary); display: block; }
    .intg-stat-label { font-size: 9.5px; color: var(--text-tertiary); text-transform: uppercase; }

    /* Activity Log */
    .log-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .log-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .log-content { flex: 1; }
    .log-msg { font-size: 12.5px; color: var(--text-primary); display: block; }
    .log-time { font-size: 11px; color: var(--text-tertiary); }

    @media (max-width: 1100px) {
      .summary-strip { grid-template-columns: repeat(2, 1fr); }
      .accounts-grid { grid-template-columns: 1fr; }
      .connect-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class BankAccountsComponent {
  summaryItems = [
    { value: '6', label: 'Total Accounts', icon: 'bi-bank', iconBg: '#E8F5F1', iconColor: '#0D6B5C' },
    { value: '$4.82M', label: 'Combined Balance', icon: 'bi-wallet2', iconBg: '#EFF6FF', iconColor: '#2563EB' },
    { value: '5/6', label: 'Connected', icon: 'bi-link-45deg', iconBg: '#ECFDF5', iconColor: '#059669' },
    { value: '97.2%', label: 'Avg Recon Rate', icon: 'bi-check2-all', iconBg: '#FEF3C7', iconColor: '#D97706' },
  ];

  accounts = [
    {
      id: 1, name: 'Operating Account', bank: 'JPMorgan Chase', balance: '$2,840,000',
      change: '+$210,000', changePositive: true, connected: true,
      accountNum: '****4821', currency: 'USD', type: 'Checking', lastSync: '2 min ago',
      reconStatus: 'Matched', reconClass: 'afda-badge-success', reconPct: 100, reconPending: 0, reconColor: '#059669',
      logoBg: '#E8F5F1', logoIcon: 'bi-building', logoColor: '#0D6B5C',
      sparkline: [40, 55, 48, 60, 52, 65, 58, 70, 62, 75, 68, 80, 72, 85],
      sparkColor: '#0D6B5C'
    },
    {
      id: 2, name: 'Payroll Account', bank: 'JPMorgan Chase', balance: '$620,000',
      change: '-$180,000', changePositive: false, connected: true,
      accountNum: '****4822', currency: 'USD', type: 'Checking', lastSync: '2 min ago',
      reconStatus: 'Matched', reconClass: 'afda-badge-success', reconPct: 100, reconPending: 0, reconColor: '#059669',
      logoBg: '#EFF6FF', logoIcon: 'bi-people', logoColor: '#2563EB',
      sparkline: [70, 65, 60, 55, 68, 62, 55, 50, 65, 58, 50, 45, 55, 48],
      sparkColor: '#2563EB'
    },
    {
      id: 3, name: 'Savings Reserve', bank: 'SVB', balance: '$480,000',
      change: '+$0', changePositive: true, connected: true,
      accountNum: '****7310', currency: 'USD', type: 'Savings', lastSync: '15 min ago',
      reconStatus: 'Matched', reconClass: 'afda-badge-success', reconPct: 100, reconPending: 0, reconColor: '#059669',
      logoBg: '#FEF3C7', logoIcon: 'bi-piggy-bank', logoColor: '#D97706',
      sparkline: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
      sparkColor: '#D97706'
    },
    {
      id: 4, name: 'EUR Operating', bank: 'Deutsche Bank', balance: '€378,000',
      change: '+€74,000', changePositive: true, connected: true,
      accountNum: '****6190', currency: 'EUR', type: 'Checking', lastSync: '8 min ago',
      reconStatus: '3 Pending', reconClass: 'afda-badge-high', reconPct: 88, reconPending: 3, reconColor: '#D97706',
      logoBg: '#EDE9FE', logoIcon: 'bi-currency-euro', logoColor: '#7C3AED',
      sparkline: [30, 35, 42, 38, 45, 50, 46, 52, 48, 55, 50, 58, 55, 62],
      sparkColor: '#7C3AED'
    },
    {
      id: 5, name: 'GBP Operating', bank: 'Barclays', balance: '£228,000',
      change: '+£19,000', changePositive: true, connected: true,
      accountNum: '****3845', currency: 'GBP', type: 'Checking', lastSync: '12 min ago',
      reconStatus: '1 Pending', reconClass: 'afda-badge-high', reconPct: 96, reconPending: 1, reconColor: '#D97706',
      logoBg: '#FCE7F3', logoIcon: 'bi-currency-pound', logoColor: '#DB2777',
      sparkline: [35, 38, 40, 42, 38, 44, 40, 46, 42, 48, 45, 50, 48, 52],
      sparkColor: '#DB2777'
    },
    {
      id: 6, name: 'Escrow Account', bank: 'JPMorgan Chase', balance: '$180,000',
      change: '+$0', changePositive: true, connected: false,
      accountNum: '****4825', currency: 'USD', type: 'Restricted', lastSync: 'Manual only',
      reconStatus: 'Manual', reconClass: 'afda-badge-medium', reconPct: 100, reconPending: 0, reconColor: '#6B7280',
      logoBg: '#FEE2E2', logoIcon: 'bi-lock', logoColor: '#DC2626',
      sparkline: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
      sparkColor: '#9CA3AF'
    },
  ];

  integrations = [
    { bank: 'JPMorgan Chase', method: 'Plaid API v2.1', icon: 'bi-building', iconBg: '#E8F5F1', iconColor: '#0D6B5C', statusLabel: 'Healthy', statusClass: 'afda-badge-success', uptime: '99.8%', latency: '142ms' },
    { bank: 'SVB',            method: 'Plaid API v2.1', icon: 'bi-building', iconBg: '#FEF3C7', iconColor: '#D97706', statusLabel: 'Healthy', statusClass: 'afda-badge-success', uptime: '99.2%', latency: '165ms' },
    { bank: 'Deutsche Bank',  method: 'PSD2 / SWIFT',   icon: 'bi-globe',    iconBg: '#EDE9FE', iconColor: '#7C3AED', statusLabel: 'Healthy', statusClass: 'afda-badge-success', uptime: '98.6%', latency: '218ms' },
    { bank: 'Barclays',       method: 'Open Banking UK', icon: 'bi-globe',    iconBg: '#FCE7F3', iconColor: '#DB2777', statusLabel: 'Healthy', statusClass: 'afda-badge-success', uptime: '99.1%', latency: '195ms' },
  ];

  activityLog = [
    { message: 'JPMorgan Operating — 6 transactions synced', time: '2:17 PM', color: '#059669', badge: 'Success', badgeClass: 'afda-badge-success' },
    { message: 'JPMorgan Payroll — payroll disbursement posted', time: '9:02 AM', color: '#059669', badge: 'Success', badgeClass: 'afda-badge-success' },
    { message: 'Deutsche Bank — EUR wire received, pending match', time: '8:45 AM', color: '#D97706', badge: 'Pending', badgeClass: 'afda-badge-high' },
    { message: 'Barclays — GBP balance sync completed', time: '8:30 AM', color: '#059669', badge: 'Success', badgeClass: 'afda-badge-success' },
    { message: 'SVB Savings — daily balance snapshot', time: '7:00 AM', color: '#059669', badge: 'Success', badgeClass: 'afda-badge-success' },
    { message: 'Escrow — manual import reminder sent', time: 'Yesterday', color: '#6B7280', badge: 'Info', badgeClass: 'afda-badge-medium' },
    { message: 'JPMorgan Operating — daily recon completed', time: 'Yesterday', color: '#059669', badge: 'Success', badgeClass: 'afda-badge-success' },
  ];
}