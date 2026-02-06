import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-fpa-budget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/fpa/budget">FP&A</a>
      <span class="separator">/</span>
      <span class="current">Budget vs. Actual</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Budget vs. Actual</h1>
        <p class="afda-page-subtitle">Period-over-period budget performance analysis</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>January 2026</option>
          <option>December 2025</option>
          <option>November 2025</option>
        </select>
        <select class="form-select-sm">
          <option>All Departments</option>
          <option>Engineering</option>
          <option>Marketing</option>
          <option>Sales</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-download"></i> Export
        </button>
      </div>
    </div>

    <!-- Summary KPIs -->
    <div class="kpi-row stagger">
      @for (kpi of summaryKpis; track kpi.label) {
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

    <!-- Department Breakdown -->
    <div class="afda-card" style="margin-bottom: 16px; animation: fadeUp 0.4s ease 0.1s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Department Breakdown</div>
        <div class="toggle-group">
          <button class="toggle-btn" [class.active]="chartMode === 'bar'" (click)="chartMode = 'bar'">
            <i class="bi bi-bar-chart"></i>
          </button>
          <button class="toggle-btn" [class.active]="chartMode === 'table'" (click)="chartMode = 'table'">
            <i class="bi bi-table"></i>
          </button>
        </div>
      </div>

      @if (chartMode === 'bar') {
        <div class="dept-bars">
          @for (dept of departments; track dept.name) {
            <div class="dept-bar-row">
              <div class="dept-bar-label">
                <span class="dept-name">{{ dept.name }}</span>
                <span class="dept-pct font-mono" [class]="dept.favorable ? 'text-favorable' : 'text-unfavorable'">
                  {{ dept.variancePct }}
                </span>
              </div>
              <div class="dept-bar-track">
                <div class="dept-bar-budget" [style.width.%]="dept.budgetWidth"></div>
                <div class="dept-bar-actual" [style.width.%]="dept.actualWidth"
                     [style.background]="dept.favorable ? 'var(--primary)' : 'var(--danger)'"></div>
              </div>
              <div class="dept-bar-values">
                <span class="font-mono">{{ dept.budget }}</span>
                <span class="font-mono" style="font-weight: 600;">{{ dept.actual }}</span>
              </div>
            </div>
          }
          <div class="bar-legend">
            <span><span class="legend-dot" style="background: #E5E7EB;"></span> Budget</span>
            <span><span class="legend-dot" style="background: var(--primary);"></span> Actual (favorable)</span>
            <span><span class="legend-dot" style="background: var(--danger);"></span> Actual (over budget)</span>
          </div>
        </div>
      }

      @if (chartMode === 'table') {
        <table class="afda-table">
          <thead>
            <tr>
              <th>Department</th>
              <th class="text-right">Budget</th>
              <th class="text-right">Actual</th>
              <th class="text-right">Variance ($)</th>
              <th class="text-right">Variance (%)</th>
              <th class="text-right">Utilization</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (dept of departments; track dept.name) {
              <tr>
                <td class="fw-600">{{ dept.name }}</td>
                <td class="text-right font-mono">{{ dept.budget }}</td>
                <td class="text-right font-mono">{{ dept.actual }}</td>
                <td class="text-right font-mono" [class]="dept.favorable ? 'text-favorable' : 'text-unfavorable'">
                  {{ dept.variance }}
                </td>
                <td class="text-right font-mono" [class]="dept.favorable ? 'text-favorable' : 'text-unfavorable'">
                  {{ dept.variancePct }}
                </td>
                <td class="text-right">
                  <div class="util-bar-wrapper">
                    <div class="util-bar">
                      <div class="util-fill" [style.width.%]="dept.utilization"
                           [style.background]="dept.utilization > 100 ? 'var(--danger)' : 'var(--primary)'"></div>
                    </div>
                    <span class="font-mono" style="font-size: 11px;">{{ dept.utilization }}%</span>
                  </div>
                </td>
                <td>
                  <span class="afda-badge" [ngClass]="dept.favorable ? 'afda-badge-success' : 'afda-badge-danger'">
                    {{ dept.favorable ? 'Under Budget' : 'Over Budget' }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
          <tfoot>
            <tr style="font-weight: 700; background: var(--bg-section);">
              <td>Total</td>
              <td class="text-right font-mono">$5,410,000</td>
              <td class="text-right font-mono">$5,400,000</td>
              <td class="text-right font-mono text-favorable">-$10,000</td>
              <td class="text-right font-mono text-favorable">-0.2%</td>
              <td class="text-right font-mono">99.8%</td>
              <td><span class="afda-badge afda-badge-success">On Track</span></td>
            </tr>
          </tfoot>
        </table>
      }
    </div>

    <!-- Monthly Trend -->
    <div class="afda-card" style="animation: fadeUp 0.4s ease 0.15s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Monthly Budget vs. Actual Trend</div>
        <span style="font-size: 11px; color: var(--text-tertiary);">Last 6 months</span>
      </div>
      <div class="trend-chart">
        @for (month of monthlyTrend; track month.label) {
          <div class="trend-col">
            <div class="trend-bars">
              <div class="trend-bar-item budget" [style.height.%]="month.budgetHeight">
                <span class="trend-bar-val">{{ month.budget }}</span>
              </div>
              <div class="trend-bar-item actual" [style.height.%]="month.actualHeight">
                <span class="trend-bar-val">{{ month.actual }}</span>
              </div>
            </div>
            <div class="trend-label">{{ month.label }}</div>
            <div class="trend-variance font-mono" [class]="month.favorable ? 'text-favorable' : 'text-unfavorable'">
              {{ month.variance }}
            </div>
          </div>
        }
      </div>
      <div class="bar-legend" style="margin-top: 16px;">
        <span><span class="legend-dot" style="background: #D1D5DB;"></span> Budget</span>
        <span><span class="legend-dot" style="background: var(--primary);"></span> Actual</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .kpi-row {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px; margin-bottom: 20px;
    }

    .toggle-group {
      display: flex; border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden;
    }

    .toggle-btn {
      padding: 6px 12px; background: var(--bg-white); border: none;
      color: var(--text-tertiary); cursor: pointer; font-size: 14px;
      transition: all 0.15s;
      &:hover { color: var(--text-primary); background: var(--bg-hover); }
      &.active { color: var(--primary); background: var(--primary-light); }
      &:not(:last-child) { border-right: 1px solid var(--border); }
    }

    /* Department Bars */
    .dept-bars { padding: 4px 0; }

    .dept-bar-row {
      display: grid; grid-template-columns: 160px 1fr 180px;
      align-items: center; gap: 16px;
      padding: 10px 0; border-bottom: 1px solid var(--border-light);
      &:last-of-type { border-bottom: none; }
    }

    .dept-bar-label { display: flex; justify-content: space-between; align-items: center; }
    .dept-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .dept-pct { font-size: 12px; font-weight: 600; }

    .dept-bar-track {
      height: 24px; background: #E5E7EB; border-radius: 6px;
      position: relative; overflow: hidden;
    }

    .dept-bar-budget {
      position: absolute; inset: 0;
      background: #E5E7EB; border-radius: 6px;
    }

    .dept-bar-actual {
      position: absolute; top: 0; bottom: 0; left: 0;
      border-radius: 6px;
      transition: width 0.6s cubic-bezier(0.16,1,0.3,1);
    }

    .dept-bar-values {
      display: flex; justify-content: space-between;
      font-size: 12px; color: var(--text-secondary);
    }

    .bar-legend {
      display: flex; gap: 20px; padding-top: 12px;
      border-top: 1px solid var(--border-light);
      font-size: 11.5px; color: var(--text-tertiary);
    }

    .legend-dot {
      display: inline-block; width: 10px; height: 10px;
      border-radius: 3px; margin-right: 5px; vertical-align: middle;
    }

    .util-bar-wrapper {
      display: flex; align-items: center; gap: 8px; justify-content: flex-end;
    }

    .util-bar {
      width: 70px; height: 6px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .util-fill { height: 100%; border-radius: 10px; transition: width 0.4s ease; }

    /* Monthly Trend */
    .trend-chart {
      display: grid; grid-template-columns: repeat(6, 1fr);
      gap: 12px; padding: 8px 0;
    }

    .trend-col { text-align: center; }

    .trend-bars {
      display: flex; align-items: flex-end; justify-content: center;
      gap: 4px; height: 160px; margin-bottom: 8px;
    }

    .trend-bar-item {
      width: 32px; border-radius: 4px 4px 0 0;
      position: relative; min-height: 8px;
      transition: height 0.5s cubic-bezier(0.16,1,0.3,1);
    }

    .trend-bar-item.budget { background: #D1D5DB; }
    .trend-bar-item.actual { background: var(--primary); }

    .trend-bar-val {
      position: absolute; top: -20px; left: 50%;
      transform: translateX(-50%);
      font-size: 10px; font-family: var(--font-mono);
      color: var(--text-tertiary); white-space: nowrap;
    }

    .trend-label { font-size: 12px; font-weight: 600; color: var(--text-primary); }
    .trend-variance { font-size: 11px; margin-top: 2px; }

    @media (max-width: 1100px) {
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
      .trend-chart { grid-template-columns: repeat(3, 1fr); }
    }
  `]
})
export class BudgetVsActualComponent {
  selectedPeriod = 'January 2026';
  chartMode: 'bar' | 'table' = 'bar';

  summaryKpis = [
    { label: 'Total Budget', value: '$5.41M', trend: 'Jan 2026', trendDir: '', footnote: 'approved allocation', accent: 'teal' },
    { label: 'Total Actual', value: '$5.40M', trend: '↓ $10K', trendDir: 'positive', footnote: '99.8% utilized', accent: 'green' },
    { label: 'Net Variance', value: '-$10K', trend: 'Favorable', trendDir: 'positive', footnote: 'under budget overall', accent: 'blue' },
    { label: 'Depts Over Budget', value: '2', trend: 'of 5', trendDir: 'negative', footnote: 'Marketing, Operations', accent: 'red' },
  ];

  departments = [
    { name: 'Engineering',  budget: '$2,100,000', actual: '$1,980,000', variance: '-$120,000', variancePct: '-5.7%',  utilization: 94.3, favorable: true,  budgetWidth: 100, actualWidth: 94.3 },
    { name: 'Marketing',    budget: '$850,000',   actual: '$952,000',   variance: '+$102,000', variancePct: '+12.0%', utilization: 112,  favorable: false, budgetWidth: 100, actualWidth: 100 },
    { name: 'Sales',        budget: '$1,400,000', actual: '$1,380,000', variance: '-$20,000',  variancePct: '-1.4%',  utilization: 98.6, favorable: true,  budgetWidth: 100, actualWidth: 98.6 },
    { name: 'Operations',   budget: '$640,000',   actual: '$658,000',   variance: '+$18,000',  variancePct: '+2.8%',  utilization: 102.8, favorable: false, budgetWidth: 100, actualWidth: 100 },
    { name: 'G&A',          budget: '$420,000',   actual: '$410,000',   variance: '-$10,000',  variancePct: '-2.4%',  utilization: 97.6, favorable: true,  budgetWidth: 100, actualWidth: 97.6 },
  ];

  monthlyTrend = [
    { label: 'Aug', budget: '$5.2M', actual: '$4.9M', variance: '-5.8%', favorable: true,  budgetHeight: 85, actualHeight: 80 },
    { label: 'Sep', budget: '$5.3M', actual: '$5.1M', variance: '-3.8%', favorable: true,  budgetHeight: 87, actualHeight: 83 },
    { label: 'Oct', budget: '$5.3M', actual: '$5.4M', variance: '+1.9%', favorable: false, budgetHeight: 87, actualHeight: 88 },
    { label: 'Nov', budget: '$5.4M', actual: '$5.2M', variance: '-3.7%', favorable: true,  budgetHeight: 88, actualHeight: 85 },
    { label: 'Dec', budget: '$5.5M', actual: '$5.6M', variance: '+1.8%', favorable: false, budgetHeight: 90, actualHeight: 92 },
    { label: 'Jan', budget: '$5.4M', actual: '$5.4M', variance: '-0.2%', favorable: true,  budgetHeight: 88, actualHeight: 88 },
  ];
}