import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-alert-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/risk-intelligence">Risk Intelligence</a>
      <span class="separator">/</span>
      <span class="current">Alert History</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Alert History</h1>
        <p class="afda-page-subtitle">Historical alert log, resolution analytics, and response time trends</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>YTD</option>
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
            <span class="afda-stat-trend" [ngClass]="kpi.trendDir">{{ kpi.trend }}</span>
          </div>
          <div class="afda-stat-footnote">{{ kpi.footnote }}</div>
        </div>
      }
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- Alert Volume (30-day stacked bar) -->
      <div class="afda-card" style="flex: 2; animation: fadeUp 0.4s ease 0.08s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Alert Volume (30 Days)</div>
          <div class="chart-legend">
            <span class="cl-item"><span class="cl-dot" style="background: #DC2626;"></span> Critical</span>
            <span class="cl-item"><span class="cl-dot" style="background: #D97706;"></span> High</span>
            <span class="cl-item"><span class="cl-dot" style="background: #2563EB;"></span> Medium</span>
            <span class="cl-item"><span class="cl-dot" style="background: #9CA3AF;"></span> Low</span>
          </div>
        </div>
        <div class="bar-chart">
          @for (day of volumeData; track day.label) {
            <div class="bc-col">
              <div class="bc-stacked">
                @for (seg of day.segments; track seg.color) {
                  <div class="bc-seg" [style.flex-grow]="seg.value"
                       [style.background]="seg.color" [title]="seg.label + ': ' + seg.value"></div>
                }
              </div>
              <span class="bc-label">{{ day.label }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Resolution Breakdown -->
      <div class="afda-card" style="flex: 1; animation: fadeUp 0.4s ease 0.1s both;">
        <div class="afda-card-title" style="margin-bottom: 14px;">Resolution Breakdown</div>
        <div class="donut-container">
          <svg viewBox="0 0 120 120" class="donut-svg">
            @for (seg of donutSegments; track seg.label) {
              <circle cx="60" cy="60" r="48" fill="none"
                      [attr.stroke]="seg.color" stroke-width="16"
                      [attr.stroke-dasharray]="seg.dash"
                      [attr.stroke-dashoffset]="seg.offset"
                      transform="rotate(-90 60 60)"/>
            }
          </svg>
          <div class="donut-center">
            <div class="donut-val font-mono">{{ totalResolved }}</div>
            <div class="donut-lbl">Total</div>
          </div>
        </div>
        <div class="donut-legend">
          @for (seg of donutSegments; track seg.label) {
            <div class="dl-item">
              <div class="dl-dot" [style.background]="seg.color"></div>
              <span class="dl-label">{{ seg.label }}</span>
              <span class="dl-value font-mono">{{ seg.count }}</span>
              <span class="dl-pct font-mono">{{ seg.pct }}%</span>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar stagger">
      <div class="filter-search">
        <i class="bi bi-search"></i>
        <input type="text" placeholder="Search alerts..." class="filter-search-input" (input)="onSearch($event)">
      </div>
      <div class="filter-chips">
        @for (sev of severityFilters; track sev) {
          <button class="filter-chip" [class.active]="activeSeverity === sev"
                  (click)="activeSeverity = sev">{{ sev }}</button>
        }
      </div>
      <div class="filter-chips">
        @for (res of resolutionFilters; track res) {
          <button class="filter-chip" [class.active]="activeResolution === res"
                  (click)="activeResolution = res">{{ res }}</button>
        }
      </div>
    </div>

    <!-- Alert History Table -->
    <div class="afda-card" style="animation: fadeUp 0.4s ease 0.14s both;">
      <table class="afda-table">
        <thead>
          <tr>
            <th>Alert ID</th>
            <th>Severity</th>
            <th>Title</th>
            <th>Category</th>
            <th>Triggered</th>
            <th>Response Time</th>
            <th>Resolution</th>
            <th>Resolved By</th>
          </tr>
        </thead>
        <tbody>
          @for (alert of filteredHistory; track alert.id) {
            <tr [class.expandable]="true" (click)="toggleDetail(alert.id)">
              <td><span class="font-mono alert-id">{{ alert.id }}</span></td>
              <td>
                <span class="sev-chip" [style.background]="getSevBg(alert.severity)"
                      [style.color]="getSevColor(alert.severity)">{{ alert.severity }}</span>
              </td>
              <td>
                <div class="alert-title-cell">{{ alert.title }}</div>
              </td>
              <td><span class="cat-text">{{ alert.category }}</span></td>
              <td>
                <div class="time-cell">
                  <span class="time-date">{{ alert.triggeredDate }}</span>
                  <span class="time-time font-mono">{{ alert.triggeredTime }}</span>
                </div>
              </td>
              <td>
                <span class="response-time font-mono" [ngClass]="alert.responseClass">{{ alert.responseTime }}</span>
              </td>
              <td>
                <span class="res-chip" [style.background]="getResBg(alert.resolution)"
                      [style.color]="getResColor(alert.resolution)">{{ alert.resolution }}</span>
              </td>
              <td>
                <div class="resolver-cell">
                  @if (alert.resolvedBy === 'AI Auto-Resolved') {
                    <i class="bi bi-robot" style="color: var(--primary); margin-right: 4px;"></i>
                  }
                  <span>{{ alert.resolvedBy }}</span>
                </div>
              </td>
            </tr>
            @if (expandedDetail === alert.id) {
              <tr class="detail-row">
                <td colspan="8">
                  <div class="detail-content">
                    <div class="dc-section">
                      <div class="dc-label">Description</div>
                      <div class="dc-text">{{ alert.description }}</div>
                    </div>
                    <div class="dc-section">
                      <div class="dc-label">Root Cause</div>
                      <div class="dc-text">{{ alert.rootCause }}</div>
                    </div>
                    <div class="dc-metrics">
                      @for (m of alert.metrics; track m.label) {
                        <div class="dc-metric">
                          <span class="dc-metric-label">{{ m.label }}</span>
                          <span class="dc-metric-value font-mono">{{ m.value }}</span>
                        </div>
                      }
                    </div>
                    <div class="dc-timeline">
                      @for (ev of alert.timeline; track ev.time) {
                        <div class="dc-tl-item">
                          <div class="dc-tl-dot" [style.background]="ev.color"></div>
                          <span class="dc-tl-time font-mono">{{ ev.time }}</span>
                          <span class="dc-tl-text">{{ ev.text }}</span>
                        </div>
                      }
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
        <span class="pg-info">Showing 1–12 of 142 alerts</span>
        <div class="pg-btns">
          <button class="pg-btn" disabled><i class="bi bi-chevron-left"></i></button>
          <button class="pg-btn pg-active">1</button>
          <button class="pg-btn">2</button>
          <button class="pg-btn">3</button>
          <span class="pg-dots">…</span>
          <button class="pg-btn">12</button>
          <button class="pg-btn"><i class="bi bi-chevron-right"></i></button>
        </div>
      </div>
    </div>

    <!-- Bottom Analytics Row -->
    <div class="analytics-row">
      <!-- Response Time Distribution -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.18s both;">
        <div class="afda-card-title" style="margin-bottom: 14px;">Response Time Distribution</div>
        <div class="rt-dist">
          @for (bucket of responseTimeBuckets; track bucket.label) {
            <div class="rt-bar-row">
              <span class="rt-label">{{ bucket.label }}</span>
              <div class="rt-bar">
                <div class="rt-bar-fill" [style.width.%]="bucket.pct" [style.background]="bucket.color"></div>
              </div>
              <span class="rt-count font-mono">{{ bucket.count }}</span>
              <span class="rt-pct font-mono">{{ bucket.pct }}%</span>
            </div>
          }
        </div>
      </div>

      <!-- Top Triggered Rules -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.2s both;">
        <div class="afda-card-title" style="margin-bottom: 14px;">Top Triggered Rules</div>
        @for (rule of topRules; track rule.name) {
          <div class="tr-item">
            <div class="tr-sev-dot" [style.background]="getSevColor(rule.severity)"></div>
            <div class="tr-info">
              <div class="tr-name">{{ rule.name }}</div>
              <div class="tr-meta">{{ rule.category }} · {{ rule.falseRate }} false positive</div>
            </div>
            <div class="tr-count-bar">
              <div class="tr-bar">
                <div class="tr-bar-fill" [style.width.%]="(rule.count / 24) * 100" style="background: var(--primary);"></div>
              </div>
              <span class="tr-count font-mono">{{ rule.count }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Severity Trend -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.22s both;">
        <div class="afda-card-title" style="margin-bottom: 14px;">Severity Trend (Weeks)</div>
        <div class="sev-trend-grid">
          <div class="st-header">
            <span></span>
            @for (wk of ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4']; track wk) {
              <span class="st-wk">{{ wk }}</span>
            }
          </div>
          @for (row of sevTrendData; track row.severity) {
            <div class="st-row">
              <span class="st-label" [style.color]="getSevColor(row.severity)">{{ row.severity }}</span>
              @for (val of row.values; track $index) {
                <div class="st-cell" [style.background]="getSevBg(row.severity)"
                     [style.color]="getSevColor(row.severity)">
                  <span class="font-mono">{{ val }}</span>
                </div>
              }
            </div>
          }
        </div>
        <div class="sev-trend-summary">
          <span class="sts-item positive"><i class="bi bi-arrow-down"></i> Critical alerts down 33% WoW</span>
          <span class="sts-item negative"><i class="bi bi-arrow-up"></i> High alerts up 20% WoW</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* KPIs */
    .kpi-row {
      display: grid; grid-template-columns: repeat(6, 1fr);
      gap: 12px; margin-bottom: 16px;
    }

    /* Charts Row */
    .charts-row { display: flex; gap: 16px; margin-bottom: 16px; }

    /* Bar Chart */
    .bar-chart {
      display: flex; gap: 4px; align-items: flex-end; height: 140px; padding-top: 8px;
    }

    .bc-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }

    .bc-stacked {
      display: flex; flex-direction: column-reverse;
      width: 100%; max-width: 20px; height: 120px;
      border-radius: 3px 3px 0 0; overflow: hidden;
    }

    .bc-seg { min-height: 2px; transition: flex-grow 0.3s; }

    .bc-label { font-size: 9px; color: var(--text-tertiary); white-space: nowrap; }

    .chart-legend { display: flex; gap: 12px; }

    .cl-item {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; color: var(--text-tertiary);
    }

    .cl-dot { width: 8px; height: 8px; border-radius: 2px; }

    /* Donut */
    .donut-container {
      position: relative; width: 130px; height: 130px; margin: 0 auto 14px;
    }

    .donut-svg { width: 100%; height: 100%; }

    .donut-center {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }

    .donut-val { font-size: 22px; font-weight: 800; color: var(--text-primary); }
    .donut-lbl { font-size: 10px; color: var(--text-tertiary); }

    .donut-legend { display: flex; flex-direction: column; gap: 6px; }

    .dl-item { display: flex; align-items: center; gap: 8px; }
    .dl-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
    .dl-label { font-size: 12px; color: var(--text-secondary); flex: 1; }
    .dl-value { font-size: 12px; font-weight: 700; min-width: 28px; }
    .dl-pct { font-size: 11px; color: var(--text-tertiary); min-width: 32px; text-align: right; }

    /* Filters */
    .filter-bar {
      display: flex; gap: 10px; align-items: center; margin-bottom: 16px; flex-wrap: wrap;
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
      color: var(--text-primary); width: 160px;
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

    /* Table Enhancements */
    .alert-id { font-size: 11px; color: var(--primary); }

    .sev-chip {
      font-size: 10px; font-weight: 700; padding: 2px 8px;
      border-radius: 10px; text-transform: uppercase; letter-spacing: 0.3px;
    }

    .alert-title-cell {
      font-size: 12.5px; font-weight: 500; color: var(--text-primary);
      max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .cat-text { font-size: 12px; color: var(--text-secondary); }

    .time-cell { display: flex; flex-direction: column; }
    .time-date { font-size: 11.5px; color: var(--text-primary); }
    .time-time { font-size: 10.5px; color: var(--text-tertiary); }

    .response-time {
      font-size: 12px; font-weight: 600;
      &.fast { color: #059669; }
      &.moderate { color: #D97706; }
      &.slow { color: #DC2626; }
    }

    .res-chip {
      font-size: 10px; font-weight: 600; padding: 2px 8px;
      border-radius: 10px;
    }

    .resolver-cell {
      display: flex; align-items: center;
      font-size: 12px; color: var(--text-secondary);
    }

    tr.expandable { cursor: pointer; }
    tr.expandable:hover td { background: var(--bg-section); }

    /* Detail Row */
    .detail-row td { padding: 0 !important; }

    .detail-content {
      padding: 16px 20px; background: var(--bg-section);
      border-top: 1px solid var(--border-light);
      animation: slideDown 0.2s ease;
    }

    @keyframes slideDown { from { opacity: 0; } to { opacity: 1; } }

    .dc-section { margin-bottom: 12px; }
    .dc-label {
      font-size: 10.5px; font-weight: 700; color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 3px;
    }
    .dc-text { font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; }

    .dc-metrics { display: flex; gap: 16px; margin-bottom: 12px; }

    .dc-metric {
      padding: 8px 14px; background: var(--bg-white);
      border: 1px solid var(--border-light); border-radius: var(--radius-sm);
    }

    .dc-metric-label { display: block; font-size: 10px; color: var(--text-tertiary); }
    .dc-metric-value { display: block; font-size: 14px; font-weight: 700; color: var(--text-primary); }

    .dc-timeline { display: flex; flex-direction: column; gap: 4px; }

    .dc-tl-item { display: flex; align-items: center; gap: 8px; }
    .dc-tl-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .dc-tl-time { font-size: 10.5px; color: var(--text-tertiary); min-width: 65px; }
    .dc-tl-text { font-size: 12px; color: var(--text-secondary); }

    /* Pagination */
    .pagination {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 0 4px; border-top: 1px solid var(--border-light); margin-top: 4px;
    }

    .pg-info { font-size: 12px; color: var(--text-tertiary); }

    .pg-btns { display: flex; gap: 4px; align-items: center; }

    .pg-btn {
      width: 30px; height: 30px; border: 1px solid var(--border);
      border-radius: var(--radius-sm); background: var(--bg-white);
      font-size: 12px; font-family: var(--font-sans); cursor: pointer;
      display: grid; place-items: center; color: var(--text-secondary);
      transition: all 0.1s;
      &:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
      &.pg-active { background: var(--primary); border-color: var(--primary); color: white; font-weight: 600; }
      &:disabled { opacity: 0.4; cursor: default; }
    }

    .pg-dots { font-size: 12px; color: var(--text-tertiary); padding: 0 4px; }

    /* Analytics Row */
    .analytics-row {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      gap: 16px; margin-top: 16px;
    }

    /* Response Time Distribution */
    .rt-dist { display: flex; flex-direction: column; gap: 8px; }

    .rt-bar-row { display: flex; align-items: center; gap: 8px; }
    .rt-label { font-size: 11.5px; color: var(--text-secondary); min-width: 55px; }

    .rt-bar {
      flex: 1; height: 8px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .rt-bar-fill { height: 100%; border-radius: 10px; }
    .rt-count { font-size: 12px; font-weight: 700; min-width: 24px; text-align: right; }
    .rt-pct { font-size: 11px; color: var(--text-tertiary); min-width: 30px; text-align: right; }

    /* Top Triggered Rules */
    .tr-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .tr-sev-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .tr-info { flex: 1; min-width: 0; }
    .tr-name { font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tr-meta { font-size: 10.5px; color: var(--text-tertiary); }

    .tr-count-bar { display: flex; align-items: center; gap: 6px; min-width: 100px; }

    .tr-bar {
      flex: 1; height: 6px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .tr-bar-fill { height: 100%; border-radius: 10px; }
    .tr-count { font-size: 12px; font-weight: 700; }

    /* Severity Trend */
    .sev-trend-grid { }

    .st-header {
      display: grid; grid-template-columns: 60px repeat(4, 1fr);
      gap: 4px; margin-bottom: 6px;
    }

    .st-wk { font-size: 10px; color: var(--text-tertiary); text-align: center; }

    .st-row {
      display: grid; grid-template-columns: 60px repeat(4, 1fr);
      gap: 4px; margin-bottom: 4px;
    }

    .st-label { font-size: 11px; font-weight: 600; display: flex; align-items: center; }

    .st-cell {
      text-align: center; padding: 8px 4px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 700;
    }

    .sev-trend-summary { margin-top: 12px; display: flex; flex-direction: column; gap: 4px; }

    .sts-item {
      font-size: 11px; display: flex; align-items: center; gap: 4px;
      &.positive { color: #059669; }
      &.negative { color: #DC2626; }
    }

    @media (max-width: 1200px) {
      .kpi-row { grid-template-columns: repeat(3, 1fr); }
      .charts-row { flex-direction: column; }
      .analytics-row { grid-template-columns: 1fr; }
    }
  `]
})
export class AlertHistoryComponent {
  selectedPeriod = 'Last 30 Days';
  activeSeverity = 'All';
  activeResolution = 'All';
  searchTerm = '';
  expandedDetail = '';

  severityFilters = ['All', 'Critical', 'High', 'Medium', 'Low'];
  resolutionFilters = ['All', 'Resolved', 'Auto-Resolved', 'Dismissed', 'Escalated'];

  kpis = [
    { label: 'Total Alerts', value: '142', trend: '↓ 12%', trendDir: 'positive', footnote: 'vs prior period', accent: 'teal' },
    { label: 'Avg Response Time', value: '4.2m', trend: '↓ 38%', trendDir: 'positive', footnote: 'time to acknowledge', accent: 'green' },
    { label: 'Avg Resolution Time', value: '18m', trend: '↓ 22%', trendDir: 'positive', footnote: 'time to resolve', accent: 'blue' },
    { label: 'AI Auto-Resolved', value: '38%', trend: '↑ 12%', trendDir: 'positive', footnote: 'of total alerts', accent: 'purple' },
    { label: 'False Positive Rate', value: '3.1%', trend: '↓ 0.8%', trendDir: 'positive', footnote: 'last 30 days', accent: 'teal' },
    { label: 'SLA Compliance', value: '96.4%', trend: '↑ 2.1%', trendDir: 'positive', footnote: 'within target time', accent: 'green' },
  ];

  // 30-day volume (just show 14 days for space)
  volumeData = [
    { label: '24', segments: [{ value: 2, color: '#DC2626', label: 'Critical' }, { value: 3, color: '#D97706', label: 'High' }, { value: 1, color: '#2563EB', label: 'Medium' }, { value: 1, color: '#9CA3AF', label: 'Low' }] },
    { label: '25', segments: [{ value: 1, color: '#DC2626', label: 'Critical' }, { value: 2, color: '#D97706', label: 'High' }, { value: 2, color: '#2563EB', label: 'Medium' }, { value: 0, color: '#9CA3AF', label: 'Low' }] },
    { label: '26', segments: [{ value: 0, color: '#DC2626', label: 'Critical' }, { value: 1, color: '#D97706', label: 'High' }, { value: 3, color: '#2563EB', label: 'Medium' }, { value: 1, color: '#9CA3AF', label: 'Low' }] },
    { label: '27', segments: [{ value: 1, color: '#DC2626', label: 'Critical' }, { value: 4, color: '#D97706', label: 'High' }, { value: 1, color: '#2563EB', label: 'Medium' }, { value: 0, color: '#9CA3AF', label: 'Low' }] },
    { label: '28', segments: [{ value: 3, color: '#DC2626', label: 'Critical' }, { value: 2, color: '#D97706', label: 'High' }, { value: 2, color: '#2563EB', label: 'Medium' }, { value: 1, color: '#9CA3AF', label: 'Low' }] },
    { label: '29', segments: [{ value: 1, color: '#DC2626', label: 'Critical' }, { value: 1, color: '#D97706', label: 'High' }, { value: 1, color: '#2563EB', label: 'Medium' }, { value: 2, color: '#9CA3AF', label: 'Low' }] },
    { label: '30', segments: [{ value: 0, color: '#DC2626', label: 'Critical' }, { value: 3, color: '#D97706', label: 'High' }, { value: 2, color: '#2563EB', label: 'Medium' }, { value: 0, color: '#9CA3AF', label: 'Low' }] },
    { label: '31', segments: [{ value: 2, color: '#DC2626', label: 'Critical' }, { value: 2, color: '#D97706', label: 'High' }, { value: 1, color: '#2563EB', label: 'Medium' }, { value: 1, color: '#9CA3AF', label: 'Low' }] },
    { label: '1', segments: [{ value: 1, color: '#DC2626', label: 'Critical' }, { value: 3, color: '#D97706', label: 'High' }, { value: 2, color: '#2563EB', label: 'Medium' }, { value: 1, color: '#9CA3AF', label: 'Low' }] },
    { label: '2', segments: [{ value: 0, color: '#DC2626', label: 'Critical' }, { value: 2, color: '#D97706', label: 'High' }, { value: 1, color: '#2563EB', label: 'Medium' }, { value: 2, color: '#9CA3AF', label: 'Low' }] },
    { label: '3', segments: [{ value: 1, color: '#DC2626', label: 'Critical' }, { value: 1, color: '#D97706', label: 'High' }, { value: 3, color: '#2563EB', label: 'Medium' }, { value: 0, color: '#9CA3AF', label: 'Low' }] },
    { label: '4', segments: [{ value: 0, color: '#DC2626', label: 'Critical' }, { value: 2, color: '#D97706', label: 'High' }, { value: 2, color: '#2563EB', label: 'Medium' }, { value: 1, color: '#9CA3AF', label: 'Low' }] },
    { label: '5', segments: [{ value: 1, color: '#DC2626', label: 'Critical' }, { value: 3, color: '#D97706', label: 'High' }, { value: 1, color: '#2563EB', label: 'Medium' }, { value: 1, color: '#9CA3AF', label: 'Low' }] },
    { label: '6', segments: [{ value: 2, color: '#DC2626', label: 'Critical' }, { value: 5, color: '#D97706', label: 'High' }, { value: 4, color: '#2563EB', label: 'Medium' }, { value: 3, color: '#9CA3AF', label: 'Low' }] },
  ];

  totalResolved = 142;

  donutSegments = [
    { label: 'Resolved', count: 68, pct: 48, color: '#059669', dash: '144.5 301.6', offset: '0' },
    { label: 'Auto-Resolved', count: 42, pct: 30, color: 'var(--primary)', dash: '90.5 301.6', offset: '-144.5' },
    { label: 'Dismissed', count: 18, pct: 13, color: '#D97706', dash: '39.2 301.6', offset: '-235' },
    { label: 'Escalated', count: 14, pct: 10, color: '#DC2626', dash: '30.2 301.6', offset: '-274.2' },
  ];

  alertHistory: any[] = [
    { id: 'ALT-1001', severity: 'Critical', title: 'Cash balance below $2M covenant', category: 'Liquidity', triggeredDate: 'Feb 6', triggeredTime: '2:00 PM', responseTime: '2m', responseClass: 'fast', resolution: 'Resolved', resolvedBy: 'J. Park (Treasury)', description: 'Week 6 forecast showed operating cash dipping to $1.8M.', rootCause: 'Large vendor payment timing + delayed AR collections', metrics: [{ label: 'Impact', value: '-$200K' }, { label: 'Duration', value: '42m' }, { label: 'Escalated', value: 'Yes' }], timeline: [{ time: '2:00 PM', text: 'Alert triggered by Forecast Agent', color: '#DC2626' }, { time: '2:02 PM', text: 'Acknowledged by J. Park', color: '#D97706' }, { time: '2:42 PM', text: 'Payment extension negotiated — resolved', color: '#059669' }] },
    { id: 'ALT-1002', severity: 'Critical', title: 'Unreconciled variance exceeds $50K', category: 'Reconciliation', triggeredDate: 'Feb 6', triggeredTime: '1:42 PM', responseTime: '4m', responseClass: 'fast', resolution: 'Resolved', resolvedBy: 'AI Auto-Resolved', description: 'Bank account 4892 had $62.4K unmatched after auto-recon.', rootCause: 'Duplicate JE batch + timing differences', metrics: [{ label: 'Unmatched', value: '$62.4K' }, { label: 'Duration', value: '28m' }, { label: 'AI Confidence', value: '88%' }], timeline: [{ time: '1:42 PM', text: 'Recon agent flagged variance', color: '#DC2626' }, { time: '1:43 PM', text: 'AI identified duplicate JE batch', color: 'var(--primary)' }, { time: '2:10 PM', text: 'Duplicates reversed — auto-resolved', color: '#059669' }] },
    { id: 'ALT-0998', severity: 'High', title: 'IC imbalance Parent ↔ EU Sub ($34.2K)', category: 'Intercompany', triggeredDate: 'Feb 6', triggeredTime: '1:15 PM', responseTime: '7m', responseClass: 'fast', resolution: 'Resolved', resolvedBy: 'S. Chen (Accounting)', description: 'IC balances out of sync by $34.2K.', rootCause: 'Unposted management fee invoice from EU entity', metrics: [{ label: 'Imbalance', value: '$34.2K' }, { label: 'Duration', value: '1h 15m' }, { label: 'Entities', value: '2' }], timeline: [{ time: '1:15 PM', text: 'IC recon detected imbalance', color: '#D97706' }, { time: '1:22 PM', text: 'Acknowledged by S. Chen', color: '#D97706' }, { time: '2:30 PM', text: 'Invoice posted — resolved', color: '#059669' }] },
    { id: 'ALT-0995', severity: 'High', title: 'Marketing spend 42% over budget', category: 'Variance', triggeredDate: 'Feb 6', triggeredTime: '1:00 PM', responseTime: '12m', responseClass: 'moderate', resolution: 'Escalated', resolvedBy: 'VP Finance', description: 'January marketing at $284K vs $200K budget.', rootCause: 'Annual conference + tool renewals front-loaded', metrics: [{ label: 'Variance', value: '+$84K' }, { label: 'Duration', value: '2h 30m' }, { label: 'Impact', value: 'YTD +$84K' }], timeline: [{ time: '1:00 PM', text: 'Materiality threshold exceeded', color: '#D97706' }, { time: '1:12 PM', text: 'Acknowledged by FP&A team', color: '#D97706' }, { time: '3:30 PM', text: 'Escalated to VP Finance for commentary', color: '#DC2626' }] },
    { id: 'ALT-0992', severity: 'High', title: '3 invoices moved to 90+ days past due', category: 'AR Aging', triggeredDate: 'Feb 6', triggeredTime: '12:00 PM', responseTime: '8m', responseClass: 'fast', resolution: 'Resolved', resolvedBy: 'M. Chen (AR)', description: 'TechVentures, GlobalTech, Nexus Corp crossed 90-day threshold.', rootCause: 'Payment disputes + cash flow issues at Nexus Corp', metrics: [{ label: 'At Risk', value: '$88K' }, { label: 'Duration', value: '4h' }, { label: 'Reserve Adj', value: '+$18K' }], timeline: [{ time: '12:00 PM', text: 'Daily AR scan flagged threshold', color: '#D97706' }, { time: '12:08 PM', text: 'Collection calls initiated', color: '#D97706' }, { time: '4:00 PM', text: 'Reserve increased — resolved', color: '#059669' }] },
    { id: 'ALT-0988', severity: 'Medium', title: 'Month-end close Day 5 — 3 tasks overdue', category: 'Close Process', triggeredDate: 'Feb 6', triggeredTime: '11:00 AM', responseTime: '5m', responseClass: 'fast', resolution: 'Resolved', resolvedBy: 'M. Torres (Controller)', description: 'Revenue recognition, lease, and stock comp tasks overdue.', rootCause: 'Resource constraints during close period', metrics: [{ label: 'Tasks', value: '3' }, { label: 'Duration', value: '6h' }, { label: 'Close Day', value: '5 of 7' }], timeline: [{ time: '11:00 AM', text: 'Task deadline passed', color: '#2563EB' }, { time: '11:05 AM', text: 'Acknowledged by Controller', color: '#D97706' }, { time: '5:00 PM', text: 'All 3 tasks completed — resolved', color: '#059669' }] },
    { id: 'ALT-0984', severity: 'Medium', title: 'LangGraph latency spike (218ms avg)', category: 'System', triggeredDate: 'Feb 6', triggeredTime: '10:00 AM', responseTime: '1m', responseClass: 'fast', resolution: 'Auto-Resolved', resolvedBy: 'AI Auto-Resolved', description: 'Latency increased 5x above baseline for 15 minutes.', rootCause: 'Concurrent graph execution during batch close', metrics: [{ label: 'Peak', value: '218ms' }, { label: 'Duration', value: '15m' }, { label: 'Affected', value: '3 agents' }], timeline: [{ time: '10:00 AM', text: 'Latency threshold breached', color: '#2563EB' }, { time: '10:15 AM', text: 'Batch completed — latency normalized', color: '#059669' }, { time: '10:16 AM', text: 'Auto-resolved by monitoring agent', color: '#059669' }] },
    { id: 'ALT-0980', severity: 'Low', title: 'SOX Q1 control testing reminder', category: 'Compliance', triggeredDate: 'Feb 6', triggeredTime: '8:00 AM', responseTime: '—', responseClass: '', resolution: 'Dismissed', resolvedBy: 'A. Patel (Audit)', description: 'Routine quarterly SOX testing cycle reminder.', rootCause: 'Scheduled reminder — no action needed', metrics: [{ label: 'Controls', value: '12' }, { label: 'Deadline', value: 'Feb 14' }], timeline: [{ time: '8:00 AM', text: 'Automated reminder generated', color: '#6B7280' }, { time: '8:30 AM', text: 'Acknowledged and dismissed', color: '#6B7280' }] },
    { id: 'ALT-0975', severity: 'High', title: 'FX exposure exceeds hedge ratio target', category: 'Liquidity', triggeredDate: 'Feb 5', triggeredTime: '3:45 PM', responseTime: '18m', responseClass: 'moderate', resolution: 'Resolved', resolvedBy: 'J. Park (Treasury)', description: 'EUR/USD exposure at 62% vs 80% target hedge ratio.', rootCause: 'New EU contract not yet hedged', metrics: [{ label: 'Exposure', value: '€1.2M' }, { label: 'Duration', value: '2h' }, { label: 'Hedge Gap', value: '18%' }], timeline: [{ time: '3:45 PM', text: 'Hedge ratio threshold breached', color: '#D97706' }, { time: '4:03 PM', text: 'Treasury team notified', color: '#D97706' }, { time: '5:45 PM', text: 'Forward contract placed — resolved', color: '#059669' }] },
    { id: 'ALT-0970', severity: 'Medium', title: 'Token budget at 78% with 8 hours remaining', category: 'System', triggeredDate: 'Feb 5', triggeredTime: '4:00 PM', responseTime: '3m', responseClass: 'fast', resolution: 'Auto-Resolved', resolvedBy: 'AI Auto-Resolved', description: 'Daily token budget consumption rate exceeded forecast.', rootCause: 'Batch reconciliation consumed extra tokens', metrics: [{ label: 'Usage', value: '78%' }, { label: 'Duration', value: '45m' }, { label: 'Budget', value: '3.9M / 5M' }], timeline: [{ time: '4:00 PM', text: 'Budget threshold alert', color: '#2563EB' }, { time: '4:03 PM', text: 'AI deprioritized non-critical tasks', color: 'var(--primary)' }, { time: '4:45 PM', text: 'Budget reset at midnight — resolved', color: '#059669' }] },
    { id: 'ALT-0965', severity: 'Critical', title: 'Cash balance breached $2M — actual', category: 'Liquidity', triggeredDate: 'Feb 5', triggeredTime: '2:30 PM', responseTime: '1m', responseClass: 'fast', resolution: 'Escalated', resolvedBy: 'CFO', description: 'Operating cash dropped to $1.92M intraday.', rootCause: 'Unexpected wire debit + delayed deposit', metrics: [{ label: 'Low Point', value: '$1.92M' }, { label: 'Duration', value: '3h' }, { label: 'Gap', value: '$80K' }], timeline: [{ time: '2:30 PM', text: 'Real-time balance alert triggered', color: '#DC2626' }, { time: '2:31 PM', text: 'Immediately escalated to CFO', color: '#DC2626' }, { time: '3:15 PM', text: 'Emergency credit line draw authorized', color: '#D97706' }, { time: '5:30 PM', text: 'Balance restored above $2M', color: '#059669' }] },
    { id: 'ALT-0960', severity: 'Low', title: 'Scheduled maintenance window approaching', category: 'System', triggeredDate: 'Feb 5', triggeredTime: '9:00 AM', responseTime: '—', responseClass: '', resolution: 'Dismissed', resolvedBy: 'System', description: 'Planned PostgreSQL maintenance in 48 hours.', rootCause: 'Routine maintenance — informational', metrics: [{ label: 'Downtime', value: '15 min' }, { label: 'Window', value: 'Feb 7 2AM' }], timeline: [{ time: '9:00 AM', text: 'Maintenance reminder generated', color: '#6B7280' }] },
  ];

  responseTimeBuckets = [
    { label: '< 2 min', count: 48, pct: 34, color: '#059669' },
    { label: '2–5 min', count: 42, pct: 30, color: '#0D6B5C' },
    { label: '5–15 min', count: 28, pct: 20, color: '#D97706' },
    { label: '15–30 min', count: 14, pct: 10, color: '#F59E0B' },
    { label: '> 30 min', count: 10, pct: 7, color: '#DC2626' },
  ];

  topRules = [
    { name: 'Budget Variance Materiality', severity: 'High', category: 'Variance', count: 24, falseRate: '5.8%' },
    { name: 'AR 90-Day Aging', severity: 'High', category: 'Credit', count: 18, falseRate: '1.2%' },
    { name: 'Close Task Overdue', severity: 'Medium', category: 'Close', count: 18, falseRate: '0%' },
    { name: 'Recon Variance Tolerance', severity: 'Critical', category: 'Recon', count: 12, falseRate: '2.4%' },
    { name: 'Cash Covenant Threshold', severity: 'Critical', category: 'Liquidity', count: 8, falseRate: '0%' },
  ];

  sevTrendData = [
    { severity: 'Critical', values: [6, 4, 5, 4] },
    { severity: 'High', values: [10, 8, 12, 12] },
    { severity: 'Medium', values: [8, 10, 7, 9] },
    { severity: 'Low', values: [4, 3, 5, 3] },
  ];

  get filteredHistory() {
    let result = this.alertHistory;
    if (this.activeSeverity !== 'All') result = result.filter(a => a.severity === this.activeSeverity);
    if (this.activeResolution !== 'All') result = result.filter(a => a.resolution === this.activeResolution || (this.activeResolution === 'Auto-Resolved' && a.resolvedBy === 'AI Auto-Resolved'));
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(a => a.title.toLowerCase().includes(t) || a.id.toLowerCase().includes(t) || a.category.toLowerCase().includes(t));
    }
    return result;
  }

  getSevColor(sev: string): string {
    const m: any = { Critical: '#DC2626', High: '#D97706', Medium: '#2563EB', Low: '#6B7280' };
    return m[sev] || '#6B7280';
  }

  getSevBg(sev: string): string {
    const m: any = { Critical: '#FEE2E2', High: '#FEF3C7', Medium: '#EFF6FF', Low: '#F3F4F6' };
    return m[sev] || '#F3F4F6';
  }

  getResBg(res: string): string {
    const m: any = { Resolved: '#ECFDF5', 'Auto-Resolved': '#E8F5F1', Dismissed: '#F3F4F6', Escalated: '#FEE2E2' };
    return m[res] || '#F3F4F6';
  }

  getResColor(res: string): string {
    const m: any = { Resolved: '#059669', 'Auto-Resolved': '#0D6B5C', Dismissed: '#6B7280', Escalated: '#DC2626' };
    return m[res] || '#6B7280';
  }

  toggleDetail(id: string) { this.expandedDetail = this.expandedDetail === id ? '' : id; }

  onSearch(event: Event) { this.searchTerm = (event.target as HTMLInputElement).value; }
}