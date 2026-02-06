import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, ApiKeyOut } from '../../services/admin.service';

interface DisplayKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  status: string;
  created: string;
  expires: string;
  daysToExpiry: number | null;
  lastUsed: string;
  isActive: boolean;
}

@Component({
  selector: 'afda-api-keys',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

    <!-- Loading -->
    @if (loading) {
      <div class="loading-bar"><div class="loading-bar-fill"></div></div>
    }

    <!-- Error -->
    @if (errorMsg) {
      <div class="notice-bar error">
        <i class="bi bi-exclamation-triangle"></i>
        <span>{{ errorMsg }}</span>
        <button class="notice-action" (click)="loadKeys()">Retry</button>
      </div>
    }

    <!-- KPI Row -->
    <div class="kpi-row stagger">
      @for (kpi of kpis; track kpi.label) {
        <div class="afda-stat-card">
          <div class="accent-bar" [ngClass]="kpi.accent"></div>
          <div class="afda-stat-label">{{ kpi.label }}</div>
          <div class="afda-stat-value" style="margin-top: 8px;">{{ kpi.value }}</div>
          <div class="afda-stat-footnote">{{ kpi.footnote }}</div>
        </div>
      }
    </div>

    <!-- Expiring Warning -->
    @if (expiringCount > 0) {
      <div class="notice-bar warning">
        <i class="bi bi-exclamation-triangle"></i>
        <span><strong>{{ expiringCount }} key(s) expiring within 14 days.</strong> Rotate or renew to avoid service disruption.</span>
        <button class="notice-action" (click)="activeFilter = 'Expiring'">Review</button>
      </div>
    }

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
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (key of filteredKeys; track key.id) {
            <tr [class.expiring]="key.daysToExpiry !== null && key.daysToExpiry <= 14 && key.daysToExpiry > 0"
                [class.expired]="key.status === 'Revoked'">
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
                  @if (key.scopes.length === 0) {
                    <span class="scope-chip" style="background: #F3F4F6; color: #6B7280;">none</span>
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
                <div class="action-btns">
                  @if (key.isActive) {
                    <button class="icon-btn danger" title="Revoke" (click)="revokeKey(key)">
                      <i class="bi bi-x-circle"></i>
                    </button>
                  }
                </div>
              </td>
            </tr>
          }
          @if (filteredKeys.length === 0 && !loading) {
            <tr><td colspan="8" style="text-align:center; padding: 40px; color: var(--text-tertiary);">No API keys found</td></tr>
          }
        </tbody>
      </table>
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
              <input type="text" class="form-input" placeholder="e.g., Production Agent Gateway" [(ngModel)]="createForm.name">
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Expiration (days)</label>
              <select class="form-select" [(ngModel)]="createForm.expires_in_days">
                <option [ngValue]="30">30 days</option>
                <option [ngValue]="90">90 days</option>
                <option [ngValue]="180">180 days</option>
                <option [ngValue]="365">1 year</option>
                <option [ngValue]="null">No expiry</option>
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
            @if (createError) {
              <div class="form-error" style="margin-top: 10px;">{{ createError }}</div>
            }
          </div>
          <div class="modal-footer">
            <button class="afda-btn afda-btn-outline" (click)="showCreateModal = false">Cancel</button>
            <button class="afda-btn afda-btn-primary" (click)="generateKey()" [disabled]="creating">
              <i class="bi bi-key"></i> {{ creating ? 'Generating...' : 'Generate Key' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Key Created Modal -->
    @if (newKeyValue) {
      <div class="modal-overlay">
        <div class="modal-panel">
          <div class="modal-header" style="background: #ECFDF5;">
            <h3 style="color: #059669;"><i class="bi bi-check-circle-fill"></i> API Key Generated</h3>
          </div>
          <div class="modal-body">
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
              Copy this key now — it won't be shown again.
            </p>
            <div class="key-display">
              <code class="font-mono">{{ newKeyValue }}</code>
              <button class="copy-btn" (click)="copyKey()">
                <i class="bi bi-clipboard"></i> Copy
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="afda-btn afda-btn-primary" (click)="newKeyValue = ''">Done</button>
          </div>
        </div>
      </div>
    }

    <!-- Success Toast -->
    @if (successMsg) {
      <div class="toast-success">
        <i class="bi bi-check-circle-fill"></i> {{ successMsg }}
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .loading-bar { height: 3px; background: var(--border-light); border-radius: 2px; overflow: hidden; margin-bottom: 12px; }
    .loading-bar-fill { height: 100%; width: 30%; background: var(--primary); border-radius: 2px; animation: loadingSlide 1.2s ease infinite; }
    @keyframes loadingSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }

    .notice-bar { display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: var(--radius-md); margin-bottom: 14px; font-size: 13px; animation: fadeUp 0.3s ease both; }
    .notice-bar.error { background: #FEF2F2; border: 1px solid #FCA5A5; color: #DC2626; }
    .notice-bar.warning { background: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; }
    .notice-action { margin-left: auto; padding: 4px 12px; font-size: 11px; font-weight: 600; border: 1px solid currentColor; border-radius: var(--radius-sm); background: transparent; color: inherit; cursor: pointer; font-family: var(--font-sans); }

    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
    .filter-bar { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
    .filter-search { display: flex; align-items: center; gap: 8px; padding: 6px 14px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); i { color: var(--text-tertiary); font-size: 14px; } }
    .filter-search-input { border: none; outline: none; background: transparent; font-size: 13px; font-family: var(--font-sans); color: var(--text-primary); width: 200px; &::placeholder { color: var(--text-tertiary); } }
    .filter-chips { display: flex; gap: 4px; }
    .filter-chip { padding: 5px 12px; font-size: 11.5px; font-weight: 500; border: 1px solid var(--border); border-radius: 20px; background: var(--bg-white); color: var(--text-secondary); cursor: pointer; transition: all 0.15s; font-family: var(--font-sans); &:hover { border-color: var(--primary); color: var(--primary); } &.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 600; } }

    .key-name-cell { display: flex; align-items: center; gap: 8px; }
    .key-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .key-prefix { font-size: 11px; padding: 3px 8px; background: var(--bg-section); border-radius: 4px; color: var(--text-secondary); }
    .scope-chips { display: flex; gap: 3px; flex-wrap: wrap; }
    .scope-chip { font-size: 9px; font-weight: 600; padding: 2px 6px; background: var(--primary-light); color: var(--primary); border-radius: 6px; }
    .status-chip { font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.3px; }
    .date-cell { font-size: 11.5px; color: var(--text-tertiary); }
    .expiring-text { color: #D97706 !important; font-weight: 600; }
    .days-left { display: block; font-size: 9px; font-weight: 700; color: #D97706; margin-top: 1px; }
    tr.expiring { background: #FFFDF7; }
    tr.expired { opacity: 0.5; }

    .action-btns { display: flex; gap: 4px; }
    .icon-btn { width: 28px; height: 28px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); background: var(--bg-white); display: grid; place-items: center; cursor: pointer; color: var(--text-tertiary); font-size: 12px; transition: all 0.1s; &:hover { border-color: var(--primary); color: var(--primary); } &.danger:hover { border-color: #DC2626; color: #DC2626; } }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: grid; place-items: center; z-index: 1000; }
    .modal-panel { background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: 0 20px 60px rgba(0,0,0,0.2); width: 100%; max-width: 520px; overflow: hidden; animation: slideUp 0.2s ease; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1px solid var(--border-light); h3 { margin: 0; font-size: 16px; } }
    .modal-close { background: none; border: none; font-size: 16px; color: var(--text-tertiary); cursor: pointer; }
    .modal-body { padding: 20px 24px; max-height: 60vh; overflow-y: auto; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 24px; border-top: 1px solid var(--border-light); background: var(--bg-section); }
    .form-label { font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-bottom: 4px; }
    .form-input, .form-select { width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; background: var(--bg-section); color: var(--text-primary); font-family: var(--font-sans); outline: none; box-sizing: border-box; &:focus { border-color: var(--primary); } }
    .form-field { display: flex; flex-direction: column; }
    .form-error { padding: 8px 12px; background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: var(--radius-sm); color: #DC2626; font-size: 12px; }

    .scope-selector { display: flex; flex-direction: column; gap: 4px; }
    .scope-option { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border: 1px solid var(--border-light); border-radius: var(--radius-sm); cursor: pointer; transition: all 0.1s; &:hover { border-color: var(--border); } &.selected { border-color: var(--primary); background: var(--primary-subtle, #F0FDF4); } i { font-size: 16px; margin-top: 1px; } }
    .so-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .so-desc { font-size: 11px; color: var(--text-tertiary); }

    .key-display { display: flex; align-items: center; gap: 8px; padding: 12px 14px; background: #F8FAFC; border: 1px solid var(--border); border-radius: var(--radius-sm); code { flex: 1; font-size: 12px; word-break: break-all; color: var(--text-primary); } }
    .copy-btn { display: flex; align-items: center; gap: 4px; padding: 6px 12px; font-size: 11px; font-weight: 600; border: 1px solid var(--primary); border-radius: var(--radius-sm); background: var(--primary-light); color: var(--primary); cursor: pointer; font-family: var(--font-sans); &:hover { background: var(--primary); color: white; } }

    .toast-success { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; background: #059669; color: white; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; z-index: 2000; animation: slideUp 0.3s ease; box-shadow: 0 8px 24px rgba(5,150,105,0.3); }

    @media (max-width: 1200px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class ApiKeysComponent implements OnInit {
  private adminService = inject(AdminService);

  activeFilter = 'All';
  searchTerm = '';
  showCreateModal = false;
  loading = true;
  errorMsg = '';
  successMsg = '';
  creating = false;
  createError = '';
  newKeyValue = '';

  statusFilters = ['All', 'Active', 'Expiring', 'Revoked'];

  apiKeys: DisplayKey[] = [];

  createForm = { name: '', expires_in_days: 90 as number | null };

  availableScopes: { name: string; desc: string; selected: boolean }[] = [
    { name: 'agents', desc: 'Agent execution, configuration, run history', selected: true },
    { name: 'chat', desc: 'Natural language chat with financial data', selected: true },
    { name: 'transactions', desc: 'GL transactions, journal entries, invoices', selected: false },
    { name: 'forecasts', desc: 'Cash flow and revenue forecasts', selected: false },
    { name: 'webhooks', desc: 'Webhook event subscriptions', selected: false },
    { name: 'health', desc: 'System health and metrics endpoints', selected: false },
    { name: 'admin', desc: 'User management and system configuration', selected: false },
  ];

  kpis = [
    { label: 'Total Keys', value: '—', footnote: 'across all environments', accent: 'teal' },
    { label: 'Active Keys', value: '—', footnote: 'currently valid', accent: 'green' },
    { label: 'Revoked', value: '—', footnote: 'deactivated', accent: 'red' },
    { label: 'Expiring < 14d', value: '—', footnote: 'needs attention', accent: 'orange' },
  ];

  get expiringCount(): number {
    return this.apiKeys.filter(k => k.daysToExpiry !== null && k.daysToExpiry <= 14 && k.daysToExpiry > 0).length;
  }

  get filteredKeys(): DisplayKey[] {
    let result = this.apiKeys;
    if (this.activeFilter === 'Active') result = result.filter(k => k.isActive);
    else if (this.activeFilter === 'Expiring') result = result.filter(k => k.daysToExpiry !== null && k.daysToExpiry <= 14 && k.daysToExpiry > 0);
    else if (this.activeFilter === 'Revoked') result = result.filter(k => !k.isActive);
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(k => k.name.toLowerCase().includes(t) || k.prefix.toLowerCase().includes(t));
    }
    return result;
  }

  ngOnInit() { this.loadKeys(); }

  loadKeys() {
    this.loading = true;
    this.errorMsg = '';

    this.adminService.getApiKeys().subscribe({
      next: (keys) => {
        this.apiKeys = keys.map(k => this.mapKey(k));
        this.updateKpis();
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to load API keys: ' + (err?.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  private mapKey(k: ApiKeyOut): DisplayKey {
    const now = new Date();
    let daysToExpiry: number | null = null;
    let expiresStr = 'Never';
    if (k.expires_at) {
      const exp = new Date(k.expires_at);
      daysToExpiry = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
      expiresStr = this.formatDate(k.expires_at);
    }
    return {
      id: k.id,
      name: k.name,
      prefix: k.key_prefix,
      scopes: Array.isArray(k.scopes) ? k.scopes : [],
      status: k.is_active ? (daysToExpiry !== null && daysToExpiry <= 0 ? 'Expired' : 'Active') : 'Revoked',
      created: this.formatDate(k.created_at),
      expires: expiresStr,
      daysToExpiry: daysToExpiry !== null && daysToExpiry > 0 ? daysToExpiry : null,
      lastUsed: k.last_used_at ? this.timeAgo(k.last_used_at) : 'Never',
      isActive: k.is_active,
    };
  }

  private updateKpis() {
    const active = this.apiKeys.filter(k => k.isActive).length;
    const revoked = this.apiKeys.filter(k => !k.isActive).length;
    const expiring = this.expiringCount;
    this.kpis = [
      { label: 'Total Keys', value: String(this.apiKeys.length), footnote: 'across all environments', accent: 'teal' },
      { label: 'Active Keys', value: String(active), footnote: 'currently valid', accent: 'green' },
      { label: 'Revoked', value: String(revoked), footnote: 'deactivated', accent: 'red' },
      { label: 'Expiring < 14d', value: String(expiring), footnote: 'needs attention', accent: 'orange' },
    ];
  }

  generateKey() {
    if (!this.createForm.name) {
      this.createError = 'Key name is required.';
      return;
    }
    this.creating = true;
    this.createError = '';

    const scopes = this.availableScopes.filter(s => s.selected).map(s => s.name);
    const payload: any = {
      name: this.createForm.name,
      scopes,
    };
    if (this.createForm.expires_in_days) {
      payload.expires_in_days = this.createForm.expires_in_days;
    }

    this.adminService.createApiKey(payload).subscribe({
      next: (result) => {
        this.creating = false;
        this.showCreateModal = false;
        this.newKeyValue = result.key;
        this.createForm = { name: '', expires_in_days: 90 };
        this.availableScopes.forEach(s => s.selected = ['agents', 'chat'].includes(s.name));
        this.loadKeys();
      },
      error: (err) => {
        this.creating = false;
        this.createError = err?.error?.message || err?.message || 'Failed to generate key';
      }
    });
  }

  revokeKey(key: DisplayKey) {
    if (!confirm(`Revoke API key "${key.name}"? This cannot be undone.`)) return;
    this.adminService.revokeApiKey(key.id).subscribe({
      next: () => {
        this.showSuccess('API key revoked');
        this.loadKeys();
      },
      error: () => this.showSuccess('Failed to revoke key'),
    });
  }

  copyKey() {
    navigator.clipboard.writeText(this.newKeyValue).then(() => this.showSuccess('Key copied to clipboard'));
  }

  getStatusColor(status: string): string {
    const m: any = { Active: '#059669', Expired: '#6B7280', Revoked: '#DC2626' };
    return m[status] || '#6B7280';
  }

  getStatusBg(status: string): string {
    const m: any = { Active: '#ECFDF5', Expired: '#F3F4F6', Revoked: '#FEE2E2' };
    return m[status] || '#F3F4F6';
  }

  onSearch(event: Event) { this.searchTerm = (event.target as HTMLInputElement).value; }

  private formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private timeAgo(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + 'h ago';
    return Math.floor(hours / 24) + 'd ago';
  }

  private showSuccess(msg: string) {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
  }
}
