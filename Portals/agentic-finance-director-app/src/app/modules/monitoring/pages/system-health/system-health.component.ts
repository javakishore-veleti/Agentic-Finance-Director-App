import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-system-health',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/monitoring">Monitoring</a>
      <span class="separator">/</span>
      <span class="current">System Health</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">System Health</h1>
        <p class="afda-page-subtitle">Real-time infrastructure monitoring, resource utilization, and container health</p>
      </div>
      <div class="afda-page-actions">
        <div class="live-indicator">
          <span class="live-dot"></span>
          <span class="live-text">Live</span>
        </div>
        <select class="form-select-sm">
          <option>Last 1 Hour</option>
          <option>Last 6 Hours</option>
          <option>Last 24 Hours</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>
    </div>

    <!-- Overall Status Banner -->
    <div class="status-banner" [ngClass]="overallStatus">
      <div class="sb-left">
        <i [class]="'bi ' + statusIcon"></i>
        <div>
          <div class="sb-title">{{ statusTitle }}</div>
          <div class="sb-detail">{{ statusDetail }}</div>
        </div>
      </div>
      <div class="sb-metrics">
        <div class="sb-metric">
          <span class="sb-metric-value font-mono">99.94%</span>
          <span class="sb-metric-label">Uptime (30d)</span>
        </div>
        <div class="sb-metric">
          <span class="sb-metric-value font-mono">42ms</span>
          <span class="sb-metric-label">Avg Latency</span>
        </div>
        <div class="sb-metric">
          <span class="sb-metric-value font-mono">0.02%</span>
          <span class="sb-metric-label">Error Rate</span>
        </div>
      </div>
    </div>

    <!-- Resource Gauges -->
    <div class="gauge-row stagger">
      @for (gauge of gauges; track gauge.name) {
        <div class="afda-card gauge-card">
          <div class="gauge-ring">
            <svg viewBox="0 0 100 100" class="gauge-svg">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-light)" stroke-width="8"/>
              <circle cx="50" cy="50" r="42" fill="none"
                      [attr.stroke]="getGaugeColor(gauge.pct)"
                      stroke-width="8" stroke-linecap="round"
                      [attr.stroke-dasharray]="getGaugeDash(gauge.pct)"
                      transform="rotate(-90 50 50)"
                      style="transition: stroke-dasharray 1s ease;"/>
            </svg>
            <div class="gauge-value">
              <span class="gv-number font-mono" [style.color]="getGaugeColor(gauge.pct)">{{ gauge.pct }}%</span>
            </div>
          </div>
          <div class="gauge-info">
            <div class="gauge-name">{{ gauge.name }}</div>
            <div class="gauge-detail font-mono">{{ gauge.detail }}</div>
            <div class="gauge-trend" [ngClass]="gauge.trendDir">
              <i [class]="'bi ' + (gauge.trendDir === 'positive' ? 'bi-arrow-down' : gauge.trendDir === 'negative' ? 'bi-arrow-up' : 'bi-arrow-right')"></i>
              {{ gauge.trend }}
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Container Status + Error Breakdown -->
    <div class="mid-grid">
      <!-- Docker Containers -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.08s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Docker Container Status</div>
          <div class="container-summary">
            <span class="cs-chip running">{{ runningCount }} Running</span>
            @if (degradedCount > 0) {
              <span class="cs-chip" style="background: #FEF3C7; color: #92400E;">{{ degradedCount }} Degraded</span>
            }
          </div>
        </div>
        <div class="container-grid">
          @for (c of containers; track c.name) {
            <div class="ct-card" [ngClass]="'ct-' + c.status.toLowerCase()">
              <div class="ct-header">
                <div class="ct-status-dot" [style.background]="getContainerColor(c.status)"></div>
                <span class="ct-name">{{ c.name }}</span>
                <span class="ct-status-label" [style.color]="getContainerColor(c.status)">{{ c.status }}</span>
              </div>
              <div class="ct-metrics">
                <div class="ct-metric">
                  <span class="ct-metric-label">CPU</span>
                  <div class="ct-metric-bar">
                    <div class="ct-bar-fill" [style.width.%]="c.cpu" [style.background]="getGaugeColor(c.cpu)"></div>
                  </div>
                  <span class="ct-metric-value font-mono">{{ c.cpu }}%</span>
                </div>
                <div class="ct-metric">
                  <span class="ct-metric-label">Mem</span>
                  <div class="ct-metric-bar">
                    <div class="ct-bar-fill" [style.width.%]="c.mem" [style.background]="getGaugeColor(c.mem)"></div>
                  </div>
                  <span class="ct-metric-value font-mono">{{ c.mem }}%</span>
                </div>
              </div>
              <div class="ct-footer">
                <span class="ct-uptime font-mono">↑ {{ c.uptime }}</span>
                <span class="ct-image">{{ c.image }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Error Breakdown -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.1s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Error Breakdown (24h)</div>
          <span class="afda-badge afda-badge-medium">{{ totalErrors }} total</span>
        </div>
        <div class="error-categories">
          @for (err of errorCategories; track err.name) {
            <div class="ec-item">
              <div class="ec-left">
                <div class="ec-icon" [style.background]="err.iconBg">
                  <i [class]="'bi ' + err.icon" [style.color]="err.iconColor"></i>
                </div>
                <div>
                  <div class="ec-name">{{ err.name }}</div>
                  <div class="ec-desc">{{ err.desc }}</div>
                </div>
              </div>
              <div class="ec-right">
                <div class="ec-bar">
                  <div class="ec-bar-fill" [style.width.%]="(err.count / maxError) * 100"
                       [style.background]="err.barColor"></div>
                </div>
                <span class="ec-count font-mono">{{ err.count }}</span>
              </div>
            </div>
          }
        </div>

        <div class="error-rate-mini" style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-light);">
          <div class="afda-card-title" style="font-size: 12px; margin-bottom: 10px;">Error Rate Trend</div>
          <div class="erm-chart">
            @for (pt of errorRateTrend; track pt.hour) {
              <div class="erm-col">
                <div class="erm-bar" [style.height.%]="(pt.rate / 0.08) * 100"
                     [style.background]="pt.rate > 0.05 ? '#DC2626' : pt.rate > 0.02 ? '#D97706' : 'var(--primary)'"></div>
                <span class="erm-label">{{ pt.hour }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Resource Trend Charts -->
    <div class="trend-grid">
      @for (chart of trendCharts; track chart.title) {
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.14s both;">
          <div class="afda-card-header">
            <div class="afda-card-title">{{ chart.title }}</div>
            <span class="font-mono" [style.color]="chart.currentColor" style="font-size: 14px; font-weight: 700;">{{ chart.current }}</span>
          </div>
          <div class="tc-chart">
            <svg class="tc-svg" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient [attr.id]="'grad-' + chart.id" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" [attr.stop-color]="chart.color" stop-opacity="0.15"/>
                  <stop offset="100%" [attr.stop-color]="chart.color" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <polyline [attr.points]="chart.areaPoints" [attr.fill]="'url(#grad-' + chart.id + ')'" />
              <polyline [attr.points]="chart.linePoints" fill="none"
                        [attr.stroke]="chart.color" stroke-width="2" stroke-linejoin="round"/>
              @if (chart.threshold) {
                <line x1="0" [attr.y1]="chart.thresholdY" x2="400" [attr.y2]="chart.thresholdY"
                      stroke="#DC2626" stroke-width="1" stroke-dasharray="4 3" opacity="0.5"/>
              }
            </svg>
            <div class="tc-x-axis">
              @for (label of chart.xLabels; track label) {
                <span>{{ label }}</span>
              }
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Bottom: Network + Disk I/O -->
    <div class="bottom-grid">
      <!-- Network -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.18s both;">
        <div class="afda-card-title" style="margin-bottom: 12px;">Network I/O</div>
        <div class="net-stats">
          @for (net of networkStats; track net.label) {
            <div class="net-item">
              <div class="net-icon" [style.background]="net.iconBg">
                <i [class]="'bi ' + net.icon" [style.color]="net.iconColor"></i>
              </div>
              <div>
                <div class="net-label">{{ net.label }}</div>
                <div class="net-value font-mono">{{ net.value }}</div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Disk -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.2s both;">
        <div class="afda-card-title" style="margin-bottom: 12px;">Storage Volumes</div>
        @for (vol of volumes; track vol.name) {
          <div class="vol-item">
            <div class="vol-header">
              <span class="vol-name">{{ vol.name }}</span>
              <span class="vol-usage font-mono">{{ vol.used }} / {{ vol.total }}</span>
            </div>
            <div class="vol-bar">
              <div class="vol-bar-fill" [style.width.%]="vol.pct" [style.background]="getGaugeColor(vol.pct)"></div>
            </div>
            <div class="vol-footer">
              <span class="vol-mount">{{ vol.mount }}</span>
              <span class="vol-pct font-mono" [style.color]="getGaugeColor(vol.pct)">{{ vol.pct }}%</span>
            </div>
          </div>
        }
      </div>

      <!-- Recent Events -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.22s both;">
        <div class="afda-card-title" style="margin-bottom: 12px;">Recent Events</div>
        @for (evt of recentEvents; track evt.time) {
          <div class="evt-item">
            <div class="evt-dot" [style.background]="evt.color"></div>
            <div class="evt-info">
              <div class="evt-text">{{ evt.text }}</div>
              <div class="evt-time font-mono">{{ evt.time }}</div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Live Indicator */
    .live-indicator {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 12px; background: #ECFDF5;
      border-radius: 20px; border: 1px solid #A7F3D0;
    }

    .live-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #059669;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .live-text { font-size: 11px; font-weight: 700; color: #059669; }

    /* Status Banner */
    .status-banner {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 24px; border-radius: var(--radius-lg);
      margin-bottom: 16px; animation: fadeUp 0.4s ease both;
      &.healthy { background: linear-gradient(135deg, #ECFDF5, #D1FAE5); border: 1px solid #A7F3D0; }
      &.degraded { background: linear-gradient(135deg, #FFFBEB, #FEF3C7); border: 1px solid #FDE68A; }
      &.critical { background: linear-gradient(135deg, #FEF2F2, #FEE2E2); border: 1px solid #FCA5A5; }
    }

    .sb-left { display: flex; align-items: center; gap: 14px; }

    .sb-left i {
      font-size: 28px;
      .healthy & { color: #059669; }
      .degraded & { color: #D97706; }
      .critical & { color: #DC2626; }
    }

    .sb-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .sb-detail { font-size: 12px; color: var(--text-secondary); margin-top: 1px; }

    .sb-metrics { display: flex; gap: 28px; }

    .sb-metric { text-align: center; }
    .sb-metric-value { display: block; font-size: 18px; font-weight: 800; color: var(--text-primary); }
    .sb-metric-label { display: block; font-size: 10px; color: var(--text-tertiary); }

    /* Gauges */
    .gauge-row {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 12px; margin-bottom: 16px;
    }

    .gauge-card {
      display: flex; align-items: center; gap: 14px; padding: 14px 16px !important;
    }

    .gauge-ring { position: relative; width: 68px; height: 68px; flex-shrink: 0; }
    .gauge-svg { width: 100%; height: 100%; }

    .gauge-value {
      position: absolute; inset: 0;
      display: grid; place-items: center;
    }

    .gv-number { font-size: 16px; font-weight: 800; }

    .gauge-info { flex: 1; }
    .gauge-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .gauge-detail { font-size: 11px; color: var(--text-secondary); margin: 2px 0; }

    .gauge-trend {
      font-size: 10.5px; display: flex; align-items: center; gap: 3px;
      &.positive { color: #059669; }
      &.negative { color: #DC2626; }
      &.neutral { color: var(--text-tertiary); }
    }

    /* Mid Grid */
    .mid-grid {
      display: grid; grid-template-columns: 1.4fr 1fr;
      gap: 16px; margin-bottom: 16px;
    }

    /* Containers */
    .container-summary { display: flex; gap: 6px; }

    .cs-chip {
      font-size: 10px; font-weight: 600; padding: 2px 8px;
      border-radius: 10px;
      &.running { background: #ECFDF5; color: #059669; }
    }

    .container-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
    }

    .ct-card {
      padding: 10px 12px; border: 1px solid var(--border-light);
      border-radius: var(--radius-sm); background: var(--bg-section);
      transition: border-color 0.1s;
      &:hover { border-color: var(--border); }
      &.ct-degraded { border-color: #FDE68A; background: #FFFDF7; }
    }

    .ct-header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
    .ct-status-dot { width: 7px; height: 7px; border-radius: 50%; }
    .ct-name { font-size: 11.5px; font-weight: 700; color: var(--text-primary); flex: 1; }
    .ct-status-label { font-size: 9.5px; font-weight: 600; }

    .ct-metrics { display: flex; flex-direction: column; gap: 4px; }

    .ct-metric { display: flex; align-items: center; gap: 6px; }
    .ct-metric-label { font-size: 10px; color: var(--text-tertiary); min-width: 26px; }

    .ct-metric-bar {
      flex: 1; height: 4px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .ct-bar-fill { height: 100%; border-radius: 10px; transition: width 0.5s; }
    .ct-metric-value { font-size: 10px; font-weight: 600; min-width: 28px; text-align: right; }

    .ct-footer {
      display: flex; justify-content: space-between; margin-top: 6px;
      font-size: 9.5px; color: var(--text-tertiary);
    }

    .ct-uptime { color: #059669; }

    /* Error Breakdown */
    .error-categories { display: flex; flex-direction: column; gap: 10px; }

    .ec-item { display: flex; align-items: center; gap: 12px; }

    .ec-left { display: flex; align-items: center; gap: 10px; flex: 1; }

    .ec-icon {
      width: 30px; height: 30px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 13px; flex-shrink: 0;
    }

    .ec-name { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
    .ec-desc { font-size: 10.5px; color: var(--text-tertiary); }

    .ec-right { display: flex; align-items: center; gap: 8px; min-width: 140px; }

    .ec-bar {
      flex: 1; height: 6px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .ec-bar-fill { height: 100%; border-radius: 10px; }
    .ec-count { font-size: 12px; font-weight: 700; min-width: 24px; text-align: right; }

    /* Error Rate Mini Chart */
    .erm-chart {
      display: flex; gap: 3px; align-items: flex-end; height: 50px;
    }

    .erm-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; }

    .erm-bar {
      width: 100%; max-width: 14px; min-height: 2px;
      border-radius: 2px 2px 0 0; transition: height 0.3s;
    }

    .erm-label { font-size: 8px; color: var(--text-tertiary); }

    /* Trend Charts */
    .trend-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 16px; margin-bottom: 16px;
    }

    .tc-chart { position: relative; height: 100px; margin-top: 8px; }

    .tc-svg { position: absolute; inset: 0; width: 100%; height: 100%; }

    .tc-x-axis {
      position: absolute; bottom: -16px; left: 0; right: 0;
      display: flex; justify-content: space-between;
      font-size: 9px; color: var(--text-tertiary);
    }

    /* Bottom Grid */
    .bottom-grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    /* Network */
    .net-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

    .net-item { display: flex; align-items: center; gap: 10px; }

    .net-icon {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 14px;
    }

    .net-label { font-size: 11px; color: var(--text-tertiary); }
    .net-value { font-size: 14px; font-weight: 700; }

    /* Volumes */
    .vol-item { margin-bottom: 12px; &:last-child { margin-bottom: 0; } }

    .vol-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .vol-name { font-size: 12px; font-weight: 600; color: var(--text-primary); }
    .vol-usage { font-size: 11px; color: var(--text-tertiary); }

    .vol-bar {
      height: 6px; background: var(--border-light);
      border-radius: 10px; overflow: hidden; margin-bottom: 3px;
    }

    .vol-bar-fill { height: 100%; border-radius: 10px; }

    .vol-footer { display: flex; justify-content: space-between; }
    .vol-mount { font-size: 10px; color: var(--text-tertiary); }
    .vol-pct { font-size: 10.5px; font-weight: 600; }

    /* Events */
    .evt-item {
      display: flex; gap: 10px; padding: 8px 0;
      border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .evt-dot { width: 7px; height: 7px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
    .evt-text { font-size: 12px; color: var(--text-secondary); line-height: 1.4; }
    .evt-time { font-size: 10px; color: var(--text-tertiary); margin-top: 2px; }

    @media (max-width: 1200px) {
      .gauge-row { grid-template-columns: repeat(3, 1fr); }
      .mid-grid { grid-template-columns: 1fr; }
      .trend-grid { grid-template-columns: 1fr; }
      .bottom-grid { grid-template-columns: 1fr; }
      .container-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class SystemHealthComponent {
  overallStatus = 'healthy';
  statusIcon = 'bi-shield-check';
  statusTitle = 'All Systems Operational';
  statusDetail = '9/9 services healthy · Last incident 6 days ago';

  gauges = [
    { name: 'CPU Usage', pct: 34, detail: '2.7 / 8 cores', trend: '↓ 8% from peak', trendDir: 'positive' },
    { name: 'Memory', pct: 62, detail: '9.9 / 16 GB', trend: '↑ 4% from yesterday', trendDir: 'negative' },
    { name: 'Disk I/O', pct: 18, detail: '142 MB/s avg', trend: '→ Stable', trendDir: 'neutral' },
    { name: 'Network', pct: 22, detail: '48 Mbps / 200', trend: '↓ 12% from peak', trendDir: 'positive' },
    { name: 'GPU (If avail)', pct: 0, detail: 'N/A', trend: 'Not provisioned', trendDir: 'neutral' },
  ];

  get runningCount() { return this.containers.filter(c => c.status === 'Running').length; }
  get degradedCount() { return this.containers.filter(c => c.status === 'Degraded').length; }

  containers = [
    { name: 'angular-portal', status: 'Running', cpu: 8, mem: 12, uptime: '6d 14h', image: 'node:20-alpine' },
    { name: 'flask-crud-api', status: 'Running', cpu: 22, mem: 34, uptime: '6d 14h', image: 'python:3.12' },
    { name: 'fastapi-gateway', status: 'Running', cpu: 38, mem: 52, uptime: '6d 14h', image: 'python:3.12' },
    { name: 'langgraph-engine', status: 'Running', cpu: 45, mem: 68, uptime: '6d 14h', image: 'langgraph:0.4.2' },
    { name: 'n8n-orchestrator', status: 'Running', cpu: 18, mem: 28, uptime: '6d 14h', image: 'n8n:1.72.1' },
    { name: 'postgresql', status: 'Running', cpu: 12, mem: 42, uptime: '6d 14h', image: 'postgres:16' },
    { name: 'redis-cache', status: 'Running', cpu: 4, mem: 8, uptime: '6d 14h', image: 'redis:7-alpine' },
    { name: 'nginx-proxy', status: 'Running', cpu: 2, mem: 6, uptime: '6d 14h', image: 'nginx:1.25' },
    { name: 'prometheus', status: 'Running', cpu: 6, mem: 18, uptime: '6d 14h', image: 'prom/prometheus' },
  ];

  totalErrors = 47;
  maxError = 18;

  errorCategories = [
    { name: 'API Timeout', desc: 'Gateway > 30s response', count: 18, icon: 'bi-clock', iconBg: '#FEF3C7', iconColor: '#D97706', barColor: '#D97706' },
    { name: 'Auth Failures', desc: 'Invalid or expired tokens', count: 12, icon: 'bi-shield-x', iconBg: '#FEE2E2', iconColor: '#DC2626', barColor: '#DC2626' },
    { name: 'DB Connection', desc: 'Pool exhaustion events', count: 8, icon: 'bi-database-x', iconBg: '#EDE9FE', iconColor: '#7C3AED', barColor: '#7C3AED' },
    { name: 'Rate Limited', desc: 'LLM API 429 responses', count: 6, icon: 'bi-speedometer', iconBg: '#EFF6FF', iconColor: '#2563EB', barColor: '#2563EB' },
    { name: 'Validation', desc: 'Schema / payload errors', count: 3, icon: 'bi-exclamation-triangle', iconBg: '#F3F4F6', iconColor: '#6B7280', barColor: '#6B7280' },
  ];

  errorRateTrend = [
    { hour: '12a', rate: 0.01 }, { hour: '2a', rate: 0.005 }, { hour: '4a', rate: 0.002 },
    { hour: '6a', rate: 0.008 }, { hour: '8a', rate: 0.02 }, { hour: '10a', rate: 0.035 },
    { hour: '12p', rate: 0.04 }, { hour: '2p', rate: 0.06 }, { hour: '4p', rate: 0.045 },
    { hour: '6p', rate: 0.03 }, { hour: '8p', rate: 0.015 }, { hour: '10p', rate: 0.01 },
  ];

  trendCharts = [
    {
      id: 'cpu', title: 'CPU Usage', current: '34%', currentColor: '#059669', color: '#0D6B5C',
      threshold: true, thresholdY: 20,
      linePoints: '0,68 40,62 80,58 120,65 160,72 200,60 240,55 280,48 320,42 360,38 400,34',
      areaPoints: '0,100 0,68 40,62 80,58 120,65 160,72 200,60 240,55 280,48 320,42 360,38 400,34 400,100',
      xLabels: ['-6h', '-5h', '-4h', '-3h', '-2h', '-1h', 'Now']
    },
    {
      id: 'mem', title: 'Memory Usage', current: '62%', currentColor: '#D97706', color: '#D97706',
      threshold: true, thresholdY: 15,
      linePoints: '0,45 40,42 80,40 120,38 160,36 200,35 240,36 280,34 320,35 360,36 400,38',
      areaPoints: '0,100 0,45 40,42 80,40 120,38 160,36 200,35 240,36 280,34 320,35 360,36 400,38 400,100',
      xLabels: ['-6h', '-5h', '-4h', '-3h', '-2h', '-1h', 'Now']
    },
    {
      id: 'lat', title: 'Avg Latency', current: '42ms', currentColor: '#059669', color: '#2563EB',
      threshold: false, thresholdY: 0,
      linePoints: '0,52 40,48 80,45 120,50 160,58 200,62 240,55 280,48 320,45 360,42 400,40',
      areaPoints: '0,100 0,52 40,48 80,45 120,50 160,58 200,62 240,55 280,48 320,45 360,42 400,40 400,100',
      xLabels: ['-6h', '-5h', '-4h', '-3h', '-2h', '-1h', 'Now']
    },
  ];

  networkStats = [
    { label: 'Bytes In', value: '1.4 GB/h', icon: 'bi-arrow-down-circle', iconBg: '#EFF6FF', iconColor: '#2563EB' },
    { label: 'Bytes Out', value: '820 MB/h', icon: 'bi-arrow-up-circle', iconBg: '#ECFDF5', iconColor: '#059669' },
    { label: 'Active Conns', value: '342', icon: 'bi-plug', iconBg: '#E8F5F1', iconColor: '#0D6B5C' },
    { label: 'Packets Dropped', value: '0.001%', icon: 'bi-x-circle', iconBg: '#F3F4F6', iconColor: '#6B7280' },
  ];

  volumes = [
    { name: 'PostgreSQL Data', mount: '/var/lib/postgresql', used: '42 GB', total: '100 GB', pct: 42 },
    { name: 'Redis Cache', mount: '/data/redis', used: '1.2 GB', total: '8 GB', pct: 15 },
    { name: 'Application Logs', mount: '/var/log', used: '8.4 GB', total: '20 GB', pct: 42 },
    { name: 'Model Artifacts', mount: '/mnt/models', used: '18 GB', total: '50 GB', pct: 36 },
  ];

  recentEvents = [
    { text: 'Certificate renewed for api.agentic-finance.com', time: '14 min ago', color: '#059669' },
    { text: 'PostgreSQL vacuum completed — 342 dead tuples removed', time: '1h ago', color: '#059669' },
    { text: 'LangGraph checkpoint store pruned (>7d)', time: '2h ago', color: '#2563EB' },
    { text: 'Redis memory peaked at 1.4GB, eviction triggered', time: '4h ago', color: '#D97706' },
    { text: 'Nginx config reload — new rate limit rules', time: '6h ago', color: '#059669' },
    { text: 'Docker image pull: langgraph:0.4.2', time: '6d ago', color: '#2563EB' },
  ];

  getGaugeColor(pct: number): string {
    if (pct >= 80) return '#DC2626';
    if (pct >= 60) return '#D97706';
    return '#059669';
  }

  getGaugeDash(pct: number): string {
    const c = 2 * Math.PI * 42;
    return `${(pct / 100) * c} ${c}`;
  }

  getContainerColor(status: string): string {
    const m: any = { Running: '#059669', Degraded: '#D97706', Stopped: '#DC2626' };
    return m[status] || '#6B7280';
  }
}