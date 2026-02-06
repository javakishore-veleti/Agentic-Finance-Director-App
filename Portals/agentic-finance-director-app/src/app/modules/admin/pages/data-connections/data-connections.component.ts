import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-data-connections',
  standalone: true,
  imports: [CommonModule],
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
        <p class="afda-page-subtitle">External integrations, database links, API connectors, and data pipeline configuration</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-outline" (click)="testAllConnections()">
          <i class="bi bi-arrow-repeat"></i> Test All
        </button>
        <button class="afda-btn afda-btn-primary" (click)="showAddModal = true">
          <i class="bi bi-plus-lg"></i> Add Connection
        </button>
      </div>
    </div>

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

    <!-- Connection Categories -->
    <div class="cat-tabs">
      @for (cat of categories; track cat.id) {
        <button class="cat-tab" [class.active]="activeCategory === cat.id" (click)="activeCategory = cat.id">
          <i [class]="'bi ' + cat.icon"></i>
          <span>{{ cat.name }}</span>
          <span class="cat-count">{{ cat.count }}</span>
        </button>
      }
    </div>

    <!-- Connection Cards -->
    <div class="conn-grid">
      @for (conn of filteredConnections; track conn.name) {
        <div class="conn-card" [class.expanded]="expandedConn === conn.name"
             [class.error]="conn.status === 'Error'" [class.degraded]="conn.status === 'Degraded'">
          <!-- Card Header -->
          <div class="cc-header" (click)="expandedConn = expandedConn === conn.name ? '' : conn.name">
            <div class="cc-logo" [style.background]="conn.logoBg">
              <i [class]="'bi ' + conn.icon" [style.color]="conn.logoColor"></i>
            </div>
            <div class="cc-info">
              <div class="cc-name-row">
                <span class="cc-name">{{ conn.name }}</span>
                <span class="cc-type-chip" [style.background]="getTypeBg(conn.type)" [style.color]="getTypeColor(conn.type)">{{ conn.type }}</span>
              </div>
              <div class="cc-desc">{{ conn.desc }}</div>
            </div>
            <div class="cc-status-area">
              <div class="cc-status-dot" [style.background]="getStatusColor(conn.status)"></div>
              <span class="cc-status-text" [style.color]="getStatusColor(conn.status)">{{ conn.status }}</span>
            </div>
            <i [class]="expandedConn === conn.name ? 'bi bi-chevron-up' : 'bi bi-chevron-down'" class="cc-chevron"></i>
          </div>

          <!-- Card Metrics Row -->
          <div class="cc-metrics">
            @for (metric of conn.metrics; track metric.label) {
              <div class="ccm-item">
                <span class="ccm-value font-mono">{{ metric.value }}</span>
                <span class="ccm-label">{{ metric.label }}</span>
              </div>
            }
            <!-- Sync bar -->
            <div class="ccm-sync">
              <div class="ccm-sync-bar">
                <div class="ccm-sync-fill" [style.width.%]="conn.syncHealth" [style.background]="conn.syncHealth > 90 ? '#059669' : conn.syncHealth > 70 ? '#D97706' : '#DC2626'"></div>
              </div>
              <span class="ccm-sync-pct font-mono" [style.color]="conn.syncHealth > 90 ? '#059669' : conn.syncHealth > 70 ? '#D97706' : '#DC2626'">{{ conn.syncHealth }}%</span>
            </div>
          </div>

          <!-- Expanded Detail -->
          @if (expandedConn === conn.name) {
            <div class="cc-expanded">
              <div class="cce-grid">
                <!-- Config -->
                <div class="cce-section">
                  <div class="cce-title">Configuration</div>
                  @for (cfg of conn.config; track cfg.label) {
                    <div class="cce-row">
                      <span class="cce-label">{{ cfg.label }}</span>
                      <span class="cce-value font-mono" [class.masked]="cfg.masked">{{ cfg.masked ? '••••••••••••' : cfg.value }}</span>
                    </div>
                  }
                </div>

                <!-- Health Checks -->
                <div class="cce-section">
                  <div class="cce-title">Health Checks</div>
                  @for (check of conn.healthChecks; track check.name) {
                    <div class="hc-row">
                      <i [class]="check.pass ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"
                         [style.color]="check.pass ? '#059669' : '#DC2626'"></i>
                      <span class="hc-name">{{ check.name }}</span>
                      <span class="hc-value font-mono">{{ check.value }}</span>
                    </div>
                  }
                </div>

                <!-- Sync Schedule -->
                <div class="cce-section">
                  <div class="cce-title">Sync Schedule</div>
                  @for (sched of conn.schedule; track sched.label) {
                    <div class="cce-row">
                      <span class="cce-label">{{ sched.label }}</span>
                      <span class="cce-value">{{ sched.value }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Recent Sync History -->
              <div class="cce-history">
                <div class="cce-title">Recent Sync Activity</div>
                <div class="sh-timeline">
                  @for (event of conn.syncHistory; track event.time) {
                    <div class="sh-event">
                      <div class="sh-dot" [style.background]="event.success ? '#059669' : '#DC2626'"></div>
                      <div class="sh-info">
                        <span class="sh-time font-mono">{{ event.time }}</span>
                        <span class="sh-detail">{{ event.detail }}</span>
                      </div>
                      <span class="sh-records font-mono">{{ event.records }}</span>
                      <span class="sh-duration font-mono">{{ event.duration }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Actions -->
              <div class="cce-actions">
                <button class="afda-btn afda-btn-outline afda-btn-sm">
                  <i class="bi bi-arrow-repeat"></i> Test Connection
                </button>
                <button class="afda-btn afda-btn-outline afda-btn-sm">
                  <i class="bi bi-play-circle"></i> Sync Now
                </button>
                <button class="afda-btn afda-btn-outline afda-btn-sm">
                  <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="afda-btn afda-btn-outline afda-btn-sm" style="color: #DC2626; border-color: #DC2626; margin-left: auto;">
                  <i class="bi bi-trash"></i> Remove
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Available Connectors -->
    <div class="avail-section">
      <div class="avail-header">
        <h3>Available Connectors</h3>
        <span class="avail-count">{{ availableConnectors.length }} connectors</span>
      </div>
      <div class="avail-grid">
        @for (c of availableConnectors; track c.name) {
          <div class="avail-card" [class.installed]="c.installed">
            <div class="ac-logo" [style.background]="c.logoBg">
              <i [class]="'bi ' + c.icon" [style.color]="c.logoColor"></i>
            </div>
            <div class="ac-name">{{ c.name }}</div>
            <div class="ac-cat">{{ c.category }}</div>
            @if (c.installed) {
              <span class="ac-status"><i class="bi bi-check-circle-fill" style="color: #059669;"></i> Connected</span>
            } @else {
              <button class="ac-connect" (click)="showAddModal = true">Connect</button>
            }
          </div>
        }
      </div>
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
              <label class="form-label">Connection Type</label>
              <select class="form-select">
                <option>PostgreSQL Database</option>
                <option>REST API</option>
                <option>SFTP / File Transfer</option>
                <option>Webhook</option>
                <option>OAuth 2.0 Service</option>
              </select>
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Connection Name</label>
              <input type="text" class="form-input" placeholder="e.g., Production SAP Instance">
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Host / URL</label>
              <input type="text" class="form-input font-mono" placeholder="https://api.example.com">
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Authentication</label>
              <select class="form-select">
                <option>API Key</option>
                <option>OAuth 2.0</option>
                <option>Basic Auth</option>
                <option>Certificate</option>
              </select>
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Sync Frequency</label>
              <select class="form-select">
                <option>Real-time</option>
                <option selected>Every 15 minutes</option>
                <option>Hourly</option>
                <option>Daily</option>
                <option>Manual only</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="afda-btn afda-btn-outline" (click)="showAddModal = false">Cancel</button>
            <button class="afda-btn afda-btn-outline">
              <i class="bi bi-arrow-repeat"></i> Test
            </button>
            <button class="afda-btn afda-btn-primary" (click)="showAddModal = false">
              <i class="bi bi-link-45deg"></i> Save Connection
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .kpi-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 16px; }

    /* Category Tabs */
    .cat-tabs { display: flex; gap: 4px; margin-bottom: 16px; overflow-x: auto; }

    .cat-tab {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; font-size: 12px; font-weight: 500;
      border: 1px solid var(--border); border-radius: var(--radius-md);
      background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s; font-family: var(--font-sans);
      white-space: nowrap;
      i { font-size: 14px; }
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active {
        background: var(--primary); border-color: var(--primary);
        color: white; font-weight: 600;
      }
    }

    .cat-count {
      font-size: 10px; font-weight: 700; padding: 1px 6px;
      border-radius: 8px; background: rgba(255,255,255,0.2);
      .cat-tab:not(.active) & { background: var(--bg-section); }
    }

    /* Connection Grid */
    .conn-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }

    .conn-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); overflow: hidden;
      box-shadow: var(--shadow-sm); transition: box-shadow 0.15s;
      &.expanded { box-shadow: var(--shadow-md); }
      &.error { border-left: 4px solid #DC2626; }
      &.degraded { border-left: 4px solid #D97706; }
    }

    .cc-header {
      display: flex; align-items: center; gap: 14px;
      padding: 16px 20px; cursor: pointer;
      &:hover { background: var(--bg-section); }
    }

    .cc-logo {
      width: 42px; height: 42px; border-radius: var(--radius-md);
      display: grid; place-items: center; font-size: 20px; flex-shrink: 0;
    }

    .cc-info { flex: 1; min-width: 0; }
    .cc-name-row { display: flex; align-items: center; gap: 8px; }
    .cc-name { font-size: 15px; font-weight: 700; color: var(--text-primary); }

    .cc-type-chip {
      font-size: 9px; font-weight: 700; padding: 2px 8px;
      border-radius: 8px; text-transform: uppercase; letter-spacing: 0.3px;
    }

    .cc-desc { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }

    .cc-status-area { display: flex; align-items: center; gap: 6px; min-width: 90px; }
    .cc-status-dot { width: 8px; height: 8px; border-radius: 50%; }
    .cc-status-text { font-size: 12px; font-weight: 600; }

    .cc-chevron { color: var(--text-tertiary); font-size: 14px; }

    /* Metrics Row */
    .cc-metrics {
      display: flex; align-items: center; gap: 16px;
      padding: 0 20px 12px; flex-wrap: wrap;
    }

    .ccm-item { text-align: center; min-width: 70px; }
    .ccm-value { display: block; font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .ccm-label { display: block; font-size: 9px; color: var(--text-tertiary); text-transform: uppercase; }

    .ccm-sync { display: flex; align-items: center; gap: 8px; margin-left: auto; min-width: 120px; }

    .ccm-sync-bar { flex: 1; height: 5px; background: var(--border-light); border-radius: 10px; overflow: hidden; }
    .ccm-sync-fill { height: 100%; border-radius: 10px; }
    .ccm-sync-pct { font-size: 11px; font-weight: 700; }

    /* Expanded */
    .cc-expanded {
      padding: 0 20px 16px;
      border-top: 1px solid var(--border-light);
      animation: slideDown 0.2s ease;
    }

    @keyframes slideDown { from { opacity: 0; } to { opacity: 1; } }

    .cce-grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      gap: 20px; padding: 14px 0;
    }

    .cce-title {
      font-size: 10.5px; font-weight: 700; color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px;
    }

    .cce-row {
      display: flex; justify-content: space-between;
      padding: 5px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .cce-label { font-size: 12px; color: var(--text-tertiary); }
    .cce-value { font-size: 12px; color: var(--text-primary); font-weight: 500; }
    .cce-value.masked { color: var(--text-tertiary); letter-spacing: 2px; }

    /* Health Checks */
    .hc-row {
      display: flex; align-items: center; gap: 8px;
      padding: 4px 0;
      i { font-size: 14px; }
    }

    .hc-name { font-size: 12px; color: var(--text-secondary); flex: 1; }
    .hc-value { font-size: 11px; color: var(--text-tertiary); }

    /* Sync History */
    .cce-history { padding: 12px 0; border-top: 1px solid var(--border-light); }

    .sh-timeline { display: flex; flex-direction: column; gap: 6px; }

    .sh-event {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 0;
    }

    .sh-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

    .sh-info { flex: 1; }
    .sh-time { font-size: 11px; color: var(--text-tertiary); margin-right: 8px; }
    .sh-detail { font-size: 12px; color: var(--text-secondary); }
    .sh-records { font-size: 11px; color: var(--text-tertiary); min-width: 60px; text-align: right; }
    .sh-duration { font-size: 11px; color: var(--text-tertiary); min-width: 40px; text-align: right; }

    .cce-actions {
      display: flex; gap: 8px; padding-top: 12px;
      border-top: 1px solid var(--border-light);
    }

    /* Available Connectors */
    .avail-section { margin-top: 8px; }

    .avail-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px;
      h3 { font-size: 15px; font-weight: 700; margin: 0; }
    }

    .avail-count { font-size: 12px; color: var(--text-tertiary); }

    .avail-grid {
      display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;
    }

    .avail-card {
      display: flex; flex-direction: column; align-items: center;
      padding: 16px 12px; background: var(--bg-card);
      border: 1px solid var(--border); border-radius: var(--radius-md);
      text-align: center; gap: 6px; transition: all 0.15s;
      &:hover { border-color: var(--primary); }
      &.installed { border-color: #A7F3D0; background: #F0FDF9; }
    }

    .ac-logo {
      width: 36px; height: 36px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 18px;
    }

    .ac-name { font-size: 12px; font-weight: 700; color: var(--text-primary); }
    .ac-cat { font-size: 10px; color: var(--text-tertiary); }

    .ac-status { font-size: 10px; color: #059669; display: flex; align-items: center; gap: 4px; }

    .ac-connect {
      padding: 4px 12px; font-size: 10px; font-weight: 600;
      border: 1px solid var(--primary); border-radius: var(--radius-sm);
      background: transparent; color: var(--primary); cursor: pointer;
      font-family: var(--font-sans);
      &:hover { background: var(--primary-light); }
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

    .modal-body { padding: 20px 24px; }

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

    @media (max-width: 1200px) {
      .kpi-row { grid-template-columns: repeat(3, 1fr); }
      .cce-grid { grid-template-columns: 1fr; }
      .avail-grid { grid-template-columns: repeat(3, 1fr); }
    }
  `]
})
export class DataConnectionsComponent {
  activeCategory = 'all';
  expandedConn = '';
  showAddModal = false;

  categories = [
    { id: 'all', name: 'All Connections', icon: 'bi-link-45deg', count: 8 },
    { id: 'database', name: 'Databases', icon: 'bi-database', count: 2 },
    { id: 'api', name: 'External APIs', icon: 'bi-cloud', count: 3 },
    { id: 'erp', name: 'ERP / Finance', icon: 'bi-building', count: 2 },
    { id: 'file', name: 'File / Storage', icon: 'bi-folder', count: 1 },
  ];

  kpis = [
    { label: 'Total Connections', value: '8', footnote: 'across all categories', accent: 'teal' },
    { label: 'Healthy', value: '6', footnote: '75% of connections', accent: 'green' },
    { label: 'Degraded', value: '1', footnote: 'slow response time', accent: 'orange' },
    { label: 'Errors', value: '1', footnote: 'requires attention', accent: 'red' },
    { label: 'Records Synced (24h)', value: '284K', footnote: 'across all sources', accent: 'blue' },
  ];

  connections = [
    {
      name: 'PostgreSQL — Primary', category: 'database', type: 'Database', status: 'Connected',
      desc: 'Primary transactional database for GL, journals, and financial data',
      icon: 'bi-database-fill', logoBg: '#EFF6FF', logoColor: '#2563EB',
      metrics: [
        { label: 'Latency', value: '4ms' },
        { label: 'Connections', value: '12/50' },
        { label: 'Queries/min', value: '342' },
        { label: 'Uptime', value: '99.99%' },
      ],
      syncHealth: 99,
      config: [
        { label: 'Host', value: 'db-primary.acme.internal:5432', masked: false },
        { label: 'Database', value: 'afda_production', masked: false },
        { label: 'User', value: 'afda_app', masked: false },
        { label: 'Password', value: '', masked: true },
        { label: 'SSL', value: 'Required (verify-full)', masked: false },
      ],
      healthChecks: [
        { name: 'Connection Pool', pass: true, value: '12 active' },
        { name: 'Replication Lag', pass: true, value: '<1ms' },
        { name: 'Disk Usage', pass: true, value: '42%' },
        { name: 'Long Queries', pass: true, value: '0 active' },
      ],
      schedule: [
        { label: 'Type', value: 'Persistent connection pool' },
        { label: 'Pool Size', value: '50 connections' },
        { label: 'Idle Timeout', value: '300s' },
      ],
      syncHistory: [
        { time: '2:15 PM', detail: 'Journal entries batch write', records: '1,240 rows', duration: '0.8s', success: true },
        { time: '2:00 PM', detail: 'Transaction sync', records: '3,420 rows', duration: '1.2s', success: true },
        { time: '1:45 PM', detail: 'Forecast data refresh', records: '840 rows', duration: '0.3s', success: true },
      ],
    },
    {
      name: 'Redis Cache', category: 'database', type: 'Cache', status: 'Connected',
      desc: 'In-memory cache for session data, rate limits, and hot query results',
      icon: 'bi-lightning-charge-fill', logoBg: '#FEE2E2', logoColor: '#DC2626',
      metrics: [
        { label: 'Hit Rate', value: '94.2%' },
        { label: 'Memory', value: '1.2GB' },
        { label: 'Keys', value: '42K' },
        { label: 'Ops/sec', value: '2.8K' },
      ],
      syncHealth: 97,
      config: [
        { label: 'Host', value: 'redis.acme.internal:6379', masked: false },
        { label: 'Database', value: '0', masked: false },
        { label: 'Auth', value: '', masked: true },
        { label: 'Max Memory', value: '8GB', masked: false },
      ],
      healthChecks: [
        { name: 'Connection', pass: true, value: 'OK' },
        { name: 'Memory Usage', pass: true, value: '15%' },
        { name: 'Eviction Policy', pass: true, value: 'allkeys-lru' },
      ],
      schedule: [
        { label: 'Type', value: 'Persistent connection' },
        { label: 'Backup', value: 'RDB every 60s' },
      ],
      syncHistory: [
        { time: '2:18 PM', detail: 'Cache warm: dashboard data', records: '86 keys', duration: '0.1s', success: true },
        { time: '2:10 PM', detail: 'Session flush', records: '12 keys', duration: '<0.1s', success: true },
      ],
    },
    {
      name: 'Plaid — Banking API', category: 'api', type: 'REST API', status: 'Connected',
      desc: 'Real-time bank account feeds, transaction ingestion, and balance checks',
      icon: 'bi-bank', logoBg: '#ECFDF5', logoColor: '#059669',
      metrics: [
        { label: 'Latency', value: '180ms' },
        { label: 'Calls (24h)', value: '2,840' },
        { label: 'Accounts', value: '6' },
        { label: 'Error Rate', value: '0.1%' },
      ],
      syncHealth: 98,
      config: [
        { label: 'Base URL', value: 'https://production.plaid.com', masked: false },
        { label: 'Client ID', value: 'plaid_cli_acf_••••', masked: false },
        { label: 'Secret', value: '', masked: true },
        { label: 'Environment', value: 'Production', masked: false },
      ],
      healthChecks: [
        { name: 'API Status', pass: true, value: 'Operational' },
        { name: 'Webhook Active', pass: true, value: 'Verified' },
        { name: 'Token Expiry', pass: true, value: '28 days' },
      ],
      schedule: [
        { label: 'Sync Mode', value: 'Webhook + polling' },
        { label: 'Poll Interval', value: 'Every 15 minutes' },
        { label: 'Retry', value: '3x exponential backoff' },
      ],
      syncHistory: [
        { time: '2:15 PM', detail: 'Transaction webhook received', records: '14 txns', duration: '0.2s', success: true },
        { time: '2:00 PM', detail: 'Balance refresh (all accounts)', records: '6 accts', duration: '0.8s', success: true },
        { time: '1:45 PM', detail: 'Transaction sync poll', records: '42 txns', duration: '1.1s', success: true },
      ],
    },
    {
      name: 'Anthropic — Claude API', category: 'api', type: 'LLM API', status: 'Connected',
      desc: 'AI model inference for agent execution, chat, and financial analysis',
      icon: 'bi-stars', logoBg: '#EDE9FE', logoColor: '#7C3AED',
      metrics: [
        { label: 'Latency (P50)', value: '280ms' },
        { label: 'Tokens (24h)', value: '3.8M' },
        { label: 'Cost (24h)', value: '$12.40' },
        { label: 'Error Rate', value: '0.02%' },
      ],
      syncHealth: 100,
      config: [
        { label: 'Endpoint', value: 'https://api.anthropic.com/v1', masked: false },
        { label: 'API Key', value: '', masked: true },
        { label: 'Default Model', value: 'claude-sonnet-4-20250514', masked: false },
        { label: 'Max Tokens', value: '4096', masked: false },
      ],
      healthChecks: [
        { name: 'API Status', pass: true, value: 'Operational' },
        { name: 'Rate Limit RPM', pass: true, value: '70% used' },
        { name: 'Rate Limit TPM', pass: true, value: '41% used' },
      ],
      schedule: [
        { label: 'Mode', value: 'On-demand (per agent run)' },
        { label: 'Timeout', value: '120s' },
        { label: 'Retry', value: '3x with backoff' },
      ],
      syncHistory: [
        { time: '2:18 PM', detail: 'Cash Flow Agent completion', records: '2.4K tokens', duration: '1.8s', success: true },
        { time: '2:14 PM', detail: 'Recon Agent completion', records: '1.8K tokens', duration: '1.2s', success: true },
        { time: '2:10 PM', detail: 'Chat query response', records: '640 tokens', duration: '0.6s', success: true },
      ],
    },
    {
      name: 'Stripe — Billing', category: 'api', type: 'REST API', status: 'Degraded',
      desc: 'Payment processing, invoice generation, and subscription management',
      icon: 'bi-credit-card', logoBg: '#EFF6FF', logoColor: '#6366F1',
      metrics: [
        { label: 'Latency', value: '420ms' },
        { label: 'Calls (24h)', value: '186' },
        { label: 'Webhooks', value: '42' },
        { label: 'Error Rate', value: '2.1%' },
      ],
      syncHealth: 78,
      config: [
        { label: 'Base URL', value: 'https://api.stripe.com/v1', masked: false },
        { label: 'API Key', value: '', masked: true },
        { label: 'Webhook Secret', value: '', masked: true },
      ],
      healthChecks: [
        { name: 'API Status', pass: true, value: 'Degraded' },
        { name: 'Webhook Delivery', pass: false, value: '3 failed' },
        { name: 'Rate Limit', pass: true, value: '12% used' },
      ],
      schedule: [
        { label: 'Sync Mode', value: 'Webhook + daily batch' },
        { label: 'Batch Time', value: '2:00 AM EST' },
      ],
      syncHistory: [
        { time: '2:10 PM', detail: 'Invoice webhook received', records: '1 invoice', duration: '0.3s', success: true },
        { time: '1:48 PM', detail: 'Payment webhook — timeout', records: '0', duration: '30s', success: false },
        { time: '1:30 PM', detail: 'Subscription sync', records: '4 subs', duration: '0.6s', success: true },
      ],
    },
    {
      name: 'SAP S/4HANA', category: 'erp', type: 'ERP', status: 'Connected',
      desc: 'Enterprise GL sync, cost center mapping, and journal entry posting',
      icon: 'bi-building-fill', logoBg: '#E8F5F1', logoColor: '#0D6B5C',
      metrics: [
        { label: 'Latency', value: '320ms' },
        { label: 'Synced (24h)', value: '12.4K' },
        { label: 'Entities', value: '4' },
        { label: 'Error Rate', value: '0.3%' },
      ],
      syncHealth: 96,
      config: [
        { label: 'Endpoint', value: 'https://sap.acme.internal/api/v2', masked: false },
        { label: 'Client', value: '800', masked: false },
        { label: 'User', value: 'AFDA_INTEGRATION', masked: false },
        { label: 'Password', value: '', masked: true },
      ],
      healthChecks: [
        { name: 'OData Service', pass: true, value: 'Active' },
        { name: 'RFC Connection', pass: true, value: 'OK' },
        { name: 'Certificate Expiry', pass: true, value: '142 days' },
      ],
      schedule: [
        { label: 'GL Sync', value: 'Every 15 minutes' },
        { label: 'Full Reconcile', value: 'Daily 1:00 AM' },
        { label: 'JE Posting', value: 'Real-time' },
      ],
      syncHistory: [
        { time: '2:15 PM', detail: 'GL balance sync', records: '2,180 entries', duration: '4.2s', success: true },
        { time: '2:00 PM', detail: 'Cost center mapping refresh', records: '86 centers', duration: '1.8s', success: true },
        { time: '1:00 AM', detail: 'Full daily reconciliation', records: '12,400 entries', duration: '48s', success: true },
      ],
    },
    {
      name: 'NetSuite', category: 'erp', type: 'ERP', status: 'Error',
      desc: 'Subsidiary financial data sync and intercompany elimination',
      icon: 'bi-globe', logoBg: '#FEF3C7', logoColor: '#92400E',
      metrics: [
        { label: 'Latency', value: '—' },
        { label: 'Last Sync', value: '4h ago' },
        { label: 'Entities', value: '2' },
        { label: 'Error Rate', value: '100%' },
      ],
      syncHealth: 0,
      config: [
        { label: 'Account ID', value: '1234567_SB1', masked: false },
        { label: 'Consumer Key', value: '', masked: true },
        { label: 'Token ID', value: '', masked: true },
        { label: 'Environment', value: 'Sandbox', masked: false },
      ],
      healthChecks: [
        { name: 'REST API', pass: false, value: '401 Unauthorized' },
        { name: 'Token Valid', pass: false, value: 'Expired' },
        { name: 'SuiteScript', pass: false, value: 'Unreachable' },
      ],
      schedule: [
        { label: 'Sync Mode', value: 'Hourly batch' },
        { label: 'Last Success', value: '10:15 AM today' },
      ],
      syncHistory: [
        { time: '2:00 PM', detail: 'Sync failed — 401 Unauthorized', records: '0', duration: '—', success: false },
        { time: '1:00 PM', detail: 'Sync failed — token expired', records: '0', duration: '—', success: false },
        { time: '10:15 AM', detail: 'Subsidiary balance sync', records: '420 entries', duration: '6.2s', success: true },
      ],
    },
    {
      name: 'AWS S3 — Document Store', category: 'file', type: 'Storage', status: 'Connected',
      desc: 'Financial document storage, report archives, and backup files',
      icon: 'bi-cloud-arrow-up', logoBg: '#FEF3C7', logoColor: '#D97706',
      metrics: [
        { label: 'Objects', value: '14.2K' },
        { label: 'Size', value: '28 GB' },
        { label: 'Uploads (24h)', value: '86' },
        { label: 'Downloads', value: '142' },
      ],
      syncHealth: 100,
      config: [
        { label: 'Bucket', value: 'acme-afda-production', masked: false },
        { label: 'Region', value: 'us-east-1', masked: false },
        { label: 'Access Key', value: '', masked: true },
        { label: 'Encryption', value: 'AES-256 SSE', masked: false },
      ],
      healthChecks: [
        { name: 'Bucket Access', pass: true, value: 'OK' },
        { name: 'Lifecycle Rules', pass: true, value: '3 active' },
        { name: 'Versioning', pass: true, value: 'Enabled' },
      ],
      schedule: [
        { label: 'Upload Mode', value: 'Real-time' },
        { label: 'Cleanup', value: 'Lifecycle: 90d archive' },
      ],
      syncHistory: [
        { time: '2:12 PM', detail: 'Report PDF uploaded', records: '1 file', duration: '0.4s', success: true },
        { time: '1:55 PM', detail: 'Backup batch upload', records: '12 files', duration: '2.1s', success: true },
      ],
    },
  ];

  get filteredConnections() {
    if (this.activeCategory === 'all') return this.connections;
    return this.connections.filter(c => c.category === this.activeCategory);
  }

  availableConnectors = [
    { name: 'PostgreSQL', category: 'Database', icon: 'bi-database-fill', logoBg: '#EFF6FF', logoColor: '#2563EB', installed: true },
    { name: 'Redis', category: 'Cache', icon: 'bi-lightning-charge-fill', logoBg: '#FEE2E2', logoColor: '#DC2626', installed: true },
    { name: 'Plaid', category: 'Banking', icon: 'bi-bank', logoBg: '#ECFDF5', logoColor: '#059669', installed: true },
    { name: 'Stripe', category: 'Payments', icon: 'bi-credit-card', logoBg: '#EFF6FF', logoColor: '#6366F1', installed: true },
    { name: 'SAP', category: 'ERP', icon: 'bi-building-fill', logoBg: '#E8F5F1', logoColor: '#0D6B5C', installed: true },
    { name: 'AWS S3', category: 'Storage', icon: 'bi-cloud-arrow-up', logoBg: '#FEF3C7', logoColor: '#D97706', installed: true },
    { name: 'Snowflake', category: 'Data Warehouse', icon: 'bi-snow', logoBg: '#EFF6FF', logoColor: '#2563EB', installed: false },
    { name: 'Salesforce', category: 'CRM', icon: 'bi-cloud-fill', logoBg: '#EFF6FF', logoColor: '#2563EB', installed: false },
    { name: 'QuickBooks', category: 'Accounting', icon: 'bi-journal-check', logoBg: '#ECFDF5', logoColor: '#059669', installed: false },
    { name: 'Workday', category: 'HR / Finance', icon: 'bi-people-fill', logoBg: '#FEF3C7', logoColor: '#D97706', installed: false },
    { name: 'Slack', category: 'Messaging', icon: 'bi-chat-dots-fill', logoBg: '#EDE9FE', logoColor: '#7C3AED', installed: false },
    { name: 'SendGrid', category: 'Email', icon: 'bi-envelope-fill', logoBg: '#EFF6FF', logoColor: '#2563EB', installed: false },
  ];

  getStatusColor(status: string): string {
    const m: any = { Connected: '#059669', Degraded: '#D97706', Error: '#DC2626' };
    return m[status] || '#6B7280';
  }

  getTypeBg(type: string): string {
    const m: any = { Database: '#EFF6FF', Cache: '#FEE2E2', 'REST API': '#ECFDF5', 'LLM API': '#EDE9FE', ERP: '#E8F5F1', Storage: '#FEF3C7' };
    return m[type] || '#F3F4F6';
  }

  getTypeColor(type: string): string {
    const m: any = { Database: '#2563EB', Cache: '#DC2626', 'REST API': '#059669', 'LLM API': '#7C3AED', ERP: '#0D6B5C', Storage: '#D97706' };
    return m[type] || '#6B7280';
  }

  testAllConnections() {}
}