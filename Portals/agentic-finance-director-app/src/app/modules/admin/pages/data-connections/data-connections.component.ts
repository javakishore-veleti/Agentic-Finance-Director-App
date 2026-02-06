import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, DataConnectionOut } from '../../services/admin.service';

interface DisplayConnection {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: string;
  lastSync: string;
  lastError: string | null;
  syncFrequency: string;
  created: string;
  icon: string;
  logoBg: string;
  logoColor: string;
}

@Component({
  selector: 'afda-data-connections',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/admin">Administration</a>
      <span class="separator">/</span>
      <span class="current">Data Connections</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Data Connections</h1>
        <p class="afda-page-subtitle">External integrations, database links, API connectors, and data pipelines</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-outline" (click)="testAll()">
          <i class="bi bi-arrow-repeat"></i> Test All
        </button>
        <button class="afda-btn afda-btn-primary" (click)="showAddModal = true">
          <i class="bi bi-plus-lg"></i> Add Connection
        </button>
      </div>
    </div>

    <!-- Loading -->
    @if (loading) {
      <div class="loading-bar"><div class="loading-bar-fill"></div></div>
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

    <!-- Connection Cards -->
    <div class="conn-grid">
      @for (conn of connections; track conn.id) {
        <div class="conn-card" [class.error]="conn.status === 'error'" [class.degraded]="conn.status === 'degraded'">
          <div class="cc-header">
            <div class="cc-logo" [style.background]="conn.logoBg">
              <i [class]="'bi ' + conn.icon" [style.color]="conn.logoColor"></i>
            </div>
            <div class="cc-info">
              <div class="cc-name-row">
                <span class="cc-name">{{ conn.name }}</span>
                <span class="cc-type-chip" [style.background]="getTypeBg(conn.type)" [style.color]="getTypeColor(conn.type)">{{ conn.type }}</span>
              </div>
              <div class="cc-desc">
                Provider: {{ conn.provider || '—' }} · Sync: {{ conn.syncFrequency }}
              </div>
            </div>
            <div class="cc-status-area">
              <div class="cc-status-dot" [style.background]="getStatusColor(conn.status)"></div>
              <span class="cc-status-text" [style.color]="getStatusColor(conn.status)">{{ conn.status }}</span>
            </div>
          </div>

          <div class="cc-metrics">
            <div class="ccm-item">
              <span class="ccm-value font-mono">{{ conn.lastSync }}</span>
              <span class="ccm-label">Last Sync</span>
            </div>
            <div class="ccm-item">
              <span class="ccm-value font-mono">{{ conn.syncFrequency }}</span>
              <span class="ccm-label">Frequency</span>
            </div>
            <div class="ccm-item">
              <span class="ccm-value font-mono">{{ conn.created }}</span>
              <span class="ccm-label">Created</span>
            </div>
            @if (conn.lastError) {
              <div class="ccm-error">
                <i class="bi bi-exclamation-circle"></i>
                <span>{{ conn.lastError }}</span>
              </div>
            }
          </div>

          <div class="cc-actions">
            <button class="afda-btn afda-btn-outline afda-btn-sm" (click)="testConnection(conn)" [disabled]="testing[conn.id]">
              <i class="bi bi-arrow-repeat"></i> {{ testing[conn.id] ? 'Testing...' : 'Test' }}
            </button>
            @if (testResults[conn.id]) {
              <span class="test-result" [style.color]="testResults[conn.id]!.success ? '#059669' : '#DC2626'">
                <i [class]="testResults[conn.id]!.success ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
                {{ testResults[conn.id]!.message }}
                @if (testResults[conn.id]!.latency_ms) {
                  ({{ testResults[conn.id]!.latency_ms }}ms)
                }
              </span>
            }
          </div>
        </div>
      }
      @if (connections.length === 0 && !loading) {
        <div class="empty-state">
          <i class="bi bi-link-45deg" style="font-size: 36px; color: var(--text-tertiary);"></i>
          <div>No data connections configured</div>
          <button class="afda-btn afda-btn-primary afda-btn-sm" (click)="showAddModal = true">Add Connection</button>
        </div>
      }
    </div>

    <!-- Add Connection Modal -->
    @if (showAddModal) {
      <div class="modal-overlay" (click)="showAddModal = false">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Add Data Connection</h3>
            <button class="modal-close" (click)="showAddModal = false"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="modal-body">
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Connection Name</label>
              <input type="text" class="form-input" placeholder="e.g., Production SAP Instance" [(ngModel)]="addForm.name">
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Connection Type</label>
              <select class="form-select" [(ngModel)]="addForm.connection_type">
                <option>database</option><option>rest_api</option><option>erp</option>
                <option>file_storage</option><option>webhook</option><option>oauth</option>
              </select>
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Provider</label>
              <input type="text" class="form-input" placeholder="e.g., PostgreSQL, SAP, Plaid" [(ngModel)]="addForm.provider">
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Host / URL</label>
              <input type="text" class="form-input font-mono" placeholder="https://api.example.com" [(ngModel)]="addForm.host">
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Sync Frequency</label>
              <select class="form-select" [(ngModel)]="addForm.sync_frequency">
                <option>real-time</option><option>15min</option><option>hourly</option>
                <option>daily</option><option>manual</option>
              </select>
            </div>
            @if (addError) {
              <div class="form-error">{{ addError }}</div>
            }
          </div>
          <div class="modal-footer">
            <button class="afda-btn afda-btn-outline" (click)="showAddModal = false">Cancel</button>
            <button class="afda-btn afda-btn-primary" (click)="createConnection()" [disabled]="creating">
              <i class="bi bi-link-45deg"></i> {{ creating ? 'Saving...' : 'Save Connection' }}
            </button>
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

    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
    .conn-grid { display: flex; flex-direction: column; gap: 10px; }
    .conn-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); &.error { border-left: 4px solid #DC2626; } &.degraded { border-left: 4px solid #D97706; } }

    .cc-header { display: flex; align-items: center; gap: 14px; padding: 16px 20px; }
    .cc-logo { width: 42px; height: 42px; border-radius: var(--radius-md); display: grid; place-items: center; font-size: 20px; flex-shrink: 0; }
    .cc-info { flex: 1; min-width: 0; }
    .cc-name-row { display: flex; align-items: center; gap: 8px; }
    .cc-name { font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .cc-type-chip { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.3px; }
    .cc-desc { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }
    .cc-status-area { display: flex; align-items: center; gap: 6px; min-width: 90px; }
    .cc-status-dot { width: 8px; height: 8px; border-radius: 50%; }
    .cc-status-text { font-size: 12px; font-weight: 600; }

    .cc-metrics { display: flex; align-items: center; gap: 16px; padding: 0 20px 12px; flex-wrap: wrap; }
    .ccm-item { text-align: center; min-width: 70px; }
    .ccm-value { display: block; font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .ccm-label { display: block; font-size: 9px; color: var(--text-tertiary); text-transform: uppercase; }
    .ccm-error { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #DC2626; margin-left: auto; i { font-size: 13px; } }

    .cc-actions { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-top: 1px solid var(--border-light); background: var(--bg-section); }
    .test-result { font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; }

    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 20px; color: var(--text-tertiary); font-size: 14px; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: grid; place-items: center; z-index: 1000; }
    .modal-panel { background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: 0 20px 60px rgba(0,0,0,0.2); width: 100%; max-width: 520px; overflow: hidden; animation: slideUp 0.2s ease; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1px solid var(--border-light); h3 { margin: 0; font-size: 16px; } }
    .modal-close { background: none; border: none; font-size: 16px; color: var(--text-tertiary); cursor: pointer; }
    .modal-body { padding: 20px 24px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 24px; border-top: 1px solid var(--border-light); background: var(--bg-section); }
    .form-label { font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-bottom: 4px; }
    .form-input, .form-select { width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; background: var(--bg-section); color: var(--text-primary); font-family: var(--font-sans); outline: none; box-sizing: border-box; &:focus { border-color: var(--primary); } }
    .form-field { display: flex; flex-direction: column; }
    .form-error { padding: 8px 12px; background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: var(--radius-sm); color: #DC2626; font-size: 12px; }

    .toast-success { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; background: #059669; color: white; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; z-index: 2000; animation: slideUp 0.3s ease; box-shadow: 0 8px 24px rgba(5,150,105,0.3); }

    @media (max-width: 1200px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class DataConnectionsComponent implements OnInit {
  private adminService = inject(AdminService);

  loading = true;
  showAddModal = false;
  creating = false;
  addError = '';
  successMsg = '';

  connections: DisplayConnection[] = [];
  testing: Record<string, boolean> = {};
  testResults: Record<string, { success: boolean; message: string; latency_ms: number | null } | null> = {};

  addForm = { name: '', connection_type: 'database', provider: '', host: '', sync_frequency: '15min' };

  kpis = [
    { label: 'Total Connections', value: '—', footnote: 'across all categories', accent: 'teal' },
    { label: 'Connected', value: '—', footnote: 'healthy', accent: 'green' },
    { label: 'Errors', value: '—', footnote: 'requires attention', accent: 'red' },
    { label: 'Last Sync', value: '—', footnote: 'most recent', accent: 'blue' },
  ];

  private typeStyles: Record<string, { icon: string; logoBg: string; logoColor: string }> = {
    database:     { icon: 'bi-database-fill',        logoBg: '#EFF6FF', logoColor: '#2563EB' },
    rest_api:     { icon: 'bi-cloud',                logoBg: '#ECFDF5', logoColor: '#059669' },
    erp:          { icon: 'bi-building-fill',        logoBg: '#E8F5F1', logoColor: '#0D6B5C' },
    file_storage: { icon: 'bi-cloud-arrow-up',       logoBg: '#FEF3C7', logoColor: '#D97706' },
    webhook:      { icon: 'bi-broadcast',            logoBg: '#F3F4F6', logoColor: '#374151' },
    oauth:        { icon: 'bi-key',                  logoBg: '#EDE9FE', logoColor: '#7C3AED' },
    cache:        { icon: 'bi-lightning-charge-fill', logoBg: '#FEE2E2', logoColor: '#DC2626' },
  };

  ngOnInit() { this.loadConnections(); }

  loadConnections() {
    this.loading = true;
    this.adminService.getDataConnections().subscribe({
      next: (conns) => {
        this.connections = conns.map(c => this.mapConn(c));
        this.updateKpis();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private mapConn(c: DataConnectionOut): DisplayConnection {
    const style = this.typeStyles[c.connection_type] || this.typeStyles['database'];
    return {
      id: c.id,
      name: c.name,
      type: c.connection_type,
      provider: c.provider || '',
      status: c.status,
      lastSync: c.last_sync_at ? this.timeAgo(c.last_sync_at) : 'Never',
      lastError: c.last_error,
      syncFrequency: c.sync_frequency,
      created: this.formatDate(c.created_at),
      icon: style.icon,
      logoBg: style.logoBg,
      logoColor: style.logoColor,
    };
  }

  private updateKpis() {
    const connected = this.connections.filter(c => c.status === 'connected').length;
    const errors = this.connections.filter(c => c.status === 'error').length;
    const lastSync = this.connections.map(c => c.lastSync).find(s => s !== 'Never') || '—';
    this.kpis = [
      { label: 'Total Connections', value: String(this.connections.length), footnote: 'across all categories', accent: 'teal' },
      { label: 'Connected', value: String(connected), footnote: 'healthy', accent: 'green' },
      { label: 'Errors', value: String(errors), footnote: 'requires attention', accent: 'red' },
      { label: 'Last Sync', value: lastSync, footnote: 'most recent', accent: 'blue' },
    ];
  }

  testConnection(conn: DisplayConnection) {
    this.testing[conn.id] = true;
    this.testResults[conn.id] = null;

    this.adminService.testDataConnection(conn.id).subscribe({
      next: (result) => {
        this.testing[conn.id] = false;
        this.testResults[conn.id] = result;
        this.loadConnections(); // refresh status
      },
      error: (err) => {
        this.testing[conn.id] = false;
        this.testResults[conn.id] = { success: false, message: err?.message || 'Test failed', latency_ms: null };
      }
    });
  }

  testAll() {
    for (const conn of this.connections) {
      this.testConnection(conn);
    }
  }

  createConnection() {
    if (!this.addForm.name) { this.addError = 'Name is required'; return; }
    this.creating = true;
    this.addError = '';

    this.adminService.createDataConnection({
      name: this.addForm.name,
      connection_type: this.addForm.connection_type,
      provider: this.addForm.provider || undefined,
      config_json: { host: this.addForm.host },
      sync_frequency: this.addForm.sync_frequency,
    }).subscribe({
      next: () => {
        this.creating = false;
        this.showAddModal = false;
        this.addForm = { name: '', connection_type: 'database', provider: '', host: '', sync_frequency: '15min' };
        this.showSuccess('Connection created');
        this.loadConnections();
      },
      error: (err) => {
        this.creating = false;
        this.addError = err?.error?.message || 'Failed to create connection';
      }
    });
  }

  getStatusColor(status: string): string {
    const m: any = { connected: '#059669', degraded: '#D97706', error: '#DC2626', disconnected: '#6B7280' };
    return m[status] || '#6B7280';
  }

  getTypeBg(type: string): string {
    const m: any = { database: '#EFF6FF', rest_api: '#ECFDF5', erp: '#E8F5F1', file_storage: '#FEF3C7', webhook: '#F3F4F6', oauth: '#EDE9FE' };
    return m[type] || '#F3F4F6';
  }

  getTypeColor(type: string): string {
    const m: any = { database: '#2563EB', rest_api: '#059669', erp: '#0D6B5C', file_storage: '#D97706', webhook: '#374151', oauth: '#7C3AED' };
    return m[type] || '#6B7280';
  }

  private formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private timeAgo(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const mins = Math.floor((now.getTime() - d.getTime()) / 60000);
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
