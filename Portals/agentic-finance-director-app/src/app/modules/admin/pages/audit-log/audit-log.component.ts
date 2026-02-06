import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-audit-log',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/admin">Administration</a>
      <span class="separator">/</span>
      <span class="current">Audit Log</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Audit Log</h1>
        <p class="afda-page-subtitle">Immutable record of all platform actions for compliance and security review</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>Last 24 Hours</option>
          <option selected>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>Custom Range</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-download"></i> Export CSV
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

    <!-- Activity Summary -->
    <div class="summary-row">
      <!-- Activity by Category -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.04s both;">
        <div class="afda-card-title" style="margin-bottom: 12px;">Events by Category (7d)</div>
        @for (cat of eventCategories; track cat.name) {
          <div class="ecat-row">
            <div class="ecat-icon" [style.background]="cat.iconBg">
              <i [class]="'bi ' + cat.icon" [style.color]="cat.iconColor"></i>
            </div>
            <span class="ecat-name">{{ cat.name }}</span>
            <div class="ecat-bar">
              <div class="ecat-bar-fill" [style.width.%]="(cat.count / maxCategoryCount) * 100"
                   [style.background]="cat.iconColor"></div>
            </div>
            <span class="ecat-count font-mono">{{ cat.count }}</span>
          </div>
        }
      </div>

      <!-- Top Users -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.06s both;">
        <div class="afda-card-title" style="margin-bottom: 12px;">Most Active Users (7d)</div>
        @for (user of topUsers; track user.name) {
          <div class="tu-row">
            <div class="tu-avatar" [style.background]="user.color">{{ user.initials }}</div>
            <div class="tu-info">
              <span class="tu-name">{{ user.name }}</span>
              <span class="tu-role">{{ user.role }}</span>
            </div>
            <div class="tu-bar">
              <div class="tu-bar-fill" [style.width.%]="(user.actions / maxUserActions) * 100"></div>
            </div>
            <span class="tu-count font-mono">{{ user.actions }}</span>
          </div>
        }
      </div>

      <!-- Hourly Heatmap -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.08s both;">
        <div class="afda-card-title" style="margin-bottom: 12px;">Activity Heatmap (24h × 7d)</div>
        <div class="heatmap">
          <div class="hm-y-labels">
            @for (day of heatmapDays; track day) {
              <span class="hm-y">{{ day }}</span>
            }
          </div>
          <div class="hm-grid">
            @for (row of heatmapData; track $index) {
              <div class="hm-row">
                @for (cell of row; track $index) {
                  <div class="hm-cell" [style.background]="getHeatColor(cell)"
                       [title]="cell + ' events'"></div>
                }
              </div>
            }
          </div>
        </div>
        <div class="hm-x-labels">
          <span>12AM</span><span>4AM</span><span>8AM</span><span>12PM</span><span>4PM</span><span>8PM</span>
        </div>
        <div class="hm-legend">
          <span class="hm-leg-label">Less</span>
          @for (c of ['#F3F4F6','#D1FAE5','#6EE7B7','#34D399','#059669']; track c) {
            <div class="hm-leg-cell" [style.background]="c"></div>
          }
          <span class="hm-leg-label">More</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar stagger">
      <div class="filter-search">
        <i class="bi bi-search"></i>
        <input type="text" placeholder="Search events, users, or resources..." class="filter-search-input" (input)="onSearch($event)">
      </div>
      <div class="filter-chips">
        @for (f of actionFilters; track f) {
          <button class="filter-chip" [class.active]="activeActionFilter === f" (click)="activeActionFilter = f">{{ f }}</button>
        }
      </div>
      <div class="filter-chips">
        @for (f of severityFilters; track f) {
          <button class="filter-chip" [class.active]="activeSeverityFilter === f" (click)="activeSeverityFilter = f"
                  [ngClass]="'sev-' + f.toLowerCase()">{{ f }}</button>
        }
      </div>
    </div>

    <!-- Audit Log Table -->
    <div class="afda-card" style="animation: fadeUp 0.4s ease 0.12s both;">
      <table class="afda-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Severity</th>
            <th>IP Address</th>
            <th>Details</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (event of filteredEvents; track event.id) {
            <tr [class.highlight]="event.severity === 'Critical'" [class.expanded-row]="expandedEvent === event.id">
              <td><span class="ts font-mono">{{ event.timestamp }}</span></td>
              <td>
                <div class="user-cell">
                  <div class="user-avatar-sm" [style.background]="event.userColor">{{ event.userInitials }}</div>
                  <span class="user-name-sm">{{ event.user }}</span>
                </div>
              </td>
              <td>
                <span class="action-chip" [style.background]="getActionBg(event.action)" [style.color]="getActionColor(event.action)">
                  {{ event.action }}
                </span>
              </td>
              <td>
                <div class="resource-cell">
                  <span class="resource-type">{{ event.resourceType }}</span>
                  <span class="resource-id font-mono">{{ event.resourceId }}</span>
                </div>
              </td>
              <td>
                <span class="sev-chip" [ngClass]="'sev-' + event.severity.toLowerCase()">
                  {{ event.severity }}
                </span>
              </td>
              <td><span class="ip font-mono">{{ event.ip }}</span></td>
              <td><span class="detail-preview">{{ event.detail }}</span></td>
              <td>
                <button class="expand-btn" (click)="expandedEvent = expandedEvent === event.id ? '' : event.id">
                  <i [class]="expandedEvent === event.id ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                </button>
              </td>
            </tr>
            @if (expandedEvent === event.id) {
              <tr class="detail-row">
                <td colspan="8">
                  <div class="event-detail">
                    <div class="ed-grid">
                      <div class="ed-section">
                        <div class="ed-title">Event Metadata</div>
                        <div class="ed-kv"><span class="ed-k">Event ID</span><span class="ed-v font-mono">{{ event.id }}</span></div>
                        <div class="ed-kv"><span class="ed-k">Session</span><span class="ed-v font-mono">{{ event.sessionId }}</span></div>
                        <div class="ed-kv"><span class="ed-k">User Agent</span><span class="ed-v font-mono">{{ event.userAgent }}</span></div>
                        <div class="ed-kv"><span class="ed-k">Module</span><span class="ed-v">{{ event.module }}</span></div>
                      </div>
                      <div class="ed-section">
                        <div class="ed-title">Change Details</div>
                        @if (event.changes && event.changes.length) {
                          @for (change of event.changes; track change.field) {
                            <div class="ed-change">
                              <span class="edc-field">{{ change.field }}</span>
                              <span class="edc-from font-mono">{{ change.from }}</span>
                              <i class="bi bi-arrow-right" style="color: var(--text-tertiary); font-size: 11px;"></i>
                              <span class="edc-to font-mono">{{ change.to }}</span>
                            </div>
                          }
                        } @else {
                          <span class="ed-v" style="font-size: 12px; color: var(--text-tertiary);">No field changes recorded</span>
                        }
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <span class="pg-info">Showing 1–20 of {{ totalEvents }} events</span>
        <div class="pg-controls">
          <button class="pg-btn" disabled><i class="bi bi-chevron-left"></i></button>
          <button class="pg-btn active">1</button>
          <button class="pg-btn">2</button>
          <button class="pg-btn">3</button>
          <span class="pg-dots">...</span>
          <button class="pg-btn">124</button>
          <button class="pg-btn"><i class="bi bi-chevron-right"></i></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .kpi-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 16px; }

    /* Summary Row */
    .summary-row {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      gap: 16px; margin-bottom: 16px;
    }

    /* Event Categories */
    .ecat-row {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .ecat-icon {
      width: 24px; height: 24px; border-radius: 4px;
      display: grid; place-items: center; font-size: 11px; flex-shrink: 0;
    }

    .ecat-name { font-size: 12px; color: var(--text-secondary); min-width: 90px; }

    .ecat-bar { flex: 1; height: 6px; background: var(--border-light); border-radius: 10px; overflow: hidden; }
    .ecat-bar-fill { height: 100%; border-radius: 10px; }
    .ecat-count { font-size: 11px; font-weight: 700; min-width: 32px; text-align: right; }

    /* Top Users */
    .tu-row {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .tu-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      display: grid; place-items: center;
      font-size: 10px; font-weight: 700; color: white; flex-shrink: 0;
    }

    .tu-info { min-width: 0; }
    .tu-name { display: block; font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tu-role { display: block; font-size: 10px; color: var(--text-tertiary); }

    .tu-bar { flex: 1; height: 5px; background: var(--border-light); border-radius: 10px; overflow: hidden; }
    .tu-bar-fill { height: 100%; background: var(--primary); border-radius: 10px; }
    .tu-count { font-size: 11px; font-weight: 700; min-width: 28px; text-align: right; }

    /* Heatmap */
    .heatmap { display: flex; gap: 4px; }

    .hm-y-labels { display: flex; flex-direction: column; gap: 2px; justify-content: space-between; }
    .hm-y { font-size: 9px; color: var(--text-tertiary); line-height: 14px; min-width: 28px; }

    .hm-grid { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .hm-row { display: flex; gap: 2px; }

    .hm-cell {
      flex: 1; height: 14px; border-radius: 2px;
      min-width: 4px; cursor: crosshair;
    }

    .hm-x-labels {
      display: flex; justify-content: space-between;
      margin-top: 4px; margin-left: 32px;
      span { font-size: 8px; color: var(--text-tertiary); }
    }

    .hm-legend {
      display: flex; align-items: center; gap: 3px;
      margin-top: 8px; justify-content: flex-end;
    }

    .hm-leg-label { font-size: 9px; color: var(--text-tertiary); }
    .hm-leg-cell { width: 12px; height: 12px; border-radius: 2px; }

    /* Filters */
    .filter-bar {
      display: flex; gap: 10px; align-items: center;
      margin-bottom: 14px; flex-wrap: wrap;
    }

    .filter-search {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 14px; background: var(--bg-card);
      border: 1px solid var(--border); border-radius: var(--radius-md);
      i { color: var(--text-tertiary); font-size: 14px; }
    }

    .filter-search-input {
      border: none; outline: none; background: transparent;
      font-size: 13px; font-family: var(--font-sans);
      color: var(--text-primary); width: 240px;
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

    /* Table Specifics */
    .ts { font-size: 11px; color: var(--text-tertiary); white-space: nowrap; }

    .user-cell { display: flex; align-items: center; gap: 8px; }

    .user-avatar-sm {
      width: 26px; height: 26px; border-radius: 50%;
      display: grid; place-items: center;
      font-size: 9px; font-weight: 700; color: white; flex-shrink: 0;
    }

    .user-name-sm { font-size: 12px; font-weight: 600; color: var(--text-primary); }

    .action-chip {
      font-size: 10px; font-weight: 700; padding: 3px 10px;
      border-radius: 10px; text-transform: uppercase; letter-spacing: 0.3px;
      white-space: nowrap;
    }

    .resource-cell { }
    .resource-type { display: block; font-size: 12px; color: var(--text-secondary); font-weight: 600; }
    .resource-id { display: block; font-size: 10px; color: var(--text-tertiary); }

    .sev-chip {
      font-size: 9px; font-weight: 800; padding: 2px 8px;
      border-radius: 8px; text-transform: uppercase; letter-spacing: 0.3px;
      &.sev-info { background: #EFF6FF; color: #2563EB; }
      &.sev-low { background: #ECFDF5; color: #059669; }
      &.sev-medium { background: #FEF3C7; color: #92400E; }
      &.sev-high { background: #FEE2E2; color: #DC2626; }
      &.sev-critical { background: #DC2626; color: white; }
    }

    .ip { font-size: 11px; color: var(--text-tertiary); }
    .detail-preview { font-size: 11.5px; color: var(--text-secondary); max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }

    tr.highlight { background: #FFF5F5; }

    .expand-btn {
      background: none; border: none; color: var(--text-tertiary);
      cursor: pointer; font-size: 14px; padding: 4px;
      &:hover { color: var(--text-primary); }
    }

    /* Detail Row */
    .detail-row td {
      padding: 0 !important; background: var(--bg-section);
    }

    .event-detail { padding: 14px 20px; animation: slideDown 0.2s ease; }

    @keyframes slideDown { from { opacity: 0; } to { opacity: 1; } }

    .ed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

    .ed-title {
      font-size: 10.5px; font-weight: 700; color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px;
    }

    .ed-kv {
      display: flex; justify-content: space-between;
      padding: 4px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .ed-k { font-size: 12px; color: var(--text-tertiary); }
    .ed-v { font-size: 12px; color: var(--text-primary); }

    .ed-change {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .edc-field { font-size: 12px; color: var(--text-secondary); font-weight: 600; min-width: 80px; }
    .edc-from { font-size: 11px; color: #DC2626; background: #FEE2E2; padding: 1px 6px; border-radius: 3px; }
    .edc-to { font-size: 11px; color: #059669; background: #ECFDF5; padding: 1px 6px; border-radius: 3px; }

    /* Pagination */
    .pagination {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 20px; border-top: 1px solid var(--border-light);
    }

    .pg-info { font-size: 12px; color: var(--text-tertiary); }
    .pg-controls { display: flex; gap: 4px; }

    .pg-btn {
      width: 30px; height: 30px; border-radius: var(--radius-sm);
      border: 1px solid var(--border); background: var(--bg-white);
      display: grid; place-items: center; cursor: pointer;
      font-size: 12px; font-family: var(--font-sans); color: var(--text-secondary);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary); border-color: var(--primary); color: white; }
      &:disabled { opacity: 0.4; cursor: default; }
    }

    .pg-dots { font-size: 12px; color: var(--text-tertiary); display: grid; place-items: center; width: 20px; }

    @media (max-width: 1200px) {
      .kpi-row { grid-template-columns: repeat(3, 1fr); }
      .summary-row { grid-template-columns: 1fr; }
      .ed-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AuditLogComponent {
  activeActionFilter = 'All';
  activeSeverityFilter = 'All';
  searchTerm = '';
  expandedEvent = '';
  totalEvents = 2480;

  actionFilters = ['All', 'Create', 'Update', 'Delete', 'Login', 'Export', 'Agent Run'];
  severityFilters = ['All', 'Info', 'Low', 'Medium', 'High', 'Critical'];

  kpis = [
    { label: 'Total Events (7d)', value: '2,480', trend: '↑ 8%', trendDir: 'neutral', footnote: 'all recorded actions', accent: 'teal' },
    { label: 'Unique Users', value: '12', trend: null, trendDir: '', footnote: 'active in period', accent: 'blue' },
    { label: 'Security Events', value: '18', trend: '↓ 42%', trendDir: 'positive', footnote: 'login failures, access denied', accent: 'red' },
    { label: 'Data Modifications', value: '842', trend: null, trendDir: '', footnote: 'creates, updates, deletes', accent: 'purple' },
    { label: 'Agent Actions', value: '316', trend: '↑ 24%', trendDir: 'neutral', footnote: 'AI-initiated operations', accent: 'green' },
  ];

  eventCategories = [
    { name: 'Data Read', count: 1180, icon: 'bi-eye', iconBg: '#EFF6FF', iconColor: '#2563EB' },
    { name: 'Data Modify', count: 842, icon: 'bi-pencil', iconBg: '#E8F5F1', iconColor: '#0D6B5C' },
    { name: 'Agent Execution', count: 316, icon: 'bi-robot', iconBg: '#EDE9FE', iconColor: '#7C3AED' },
    { name: 'Authentication', count: 86, icon: 'bi-shield-lock', iconBg: '#ECFDF5', iconColor: '#059669' },
    { name: 'Configuration', count: 38, icon: 'bi-gear', iconBg: '#FEF3C7', iconColor: '#D97706' },
    { name: 'Export / Download', count: 18, icon: 'bi-download', iconBg: '#F3F4F6', iconColor: '#6B7280' },
  ];

  get maxCategoryCount() { return Math.max(...this.eventCategories.map(c => c.count)); }

  topUsers = [
    { name: 'Sarah Chen', initials: 'SC', color: '#0D6B5C', role: 'Admin', actions: 486 },
    { name: 'Michael Torres', initials: 'MT', color: '#2563EB', role: 'Controller', actions: 412 },
    { name: 'David Kim', initials: 'DK', color: '#059669', role: 'Analyst', actions: 384 },
    { name: 'Jennifer Park', initials: 'JP', color: '#7C3AED', role: 'Controller', actions: 368 },
    { name: 'System (AI Agent)', initials: 'AI', color: '#D97706', role: 'Automated', actions: 316 },
    { name: 'Emily Watson', initials: 'EW', color: '#DC2626', role: 'Analyst', actions: 284 },
  ];

  get maxUserActions() { return Math.max(...this.topUsers.map(u => u.actions)); }

  heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  heatmapData = [
    [2, 0, 0, 0, 1, 8, 22, 38, 42, 48, 52, 44, 40, 38, 42, 48, 52, 36, 18, 8, 4, 2, 1, 0],
    [1, 0, 0, 1, 0, 6, 18, 34, 48, 52, 56, 48, 42, 44, 48, 52, 48, 32, 14, 6, 2, 1, 0, 0],
    [0, 0, 1, 0, 0, 8, 20, 36, 44, 50, 58, 52, 46, 42, 46, 50, 44, 28, 12, 4, 2, 0, 0, 1],
    [2, 0, 0, 0, 1, 10, 24, 40, 46, 54, 60, 48, 44, 40, 44, 48, 46, 30, 16, 6, 2, 1, 0, 0],
    [0, 0, 0, 1, 0, 6, 16, 32, 42, 48, 54, 46, 40, 38, 42, 44, 38, 24, 10, 4, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 4, 6, 8, 10, 8, 6, 4, 6, 4, 2, 2, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 2, 4, 6, 4, 2, 4, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  getHeatColor(value: number): string {
    if (value === 0) return '#F3F4F6';
    if (value < 10) return '#D1FAE5';
    if (value < 30) return '#6EE7B7';
    if (value < 50) return '#34D399';
    return '#059669';
  }

  auditEvents = [
    { id: 'EVT-2480', timestamp: 'Feb 6, 2:18 PM', user: 'Sarah Chen', userInitials: 'SC', userColor: '#0D6B5C', action: 'Update', resourceType: 'Alert Rule', resourceId: 'RUL-001', severity: 'Medium', ip: '10.0.1.42', detail: 'Updated threshold from 1.2x to 1.5x on Cash Covenant rule', module: 'Risk Intelligence', sessionId: 'ses_8x2k4m', userAgent: 'Chrome 120 / macOS', changes: [{ field: 'threshold', from: '1.2x', to: '1.5x' }, { field: 'updated_at', from: '—', to: '2:18 PM' }] },
    { id: 'EVT-2479', timestamp: 'Feb 6, 2:15 PM', user: 'System (AI)', userInitials: 'AI', userColor: '#D97706', action: 'Agent Run', resourceType: 'Cash Flow Agent', resourceId: 'AGT-CF-001', severity: 'Info', ip: '10.0.0.1', detail: 'Completed 13-week forecast refresh — 94% confidence', module: 'Agent Studio', sessionId: 'sys_auto', userAgent: 'LangGraph Engine v2.1', changes: [] },
    { id: 'EVT-2478', timestamp: 'Feb 6, 2:12 PM', user: 'Michael Torres', userInitials: 'MT', userColor: '#2563EB', action: 'Create', resourceType: 'Journal Entry', resourceId: 'JE-2026-0842', severity: 'Low', ip: '10.0.1.38', detail: 'Posted accrual JE for Q1 insurance premium — $24,600', module: 'Accounting', sessionId: 'ses_3m9n7p', userAgent: 'Chrome 120 / Windows', changes: [] },
    { id: 'EVT-2477', timestamp: 'Feb 6, 2:10 PM', user: 'David Kim', userInitials: 'DK', userColor: '#059669', action: 'Export', resourceType: 'Budget Report', resourceId: 'RPT-BUD-Q1', severity: 'Info', ip: '10.0.1.55', detail: 'Exported Q1 budget vs actual report as PDF', module: 'FP&A', sessionId: 'ses_5r2t8y', userAgent: 'Chrome 120 / macOS', changes: [] },
    { id: 'EVT-2476', timestamp: 'Feb 6, 2:08 PM', user: 'System (AI)', userInitials: 'AI', userColor: '#D97706', action: 'Agent Run', resourceType: 'Recon Agent', resourceId: 'AGT-RC-002', severity: 'Medium', ip: '10.0.0.1', detail: 'Identified $62.4K variance in accounts receivable reconciliation', module: 'Agent Studio', sessionId: 'sys_auto', userAgent: 'LangGraph Engine v2.1', changes: [] },
    { id: 'EVT-2475', timestamp: 'Feb 6, 2:05 PM', user: 'Jennifer Park', userInitials: 'JP', userColor: '#7C3AED', action: 'Update', resourceType: 'Cash Position', resourceId: 'CP-2026-02-06', severity: 'Low', ip: '10.0.1.44', detail: 'Updated end-of-day cash position for JPM operating account', module: 'Treasury', sessionId: 'ses_7k1w3q', userAgent: 'Firefox 122 / macOS', changes: [{ field: 'balance', from: '$8,420,000', to: '$8,680,000' }, { field: 'status', from: 'Provisional', to: 'Confirmed' }] },
    { id: 'EVT-2474', timestamp: 'Feb 6, 2:02 PM', user: 'Sarah Chen', userInitials: 'SC', userColor: '#0D6B5C', action: 'Delete', resourceType: 'API Key', resourceId: 'key_dev_4j7', severity: 'High', ip: '10.0.1.42', detail: 'Revoked development test API key — expired and unused', module: 'Admin', sessionId: 'ses_8x2k4m', userAgent: 'Chrome 120 / macOS', changes: [{ field: 'status', from: 'Expired', to: 'Revoked' }] },
    { id: 'EVT-2473', timestamp: 'Feb 6, 1:58 PM', user: 'Unknown', userInitials: '??', userColor: '#DC2626', action: 'Login', resourceType: 'Auth Session', resourceId: '—', severity: 'Critical', ip: '203.0.113.99', detail: 'Failed login attempt — invalid credentials (3rd attempt from this IP)', module: 'Auth', sessionId: '—', userAgent: 'Python-requests/2.31', changes: [] },
    { id: 'EVT-2472', timestamp: 'Feb 6, 1:55 PM', user: 'Emily Watson', userInitials: 'EW', userColor: '#DC2626', action: 'Create', resourceType: 'Forecast', resourceId: 'FCT-REV-Q2', severity: 'Low', ip: '10.0.1.60', detail: 'Created new Q2 revenue forecast scenario — conservative', module: 'FP&A', sessionId: 'ses_4j7x9m', userAgent: 'Chrome 120 / Windows', changes: [] },
    { id: 'EVT-2471', timestamp: 'Feb 6, 1:50 PM', user: 'Maria Chen', userInitials: 'MC', userColor: '#4F46E5', action: 'Export', resourceType: 'Audit Log', resourceId: 'AUDIT-7d', severity: 'Info', ip: '10.0.1.72', detail: 'Exported 7-day audit log for SOX compliance review', module: 'Admin', sessionId: 'ses_2n4c6b', userAgent: 'Chrome 120 / macOS', changes: [] },
    { id: 'EVT-2470', timestamp: 'Feb 6, 1:48 PM', user: 'System (AI)', userInitials: 'AI', userColor: '#D97706', action: 'Agent Run', resourceType: 'Close Checklist Agent', resourceId: 'AGT-CL-003', severity: 'Info', ip: '10.0.0.1', detail: 'Auto-completed Task 4.2 (Bank reconciliation) — all items matched', module: 'Agent Studio', sessionId: 'sys_auto', userAgent: 'n8n Orchestrator v1.4', changes: [{ field: 'task_status', from: 'In Progress', to: 'Completed' }] },
    { id: 'EVT-2469', timestamp: 'Feb 6, 1:45 PM', user: 'Robert Liu', userInitials: 'RL', userColor: '#DC2626', action: 'Update', resourceType: 'GL Account', resourceId: 'ACCT-4100', severity: 'High', ip: '10.0.1.48', detail: 'Modified chart of accounts — renamed Revenue account 4100', module: 'Accounting', sessionId: 'ses_9p6r2t', userAgent: 'Chrome 120 / Windows', changes: [{ field: 'name', from: 'Revenue - Services', to: 'Revenue - Professional Services' }] },
  ];

  get filteredEvents() {
    let result = this.auditEvents;
    if (this.activeActionFilter !== 'All') result = result.filter(e => e.action === this.activeActionFilter);
    if (this.activeSeverityFilter !== 'All') result = result.filter(e => e.severity === this.activeSeverityFilter);
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(e =>
        e.user.toLowerCase().includes(t) || e.detail.toLowerCase().includes(t) ||
        e.resourceType.toLowerCase().includes(t) || e.resourceId.toLowerCase().includes(t)
      );
    }
    return result;
  }

  getActionBg(action: string): string {
    const m: any = { Create: '#ECFDF5', Update: '#EFF6FF', Delete: '#FEE2E2', Login: '#FEF3C7', Export: '#F3F4F6', 'Agent Run': '#EDE9FE' };
    return m[action] || '#F3F4F6';
  }

  getActionColor(action: string): string {
    const m: any = { Create: '#059669', Update: '#2563EB', Delete: '#DC2626', Login: '#92400E', Export: '#6B7280', 'Agent Run': '#7C3AED' };
    return m[action] || '#6B7280';
  }

  onSearch(event: Event) { this.searchTerm = (event.target as HTMLInputElement).value; }
}