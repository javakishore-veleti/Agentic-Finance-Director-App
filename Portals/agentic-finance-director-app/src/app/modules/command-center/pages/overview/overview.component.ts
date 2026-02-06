import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a>Command Center</a>
      <span class="separator">/</span>
      <span class="current">Executive Overview</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Executive Overview</h1>
        <p class="afda-page-subtitle">Real-time financial intelligence hub — Thursday, February 5, 2026</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-download"></i> Export
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-lightning-fill"></i> Generate Briefing
        </button>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="kpi-grid stagger">
      @for (card of kpiCards; track card.label) {
        <div class="afda-stat-card">
          <div class="accent-bar" [ngClass]="card.accent"></div>
          <div class="afda-stat-label">{{ card.label }}</div>
          <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-top: 8px;">
            <div class="afda-stat-value">{{ card.value }}</div>
            <span class="afda-stat-trend" [ngClass]="card.trendDir">{{ card.trend }}</span>
          </div>
          <div class="afda-stat-footnote">{{ card.footnote }}</div>
        </div>
      }
    </div>

    <!-- AI Panel + Alerts Row -->
    <div class="overview-row-2">
      <!-- AI Executive Summary -->
      <div class="afda-ai-panel">
        <div class="afda-ai-panel-header">
          <div class="afda-ai-icon"><i class="bi bi-stars"></i></div>
          <span class="afda-ai-label">AI Executive Summary</span>
          <span class="afda-ai-time">Generated 2m ago</span>
        </div>
        <div class="afda-ai-body">
          <p><strong>Revenue</strong> is tracking 8.2% above prior month driven by strong enterprise segment performance. Operating margin dipped slightly to 18.7%, primarily due to increased cloud infrastructure costs.</p>
          <p><strong>Cash position</strong> remains healthy at $4.8M. Treasury has flagged a $1.2M receivable aging beyond 60 days — recommend follow-up with client success.</p>
          <p><strong>Action required:</strong> Review FP&A variance report for marketing department — 12% over budget on contractor spend.</p>
        </div>
      </div>

      <!-- Risk Alerts -->
      <div class="afda-card">
        <div class="afda-card-title" style="margin-bottom: 16px;">Active Risk Alerts</div>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          @for (alert of alerts; track alert.title) {
            <div class="afda-alert-item">
              <span class="afda-badge" [ngClass]="alert.badgeClass">{{ alert.severity }}</span>
              <div>
                <div class="afda-alert-title">{{ alert.title }}</div>
                <div class="afda-alert-meta">{{ alert.meta }}</div>
              </div>
            </div>
          }
        </div>
        <button class="afda-btn afda-btn-outline" style="width: 100%; margin-top: 16px; justify-content: center;">
          View all alerts →
        </button>
      </div>
    </div>

    <!-- Budget Table -->
    <div class="afda-card" style="animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Department Budget vs. Actual</div>
        <select class="form-select-sm">
          <option>Mar 2025</option>
          <option>Feb 2025</option>
          <option>Jan 2025</option>
        </select>
      </div>
      <table class="afda-table">
        <thead>
          <tr>
            <th>Department</th>
            <th class="text-right">Budget</th>
            <th class="text-right">Actual</th>
            <th class="text-right">Variance</th>
            <th class="text-right">Var %</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          @for (row of budgetRows; track row.dept) {
            <tr>
              <td class="fw-600">{{ row.dept }}</td>
              <td class="text-right font-mono">{{ row.budget }}</td>
              <td class="text-right font-mono">{{ row.actual }}</td>
              <td class="text-right font-mono" [class]="row.favorable ? 'text-favorable' : 'text-unfavorable'">{{ row.variance }}</td>
              <td class="text-right font-mono" [class]="row.favorable ? 'text-favorable' : 'text-unfavorable'">{{ row.pct }}</td>
              <td>
                <span class="afda-badge" [ngClass]="row.favorable ? 'afda-badge-success' : 'afda-badge-danger'">
                  {{ row.favorable ? 'On Track' : 'Over Budget' }}
                </span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .kpi-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px; margin-bottom: 20px;
    }

    .overview-row-2 {
      display: grid; grid-template-columns: 1fr 360px;
      gap: 14px; margin-bottom: 20px;
    }

    @media (max-width: 1100px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .overview-row-2 { grid-template-columns: 1fr; }
    }
  `]
})
export class OverviewComponent {
  kpiCards = [
    { label: 'Total Revenue', value: '$12.4M', trend: '↑ 8.2%', trendDir: 'positive', footnote: 'vs. prior month', accent: 'teal' },
    { label: 'Operating Margin', value: '18.7%', trend: '↓ 1.2%', trendDir: 'negative', footnote: 'vs. budget', accent: 'red' },
    { label: 'Cash Position', value: '$4.8M', trend: '↑ $320K', trendDir: 'positive', footnote: 'end of day', accent: 'green' },
    { label: 'Open Alerts', value: '3', trend: '1 critical', trendDir: 'negative', footnote: 'requires attention', accent: 'amber' },
  ];

  alerts = [
    { severity: 'CRITICAL', title: 'AR aging > 60 days: $1.2M', meta: 'Treasury · 2h ago', badgeClass: 'afda-badge-critical' },
    { severity: 'HIGH', title: 'Marketing over budget by 12%', meta: 'FP&A · 4h ago', badgeClass: 'afda-badge-high' },
    { severity: 'MEDIUM', title: 'GL recon pending: 3 accounts', meta: 'Accounting · 1d ago', badgeClass: 'afda-badge-medium' },
  ];

  budgetRows = [
    { dept: 'Engineering', budget: '$2,100,000', actual: '$1,980,000', variance: '-$120,000', pct: '-5.7%', favorable: true },
    { dept: 'Marketing',   budget: '$850,000',   actual: '$952,000',   variance: '+$102,000', pct: '+12.0%', favorable: false },
    { dept: 'Sales',       budget: '$1,400,000', actual: '$1,380,000', variance: '-$20,000',  pct: '-1.4%', favorable: true },
    { dept: 'Operations',  budget: '$640,000',   actual: '$658,000',   variance: '+$18,000',  pct: '+2.8%', favorable: false },
    { dept: 'G&A',         budget: '$420,000',   actual: '$410,000',   variance: '-$10,000',  pct: '-2.4%', favorable: true },
  ];
}