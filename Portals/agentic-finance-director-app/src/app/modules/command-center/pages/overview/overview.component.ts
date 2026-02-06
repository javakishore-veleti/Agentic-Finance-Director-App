import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'afda-cc-overview',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div style="animation: fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both;">
      <!-- Breadcrumb -->
      <div class="afda-breadcrumb">
        <a routerLink="/command">Command Center</a>
        <span class="separator">/</span>
        <span class="current">Executive Overview</span>
      </div>

      <!-- Page Header -->
      <div class="afda-page-header">
        <div>
          <h1 class="afda-page-title">Executive Overview</h1>
          <p class="afda-page-subtitle">
            Real-time financial intelligence hub — {{ today | date:'EEEE, MMMM d, y' }}
          </p>
        </div>
        <div class="afda-page-actions">
          <button class="afda-btn afda-btn-outline">
            <i class="bi bi-download"></i> Export
          </button>
          <button class="afda-btn afda-btn-navy">
            <i class="bi bi-lightning-charge-fill"></i> Generate Briefing
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid stagger" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;">
        @for (kpi of kpis; track kpi.label) {
          <div class="afda-stat-card">
            <div class="afda-stat-label">{{ kpi.label }}</div>
            <div style="display: flex; align-items: flex-end; justify-content: space-between;">
              <div class="afda-stat-value">{{ kpi.value }}</div>
              <div class="afda-stat-trend" [class]="kpi.direction">{{ kpi.trend }}</div>
            </div>
            <div class="afda-stat-footnote">{{ kpi.footnote }}</div>
          </div>
        }
      </div>

      <!-- AI Summary + Risk Alerts -->
      <div style="display: grid; grid-template-columns: 1fr 340px; gap: 16px; margin-bottom: 20px;">
        <!-- AI Executive Summary -->
        <div class="afda-ai-panel" style="animation: fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s both;">
          <div class="afda-ai-panel-header">
            <div class="afda-ai-icon"><i class="bi bi-stars"></i></div>
            <span class="afda-ai-label">AI Executive Summary</span>
            <span class="afda-ai-time">Generated 2m ago</span>
          </div>
          <div class="afda-ai-body">
            <p>
              <strong>Revenue</strong> is tracking 8.2% above prior month driven by strong enterprise
              segment performance. Operating margin dipped slightly to 18.7%, primarily due to
              increased cloud infrastructure costs.
            </p>
            <p>
              <strong>Cash position</strong> remains healthy at $4.8M. Treasury has flagged a $1.2M
              receivable aging beyond 60 days — recommend follow-up with client success.
            </p>
            <p>
              <strong>Action required:</strong> Review FP&A variance report for marketing department —
              12% over budget on contractor spend.
            </p>
          </div>
        </div>

        <!-- Risk Alerts -->
        <div class="afda-card" style="animation: fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both;">
          <div class="afda-card-title" style="margin-bottom: 14px;">Active Risk Alerts</div>
          <div style="display: flex; flex-direction: column; gap: 14px;">
            @for (alert of alerts; track alert.title) {
              <div class="afda-alert-item">
                <span class="afda-badge" [class]="'afda-badge-' + alert.severity">
                  {{ alert.severity }}
                </span>
                <div>
                  <div class="afda-alert-title">{{ alert.title }}</div>
                  <div class="afda-alert-meta">{{ alert.source }} · {{ alert.time }}</div>
                </div>
              </div>
            }
          </div>
          <button class="afda-btn afda-btn-outline"
                  style="width: 100%; justify-content: center; margin-top: 16px;">
            View all alerts →
          </button>
        </div>
      </div>

      <!-- Budget Table -->
      <div class="afda-card" style="animation: fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s both;">
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
                <td class="text-right font-mono" style="font-size: 12px; color: var(--afda-gray-500);">{{ row.budget }}</td>
                <td class="text-right font-mono" style="font-size: 12px; color: var(--afda-gray-500);">{{ row.actual }}</td>
                <td class="text-right font-mono" style="font-size: 12px;"
                    [class.text-favorable]="row.favorable" [class.text-unfavorable]="!row.favorable">
                  {{ row.variance }}
                </td>
                <td class="text-right font-mono" style="font-size: 12px;"
                    [class.text-favorable]="row.favorable" [class.text-unfavorable]="!row.favorable">
                  {{ row.variancePct }}
                </td>
                <td>
                  <span class="afda-badge" [class]="row.favorable ? 'afda-badge-success' : 'afda-badge-danger'">
                    {{ row.favorable ? 'ON TRACK' : 'OVER BUDGET' }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class OverviewComponent {
  today = new Date();

  kpis = [
    { label: 'Total Revenue',   value: '$12.4M', trend: '↑ 8.2%',  direction: 'positive', footnote: 'vs. prior month' },
    { label: 'Operating Margin', value: '18.7%',  trend: '↓ 1.2%',  direction: 'negative', footnote: 'vs. budget' },
    { label: 'Cash Position',   value: '$4.8M',  trend: '↑ $320K',  direction: 'positive', footnote: 'end of day' },
    { label: 'Open Alerts',     value: '3',      trend: '1 critical', direction: 'negative', footnote: 'requires attention' },
  ];

  alerts = [
    { severity: 'critical', title: 'AR aging > 60 days: $1.2M',      source: 'Treasury',   time: '2h ago' },
    { severity: 'high',     title: 'Marketing over budget by 12%',    source: 'FP&A',       time: '4h ago' },
    { severity: 'medium',   title: 'GL recon pending: 3 accounts',    source: 'Accounting', time: '1d ago' },
  ];

  budgetRows = [
    { dept: 'Engineering',  budget: '$2,100,000', actual: '$1,980,000', variance: '-$120,000', variancePct: '-5.7%',  favorable: true },
    { dept: 'Marketing',    budget: '$850,000',   actual: '$952,000',   variance: '+$102,000', variancePct: '+12.0%', favorable: false },
    { dept: 'Sales',        budget: '$1,400,000', actual: '$1,380,000', variance: '-$20,000',  variancePct: '-1.4%',  favorable: true },
    { dept: 'Operations',   budget: '$640,000',   actual: '$658,000',   variance: '+$18,000',  variancePct: '+2.8%',  favorable: false },
    { dept: 'G&A',          budget: '$420,000',   actual: '$410,000',   variance: '-$10,000',  variancePct: '-2.4%',  favorable: true },
  ];
}
