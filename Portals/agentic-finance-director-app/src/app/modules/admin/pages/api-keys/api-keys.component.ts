import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-api-keys',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/admin">Administration</a>
      <span class="separator">/</span>
      <span class="current">API Keys</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">API Keys</h1>
        <p class="afda-page-subtitle">Manage API credentials, access scopes, usage tracking, and key rotation</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-primary" (click)="showCreateModal = true">
          <i class="bi bi-plus-lg"></i> Create API Key
        </button>
      </div>
    </div>

    <!-- KPI Row -->
    <div class="kpi-row stagger">
      @for (kpi of kpis; track kpi.label) {
        <div class="afda-stat-card">
          <div class="accent-bar" [ngClass]="kpi.accent"></div>
          <div class="afda-stat-label">{{ kpi.label }}</div>
          <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-top: 8px;">
            <div class="afda-stat-value">{{ kpi.value }}</div>
            @if (kpi.trend) {
              <span class="afda-stat-trend" [ngClass]="kpi.trendDir">{{ kpi.trend }}</span>
            }
          </div>
          <div class="afda-stat-footnote">{{ kpi.footnote }}</div>
        </div>
      }
    </div>

    <!-- Expiration Warning -->
    <div class="notice-bar warning">
      <i class="bi bi-exclamation-triangle"></i>
      <span><strong>2 keys expiring within 14 days.</strong> Rotate or renew to avoid service disruption.</span>
      <button class="notice-action" (click)="activeFilter = 'Expiring Soon'">Review</button>
    </div>

    <!-- Filters -->
    <div class="filter-bar stagger">
      <div class="filter-search">
        <i class="bi bi-search"></i>
        <input type="text" placeholder="Search by name or prefix..." class="filter-search-input" (input)="onSearch($event)">
      </div>
      <div class="filter-chips">
        @for (f of statusFilters; track f) {
          <button class="filter-chip" [class.active]="activeFilter === f" (click)="activeFilter = f">{{ f }}</button>
        }
      </div>
    </div>

    <!-- Keys Table -->
    <div class="afda-card" style="animation: fadeUp 0.4s ease 0.08s both;">
      <table class="afda-table">
        <thead>
          <tr>
            <th>Key Name</th>
            <th>Key Prefix</th>
            <th>Scopes</th>
            <th>Status</th>
            <th>Created</th>
            <th>Expires</th>
            <th>Last Used</th>
            <th>Requests (30d)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (key of filteredKeys; track key.prefix) {
            <tr [class.expiring]="key.daysToExpiry !== null && key.daysToExpiry <= 14 && key.daysToExpiry > 0"
                [class.expired]="key.status === 'Expired'">
              <td>
                <div class="key-name-cell">
                  <i class="bi bi-key" [style.color]="getStatusColor(key.status)"></i>
                  <span class="key-name">{{ key.name }}</span>
                </div>
              </td>
              <td><code class="key-prefix font-mono">{{ key.prefix }}••••••••</code></td>
              <td>
                <div class="scope-chips">
                  @for (scope of key.scopes; track scope) {
                    <span class="scope-chip">{{ scope }}</span>
                  }
                </div>
              </td>
              <td>
                <span class="status-chip" [style.background]="getStatusBg(key.status)" [style.color]="getStatusColor(key.status)">
                  {{ key.status }}
                </span>
              </td>
              <td><span class="date-cell font-mono">{{ key.created }}</span></td>
              <td>
                <span class="date-cell font-mono" [class.expiring-text]="key.daysToExpiry !== null && key.daysToExpiry <= 14 && key.daysToExpiry > 0">
                  {{ key.expires }}
                </span>
                @if (key.daysToExpiry !== null && key.daysToExpiry <= 14 && key.daysToExpiry > 0) {
                  <span class="days-left">{{ key.daysToExpiry }}d left</span>
                }
              </td>
              <td><span class="date-cell font-mono">{{ key.lastUsed }}</span></td>
              <td>
                <div class="usage-cell">
                  <div class="usage-bar">
                    <div class="usage-bar-fill" [style.width.%]="(key.requests / maxRequests) * 100"
                         [style.background]="key.requests > 8000 ? '#D97706' : 'var(--primary)'"></div>
                  </div>
                  <span class="usage-count font-mono">{{ key.requestsDisplay }}</span>
                </div>
              </td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn" title="Copy Key ID"><i class="bi bi-clipboard"></i></button>
                  <button class="icon-btn" title="Rotate"><i class="bi bi-arrow-repeat"></i></button>
                  <button class="icon-btn danger" title="Revoke"><i class="bi bi-x-circle"></i></button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Analytics -->
    <div class="analytics-grid">
      <!-- Usage by Key -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.12s both;">
        <div class="afda-card-title" style="margin-bottom: 14px;">Request Volume by Key (30d)</div>
        @for (key of usageByKey; track key.name) {
          <div class="ubk-row">
            <span class="ubk-name">{{ key.name }}</span>
            <div class="ubk-bar">
              <div class="ubk-bar-fill" [style.width.%]="(key.requests / maxUsageKey) * 100" [style.background]="key.color"></div>
            </div>
            <span class="ubk-count font-mono">{{ key.display }}</span>
          </div>
        }
      </div>

      <!-- Top Endpoints -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.14s both;">
        <div class="afda-card-title" style="margin-bottom: 14px;">Top Endpoints by API Key Usage</div>
        @for (ep of topEndpoints; track ep.path) {
          <div class="tep-row">
            <span class="tep-method" [ngClass]="'method-' + ep.method.toLowerCase()">{{ ep.method }}</span>
            <span class="tep-path font-mono">{{ ep.path }}</span>
            <span class="tep-count font-mono">{{ ep.count }}</span>
          </div>
        }
      </div>

      <!-- Key Health -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.16s both;">
        <div class="afda-card-title" style="margin-bottom: 14px;">Key Health Summary</div>
        <div class="kh-grid">
          @for (item of keyHealth; track item.label) {
            <div class="kh-item">
              <div class="kh-icon" [style.background]="item.iconBg">
                <i [class]="'bi ' + item.icon" [style.color]="item.iconColor"></i>
              </div>
              <div>
                <div class="kh-value font-mono">{{ item.value }}</div>
                <div class="kh-label">{{ item.label }}</div>
              </div>
            </div>
          }
        </div>
        <div class="kh-recs">
          <div class="kh-rec-title">Recommendations</div>
          @for (rec of recommendations; track rec) {
            <div class="kh-rec">
              <i class="bi bi-lightbulb" style="color: var(--primary);"></i>
              <span>{{ rec }}</span>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    @if (showCreateModal) {
      <div class="modal-overlay" (click)="showCreateModal = false">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Create API Key</h3>
            <button class="modal-close" (click)="showCreateModal = false"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="modal-body">
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Key Name</label>
              <input type="text" class="form-input" placeholder="e.g., Production Agent Gateway">
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Description</label>
              <input type="text" class="form-input" placeholder="Used for agent orchestration API">
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Expiration</label>
              <select class="form-select">
                <option>30 days</option><option selected>90 days</option><option>180 days</option><option>1 year</option><option>No expiry</option>
              </select>
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Rate Limit</label>
              <select class="form-select">
                <option>100 req/min</option><option selected>500 req/min</option><option>1000 req/min</option><option>Unlimited</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Access Scopes</label>
              <div class="scope-selector">
                @for (scope of availableScopes; track scope.name) {
                  <div class="scope-option" [class.selected]="scope.selected" (click)="scope.selected = !scope.selected">
                    <i [class]="scope.selected ? 'bi bi-check-square-fill' : 'bi bi-square'" [style.color]="scope.selected ? 'var(--primary)' : 'var(--text-tertiary)'"></i>
                    <div>
                      <div class="so-name">{{ scope.name }}</div>
                      <div class="so-desc">{{ scope.desc }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="afda-btn afda-btn-outline" (click)="showCreateModal = false">Cancel</button>
            <button class="afda-btn afda-btn-primary" (click)="showCreateModal = false">
              <i class="bi bi-key"></i> Generate Key
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .kpi-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 16px; }

    .notice-bar {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 18px; border-radius: var(--radius-md);
      margin-bottom: 14px; font-size: 13px;
      animation: fadeUp 0.3s ease 0.04s both;
      &.warning { background: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; }
      i { font-size: 16px; }
    }

    .notice-action {
      margin-left: auto; padding: 4px 12px; font-size: 11px; font-weight: 600;
      border: 1px solid #D97706; border-radius: var(--radius-sm);
      background: transparent; color: #D97706; cursor: pointer; font-family: var(--font-sans);
      &:hover { background: #FEF3C7; }
    }

    .filter-bar { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }

    .filter-search {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 14px; background: var(--bg-card);
      border: 1px solid var(--border); border-radius: var(--radius-md);
      i { color: var(--text-tertiary); font-size: 14px; }
    }

    .filter-search-input {
      border: none; outline: none; background: transparent;
      font-size: 13px; font-family: var(--font-sans);
      color: var(--text-primary); width: 200px;
      &::placeholder { color: var(--text-tertiary); }
    }

    .filter-chips { display: flex; gap: 4px; }

    .filter-chip {
      padding: 5px 12px; font-size: 11.5px; font-weight: 500;
      border: 1px solid var(--border); border-radius: 20px;
      background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s; font-family: var(--font-sans);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 600; }
    }

    .key-name-cell { display: flex; align-items: center; gap: 8px; }
    .key-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }

    .key-prefix {
      font-size: 11px; padding: 3px 8px;
      background: var(--bg-section); border-radius: 4px; color: var(--text-secondary);
    }

    .scope-chips { display: flex; gap: 3px; flex-wrap: wrap; }

    .scope-chip {
      font-size: 9px; font-weight: 600; padding: 2px 6px;
      background: var(--primary-light); color: var(--primary); border-radius: 6px;
    }

    .status-chip {
      font-size: 10px; font-weight: 700; padding: 3px 10px;
      border-radius: 10px; text-transform: uppercase; letter-spacing: 0.3px;
    }

    .date-cell { font-size: 11.5px; color: var(--text-tertiary); }
    .expiring-text { color: #D97706 !important; font-weight: 600; }

    .days-left { display: block; font-size: 9px; font-weight: 700; color: #D97706; margin-top: 1px; }

    tr.expiring { background: #FFFDF7; }
    tr.expired { opacity: 0.5; }

    .usage-cell { display: flex; align-items: center; gap: 6px; min-width: 120px; }

    .usage-bar { flex: 1; height: 6px; background: var(--border-light); border-radius: 10px; overflow: hidden; }
    .usage-bar-fill { height: 100%; border-radius: 10px; }
    .usage-count { font-size: 11px; font-weight: 600; min-width: 36px; text-align: right; }

    .action-btns { display: flex; gap: 4px; }

    .icon-btn {
      width: 28px; height: 28px; border-radius: var(--radius-sm);
      border: 1px solid var(--border-light); background: var(--bg-white);
      display: grid; place-items: center; cursor: pointer;
      color: var(--text-tertiary); font-size: 12px; transition: all 0.1s;
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.danger:hover { border-color: #DC2626; color: #DC2626; }
    }

    .analytics-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 16px; }

    .ubk-row {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .ubk-name { font-size: 12px; color: var(--text-secondary); min-width: 110px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ubk-bar { flex: 1; height: 6px; background: var(--border-light); border-radius: 10px; overflow: hidden; }
    .ubk-bar-fill { height: 100%; border-radius: 10px; }
    .ubk-count { font-size: 11px; font-weight: 600; min-width: 40px; text-align: right; }

    .tep-row {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .tep-method {
      font-size: 9px; font-weight: 800; padding: 2px 6px;
      border-radius: 3px; font-family: var(--font-mono);
      &.method-get { background: #ECFDF5; color: #059669; }
      &.method-post { background: #EFF6FF; color: #2563EB; }
      &.method-put { background: #FEF3C7; color: #92400E; }
    }

    .tep-path { font-size: 11px; color: var(--text-primary); flex: 1; }
    .tep-count { font-size: 11px; font-weight: 700; }

    .kh-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

    .kh-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px; background: var(--bg-section); border-radius: var(--radius-sm);
    }

    .kh-icon {
      width: 30px; height: 30px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 13px; flex-shrink: 0;
    }

    .kh-value { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .kh-label { font-size: 10px; color: var(--text-tertiary); }

    .kh-recs { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-light); }

    .kh-rec-title {
      font-size: 10.5px; font-weight: 700; color: var(--text-tertiary);
      text-transform: uppercase; margin-bottom: 8px;
    }

    .kh-rec {
      display: flex; align-items: flex-start; gap: 8px;
      font-size: 12px; color: var(--text-secondary); padding: 4px 0;
      i { margin-top: 1px; }
    }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: grid; place-items: center; z-index: 1000;
    }

    .modal-panel {
      background: var(--bg-card); border-radius: var(--radius-lg);
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      width: 100%; max-width: 520px; overflow: hidden;
      animation: slideUp 0.2s ease;
    }

    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 18px 24px; border-bottom: 1px solid var(--border-light);
      h3 { margin: 0; font-size: 16px; }
    }

    .modal-close { background: none; border: none; font-size: 16px; color: var(--text-tertiary); cursor: pointer; }

    .modal-body { padding: 20px 24px; max-height: 60vh; overflow-y: auto; }

    .modal-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 14px 24px; border-top: 1px solid var(--border-light); background: var(--bg-section);
    }

    .form-label {
      font-size: 11px; font-weight: 600; color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-bottom: 4px;
    }

    .form-input, .form-select {
      width: 100%; padding: 9px 12px; border: 1px solid var(--border);
      border-radius: var(--radius-sm); font-size: 13px;
      background: var(--bg-section); color: var(--text-primary);
      font-family: var(--font-sans); outline: none; box-sizing: border-box;
      &:focus { border-color: var(--primary); }
    }

    .form-field { display: flex; flex-direction: column; }

    .scope-selector { display: flex; flex-direction: column; gap: 4px; }

    .scope-option {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 10px 12px; border: 1px solid var(--border-light);
      border-radius: var(--radius-sm); cursor: pointer; transition: all 0.1s;
      &:hover { border-color: var(--border); }
      &.selected { border-color: var(--primary); background: var(--primary-subtle); }
      i { font-size: 16px; margin-top: 1px; }
    }

    .so-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .so-desc { font-size: 11px; color: var(--text-tertiary); }

    @media (max-width: 1200px) {
      .kpi-row { grid-template-columns: repeat(3, 1fr); }
      .analytics-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ApiKeysComponent {
  activeFilter = 'All';
  searchTerm = '';
  showCreateModal = false;

  statusFilters = ['All', 'Active', 'Expiring Soon', 'Expired', 'Revoked'];

  kpis = [
    { label: 'Total Keys', value: '8', trend: null, trendDir: '', footnote: 'across all environments', accent: 'teal' },
    { label: 'Active Keys', value: '6', trend: null, trendDir: '', footnote: '2 expired / revoked', accent: 'green' },
    { label: 'Total Requests (30d)', value: '48.2K', trend: '↑ 12%', trendDir: 'neutral', footnote: 'across all keys', accent: 'blue' },
    { label: 'Avg Key Age', value: '64d', trend: null, trendDir: '', footnote: 'recommended < 90d', accent: 'purple' },
    { label: 'Expiring < 14d', value: '2', trend: null, trendDir: '', footnote: 'action required', accent: 'red' },
  ];

  maxRequests = 14200;

  apiKeys = [
    { name: 'Production Agent Gateway', prefix: 'afk_prod_8x2', scopes: ['agents', 'chat', 'runs'], status: 'Active', created: 'Nov 12, 2025', expires: 'Feb 10, 2026', daysToExpiry: 4, lastUsed: '2 min ago', requests: 14200, requestsDisplay: '14.2K' },
    { name: 'Flask CRUD Internal', prefix: 'afk_int_3m9', scopes: ['transactions', 'journal', 'recon'], status: 'Active', created: 'Dec 1, 2025', expires: 'Mar 1, 2026', daysToExpiry: 23, lastUsed: '5 min ago', requests: 12800, requestsDisplay: '12.8K' },
    { name: 'Staging Environment', prefix: 'afk_stg_7k1', scopes: ['agents', 'transactions', 'chat'], status: 'Active', created: 'Jan 8, 2026', expires: 'Apr 8, 2026', daysToExpiry: 61, lastUsed: '1h ago', requests: 8400, requestsDisplay: '8.4K' },
    { name: 'CI/CD Pipeline', prefix: 'afk_ci_2n4', scopes: ['health', 'metrics'], status: 'Active', created: 'Jan 15, 2026', expires: 'Apr 15, 2026', daysToExpiry: 68, lastUsed: '22 min ago', requests: 6200, requestsDisplay: '6.2K' },
    { name: 'Webhook Integration', prefix: 'afk_wh_9p6', scopes: ['webhooks', 'alerts'], status: 'Active', created: 'Dec 20, 2025', expires: 'Feb 18, 2026', daysToExpiry: 12, lastUsed: '4h ago', requests: 3800, requestsDisplay: '3.8K' },
    { name: 'n8n Orchestrator', prefix: 'afk_n8n_5r2', scopes: ['agents', 'workflows'], status: 'Active', created: 'Jan 20, 2026', expires: 'Jul 20, 2026', daysToExpiry: 164, lastUsed: '12 min ago', requests: 2400, requestsDisplay: '2.4K' },
    { name: 'Legacy ERP Sync', prefix: 'afk_erp_1t8', scopes: ['transactions'], status: 'Expired', created: 'Aug 15, 2025', expires: 'Nov 15, 2025', daysToExpiry: null, lastUsed: 'Nov 14', requests: 320, requestsDisplay: '320' },
    { name: 'Test Key (Dev)', prefix: 'afk_dev_4j7', scopes: ['all'], status: 'Revoked', created: 'Oct 1, 2025', expires: '—', daysToExpiry: null, lastUsed: 'Oct 22', requests: 84, requestsDisplay: '84' },
  ];

  get filteredKeys() {
    let result = this.apiKeys;
    if (this.activeFilter === 'Active') result = result.filter(k => k.status === 'Active');
    else if (this.activeFilter === 'Expiring Soon') result = result.filter(k => k.daysToExpiry !== null && k.daysToExpiry <= 14 && k.daysToExpiry > 0);
    else if (this.activeFilter === 'Expired') result = result.filter(k => k.status === 'Expired');
    else if (this.activeFilter === 'Revoked') result = result.filter(k => k.status === 'Revoked');
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(k => k.name.toLowerCase().includes(t) || k.prefix.toLowerCase().includes(t));
    }
    return result;
  }

  usageByKey = [
    { name: 'Prod Agent Gateway', requests: 14200, display: '14.2K', color: '#0D6B5C' },
    { name: 'Flask CRUD Internal', requests: 12800, display: '12.8K', color: '#2563EB' },
    { name: 'Staging Environment', requests: 8400, display: '8.4K', color: '#7C3AED' },
    { name: 'CI/CD Pipeline', requests: 6200, display: '6.2K', color: '#059669' },
    { name: 'Webhook Integration', requests: 3800, display: '3.8K', color: '#D97706' },
    { name: 'n8n Orchestrator', requests: 2400, display: '2.4K', color: '#DC2626' },
  ];

  get maxUsageKey() { return Math.max(...this.usageByKey.map(k => k.requests)); }

  topEndpoints = [
    { method: 'GET', path: '/api/v1/transactions', count: '12,800' },
    { method: 'POST', path: '/api/v1/agents/:id/run', count: '8,420' },
    { method: 'POST', path: '/api/v1/chat', count: '6,340' },
    { method: 'GET', path: '/api/v1/health', count: '6,200' },
    { method: 'POST', path: '/api/v1/journal-entries', count: '2,180' },
    { method: 'GET', path: '/api/v1/alerts', count: '1,840' },
  ];

  keyHealth = [
    { label: 'Avg Age', value: '64d', icon: 'bi-clock', iconBg: '#EFF6FF', iconColor: '#2563EB' },
    { label: 'Oldest Key', value: '175d', icon: 'bi-hourglass', iconBg: '#FEF3C7', iconColor: '#D97706' },
    { label: 'Unused Keys', value: '0', icon: 'bi-check-circle', iconBg: '#ECFDF5', iconColor: '#059669' },
    { label: 'Revoked (90d)', value: '1', icon: 'bi-x-circle', iconBg: '#FEE2E2', iconColor: '#DC2626' },
  ];

  recommendations = [
    'Rotate "Production Agent Gateway" — expires in 4 days',
    'Rotate "Webhook Integration" — expires in 12 days',
    'Consider revoking "Legacy ERP Sync" — expired and unused',
  ];

  availableScopes: any[] = [
    { name: 'agents', desc: 'Agent execution, configuration, run history', selected: true },
    { name: 'chat', desc: 'Natural language chat with financial data', selected: true },
    { name: 'transactions', desc: 'GL transactions, journal entries, invoices', selected: false },
    { name: 'forecasts', desc: 'Cash flow and revenue forecasts', selected: false },
    { name: 'webhooks', desc: 'Webhook event subscriptions', selected: false },
    { name: 'health', desc: 'System health and metrics endpoints', selected: false },
    { name: 'admin', desc: 'User management and system configuration', selected: false },
  ];

  getStatusColor(status: string): string {
    const m: any = { Active: '#059669', Expired: '#6B7280', Revoked: '#DC2626' };
    return m[status] || '#6B7280';
  }

  getStatusBg(status: string): string {
    const m: any = { Active: '#ECFDF5', Expired: '#F3F4F6', Revoked: '#FEE2E2' };
    return m[status] || '#F3F4F6';
  }

  onSearch(event: Event) { this.searchTerm = (event.target as HTMLInputElement).value; }
}