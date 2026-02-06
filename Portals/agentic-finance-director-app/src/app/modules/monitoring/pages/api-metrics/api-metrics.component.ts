import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-api-metrics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/monitoring">Monitoring</a>
      <span class="separator">/</span>
      <span class="current">API Metrics</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">API Metrics</h1>
        <p class="afda-page-subtitle">Request volume, latency distribution, error rates, and token consumption analytics</p>
      </div>
      <div class="afda-page-actions">
        <div class="api-selector">
          @for (api of apiOptions; track api) {
            <button class="api-chip" [class.active]="selectedApi === api" (click)="selectedApi = api">{{ api }}</button>
          }
        </div>
        <select class="form-select-sm">
          <option>Last 1 Hour</option>
          <option>Last 6 Hours</option>
          <option selected>Last 24 Hours</option>
          <option>Last 7 Days</option>
        </select>
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

    <!-- Request Volume + Latency Distribution -->
    <div class="charts-row">
      <!-- Request Volume -->
      <div class="afda-card" style="flex: 1.3; animation: fadeUp 0.4s ease 0.08s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Request Volume (24h)</div>
          <div class="chart-legend">
            <span class="cl-item"><span class="cl-dot" style="background: var(--primary);"></span> Success</span>
            <span class="cl-item"><span class="cl-dot" style="background: #DC2626;"></span> Errors</span>
          </div>
        </div>
        <div class="volume-chart">
          @for (bar of volumeData; track bar.hour) {
            <div class="vc-col">
              <div class="vc-stack">
                <div class="vc-bar success" [style.height.%]="(bar.success / maxVolume) * 100"></div>
                <div class="vc-bar error" [style.height.%]="(bar.errors / maxVolume) * 4 * 100"></div>
              </div>
              <span class="vc-label">{{ bar.hour }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Latency Percentiles -->
      <div class="afda-card" style="flex: 1; animation: fadeUp 0.4s ease 0.1s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Latency Percentiles</div>
        </div>
        <div class="latency-percentiles">
          @for (p of latencyPercentiles; track p.label) {
            <div class="lp-row">
              <span class="lp-label">{{ p.label }}</span>
              <div class="lp-bar-container">
                <div class="lp-bar" [style.width.%]="(p.value / 800) * 100"
                     [style.background]="p.color"></div>
              </div>
              <span class="lp-value font-mono" [style.color]="p.color">{{ p.value }}ms</span>
            </div>
          }
        </div>
        <div class="lp-divider"></div>
        <div class="afda-card-title" style="font-size: 12px; margin-bottom: 10px;">Latency Trend (24h)</div>
        <div class="latency-sparklines">
          @for (line of latencySparklines; track line.label) {
            <div class="ls-row">
              <span class="ls-label">{{ line.label }}</span>
              <svg class="ls-svg" viewBox="0 0 200 40" preserveAspectRatio="none">
                <polyline [attr.points]="line.points" fill="none"
                          [attr.stroke]="line.color" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
              <span class="ls-value font-mono">{{ line.current }}ms</span>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Endpoint Breakdown Table + Error Analysis -->
    <div class="mid-grid">
      <!-- Endpoint Table -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.12s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Endpoint Performance</div>
          <span class="afda-badge afda-badge-low">{{ endpoints.length }} endpoints</span>
        </div>
        <table class="afda-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Endpoint</th>
              <th>Requests</th>
              <th>Avg Latency</th>
              <th>P99</th>
              <th>Error %</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            @for (ep of endpoints; track ep.path) {
              <tr>
                <td><span class="method-badge" [ngClass]="'method-' + ep.method.toLowerCase()">{{ ep.method }}</span></td>
                <td><span class="ep-path font-mono">{{ ep.path }}</span></td>
                <td><span class="font-mono">{{ ep.requests }}</span></td>
                <td><span class="font-mono" [style.color]="getLatencyColor(ep.avgLatency)">{{ ep.avgLatency }}ms</span></td>
                <td><span class="font-mono" [style.color]="getLatencyColor(ep.p99)">{{ ep.p99 }}ms</span></td>
                <td>
                  <span class="error-rate font-mono" [ngClass]="ep.errorRate > 2 ? 'high' : ep.errorRate > 0.5 ? 'moderate' : 'low'">
                    {{ ep.errorRate }}%
                  </span>
                </td>
                <td>
                  <svg class="mini-sparkline" viewBox="0 0 60 20">
                    <polyline [attr.points]="ep.sparkline" fill="none" stroke="var(--primary)" stroke-width="1.5"/>
                  </svg>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Error Breakdown -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.14s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Error Analysis</div>
          <span class="afda-badge afda-badge-high">{{ totalErrors }} errors</span>
        </div>
        <!-- Status Code Distribution -->
        <div class="error-section">
          <div class="es-title">HTTP Status Codes</div>
          @for (code of statusCodes; track code.code) {
            <div class="sc-row">
              <span class="sc-code font-mono" [style.color]="code.color">{{ code.code }}</span>
              <span class="sc-name">{{ code.name }}</span>
              <div class="sc-bar">
                <div class="sc-bar-fill" [style.width.%]="(code.count / maxErrorCode) * 100"
                     [style.background]="code.color"></div>
              </div>
              <span class="sc-count font-mono">{{ code.count }}</span>
            </div>
          }
        </div>
        <!-- Top Error Endpoints -->
        <div class="error-section" style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-light);">
          <div class="es-title">Top Error Endpoints</div>
          @for (ep of topErrorEndpoints; track ep.path) {
            <div class="tee-row">
              <span class="method-badge small" [ngClass]="'method-' + ep.method.toLowerCase()">{{ ep.method }}</span>
              <span class="tee-path font-mono">{{ ep.path }}</span>
              <span class="tee-count font-mono">{{ ep.count }}</span>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Token Usage + Rate Limits -->
    <div class="bottom-grid">
      <!-- Token Usage -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.16s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Token Consumption (24h)</div>
        </div>
        <div class="token-summary">
          @for (t of tokenSummary; track t.label) {
            <div class="ts-item">
              <div class="ts-icon" [style.background]="t.iconBg">
                <i [class]="'bi ' + t.icon" [style.color]="t.iconColor"></i>
              </div>
              <div>
                <div class="ts-value font-mono">{{ t.value }}</div>
                <div class="ts-label">{{ t.label }}</div>
              </div>
            </div>
          }
        </div>
        <div class="token-by-model">
          <div class="es-title" style="margin-top: 14px;">By Model</div>
          @for (m of tokenByModel; track m.model) {
            <div class="tbm-row">
              <div class="tbm-color" [style.background]="m.color"></div>
              <span class="tbm-model">{{ m.model }}</span>
              <div class="tbm-bar">
                <div class="tbm-bar-fill" [style.width.%]="(m.tokens / maxTokenModel) * 100"
                     [style.background]="m.color"></div>
              </div>
              <span class="tbm-tokens font-mono">{{ m.tokens }}</span>
              <span class="tbm-cost font-mono">{{ m.cost }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Rate Limits -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.18s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Rate Limit Status</div>
        </div>
        @for (rl of rateLimits; track rl.name) {
          <div class="rl-item">
            <div class="rl-header">
              <span class="rl-name">{{ rl.name }}</span>
              <span class="rl-usage font-mono" [style.color]="getRlColor(rl.pct)">{{ rl.used }} / {{ rl.limit }}</span>
            </div>
            <div class="rl-bar">
              <div class="rl-bar-fill" [style.width.%]="rl.pct" [style.background]="getRlColor(rl.pct)"></div>
            </div>
            <div class="rl-footer">
              <span class="rl-window">{{ rl.window }}</span>
              <span class="rl-pct font-mono" [style.color]="getRlColor(rl.pct)">{{ rl.pct }}%</span>
            </div>
          </div>
        }
        <div class="rl-events" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-light);">
          <div class="es-title">Recent 429 Events</div>
          @for (evt of rateLimitEvents; track evt.time) {
            <div class="rle-row">
              <span class="rle-time font-mono">{{ evt.time }}</span>
              <span class="rle-api">{{ evt.api }}</span>
              <span class="rle-detail">{{ evt.detail }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Response Size + Throughput -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.2s both;">
        <div class="afda-card-title" style="margin-bottom: 14px;">Throughput & Payload</div>
        <div class="tp-metrics">
          @for (m of throughputMetrics; track m.label) {
            <div class="tp-item">
              <span class="tp-label">{{ m.label }}</span>
              <span class="tp-value font-mono">{{ m.value }}</span>
            </div>
          }
        </div>
        <div class="tp-divider"></div>
        <div class="es-title">Request Distribution by Agent</div>
        @for (agent of agentDistribution; track agent.name) {
          <div class="ad-row">
            <div class="ad-dot" [style.background]="agent.color"></div>
            <span class="ad-name">{{ agent.name }}</span>
            <div class="ad-bar">
              <div class="ad-bar-fill" [style.width.%]="agent.pct" [style.background]="agent.color"></div>
            </div>
            <span class="ad-pct font-mono">{{ agent.pct }}%</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* API Selector */
    .api-selector { display: flex; gap: 4px; }

    .api-chip {
      padding: 5px 12px; font-size: 11.5px; font-weight: 500;
      border: 1px solid var(--border); border-radius: 20px;
      background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s; font-family: var(--font-sans);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 600; }
    }

    /* KPI */
    .kpi-row {
      display: grid; grid-template-columns: repeat(6, 1fr);
      gap: 12px; margin-bottom: 16px;
    }

    /* Charts Row */
    .charts-row { display: flex; gap: 16px; margin-bottom: 16px; }

    /* Volume Chart */
    .volume-chart {
      display: flex; gap: 3px; align-items: flex-end; height: 150px; padding-top: 8px;
    }

    .vc-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }

    .vc-stack {
      display: flex; flex-direction: column-reverse;
      width: 100%; max-width: 22px; height: 130px;
      gap: 1px;
    }

    .vc-bar {
      border-radius: 2px 2px 0 0; min-height: 1px;
      transition: height 0.3s;
      &.success { background: var(--primary); }
      &.error { background: #DC2626; }
    }

    .vc-label { font-size: 9px; color: var(--text-tertiary); }

    .chart-legend { display: flex; gap: 12px; }
    .cl-item { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-tertiary); }
    .cl-dot { width: 8px; height: 8px; border-radius: 2px; }

    /* Latency Percentiles */
    .latency-percentiles { display: flex; flex-direction: column; gap: 10px; }

    .lp-row { display: flex; align-items: center; gap: 10px; }
    .lp-label { font-size: 12px; font-weight: 600; min-width: 32px; color: var(--text-secondary); }

    .lp-bar-container {
      flex: 1; height: 10px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .lp-bar { height: 100%; border-radius: 10px; transition: width 0.5s; }
    .lp-value { font-size: 13px; font-weight: 700; min-width: 55px; text-align: right; }

    .lp-divider { height: 1px; background: var(--border-light); margin: 14px 0; }

    /* Latency Sparklines */
    .latency-sparklines { display: flex; flex-direction: column; gap: 6px; }

    .ls-row { display: flex; align-items: center; gap: 8px; }
    .ls-label { font-size: 11px; color: var(--text-tertiary); min-width: 32px; }
    .ls-svg { height: 24px; flex: 1; }
    .ls-value { font-size: 11px; font-weight: 600; min-width: 40px; text-align: right; }

    /* Mid Grid */
    .mid-grid {
      display: grid; grid-template-columns: 1.5fr 1fr;
      gap: 16px; margin-bottom: 16px;
    }

    /* Method Badge */
    .method-badge {
      font-size: 9px; font-weight: 800; padding: 2px 6px;
      border-radius: 3px; text-transform: uppercase; font-family: var(--font-mono);
      &.method-get { background: #ECFDF5; color: #059669; }
      &.method-post { background: #EFF6FF; color: #2563EB; }
      &.method-put { background: #FEF3C7; color: #92400E; }
      &.method-delete { background: #FEE2E2; color: #DC2626; }
      &.small { font-size: 8px; padding: 1px 5px; }
    }

    .ep-path { font-size: 11.5px; color: var(--text-primary); }

    .error-rate {
      font-size: 12px; font-weight: 600;
      &.low { color: #059669; }
      &.moderate { color: #D97706; }
      &.high { color: #DC2626; }
    }

    .mini-sparkline { width: 60px; height: 20px; }

    /* Error Section */
    .error-section { }

    .es-title {
      font-size: 10.5px; font-weight: 700; color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px;
    }

    .sc-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .sc-code { font-size: 13px; font-weight: 800; min-width: 32px; }
    .sc-name { font-size: 12px; color: var(--text-secondary); min-width: 100px; }

    .sc-bar { flex: 1; height: 6px; background: var(--border-light); border-radius: 10px; overflow: hidden; }
    .sc-bar-fill { height: 100%; border-radius: 10px; }
    .sc-count { font-size: 12px; font-weight: 700; min-width: 28px; text-align: right; }

    .tee-row {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .tee-path { font-size: 11px; color: var(--text-primary); flex: 1; }
    .tee-count { font-size: 12px; font-weight: 700; color: #DC2626; }

    /* Bottom Grid */
    .bottom-grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    /* Token Summary */
    .token-summary {
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    }

    .ts-item { display: flex; align-items: center; gap: 10px; }

    .ts-icon {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 14px;
    }

    .ts-value { font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .ts-label { font-size: 10px; color: var(--text-tertiary); }

    /* Token By Model */
    .tbm-row {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .tbm-color { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
    .tbm-model { font-size: 12px; color: var(--text-secondary); min-width: 100px; }

    .tbm-bar { flex: 1; height: 5px; background: var(--border-light); border-radius: 10px; overflow: hidden; }
    .tbm-bar-fill { height: 100%; border-radius: 10px; }
    .tbm-tokens { font-size: 11px; font-weight: 600; min-width: 42px; text-align: right; }
    .tbm-cost { font-size: 10px; color: var(--text-tertiary); min-width: 40px; text-align: right; }

    /* Rate Limits */
    .rl-item { margin-bottom: 14px; }

    .rl-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .rl-name { font-size: 12px; font-weight: 600; color: var(--text-primary); }
    .rl-usage { font-size: 11px; }

    .rl-bar { height: 6px; background: var(--border-light); border-radius: 10px; overflow: hidden; margin-bottom: 3px; }
    .rl-bar-fill { height: 100%; border-radius: 10px; transition: width 0.5s; }

    .rl-footer { display: flex; justify-content: space-between; }
    .rl-window { font-size: 10px; color: var(--text-tertiary); }
    .rl-pct { font-size: 10.5px; font-weight: 600; }

    .rle-row {
      display: flex; gap: 8px; align-items: center;
      padding: 5px 0; border-bottom: 1px solid var(--border-light);
      font-size: 11px;
      &:last-child { border-bottom: none; }
    }

    .rle-time { color: var(--text-tertiary); min-width: 58px; }
    .rle-api { font-weight: 600; color: var(--text-primary); min-width: 70px; }
    .rle-detail { color: var(--text-secondary); }

    /* Throughput */
    .tp-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

    .tp-item {
      padding: 8px 12px; background: var(--bg-section);
      border-radius: var(--radius-sm); border: 1px solid var(--border-light);
    }

    .tp-label { display: block; font-size: 10px; color: var(--text-tertiary); }
    .tp-value { display: block; font-size: 15px; font-weight: 700; color: var(--text-primary); }

    .tp-divider { height: 1px; background: var(--border-light); margin: 14px 0; }

    .ad-row {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .ad-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .ad-name { font-size: 12px; color: var(--text-secondary); min-width: 110px; }

    .ad-bar { flex: 1; height: 5px; background: var(--border-light); border-radius: 10px; overflow: hidden; }
    .ad-bar-fill { height: 100%; border-radius: 10px; }
    .ad-pct { font-size: 11px; font-weight: 600; min-width: 30px; text-align: right; }

    @media (max-width: 1200px) {
      .kpi-row { grid-template-columns: repeat(3, 1fr); }
      .charts-row { flex-direction: column; }
      .mid-grid { grid-template-columns: 1fr; }
      .bottom-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ApiMetricsComponent {
  selectedApi = 'All APIs';
  apiOptions = ['All APIs', 'Flask CRUD', 'FastAPI Gateway', 'LLM APIs'];

  kpis = [
    { label: 'Total Requests', value: '48.2K', trend: '↑ 12%', trendDir: 'neutral', footnote: 'last 24 hours', accent: 'teal' },
    { label: 'Avg Latency', value: '42ms', trend: '↓ 18%', trendDir: 'positive', footnote: 'p50 response time', accent: 'green' },
    { label: 'P99 Latency', value: '380ms', trend: '↓ 8%', trendDir: 'positive', footnote: '99th percentile', accent: 'blue' },
    { label: 'Error Rate', value: '0.34%', trend: '↓ 0.12%', trendDir: 'positive', footnote: '4xx + 5xx combined', accent: 'green' },
    { label: 'Throughput', value: '2.01K', trend: '↑ 8%', trendDir: 'neutral', footnote: 'requests / hour', accent: 'purple' },
    { label: 'Token Cost', value: '$18.42', trend: '↑ $2.10', trendDir: 'negative', footnote: 'LLM spend (24h)', accent: 'teal' },
  ];

  volumeData = [
    { hour: '12a', success: 420, errors: 2 }, { hour: '1a', success: 280, errors: 1 },
    { hour: '2a', success: 180, errors: 0 }, { hour: '3a', success: 120, errors: 0 },
    { hour: '4a', success: 140, errors: 1 }, { hour: '5a', success: 220, errors: 0 },
    { hour: '6a', success: 580, errors: 2 }, { hour: '7a', success: 1200, errors: 4 },
    { hour: '8a', success: 2400, errors: 8 }, { hour: '9a', success: 3200, errors: 12 },
    { hour: '10a', success: 3600, errors: 10 }, { hour: '11a', success: 3400, errors: 8 },
    { hour: '12p', success: 2800, errors: 6 }, { hour: '1p', success: 3100, errors: 14 },
    { hour: '2p', success: 3800, errors: 18 }, { hour: '3p', success: 3500, errors: 12 },
    { hour: '4p', success: 3200, errors: 10 }, { hour: '5p', success: 2600, errors: 8 },
    { hour: '6p', success: 1800, errors: 4 }, { hour: '7p', success: 1200, errors: 3 },
    { hour: '8p', success: 900, errors: 2 }, { hour: '9p', success: 680, errors: 1 },
    { hour: '10p', success: 520, errors: 2 }, { hour: '11p', success: 440, errors: 1 },
  ];

  get maxVolume() { return Math.max(...this.volumeData.map(d => d.success)); }

  latencyPercentiles = [
    { label: 'P50', value: 42, color: '#059669' },
    { label: 'P75', value: 88, color: '#0D6B5C' },
    { label: 'P90', value: 165, color: '#D97706' },
    { label: 'P95', value: 248, color: '#F59E0B' },
    { label: 'P99', value: 380, color: '#DC2626' },
  ];

  latencySparklines = [
    { label: 'P50', points: '0,25 20,22 40,28 60,20 80,24 100,18 120,22 140,16 160,20 180,18 200,16', current: 42, color: '#059669' },
    { label: 'P95', points: '0,15 20,18 40,12 60,20 80,16 100,22 120,18 140,24 160,14 180,18 200,12', current: 248, color: '#F59E0B' },
    { label: 'P99', points: '0,10 20,14 40,8 60,18 80,12 100,20 120,14 140,22 160,10 180,14 200,8', current: 380, color: '#DC2626' },
  ];

  endpoints = [
    { method: 'POST', path: '/api/v1/chat', requests: '8,420', avgLatency: 280, p99: 620, errorRate: 0.8, sparkline: '0,15 10,12 20,14 30,10 40,12 50,8 60,10' },
    { method: 'POST', path: '/api/v1/agents/:id/run', requests: '6,340', avgLatency: 142, p99: 480, errorRate: 1.2, sparkline: '0,12 10,14 20,10 30,16 40,12 50,10 60,8' },
    { method: 'GET', path: '/api/v1/transactions', requests: '12,800', avgLatency: 22, p99: 85, errorRate: 0.1, sparkline: '0,8 10,10 20,8 30,12 40,8 50,10 60,8' },
    { method: 'GET', path: '/api/v1/forecasts', requests: '4,200', avgLatency: 38, p99: 120, errorRate: 0.2, sparkline: '0,10 10,12 20,8 30,10 40,8 50,12 60,10' },
    { method: 'POST', path: '/api/v1/journal-entries', requests: '2,180', avgLatency: 45, p99: 145, errorRate: 0.4, sparkline: '0,12 10,10 20,14 30,10 40,12 50,8 60,10' },
    { method: 'GET', path: '/api/v1/reconciliation', requests: '3,600', avgLatency: 32, p99: 95, errorRate: 0.1, sparkline: '0,8 10,10 20,8 30,8 40,10 50,8 60,8' },
    { method: 'PUT', path: '/api/v1/forecasts/:id', requests: '1,420', avgLatency: 28, p99: 78, errorRate: 0.3, sparkline: '0,10 10,8 20,10 30,12 40,8 50,10 60,8' },
    { method: 'GET', path: '/api/v1/agents', requests: '5,200', avgLatency: 8, p99: 24, errorRate: 0.0, sparkline: '0,6 10,8 20,6 30,8 40,6 50,8 60,6' },
  ];

  totalErrors = 164;
  maxErrorCode = 82;

  statusCodes = [
    { code: '429', name: 'Rate Limited', count: 82, color: '#D97706' },
    { code: '500', name: 'Internal Error', count: 38, color: '#DC2626' },
    { code: '408', name: 'Timeout', count: 24, color: '#F59E0B' },
    { code: '401', name: 'Unauthorized', count: 12, color: '#7C3AED' },
    { code: '400', name: 'Bad Request', count: 8, color: '#6B7280' },
  ];

  topErrorEndpoints = [
    { method: 'POST', path: '/api/v1/chat', count: 68 },
    { method: 'POST', path: '/api/v1/agents/:id/run', count: 42 },
    { method: 'POST', path: '/api/v1/journal-entries', count: 28 },
    { method: 'GET', path: '/api/v1/transactions', count: 14 },
  ];

  tokenSummary = [
    { value: '3.8M', label: 'Input Tokens', icon: 'bi-arrow-right-circle', iconBg: '#E8F5F1', iconColor: '#0D6B5C' },
    { value: '1.2M', label: 'Output Tokens', icon: 'bi-arrow-left-circle', iconBg: '#EFF6FF', iconColor: '#2563EB' },
    { value: '$18.42', label: 'Total Cost', icon: 'bi-currency-dollar', iconBg: '#FEF3C7', iconColor: '#D97706' },
    { value: '842', label: 'LLM Calls', icon: 'bi-lightning', iconBg: '#EDE9FE', iconColor: '#7C3AED' },
  ];

  maxTokenModel = 1800;

  tokenByModel = [
    { model: 'Claude Sonnet 4', tokens: 1800, cost: '$8.42', color: '#0D6B5C' },
    { model: 'Claude Haiku 4', tokens: 1200, cost: '$2.10', color: '#2563EB' },
    { model: 'Claude Opus 4', tokens: 480, cost: '$6.40', color: '#7C3AED' },
    { model: 'GPT-4o (fallback)', tokens: 220, cost: '$1.20', color: '#D97706' },
    { model: 'Titan Express', tokens: 100, cost: '$0.30', color: '#6B7280' },
  ];

  rateLimits = [
    { name: 'Anthropic API (RPM)', used: '42', limit: '60', pct: 70, window: 'Per minute' },
    { name: 'Anthropic API (TPM)', used: '82K', limit: '200K', pct: 41, window: 'Per minute' },
    { name: 'OpenAI API (RPM)', used: '8', limit: '60', pct: 13, window: 'Per minute' },
    { name: 'Flask CRUD (hourly)', used: '1,840', limit: '5,000', pct: 37, window: 'Per hour' },
    { name: 'FastAPI Gateway (hourly)', used: '2,200', limit: '3,000', pct: 73, window: 'Per hour' },
    { name: 'Daily Token Budget', used: '3.8M', limit: '5M', pct: 76, window: 'Daily reset' },
  ];

  rateLimitEvents = [
    { time: '2:14 PM', api: 'Anthropic', detail: 'RPM limit hit — 3 requests queued' },
    { time: '1:48 PM', api: 'Anthropic', detail: 'TPM spike during batch recon' },
    { time: '10:02 AM', api: 'FastAPI', detail: 'Concurrent graph limit reached' },
  ];

  throughputMetrics = [
    { label: 'Avg Payload (req)', value: '2.4 KB' },
    { label: 'Avg Payload (res)', value: '8.6 KB' },
    { label: 'Bandwidth (in)', value: '1.4 GB' },
    { label: 'Bandwidth (out)', value: '820 MB' },
  ];

  agentDistribution = [
    { name: 'Cash Flow Agent', pct: 28, color: '#0D6B5C' },
    { name: 'Recon Agent', pct: 22, color: '#2563EB' },
    { name: 'Forecast Agent', pct: 18, color: '#7C3AED' },
    { name: 'Close Agent', pct: 14, color: '#D97706' },
    { name: 'AR/AP Agent', pct: 12, color: '#059669' },
    { name: 'Other', pct: 6, color: '#9CA3AF' },
  ];

  getLatencyColor(ms: number): string {
    if (ms > 300) return '#DC2626';
    if (ms > 100) return '#D97706';
    return '#059669';
  }

  getRlColor(pct: number): string {
    if (pct >= 80) return '#DC2626';
    if (pct >= 60) return '#D97706';
    return '#059669';
  }
}