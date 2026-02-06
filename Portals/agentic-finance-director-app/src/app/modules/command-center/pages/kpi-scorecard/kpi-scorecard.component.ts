import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-cc-kpi',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/command/overview">Command Center</a>
      <span class="separator">/</span>
      <span class="current">KPI Scorecard</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">KPI Scorecard</h1>
        <p class="afda-page-subtitle">Key performance indicators across all finance functions</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>February 2026</option>
          <option>January 2026</option>
          <option>December 2025</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-download"></i> Export PDF
        </button>
      </div>
    </div>

    <!-- Overall Health -->
    <div class="health-banner stagger">
      <div class="health-score-card">
        <div class="health-ring">
          <svg viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#E5E7EB" stroke-width="6"/>
            <circle cx="40" cy="40" r="34" fill="none" stroke="#059669" stroke-width="6"
                    stroke-dasharray="171" stroke-dashoffset="29" stroke-linecap="round"
                    transform="rotate(-90 40 40)"/>
          </svg>
          <span class="health-pct">83%</span>
        </div>
        <div>
          <div class="health-title">Overall Health Score</div>
          <div class="health-sub">14 of 17 KPIs on track</div>
        </div>
      </div>
      <div class="health-summary-cards">
        @for (s of summaryCards; track s.label) {
          <div class="health-mini-card">
            <div class="health-mini-value" [style.color]="s.color">{{ s.value }}</div>
            <div class="health-mini-label">{{ s.label }}</div>
          </div>
        }
      </div>
    </div>

    <!-- KPI Groups -->
    @for (group of kpiGroups; track group.title) {
      <div class="afda-card" style="margin-bottom: 16px;" [style.animation-delay]="group.delay">
        <div class="afda-card-header">
          <div class="afda-card-title">
            <i [class]="'bi ' + group.icon" style="margin-right: 6px; color: var(--primary);"></i>
            {{ group.title }}
          </div>
          <span class="afda-badge afda-badge-success" *ngIf="group.onTrack === group.total">All on track</span>
          <span class="afda-badge afda-badge-danger" *ngIf="group.onTrack < group.total">
            {{ group.total - group.onTrack }} off track
          </span>
        </div>
        <table class="afda-table">
          <thead>
            <tr>
              <th style="width: 28%;">KPI</th>
              <th class="text-right">Target</th>
              <th class="text-right">Actual</th>
              <th class="text-right">Variance</th>
              <th style="width: 120px;">Trend</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (kpi of group.kpis; track kpi.name) {
              <tr>
                <td class="fw-600">{{ kpi.name }}</td>
                <td class="text-right font-mono">{{ kpi.target }}</td>
                <td class="text-right font-mono">{{ kpi.actual }}</td>
                <td class="text-right font-mono" [class]="kpi.favorable ? 'text-favorable' : 'text-unfavorable'">
                  {{ kpi.variance }}
                </td>
                <td>
                  <div class="trend-bar-wrapper">
                    @for (bar of kpi.trend; track $index) {
                      <div class="trend-bar"
                           [style.height.px]="bar"
                           [style.background]="kpi.favorable ? '#059669' : '#DC2626'"
                           [style.opacity]="0.4 + ($index * 0.12)"></div>
                    }
                  </div>
                </td>
                <td>
                  <span class="afda-badge" [ngClass]="kpi.favorable ? 'afda-badge-success' : 'afda-badge-danger'">
                    {{ kpi.favorable ? 'On Track' : 'Off Track' }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .health-banner {
      display: flex; align-items: center; gap: 24px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 22px 28px;
      box-shadow: var(--shadow-card); margin-bottom: 20px;
      animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
    }

    .health-score-card {
      display: flex; align-items: center; gap: 16px;
      padding-right: 24px; border-right: 1px solid var(--border-light);
    }

    .health-ring {
      width: 72px; height: 72px; position: relative; flex-shrink: 0;
    }
    .health-ring svg { width: 100%; height: 100%; }
    .health-pct {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 700; color: #059669;
      font-family: var(--font-mono);
    }

    .health-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .health-sub { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }

    .health-summary-cards {
      display: flex; gap: 24px; flex: 1; justify-content: center;
    }

    .health-mini-card { text-align: center; }
    .health-mini-value { font-size: 22px; font-weight: 700; font-family: var(--font-mono); }
    .health-mini-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.4px; margin-top: 2px; }

    .trend-bar-wrapper {
      display: flex; align-items: flex-end; gap: 3px; height: 28px;
    }
    .trend-bar {
      width: 6px; border-radius: 2px; min-height: 4px;
      transition: height 0.3s ease;
    }
  `]
})
export class KpiScorecardComponent {
  summaryCards = [
    { label: 'On Track', value: '14', color: '#059669' },
    { label: 'Off Track', value: '3', color: '#DC2626' },
    { label: 'Improved', value: '5', color: '#2563EB' },
    { label: 'Declined', value: '2', color: '#D97706' },
  ];

  kpiGroups = [
    {
      title: 'Revenue & Growth', icon: 'bi-graph-up-arrow', onTrack: 3, total: 4, delay: '0.05s',
      kpis: [
        { name: 'Monthly Recurring Revenue', target: '$11.8M', actual: '$12.4M', variance: '+5.1%', favorable: true, trend: [12, 16, 14, 20, 24] },
        { name: 'Net Revenue Retention', target: '115%', actual: '118%', variance: '+3.0%', favorable: true, trend: [18, 20, 19, 22, 24] },
        { name: 'New Logo Revenue', target: '$1.2M', actual: '$980K', variance: '-18.3%', favorable: false, trend: [22, 18, 14, 12, 10] },
        { name: 'Avg Contract Value', target: '$48K', actual: '$52K', variance: '+8.3%', favorable: true, trend: [14, 15, 18, 20, 22] },
      ]
    },
    {
      title: 'Profitability & Margins', icon: 'bi-pie-chart', onTrack: 2, total: 3, delay: '0.1s',
      kpis: [
        { name: 'Gross Margin', target: '72%', actual: '71.4%', variance: '-0.6%', favorable: false, trend: [24, 22, 20, 21, 19] },
        { name: 'Operating Margin', target: '20%', actual: '18.7%', variance: '-1.3%', favorable: false, trend: [22, 20, 18, 19, 16] },
        { name: 'EBITDA Margin', target: '24%', actual: '25.1%', variance: '+1.1%', favorable: true, trend: [16, 18, 20, 22, 24] },
      ]
    },
    {
      title: 'Cash & Treasury', icon: 'bi-wallet2', onTrack: 4, total: 4, delay: '0.15s',
      kpis: [
        { name: 'Cash Balance', target: '$4.5M', actual: '$4.8M', variance: '+6.7%', favorable: true, trend: [16, 18, 20, 22, 24] },
        { name: 'Operating Cash Flow', target: '$1.8M', actual: '$2.1M', variance: '+16.7%', favorable: true, trend: [14, 16, 18, 22, 26] },
        { name: 'DSO (Days Sales Out)', target: '38d', actual: '35d', variance: '-3 days', favorable: true, trend: [22, 20, 18, 16, 14] },
        { name: 'Current Ratio', target: '1.8x', actual: '2.1x', variance: '+0.3x', favorable: true, trend: [16, 17, 19, 20, 22] },
      ]
    },
    {
      title: 'Operational Efficiency', icon: 'bi-speedometer2', onTrack: 5, total: 6, delay: '0.2s',
      kpis: [
        { name: 'Close Cycle Time', target: '5 days', actual: '4.5 days', variance: '-0.5d', favorable: true, trend: [20, 18, 16, 15, 14] },
        { name: 'Recon Completion Rate', target: '100%', actual: '97%', variance: '-3%', favorable: false, trend: [24, 24, 22, 20, 18] },
        { name: 'AP Processing Time', target: '2 days', actual: '1.8 days', variance: '-0.2d', favorable: true, trend: [18, 16, 15, 14, 12] },
        { name: 'Agent Task Automation', target: '60%', actual: '68%', variance: '+8%', favorable: true, trend: [10, 14, 18, 22, 26] },
        { name: 'Forecast Accuracy', target: '92%', actual: '94%', variance: '+2%', favorable: true, trend: [16, 18, 20, 22, 24] },
        { name: 'Budget Utilization', target: '95%', actual: '96.2%', variance: '+1.2%', favorable: true, trend: [18, 19, 20, 22, 23] },
      ]
    }
  ];
}