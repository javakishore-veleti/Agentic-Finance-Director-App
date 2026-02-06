import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-grafana-embed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/monitoring">Monitoring</a>
      <span class="separator">/</span>
      <span class="current">Grafana Dashboards</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Grafana Dashboards</h1>
        <p class="afda-page-subtitle">Embedded Grafana visualizations for deep infrastructure and application observability</p>
      </div>
      <div class="afda-page-actions">
        <div class="grafana-status" [ngClass]="connectionStatus">
          <span class="gs-dot"></span>
          <span class="gs-text">{{ connectionLabel }}</span>
        </div>
        <button class="afda-btn afda-btn-outline" (click)="openInGrafana()">
          <i class="bi bi-box-arrow-up-right"></i> Open in Grafana
        </button>
        <select class="form-select-sm">
          <option>Last 1 Hour</option>
          <option>Last 6 Hours</option>
          <option selected>Last 24 Hours</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>
    </div>

    <!-- Connection Info Banner -->
    <div class="conn-banner">
      <div class="cb-left">
        <div class="cb-icon"><i class="bi bi-bar-chart-line"></i></div>
        <div>
          <div class="cb-title">Grafana v10.2 · Prometheus Data Source</div>
          <div class="cb-detail">http://localhost:3000 · 12 dashboards · 9 scrape targets · Last sync 8s ago</div>
        </div>
      </div>
      <div class="cb-right">
        <div class="cb-stat">
          <span class="cb-stat-value font-mono">12</span>
          <span class="cb-stat-label">Dashboards</span>
        </div>
        <div class="cb-stat">
          <span class="cb-stat-value font-mono">86</span>
          <span class="cb-stat-label">Panels</span>
        </div>
        <div class="cb-stat">
          <span class="cb-stat-value font-mono">3</span>
          <span class="cb-stat-label">Data Sources</span>
        </div>
      </div>
    </div>

    <!-- Dashboard Selector Tabs -->
    <div class="dash-tabs">
      @for (dash of dashboards; track dash.id) {
        <button class="dash-tab" [class.active]="selectedDashboard === dash.id"
                (click)="selectedDashboard = dash.id">
          <i [class]="'bi ' + dash.icon"></i>
          <span>{{ dash.name }}</span>
        </button>
      }
    </div>

    <!-- Embedded Dashboard Area -->
    <div class="embed-area">
      <div class="embed-frame">
        <!-- Simulated Grafana Dashboard -->
        <div class="gf-toolbar">
          <div class="gf-tb-left">
            <i class="bi bi-bar-chart-line" style="color: #FF6600; font-size: 16px;"></i>
            <span class="gf-tb-title">{{ activeDashboard.name }}</span>
            <span class="gf-tb-tag" *ngIf="activeDashboard.tag">{{ activeDashboard.tag }}</span>
          </div>
          <div class="gf-tb-right">
            <span class="gf-tb-refresh font-mono">Auto-refresh: 10s</span>
            <span class="gf-tb-time font-mono">Last 24 hours</span>
          </div>
        </div>

        <!-- Panel Grid -->
        <div class="gf-panel-grid" [ngClass]="'layout-' + activeDashboard.layout">
          @for (panel of activeDashboard.panels; track panel.title) {
            <div class="gf-panel" [ngClass]="panel.size || ''">
              <div class="gfp-header">
                <span class="gfp-title">{{ panel.title }}</span>
                <i class="bi bi-three-dots-vertical gfp-menu"></i>
              </div>
              <div class="gfp-body">
                @switch (panel.type) {
                  @case ('timeseries') {
                    <div class="gfp-timeseries">
                      @for (line of panel.lines; track line.label) {
                        <div class="gfp-ts-legend">
                          <span class="gfp-ts-dot" [style.background]="line.color"></span>
                          <span class="gfp-ts-label">{{ line.label }}</span>
                          <span class="gfp-ts-val font-mono" [style.color]="line.color">{{ line.current }}</span>
                        </div>
                      }
                      <svg class="gfp-ts-svg" viewBox="0 0 400 80" preserveAspectRatio="none">
                        @for (line of panel.lines; track line.label) {
                          <polyline [attr.points]="line.points" fill="none"
                                    [attr.stroke]="line.color" stroke-width="1.5" stroke-linejoin="round" [attr.opacity]="0.8"/>
                        }
                      </svg>
                    </div>
                  }
                  @case ('gauge') {
                    <div class="gfp-gauge-grid">
                      @for (g of panel.gauges; track g.label) {
                        <div class="gfp-gauge-item">
                          <svg viewBox="0 0 80 50" class="gfp-gauge-svg">
                            <path d="M 10 45 A 30 30 0 0 1 70 45" fill="none" stroke="#E5E7EB" stroke-width="6" stroke-linecap="round"/>
                            <path d="M 10 45 A 30 30 0 0 1 70 45" fill="none"
                                  [attr.stroke]="g.color" stroke-width="6" stroke-linecap="round"
                                  [attr.stroke-dasharray]="g.dash + ' 94.25'"
                                  style="transition: stroke-dasharray 0.5s;"/>
                          </svg>
                          <div class="gfp-gauge-val font-mono" [style.color]="g.color">{{ g.value }}</div>
                          <div class="gfp-gauge-label">{{ g.label }}</div>
                        </div>
                      }
                    </div>
                  }
                  @case ('stat') {
                    <div class="gfp-stat-grid">
                      @for (s of panel.stats; track s.label) {
                        <div class="gfp-stat-item">
                          <div class="gfp-stat-val font-mono" [style.color]="s.color">{{ s.value }}</div>
                          <div class="gfp-stat-label">{{ s.label }}</div>
                        </div>
                      }
                    </div>
                  }
                  @case ('table') {
                    <div class="gfp-table">
                      <div class="gfp-tr gfp-thead">
                        @for (col of panel.columns; track col) {
                          <span class="gfp-th">{{ col }}</span>
                        }
                      </div>
                      @for (row of panel.rows; track $index) {
                        <div class="gfp-tr">
                          @for (cell of row; track $index) {
                            <span class="gfp-td font-mono">{{ cell }}</span>
                          }
                        </div>
                      }
                    </div>
                  }
                  @case ('heatmap') {
                    <div class="gfp-heatmap">
                      @for (row of panel.heatData; track $index) {
                        <div class="gfp-hm-row">
                          @for (cell of row; track $index) {
                            <div class="gfp-hm-cell" [style.background]="cell"></div>
                          }
                        </div>
                      }
                    </div>
                  }
                  @case ('bar') {
                    <div class="gfp-bar-chart">
                      @for (b of panel.bars; track b.label) {
                        <div class="gfp-bar-item">
                          <span class="gfp-bar-label">{{ b.label }}</span>
                          <div class="gfp-bar-track">
                            <div class="gfp-bar-fill" [style.width.%]="b.pct" [style.background]="b.color"></div>
                          </div>
                          <span class="gfp-bar-val font-mono">{{ b.value }}</span>
                        </div>
                      }
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Dashboard Catalog -->
    <div class="catalog-section">
      <div class="cs-header">
        <h3 class="cs-title">Dashboard Catalog</h3>
        <span class="cs-count">{{ allDashboards.length }} dashboards available</span>
      </div>
      <div class="catalog-grid">
        @for (d of allDashboards; track d.name) {
          <div class="cat-card" [class.active]="selectedDashboard === d.id" (click)="selectedDashboard = d.id">
            <div class="cc-icon" [style.background]="d.iconBg">
              <i [class]="'bi ' + d.icon" [style.color]="d.iconColor"></i>
            </div>
            <div class="cc-info">
              <div class="cc-name">{{ d.name }}</div>
              <div class="cc-desc">{{ d.desc }}</div>
            </div>
            <div class="cc-meta">
              <span class="cc-panels font-mono">{{ d.panelCount }} panels</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Grafana Status */
    .grafana-status {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 12px; border-radius: 20px;
      &.connected { background: #ECFDF5; border: 1px solid #A7F3D0; }
      &.disconnected { background: #FEE2E2; border: 1px solid #FCA5A5; }
    }

    .gs-dot {
      width: 8px; height: 8px; border-radius: 50%;
      .connected & { background: #059669; animation: pulse 2s infinite; }
      .disconnected & { background: #DC2626; }
    }

    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

    .gs-text {
      font-size: 11px; font-weight: 700;
      .connected & { color: #059669; }
      .disconnected & { color: #DC2626; }
    }

    /* Connection Banner */
    .conn-banner {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 20px; background: var(--bg-card);
      border: 1px solid var(--border); border-radius: var(--radius-lg);
      margin-bottom: 16px; box-shadow: var(--shadow-sm);
      animation: fadeUp 0.4s ease both;
    }

    .cb-left { display: flex; align-items: center; gap: 14px; }

    .cb-icon {
      width: 40px; height: 40px; border-radius: var(--radius-sm);
      background: linear-gradient(135deg, #FF6600, #F9A825);
      display: grid; place-items: center; color: white; font-size: 18px;
    }

    .cb-title { font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .cb-detail { font-size: 11.5px; color: var(--text-tertiary); margin-top: 1px; }

    .cb-right { display: flex; gap: 24px; }

    .cb-stat { text-align: center; }
    .cb-stat-value { display: block; font-size: 18px; font-weight: 800; color: var(--text-primary); }
    .cb-stat-label { display: block; font-size: 10px; color: var(--text-tertiary); }

    /* Dashboard Tabs */
    .dash-tabs {
      display: flex; gap: 4px; margin-bottom: 12px; overflow-x: auto;
      padding-bottom: 4px;
    }

    .dash-tab {
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
        box-shadow: 0 2px 8px rgba(13, 107, 92, 0.25);
      }
    }

    /* Embed Area */
    .embed-area { margin-bottom: 24px; }

    .embed-frame {
      background: #1a1a2e; border-radius: var(--radius-lg);
      overflow: hidden; box-shadow: var(--shadow-md);
      animation: fadeUp 0.4s ease 0.06s both;
    }

    /* Grafana Toolbar */
    .gf-toolbar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 16px; background: #16213e;
      border-bottom: 1px solid #2a2a4a;
    }

    .gf-tb-left { display: flex; align-items: center; gap: 10px; }
    .gf-tb-title { font-size: 14px; font-weight: 700; color: #E5E7EB; }

    .gf-tb-tag {
      font-size: 9px; font-weight: 600; padding: 2px 8px;
      border-radius: 8px; background: rgba(255, 102, 0, 0.2);
      color: #FF6600;
    }

    .gf-tb-right { display: flex; gap: 14px; }
    .gf-tb-refresh, .gf-tb-time { font-size: 11px; color: #9CA3AF; }

    /* Panel Grid */
    .gf-panel-grid {
      display: grid; gap: 4px; padding: 4px;
      &.layout-3col { grid-template-columns: repeat(3, 1fr); }
      &.layout-2col { grid-template-columns: repeat(2, 1fr); }
      &.layout-mixed { grid-template-columns: repeat(3, 1fr); }
    }

    .gf-panel {
      background: #0f3460; border: 1px solid #2a2a4a;
      border-radius: 4px; overflow: hidden;
      &.wide { grid-column: span 2; }
      &.full { grid-column: 1 / -1; }
    }

    .gfp-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 12px; border-bottom: 1px solid #2a2a4a;
    }

    .gfp-title { font-size: 11px; font-weight: 600; color: #D1D5DB; }
    .gfp-menu { font-size: 12px; color: #6B7280; cursor: pointer; }

    .gfp-body { padding: 10px 12px; min-height: 100px; }

    /* Timeseries */
    .gfp-timeseries { }

    .gfp-ts-legend { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
    .gfp-ts-dot { width: 6px; height: 6px; border-radius: 50%; }
    .gfp-ts-label { font-size: 10px; color: #9CA3AF; flex: 1; }
    .gfp-ts-val { font-size: 10px; font-weight: 600; }

    .gfp-ts-svg { width: 100%; height: 60px; margin-top: 6px; }

    /* Gauges */
    .gfp-gauge-grid { display: flex; justify-content: space-around; }

    .gfp-gauge-item { text-align: center; }
    .gfp-gauge-svg { width: 70px; height: 40px; }
    .gfp-gauge-val { font-size: 14px; font-weight: 800; margin-top: -4px; }
    .gfp-gauge-label { font-size: 9px; color: #9CA3AF; }

    /* Stats */
    .gfp-stat-grid { display: flex; justify-content: space-around; text-align: center; padding: 10px 0; }

    .gfp-stat-val { font-size: 22px; font-weight: 800; }
    .gfp-stat-label { font-size: 10px; color: #9CA3AF; margin-top: 2px; }

    /* Table */
    .gfp-table { font-size: 10px; }

    .gfp-tr {
      display: flex; gap: 4px; padding: 4px 0;
      border-bottom: 1px solid #2a2a4a;
      &:last-child { border-bottom: none; }
    }

    .gfp-thead { border-bottom: 1px solid #4a4a6a; }
    .gfp-th { flex: 1; font-weight: 700; color: #D1D5DB; text-transform: uppercase; font-size: 9px; }
    .gfp-td { flex: 1; color: #9CA3AF; font-size: 10px; }

    /* Heatmap */
    .gfp-heatmap { display: flex; flex-direction: column; gap: 2px; }

    .gfp-hm-row { display: flex; gap: 2px; }

    .gfp-hm-cell {
      flex: 1; height: 12px; border-radius: 1px;
      min-width: 8px;
    }

    /* Bar */
    .gfp-bar-chart { display: flex; flex-direction: column; gap: 6px; }

    .gfp-bar-item { display: flex; align-items: center; gap: 6px; }
    .gfp-bar-label { font-size: 10px; color: #9CA3AF; min-width: 80px; }

    .gfp-bar-track {
      flex: 1; height: 8px; background: #2a2a4a;
      border-radius: 4px; overflow: hidden;
    }

    .gfp-bar-fill { height: 100%; border-radius: 4px; }
    .gfp-bar-val { font-size: 10px; color: #D1D5DB; min-width: 40px; text-align: right; }

    /* Catalog Section */
    .catalog-section { }

    .cs-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px;
    }

    .cs-title { font-size: 15px; font-weight: 700; margin: 0; }
    .cs-count { font-size: 12px; color: var(--text-tertiary); }

    .catalog-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    }

    .cat-card {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; background: var(--bg-card);
      border: 1px solid var(--border); border-radius: var(--radius-md);
      cursor: pointer; transition: all 0.15s;
      box-shadow: var(--shadow-sm);
      &:hover { border-color: var(--primary); }
      &.active { border-color: var(--primary); background: var(--primary-subtle); }
    }

    .cc-icon {
      width: 36px; height: 36px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 16px; flex-shrink: 0;
    }

    .cc-info { flex: 1; min-width: 0; }
    .cc-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .cc-desc { font-size: 11px; color: var(--text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cc-panels { font-size: 10px; color: var(--text-tertiary); white-space: nowrap; }

    @media (max-width: 1100px) {
      .gf-panel-grid { grid-template-columns: 1fr !important; }
      .gf-panel.wide { grid-column: span 1; }
      .catalog-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class GrafanaEmbedComponent {
  connectionStatus = 'connected';
  connectionLabel = 'Connected';
  selectedDashboard = 'infra';

  dashboards = [
    { id: 'infra', name: 'Infrastructure', icon: 'bi-hdd-stack' },
    { id: 'api', name: 'API Performance', icon: 'bi-activity' },
    { id: 'agents', name: 'Agent Engines', icon: 'bi-robot' },
    { id: 'llm', name: 'LLM Usage', icon: 'bi-lightning' },
    { id: 'db', name: 'Database', icon: 'bi-database' },
  ];

  dashboardConfigs: Record<string, any> = {
    infra: {
      name: 'Infrastructure Overview', tag: 'Production', layout: 'mixed',
      panels: [
        { title: 'CPU Usage (All Containers)', type: 'timeseries', size: 'wide',
          lines: [
            { label: 'langgraph-engine', color: '#FF6B6B', current: '45%', points: '0,40 50,35 100,42 150,38 200,45 250,40 300,35 350,42 400,38' },
            { label: 'fastapi-gateway', color: '#4ECDC4', current: '38%', points: '0,50 50,45 100,48 150,42 200,38 250,44 300,48 350,45 400,42' },
            { label: 'flask-crud-api', color: '#FFE66D', current: '22%', points: '0,60 50,58 100,62 150,58 200,55 250,60 300,58 350,55 400,58' },
          ]
        },
        { title: 'System Resources', type: 'gauge',
          gauges: [
            { label: 'CPU', value: '34%', color: '#4ECDC4', dash: '32' },
            { label: 'Memory', value: '62%', color: '#FFE66D', dash: '59' },
            { label: 'Disk', value: '42%', color: '#4ECDC4', dash: '40' },
          ]
        },
        { title: 'Memory Usage Trend', type: 'timeseries', size: 'wide',
          lines: [
            { label: 'Total Used', color: '#FF6B6B', current: '9.9GB', points: '0,30 50,32 100,35 150,33 200,36 250,34 300,37 350,35 400,38' },
            { label: 'Cache', color: '#4ECDC4', current: '3.2GB', points: '0,60 50,58 100,55 150,58 200,56 250,55 300,54 350,56 400,55' },
          ]
        },
        { title: 'Container Status', type: 'stat',
          stats: [
            { label: 'Running', value: '9', color: '#4ECDC4' },
            { label: 'Degraded', value: '0', color: '#FFE66D' },
            { label: 'Stopped', value: '0', color: '#FF6B6B' },
          ]
        },
        { title: 'Network I/O', type: 'timeseries',
          lines: [
            { label: 'Inbound', color: '#4ECDC4', current: '1.4GB/h', points: '0,45 50,42 100,48 150,44 200,40 250,46 300,42 350,38 400,40' },
            { label: 'Outbound', color: '#FF6B6B', current: '820MB/h', points: '0,55 50,52 100,58 150,54 200,50 250,56 300,52 350,48 400,50' },
          ]
        },
        { title: 'Disk IOPS', type: 'timeseries',
          lines: [
            { label: 'Read', color: '#4ECDC4', current: '1.2K', points: '0,50 50,45 100,48 150,42 200,46 250,48 300,44 350,40 400,42' },
            { label: 'Write', color: '#FFE66D', current: '680', points: '0,60 50,58 100,55 150,58 200,62 250,56 300,58 350,55 400,58' },
          ]
        },
      ]
    },
    api: {
      name: 'API Performance', tag: 'Real-time', layout: 'mixed',
      panels: [
        { title: 'Request Rate (req/s)', type: 'timeseries', size: 'wide',
          lines: [
            { label: 'Flask CRUD', color: '#4ECDC4', current: '24/s', points: '0,50 50,45 100,40 150,35 200,30 250,28 300,32 350,35 400,30' },
            { label: 'FastAPI Gateway', color: '#FF6B6B', current: '18/s', points: '0,55 50,52 100,48 150,45 200,42 250,40 300,44 350,42 400,38' },
          ]
        },
        { title: 'Latency Heatmap (ms)', type: 'heatmap',
          heatData: this.generateHeatmap()
        },
        { title: 'Error Rate by Service', type: 'bar',
          bars: [
            { label: 'FastAPI Gateway', pct: 68, value: '0.8%', color: '#FF6B6B' },
            { label: 'Flask CRUD', pct: 22, value: '0.2%', color: '#4ECDC4' },
            { label: 'n8n Webhook', pct: 10, value: '0.1%', color: '#FFE66D' },
          ]
        },
        { title: 'Response Codes', type: 'stat', size: 'wide',
          stats: [
            { label: '2xx', value: '47.8K', color: '#4ECDC4' },
            { label: '4xx', value: '82', color: '#FFE66D' },
            { label: '5xx', value: '38', color: '#FF6B6B' },
            { label: 'Avg ms', value: '42', color: '#4ECDC4' },
          ]
        },
        { title: 'Top Endpoints by Latency', type: 'table',
          columns: ['Endpoint', 'Avg (ms)', 'P99 (ms)', 'Req/h'],
          rows: [
            ['/api/v1/chat', '280', '620', '351'],
            ['/api/v1/agents/run', '142', '480', '264'],
            ['/api/v1/forecasts', '38', '120', '175'],
            ['/api/v1/transactions', '22', '85', '533'],
          ]
        },
      ]
    },
    agents: {
      name: 'Agent Engine Metrics', tag: 'LangGraph + n8n', layout: '3col',
      panels: [
        { title: 'Active Graphs', type: 'stat',
          stats: [
            { label: 'Running', value: '4', color: '#4ECDC4' },
            { label: 'Queued', value: '2', color: '#FFE66D' },
            { label: 'Completed (1h)', value: '42', color: '#4ECDC4' },
          ]
        },
        { title: 'Agent Latency (p50/p99)', type: 'timeseries',
          lines: [
            { label: 'P50', color: '#4ECDC4', current: '42ms', points: '0,55 50,50 100,52 150,48 200,45 250,42 300,48 350,45 400,42' },
            { label: 'P99', color: '#FF6B6B', current: '380ms', points: '0,25 50,28 100,22 150,30 200,24 250,28 300,20 350,25 400,22' },
          ]
        },
        { title: 'Checkpoint Store', type: 'gauge',
          gauges: [
            { label: 'Disk', value: '2.1GB', color: '#4ECDC4', dash: '38' },
            { label: 'Objects', value: '14K', color: '#FFE66D', dash: '52' },
          ]
        },
        { title: 'n8n Workflow Executions', type: 'timeseries', size: 'wide',
          lines: [
            { label: 'Success', color: '#4ECDC4', current: '312/d', points: '0,35 50,32 100,38 150,30 200,35 250,32 300,28 350,34 400,30' },
            { label: 'Failed', color: '#FF6B6B', current: '4/d', points: '0,72 50,75 100,70 150,74 200,72 250,76 300,74 350,72 400,74' },
          ]
        },
        { title: 'Worker Pool (n8n)', type: 'gauge',
          gauges: [
            { label: 'Active', value: '4/8', color: '#FFE66D', dash: '47' },
            { label: 'Queue', value: '1', color: '#4ECDC4', dash: '12' },
          ]
        },
      ]
    },
    llm: {
      name: 'LLM Token Usage', tag: 'Cost Tracking', layout: 'mixed',
      panels: [
        { title: 'Token Consumption (24h)', type: 'timeseries', size: 'wide',
          lines: [
            { label: 'Input Tokens', color: '#4ECDC4', current: '3.8M', points: '0,50 50,45 100,42 150,40 200,35 250,38 300,32 350,35 400,30' },
            { label: 'Output Tokens', color: '#FF6B6B', current: '1.2M', points: '0,65 50,62 100,58 150,60 200,55 250,58 300,52 350,55 400,50' },
          ]
        },
        { title: 'Cost by Model', type: 'bar',
          bars: [
            { label: 'Claude Sonnet 4', pct: 80, value: '$8.42', color: '#4ECDC4' },
            { label: 'Claude Opus 4', pct: 60, value: '$6.40', color: '#A78BFA' },
            { label: 'Claude Haiku 4', pct: 20, value: '$2.10', color: '#FFE66D' },
            { label: 'GPT-4o', pct: 12, value: '$1.20', color: '#FF6B6B' },
          ]
        },
        { title: 'Daily Cost Trend', type: 'timeseries',
          lines: [
            { label: 'Spend', color: '#FFE66D', current: '$18.42', points: '0,45 50,42 100,38 150,44 200,36 250,40 300,34 350,38 400,32' },
          ]
        },
        { title: 'Rate Limit Utilization', type: 'gauge', size: 'wide',
          gauges: [
            { label: 'Anthropic RPM', value: '70%', color: '#FFE66D', dash: '66' },
            { label: 'Anthropic TPM', value: '41%', color: '#4ECDC4', dash: '39' },
            { label: 'OpenAI RPM', value: '13%', color: '#4ECDC4', dash: '12' },
            { label: 'Token Budget', value: '76%', color: '#FF6B6B', dash: '72' },
          ]
        },
        { title: 'Requests by Agent', type: 'bar',
          bars: [
            { label: 'Cash Flow Agent', pct: 85, value: '236', color: '#4ECDC4' },
            { label: 'Recon Agent', pct: 65, value: '186', color: '#A78BFA' },
            { label: 'Forecast Agent', pct: 50, value: '152', color: '#FFE66D' },
            { label: 'Close Agent', pct: 35, value: '118', color: '#FF6B6B' },
          ]
        },
      ]
    },
    db: {
      name: 'Database Performance', tag: 'PostgreSQL + Redis', layout: '2col',
      panels: [
        { title: 'Active Connections', type: 'timeseries',
          lines: [
            { label: 'PostgreSQL', color: '#4ECDC4', current: '12', points: '0,55 50,52 100,48 150,50 200,46 250,52 300,48 350,45 400,48' },
            { label: 'Redis', color: '#FF6B6B', current: '18', points: '0,50 50,48 100,45 150,42 200,46 250,44 300,42 350,46 400,44' },
          ]
        },
        { title: 'Query Latency', type: 'timeseries',
          lines: [
            { label: 'Avg', color: '#4ECDC4', current: '4ms', points: '0,62 50,60 100,58 150,55 200,58 250,56 300,54 350,56 400,55' },
            { label: 'P99', color: '#FF6B6B', current: '28ms', points: '0,42 50,45 100,40 150,38 200,42 250,40 300,36 350,38 400,35' },
          ]
        },
        { title: 'Cache Performance', type: 'stat', size: 'full',
          stats: [
            { label: 'Hit Rate', value: '94.2%', color: '#4ECDC4' },
            { label: 'Memory', value: '1.2GB', color: '#FFE66D' },
            { label: 'Keys', value: '42K', color: '#4ECDC4' },
            { label: 'Evictions', value: '12', color: '#FF6B6B' },
          ]
        },
        { title: 'Slow Queries (>100ms)', type: 'table',
          columns: ['Query', 'Duration', 'Rows', 'Time'],
          rows: [
            ['SELECT ... transactions', '142ms', '8,400', '2:14 PM'],
            ['UPDATE ... forecasts', '118ms', '1', '1:48 PM'],
            ['SELECT ... journal_entries', '104ms', '12,200', '10:22 AM'],
          ]
        },
      ]
    },
  };

  get activeDashboard(): any {
    return this.dashboardConfigs[this.selectedDashboard] || this.dashboardConfigs['infra'];
  }

  allDashboards = [
    { id: 'infra', name: 'Infrastructure Overview', desc: 'CPU, memory, disk, network for all containers', icon: 'bi-hdd-stack', iconBg: '#E8F5F1', iconColor: '#0D6B5C', panelCount: 6 },
    { id: 'api', name: 'API Performance', desc: 'Request rates, latency, error codes', icon: 'bi-activity', iconBg: '#EFF6FF', iconColor: '#2563EB', panelCount: 5 },
    { id: 'agents', name: 'Agent Engine Metrics', desc: 'LangGraph graphs, n8n workflows, queues', icon: 'bi-robot', iconBg: '#EDE9FE', iconColor: '#7C3AED', panelCount: 5 },
    { id: 'llm', name: 'LLM Token Usage', desc: 'Token consumption, costs, rate limits', icon: 'bi-lightning', iconBg: '#FEF3C7', iconColor: '#D97706', panelCount: 5 },
    { id: 'db', name: 'Database Performance', desc: 'PostgreSQL queries, Redis cache, connections', icon: 'bi-database', iconBg: '#ECFDF5', iconColor: '#059669', panelCount: 4 },
    { id: 'docker', name: 'Docker Containers', desc: 'Container lifecycle, resource limits, restarts', icon: 'bi-box', iconBg: '#EFF6FF', iconColor: '#2563EB', panelCount: 8 },
    { id: 'nginx', name: 'Nginx Proxy', desc: 'Request routing, SSL, rate limiting', icon: 'bi-shield', iconBg: '#E8F5F1', iconColor: '#0D6B5C', panelCount: 6 },
    { id: 'alerts', name: 'Alert Manager', desc: 'Alert rules, firing state, silences', icon: 'bi-bell', iconBg: '#FEE2E2', iconColor: '#DC2626', panelCount: 4 },
    { id: 'logs', name: 'Log Explorer', desc: 'Structured logs from all services', icon: 'bi-journal-text', iconBg: '#F3F4F6', iconColor: '#374151', panelCount: 3 },
    { id: 'security', name: 'Security Dashboard', desc: 'Auth failures, rate limit hits, anomalies', icon: 'bi-shield-lock', iconBg: '#FEF3C7', iconColor: '#92400E', panelCount: 7 },
    { id: 'business', name: 'Business Metrics', desc: 'Agent ROI, automation rates, SLAs', icon: 'bi-graph-up', iconBg: '#EDE9FE', iconColor: '#5B21B6', panelCount: 6 },
    { id: 'custom', name: 'Custom Dashboard', desc: 'User-defined panels and queries', icon: 'bi-pencil-square', iconBg: '#F3F4F6', iconColor: '#6B7280', panelCount: 0 },
  ];

  generateHeatmap(): string[][] {
    const colors = ['#0f3460', '#1a4b7a', '#2563EB', '#4ECDC4', '#FFE66D', '#FF6B6B'];
    return Array.from({ length: 6 }, () =>
      Array.from({ length: 24 }, () => colors[Math.floor(Math.random() * colors.length)])
    );
  }

  openInGrafana() {}
}