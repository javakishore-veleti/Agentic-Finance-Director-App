import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-risk-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/risk-intelligence">Risk Intelligence</a>
      <span class="separator">/</span>
      <span class="current">Risk Dashboard</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Risk Dashboard</h1>
        <p class="afda-page-subtitle">Composite risk scoring, heatmap analysis, and mitigation tracking</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>February 2026</option>
          <option>January 2026</option>
          <option>Q4 2025</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-download"></i> Export Report
        </button>
      </div>
    </div>

    <!-- Top Row: Risk Score + Category Scores -->
    <div class="score-row stagger">
      <!-- Composite Score Ring -->
      <div class="afda-card score-ring-card" style="animation: fadeUp 0.4s ease both;">
        <div class="sr-ring">
          <svg viewBox="0 0 120 120" class="sr-svg">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-light)" stroke-width="10"/>
            <circle cx="60" cy="60" r="52" fill="none"
                    [attr.stroke]="getRiskColor(compositeScore)"
                    stroke-width="10" stroke-linecap="round"
                    [attr.stroke-dasharray]="getScoreDash(compositeScore)"
                    stroke-dashoffset="0"
                    transform="rotate(-90 60 60)"
                    style="transition: stroke-dasharray 1s ease;"/>
          </svg>
          <div class="sr-value">
            <span class="sr-number font-mono">{{ compositeScore }}</span>
            <span class="sr-max">/100</span>
          </div>
        </div>
        <div class="sr-label-section">
          <div class="sr-title">Composite Risk Score</div>
          <div class="sr-status" [style.color]="getRiskColor(compositeScore)">
            <i class="bi bi-shield-check"></i> {{ getRiskLabel(compositeScore) }}
          </div>
          <div class="sr-trend positive">
            <i class="bi bi-arrow-down"></i> 4 pts from last month
          </div>
        </div>
      </div>

      <!-- Category Scores -->
      @for (cat of categoryScores; track cat.name) {
        <div class="afda-card cat-score-card" style="animation: fadeUp 0.4s ease both;">
          <div class="cs-header">
            <div class="cs-icon" [style.background]="cat.iconBg">
              <i [class]="'bi ' + cat.icon" [style.color]="cat.iconColor"></i>
            </div>
            <div class="cs-trend font-mono" [ngClass]="cat.trendDir">
              {{ cat.trend }}
            </div>
          </div>
          <div class="cs-score font-mono" [style.color]="getRiskColor(cat.score)">{{ cat.score }}</div>
          <div class="cs-name">{{ cat.name }}</div>
          <div class="cs-bar">
            <div class="cs-bar-fill" [style.width.%]="cat.score"
                 [style.background]="getRiskColor(cat.score)"></div>
          </div>
          <div class="cs-detail">{{ cat.detail }}</div>
        </div>
      }
    </div>

    <!-- Risk Heatmap + Trend Chart -->
    <div class="mid-grid">
      <!-- Heatmap -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.08s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Risk Heatmap</div>
          <div class="hm-legend">
            <span class="hm-leg"><span class="hm-swatch" style="background: #059669;"></span> Low</span>
            <span class="hm-leg"><span class="hm-swatch" style="background: #D97706;"></span> Medium</span>
            <span class="hm-leg"><span class="hm-swatch" style="background: #DC2626;"></span> High</span>
          </div>
        </div>
        <div class="heatmap">
          <div class="hm-y-axis">
            @for (label of heatmapYLabels; track label) {
              <span class="hm-y-label">{{ label }}</span>
            }
          </div>
          <div class="hm-grid">
            @for (row of heatmapData; track $index) {
              <div class="hm-row">
                @for (cell of row; track $index) {
                  <div class="hm-cell" [style.background]="cell.bg" [style.color]="cell.color"
                       [title]="cell.tooltip">
                    {{ cell.value }}
                  </div>
                }
              </div>
            }
            <div class="hm-x-axis">
              @for (label of heatmapXLabels; track label) {
                <span class="hm-x-label">{{ label }}</span>
              }
            </div>
          </div>
        </div>
        <div class="hm-axes-labels">
          <span class="hm-axis-label">← Impact →</span>
          <span class="hm-axis-label-y">← Likelihood →</span>
        </div>
      </div>

      <!-- Trend Chart -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.1s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Risk Score Trend (6 Months)</div>
        </div>
        <div class="trend-chart">
          <div class="tc-y-axis">
            @for (y of [80, 60, 40, 20, 0]; track y) {
              <span class="tc-y-label font-mono">{{ y }}</span>
            }
          </div>
          <div class="tc-area">
            <!-- Grid lines -->
            @for (y of [0, 25, 50, 75, 100]; track y) {
              <div class="tc-gridline" [style.bottom.%]="y"></div>
            }
            <!-- Data points + line -->
            <svg class="tc-svg" viewBox="0 0 500 200" preserveAspectRatio="none">
              <polyline [attr.points]="trendLinePoints" fill="none"
                        stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round"/>
              <polyline [attr.points]="trendAreaPoints" fill="url(#trendGrad)" opacity="0.15"/>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--primary)"/>
                  <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
                </linearGradient>
              </defs>
              @for (pt of trendPoints; track pt.x) {
                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="4"
                        fill="white" stroke="var(--primary)" stroke-width="2"/>
              }
            </svg>
            <div class="tc-x-axis">
              @for (label of trendLabels; track label) {
                <span class="tc-x-label">{{ label }}</span>
              }
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Risk Register + Mitigations -->
    <div class="bottom-grid">
      <!-- Risk Register -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.14s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Top Risks</div>
          <span class="afda-badge afda-badge-medium">{{ riskRegister.length }} risks tracked</span>
        </div>
        @for (risk of riskRegister; track risk.id) {
          <div class="risk-item">
            <div class="ri-severity" [style.background]="getRiskColor(risk.score)"></div>
            <div class="ri-content">
              <div class="ri-top">
                <span class="ri-score font-mono" [style.color]="getRiskColor(risk.score)">{{ risk.score }}</span>
                <span class="ri-name">{{ risk.name }}</span>
                <span class="ri-category">{{ risk.category }}</span>
              </div>
              <div class="ri-bottom">
                <span class="ri-impact">Impact: <strong>{{ risk.impact }}</strong></span>
                <span class="ri-likelihood">Likelihood: <strong>{{ risk.likelihood }}</strong></span>
                <span class="ri-owner">
                  <i class="bi bi-person"></i> {{ risk.owner }}
                </span>
              </div>
            </div>
            <div class="ri-mitigation-status">
              <div class="ri-mit-bar">
                <div class="ri-mit-fill" [style.width.%]="risk.mitigationPct"
                     [style.background]="risk.mitigationPct >= 75 ? '#059669' : risk.mitigationPct >= 50 ? '#D97706' : '#DC2626'"></div>
              </div>
              <span class="ri-mit-label font-mono">{{ risk.mitigationPct }}%</span>
            </div>
          </div>
        }
      </div>

      <!-- Mitigation Actions + AI Recommendations -->
      <div class="bottom-side">
        <!-- Pending Mitigations -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.16s both;">
          <div class="afda-card-header">
            <div class="afda-card-title">Pending Actions</div>
            <span class="afda-badge afda-badge-high">{{ pendingActions.length }} due</span>
          </div>
          @for (action of pendingActions; track action.id) {
            <div class="pa-item">
              <div class="pa-priority" [style.background]="action.priorityBg">
                <i [class]="'bi ' + action.priorityIcon" [style.color]="action.priorityColor"></i>
              </div>
              <div class="pa-info">
                <div class="pa-title">{{ action.title }}</div>
                <div class="pa-meta">
                  <span>{{ action.risk }}</span>
                  <span>·</span>
                  <span>Due {{ action.due }}</span>
                </div>
              </div>
              <span class="pa-owner">{{ action.owner }}</span>
            </div>
          }
        </div>

        <!-- AI Recommendations -->
        <div class="afda-card" style="margin-top: 14px; animation: fadeUp 0.4s ease 0.18s both;">
          <div class="afda-card-header">
            <div class="afda-card-title">
              <i class="bi bi-robot" style="color: var(--primary);"></i> AI Risk Insights
            </div>
          </div>
          @for (insight of aiInsights; track insight.title) {
            <div class="ai-insight">
              <div class="aii-icon" [style.background]="insight.iconBg">
                <i [class]="'bi ' + insight.icon" [style.color]="insight.iconColor"></i>
              </div>
              <div class="aii-content">
                <div class="aii-title">{{ insight.title }}</div>
                <div class="aii-text">{{ insight.text }}</div>
                <div class="aii-confidence">
                  <span class="font-mono" style="font-size: 10px; color: var(--text-tertiary);">{{ insight.confidence }}% confidence</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Score Row */
    .score-row {
      display: grid; grid-template-columns: 280px repeat(5, 1fr);
      gap: 12px; margin-bottom: 16px;
    }

    /* Ring Card */
    .score-ring-card {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 20px !important; text-align: center;
    }

    .sr-ring { position: relative; width: 110px; height: 110px; margin-bottom: 10px; }
    .sr-svg { width: 100%; height: 100%; }

    .sr-value {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center; gap: 1px;
    }

    .sr-number { font-size: 30px; font-weight: 800; color: var(--text-primary); }
    .sr-max { font-size: 14px; color: var(--text-tertiary); font-weight: 500; }

    .sr-title { font-size: 13px; font-weight: 700; color: var(--text-primary); }

    .sr-status {
      font-size: 12px; font-weight: 600; margin-top: 2px;
      display: flex; align-items: center; justify-content: center; gap: 4px;
    }

    .sr-trend {
      font-size: 11px; margin-top: 4px; color: var(--text-tertiary);
      &.positive { color: #059669; }
      &.negative { color: #DC2626; }
    }

    /* Category Score Cards */
    .cat-score-card { padding: 14px 16px !important; }

    .cs-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }

    .cs-icon {
      width: 30px; height: 30px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 14px;
    }

    .cs-trend { font-size: 11px; font-weight: 600; }

    .cs-score { font-size: 26px; font-weight: 800; margin-bottom: 2px; }
    .cs-name { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }

    .cs-bar {
      height: 4px; background: var(--border-light);
      border-radius: 10px; overflow: hidden; margin-bottom: 6px;
    }

    .cs-bar-fill { height: 100%; border-radius: 10px; transition: width 0.8s ease; }

    .cs-detail { font-size: 10.5px; color: var(--text-tertiary); }

    /* Mid Grid */
    .mid-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 16px; margin-bottom: 16px;
    }

    /* Heatmap */
    .heatmap { display: flex; gap: 4px; }

    .hm-y-axis {
      display: flex; flex-direction: column; justify-content: space-around;
      padding-right: 4px;
    }

    .hm-y-label { font-size: 10px; color: var(--text-tertiary); text-align: right; min-width: 60px; }

    .hm-grid { flex: 1; }

    .hm-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; margin-bottom: 3px; }

    .hm-cell {
      aspect-ratio: 1; border-radius: var(--radius-sm);
      display: grid; place-items: center;
      font-size: 11px; font-weight: 700; cursor: default;
      font-family: var(--font-mono);
      transition: transform 0.1s;
      &:hover { transform: scale(1.08); }
    }

    .hm-x-axis {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 3px; margin-top: 4px;
    }

    .hm-x-label { font-size: 10px; color: var(--text-tertiary); text-align: center; }

    .hm-legend { display: flex; gap: 12px; font-size: 11px; color: var(--text-tertiary); }

    .hm-leg { display: flex; align-items: center; gap: 4px; }

    .hm-swatch { width: 10px; height: 10px; border-radius: 2px; }

    .hm-axes-labels {
      display: flex; justify-content: space-between;
      font-size: 10px; color: var(--text-tertiary); margin-top: 8px; font-style: italic;
    }

    /* Trend Chart */
    .trend-chart { display: flex; gap: 4px; height: 200px; }

    .tc-y-axis {
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 0 4px;
    }

    .tc-y-label { font-size: 10px; color: var(--text-tertiary); }

    .tc-area { flex: 1; position: relative; }

    .tc-gridline {
      position: absolute; left: 0; right: 0; height: 1px;
      background: var(--border-light);
    }

    .tc-svg {
      position: absolute; inset: 0; width: 100%; height: 100%;
    }

    .tc-x-axis {
      position: absolute; bottom: -18px; left: 0; right: 0;
      display: flex; justify-content: space-between;
    }

    .tc-x-label { font-size: 10px; color: var(--text-tertiary); }

    /* Bottom Grid */
    .bottom-grid {
      display: grid; grid-template-columns: 1fr 360px;
      gap: 16px; margin-top: 20px;
    }

    .bottom-side { display: flex; flex-direction: column; }

    /* Risk Register */
    .risk-item {
      display: flex; align-items: center; gap: 0;
      padding: 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .ri-severity { width: 4px; height: 56px; border-radius: 2px; flex-shrink: 0; margin-right: 12px; }

    .ri-content { flex: 1; padding: 10px 0; }

    .ri-top { display: flex; align-items: center; gap: 8px; }
    .ri-score { font-size: 14px; font-weight: 800; min-width: 28px; }
    .ri-name { font-size: 13px; font-weight: 600; color: var(--text-primary); flex: 1; }
    .ri-category { font-size: 10.5px; color: var(--text-tertiary); }

    .ri-bottom {
      display: flex; gap: 12px; margin-top: 4px;
      font-size: 11px; color: var(--text-tertiary);
      strong { color: var(--text-secondary); font-weight: 600; }
    }

    .ri-owner { display: flex; align-items: center; gap: 3px; }

    .ri-mitigation-status {
      display: flex; align-items: center; gap: 8px; min-width: 100px;
    }

    .ri-mit-bar {
      width: 60px; height: 5px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .ri-mit-fill { height: 100%; border-radius: 10px; }
    .ri-mit-label { font-size: 11px; font-weight: 600; }

    /* Pending Actions */
    .pa-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .pa-priority {
      width: 28px; height: 28px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 12px; flex-shrink: 0;
    }

    .pa-info { flex: 1; }
    .pa-title { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
    .pa-meta { font-size: 11px; color: var(--text-tertiary); display: flex; gap: 4px; }
    .pa-owner { font-size: 11px; color: var(--text-tertiary); white-space: nowrap; }

    /* AI Insights */
    .ai-insight {
      display: flex; gap: 10px; padding: 12px 0;
      border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .aii-icon {
      width: 30px; height: 30px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 13px; flex-shrink: 0;
    }

    .aii-content { flex: 1; }
    .aii-title { font-size: 12.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
    .aii-text { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    @media (max-width: 1200px) {
      .score-row { grid-template-columns: 1fr 1fr; }
      .mid-grid { grid-template-columns: 1fr; }
      .bottom-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class RiskDashboardComponent {
  compositeScore = 34;

  categoryScores = [
    { name: 'Liquidity', score: 48, icon: 'bi-droplet', iconBg: '#EFF6FF', iconColor: '#2563EB', trend: '↑ 8', trendDir: 'negative', detail: 'Cash covenant pressure Week 6' },
    { name: 'Credit / AR', score: 42, icon: 'bi-credit-card', iconBg: '#FEF3C7', iconColor: '#D97706', trend: '↑ 5', trendDir: 'negative', detail: '3 invoices crossed 90+ days' },
    { name: 'Operational', score: 28, icon: 'bi-gear', iconBg: '#E8F5F1', iconColor: '#0D6B5C', trend: '↓ 6', trendDir: 'positive', detail: 'Close process on track (Day 5)' },
    { name: 'Compliance', score: 18, icon: 'bi-shield-check', iconBg: '#ECFDF5', iconColor: '#059669', trend: '→ 0', trendDir: '', detail: 'SOX Q1 testing upcoming' },
    { name: 'Technology', score: 22, icon: 'bi-cpu', iconBg: '#EDE9FE', iconColor: '#7C3AED', trend: '↓ 4', trendDir: 'positive', detail: 'Latency spike resolved' },
  ];

  heatmapYLabels = ['Very High', 'High', 'Medium', 'Low', 'Very Low'];
  heatmapXLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Severe'];

  heatmapData = [
    [
      { value: '', bg: '#FEF3C7', color: '#92400E', tooltip: '' },
      { value: '1', bg: '#FEE2E2', color: '#991B1B', tooltip: 'AR 90+ days' },
      { value: '', bg: '#FEE2E2', color: '#991B1B', tooltip: '' },
      { value: '1', bg: '#DC2626', color: '#FFF', tooltip: 'Liquidity covenant' },
      { value: '', bg: '#DC2626', color: '#FFF', tooltip: '' },
    ],
    [
      { value: '', bg: '#ECFDF5', color: '#059669', tooltip: '' },
      { value: '1', bg: '#FEF3C7', color: '#92400E', tooltip: 'IC imbalance' },
      { value: '2', bg: '#FEE2E2', color: '#991B1B', tooltip: 'Budget var / Recon' },
      { value: '', bg: '#FEE2E2', color: '#991B1B', tooltip: '' },
      { value: '', bg: '#DC2626', color: '#FFF', tooltip: '' },
    ],
    [
      { value: '1', bg: '#ECFDF5', color: '#059669', tooltip: 'SOX reminder' },
      { value: '1', bg: '#FEF3C7', color: '#92400E', tooltip: 'Close tasks' },
      { value: '', bg: '#FEF3C7', color: '#92400E', tooltip: '' },
      { value: '', bg: '#FEE2E2', color: '#991B1B', tooltip: '' },
      { value: '', bg: '#FEE2E2', color: '#991B1B', tooltip: '' },
    ],
    [
      { value: '1', bg: '#ECFDF5', color: '#059669', tooltip: 'Latency spike' },
      { value: '', bg: '#ECFDF5', color: '#059669', tooltip: '' },
      { value: '', bg: '#FEF3C7', color: '#92400E', tooltip: '' },
      { value: '', bg: '#FEF3C7', color: '#92400E', tooltip: '' },
      { value: '', bg: '#FEE2E2', color: '#991B1B', tooltip: '' },
    ],
    [
      { value: '', bg: '#ECFDF5', color: '#059669', tooltip: '' },
      { value: '', bg: '#ECFDF5', color: '#059669', tooltip: '' },
      { value: '', bg: '#ECFDF5', color: '#059669', tooltip: '' },
      { value: '', bg: '#FEF3C7', color: '#92400E', tooltip: '' },
      { value: '', bg: '#FEF3C7', color: '#92400E', tooltip: '' },
    ],
  ];

  trendData = [
    { month: 'Sep', score: 52 },
    { month: 'Oct', score: 46 },
    { month: 'Nov', score: 40 },
    { month: 'Dec', score: 44 },
    { month: 'Jan', score: 38 },
    { month: 'Feb', score: 34 },
  ];

  trendLabels = this.trendData.map(d => d.month);

  get trendPoints() {
    return this.trendData.map((d, i) => ({
      x: 40 + i * 84,
      y: 200 - (d.score / 80) * 200
    }));
  }

  get trendLinePoints() {
    return this.trendPoints.map(p => `${p.x},${p.y}`).join(' ');
  }

  get trendAreaPoints() {
    const pts = this.trendPoints;
    const line = pts.map(p => `${p.x},${p.y}`).join(' ');
    return `${pts[0].x},200 ${line} ${pts[pts.length - 1].x},200`;
  }

  riskRegister = [
    { id: 'R-001', name: 'Liquidity covenant breach risk', category: 'Liquidity', score: 72, impact: 'Major', likelihood: 'Possible', owner: 'CFO', mitigationPct: 35 },
    { id: 'R-002', name: 'AR credit concentration — TechVentures', category: 'Credit', score: 58, impact: 'Moderate', likelihood: 'Likely', owner: 'AR Manager', mitigationPct: 50 },
    { id: 'R-003', name: 'IC elimination timing gaps', category: 'Operational', score: 45, impact: 'Moderate', likelihood: 'Possible', owner: 'Controller', mitigationPct: 75 },
    { id: 'R-004', name: 'Marketing budget overrun propagation', category: 'Operational', score: 42, impact: 'Minor', likelihood: 'Likely', owner: 'VP Finance', mitigationPct: 60 },
    { id: 'R-005', name: 'Month-end close delay risk', category: 'Operational', score: 38, impact: 'Moderate', likelihood: 'Unlikely', owner: 'Controller', mitigationPct: 80 },
    { id: 'R-006', name: 'SOX control testing coverage gap', category: 'Compliance', score: 25, impact: 'Major', likelihood: 'Rare', owner: 'Internal Audit', mitigationPct: 90 },
  ];

  pendingActions = [
    { id: 'MA-1', title: 'Negotiate payment extension with TechSolutions', risk: 'Liquidity covenant', due: 'Feb 7', owner: 'J. Park', priorityIcon: 'bi-exclamation-triangle-fill', priorityBg: '#FEE2E2', priorityColor: '#DC2626' },
    { id: 'MA-2', title: 'Escalate AR collection to VP Finance', risk: 'Credit / TechVentures', due: 'Feb 7', owner: 'M. Chen', priorityIcon: 'bi-exclamation-triangle', priorityBg: '#FEF3C7', priorityColor: '#D97706' },
    { id: 'MA-3', title: 'Post missing EU management fee invoice', risk: 'IC imbalance', due: 'Feb 8', owner: 'S. Chen', priorityIcon: 'bi-exclamation-triangle', priorityBg: '#FEF3C7', priorityColor: '#D97706' },
    { id: 'MA-4', title: 'Review JE batch #4412 for duplicates', risk: 'Recon variance', due: 'Feb 8', owner: 'T. Kim', priorityIcon: 'bi-info-circle', priorityBg: '#EFF6FF', priorityColor: '#2563EB' },
    { id: 'MA-5', title: 'Prepare SOX Q1 sampling plan', risk: 'SOX compliance', due: 'Feb 12', owner: 'A. Patel', priorityIcon: 'bi-info-circle', priorityBg: '#F3F4F6', priorityColor: '#6B7280' },
  ];

  aiInsights = [
    { title: 'Cash Recovery Likely by Week 5', text: 'Historical AR collection patterns suggest $680K in delayed payments will arrive before the Week 6 dip, reducing covenant breach probability to 8%.', confidence: 88, icon: 'bi-graph-down-arrow', iconBg: '#E8F5F1', iconColor: '#0D6B5C' },
    { title: 'Duplicate JE Pattern Detected', text: 'Similar batch upload duplicates occurred in Oct 2025. Root cause was timezone mismatch in ERP sync. Recommend permanent fix.', confidence: 94, icon: 'bi-bug', iconBg: '#EDE9FE', iconColor: '#7C3AED' },
    { title: 'Marketing Spend Normalizing', text: 'January spike driven by annual conference ($62K) and tool renewals ($18K). Expect February to return within 5% of budget.', confidence: 91, icon: 'bi-bar-chart', iconBg: '#FEF3C7', iconColor: '#D97706' },
  ];

  getRiskColor(score: number): string {
    if (score >= 60) return '#DC2626';
    if (score >= 40) return '#D97706';
    if (score >= 20) return '#2563EB';
    return '#059669';
  }

  getRiskLabel(score: number): string {
    if (score >= 60) return 'High Risk';
    if (score >= 40) return 'Moderate Risk';
    if (score >= 20) return 'Low Risk';
    return 'Minimal Risk';
  }

  getScoreDash(score: number): string {
    const circumference = 2 * Math.PI * 52;
    const filled = (score / 100) * circumference;
    return `${filled} ${circumference}`;
  }
}