import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-fpa-forecast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/fpa/budget">FP&A</a>
      <span class="separator">/</span>
      <span class="current">Forecasting</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Forecasting</h1>
        <p class="afda-page-subtitle">Rolling forecast vs. plan comparison with AI-powered projections</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>Q1 2026</option>
          <option>Q2 2026</option>
          <option>Full Year 2026</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-sliders"></i> Assumptions
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-arrow-repeat"></i> Reforecast
        </button>
      </div>
    </div>

    <!-- Forecast KPIs -->
    <div class="kpi-row stagger">
      @for (kpi of forecastKpis; track kpi.label) {
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

    <!-- Two Column: Chart + Scenarios -->
    <div class="forecast-grid">
      <!-- Monthly Chart -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.08s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Revenue Forecast vs. Plan</div>
          <div class="chart-legend">
            <span><span class="legend-bar" style="background: var(--primary);"></span> Forecast</span>
            <span><span class="legend-bar" style="background: #D1D5DB;"></span> Plan</span>
            <span><span class="legend-bar projected-legend"></span> Projected</span>
          </div>
        </div>
        <div class="bar-chart">
          @for (m of monthlyData; track m.month) {
            <div class="bc-col">
              <div class="bc-bars">
                <div class="bc-bar plan-bar" [style.height.%]="m.planH">
                  <span class="bc-val">{{ m.plan }}</span>
                </div>
                <div class="bc-bar forecast-bar" [style.height.%]="m.forecastH"
                     [class.projected]="m.isProjected">
                  <span class="bc-val">{{ m.forecast }}</span>
                </div>
              </div>
              <div class="bc-month" [class.current]="m.isCurrent">{{ m.month }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Scenario Panel -->
      <div class="scenario-panel">
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.1s both;">
          <div class="afda-card-title" style="margin-bottom: 14px;">Scenario Analysis</div>
          @for (scenario of scenarios; track scenario.name) {
            <div class="scenario-card" [class.active]="activeScenario === scenario.name"
                 (click)="activeScenario = scenario.name">
              <div class="sc-header">
                <span class="sc-dot" [style.background]="scenario.color"></span>
                <div>
                  <div class="sc-name">{{ scenario.name }}</div>
                  <div class="sc-desc">{{ scenario.description }}</div>
                </div>
                <span class="sc-prob font-mono">{{ scenario.probability }}</span>
              </div>
              <div class="sc-metrics">
                <div class="sc-metric">
                  <span class="sc-label">Revenue</span>
                  <span class="sc-val font-mono">{{ scenario.revenue }}</span>
                </div>
                <div class="sc-metric">
                  <span class="sc-label">EBITDA</span>
                  <span class="sc-val font-mono">{{ scenario.ebitda }}</span>
                </div>
                <div class="sc-metric">
                  <span class="sc-label">Cash</span>
                  <span class="sc-val font-mono">{{ scenario.cash }}</span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Key Assumptions -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.14s both;">
          <div class="afda-card-header" style="margin-bottom: 10px;">
            <div class="afda-card-title">Key Assumptions</div>
            <span class="ai-tag"><i class="bi bi-stars"></i> AI</span>
          </div>
          @for (a of assumptions; track a.label) {
            <div class="assumption-row">
              <span class="a-label">{{ a.label }}</span>
              <span class="a-value font-mono">{{ a.value }}</span>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- AI Forecast Panel -->
    <div class="afda-ai-panel" style="margin-top: 16px; animation: fadeUp 0.4s ease 0.16s both;">
      <div class="afda-ai-panel-header">
        <div class="afda-ai-icon"><i class="bi bi-stars"></i></div>
        <span class="afda-ai-label">AI Forecast Commentary</span>
        <span class="afda-ai-time">Model: Ensemble v3.2 · Updated Feb 5</span>
      </div>
      <div class="afda-ai-body">
        <p>The forecast model shows <strong>Q1 revenue trending 2% above plan</strong> at $38.2M, driven primarily by enterprise segment outperformance (+$1.2M vs plan). Mid-market softness (-$300K) is partially offset by strong SMB acquisition.</p>
        <p><strong>Key upside risk:</strong> GlobalTech enterprise deal ($420K ACV) in final negotiation — not included in base forecast. If closed by Feb 15, Q1 would reach $38.6M.</p>
        <p><strong>Key downside risk:</strong> Two mid-market renewals ($180K combined) at risk of churn. Client success team engaged but outcome uncertain.</p>
      </div>
    </div>

    <!-- Quarterly Detail Table -->
    <div class="afda-card" style="margin-top: 16px; animation: fadeUp 0.4s ease 0.2s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Quarterly Forecast Detail</div>
        <span style="font-size: 11px; color: var(--text-tertiary);">FY 2026</span>
      </div>
      <table class="afda-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th class="text-right">Q1 Plan</th>
            <th class="text-right">Q1 Forecast</th>
            <th class="text-right">Q1 Var</th>
            <th class="text-right">Q2 Plan</th>
            <th class="text-right">Q2 Forecast</th>
            <th class="text-right">FY Plan</th>
            <th class="text-right">FY Forecast</th>
          </tr>
        </thead>
        <tbody>
          @for (row of quarterlyData; track row.metric) {
            <tr [style.background]="row.isTotal ? 'var(--bg-section)' : 'transparent'"
                [style.font-weight]="row.isTotal ? '700' : '400'">
              <td class="fw-600">{{ row.metric }}</td>
              <td class="text-right font-mono">{{ row.q1Plan }}</td>
              <td class="text-right font-mono">{{ row.q1Forecast }}</td>
              <td class="text-right font-mono" [class]="row.q1Fav ? 'text-favorable' : 'text-unfavorable'">
                {{ row.q1Var }}
              </td>
              <td class="text-right font-mono">{{ row.q2Plan }}</td>
              <td class="text-right font-mono">{{ row.q2Forecast }}</td>
              <td class="text-right font-mono">{{ row.fyPlan }}</td>
              <td class="text-right font-mono" style="font-weight: 600;">{{ row.fyForecast }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .kpi-row {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px; margin-bottom: 20px;
    }

    .forecast-grid {
      display: grid; grid-template-columns: 1fr 340px;
      gap: 16px;
    }

    /* Bar Chart */
    .bar-chart {
      display: flex; align-items: flex-end; gap: 6px;
      padding: 8px 0; height: 240px;
    }

    .bc-col { flex: 1; text-align: center; height: 100%; display: flex; flex-direction: column; }

    .bc-bars {
      flex: 1; display: flex; align-items: flex-end; justify-content: center;
      gap: 4px;
    }

    .bc-bar {
      width: 22px; border-radius: 4px 4px 0 0;
      position: relative; min-height: 4px;
      transition: height 0.5s cubic-bezier(0.16,1,0.3,1);
    }

    .plan-bar { background: #D1D5DB; }
    .forecast-bar { background: var(--primary); }
    .forecast-bar.projected {
      background: rgba(13,107,92,0.25);
      border: 2px dashed var(--primary);
      border-bottom: none;
    }

    .bc-val {
      position: absolute; top: -18px; left: 50%;
      transform: translateX(-50%);
      font-size: 9.5px; font-family: var(--font-mono);
      color: var(--text-tertiary); white-space: nowrap;
    }

    .bc-month {
      font-size: 11px; font-weight: 500; color: var(--text-secondary);
      margin-top: 8px;
      &.current { color: var(--primary); font-weight: 700; }
    }

    .chart-legend {
      display: flex; gap: 14px; font-size: 11px; color: var(--text-tertiary);
    }

    .legend-bar {
      display: inline-block; width: 14px; height: 10px;
      border-radius: 2px; vertical-align: middle; margin-right: 4px;
    }

    .projected-legend {
      background: rgba(13,107,92,0.2);
      border: 1.5px dashed var(--primary);
    }

    /* Scenario Panel */
    .scenario-panel { display: flex; flex-direction: column; gap: 16px; }

    .scenario-card {
      padding: 14px; border: 1px solid var(--border-light);
      border-radius: var(--radius-md); margin-bottom: 8px;
      cursor: pointer; transition: all 0.15s;
      &:last-child { margin-bottom: 0; }
      &:hover { border-color: var(--primary); }
      &.active { border-color: var(--primary); background: var(--primary-subtle); }
    }

    .sc-header {
      display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
    }

    .sc-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .sc-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .sc-desc { font-size: 11px; color: var(--text-tertiary); }

    .sc-prob {
      margin-left: auto; font-size: 11px; font-weight: 600;
      color: var(--text-tertiary); background: var(--bg-section);
      padding: 2px 8px; border-radius: 20px;
    }

    .sc-metrics { display: flex; gap: 12px; }

    .sc-metric {
      flex: 1; text-align: center; padding: 6px;
      background: var(--bg-white); border-radius: var(--radius-sm);
      border: 1px solid var(--border-light);
    }

    .sc-label { display: block; font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; }
    .sc-val { display: block; font-size: 12.5px; font-weight: 600; color: var(--text-primary); margin-top: 2px; }

    .ai-tag {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 10.5px; font-weight: 600; color: var(--primary);
    }

    .assumption-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 7px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .a-label { font-size: 12.5px; color: var(--text-secondary); }
    .a-value { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }

    @media (max-width: 1100px) {
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
      .forecast-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ForecastingComponent {
  activeScenario = 'Base Case';

  forecastKpis = [
    { label: 'Q1 Forecast', value: '$38.2M', trend: '102% of plan', trendDir: 'positive', footnote: 'AI confidence: 94%', accent: 'teal' },
    { label: 'FY Forecast', value: '$158M', trend: '↑ $4.2M', trendDir: 'positive', footnote: 'vs. annual plan', accent: 'green' },
    { label: 'Forecast Accuracy', value: '94.2%', trend: '↑ 1.8%', trendDir: 'positive', footnote: 'trailing 6-month avg', accent: 'blue' },
    { label: 'Next Reforecast', value: 'Feb 15', trend: '10 days', trendDir: '', footnote: 'monthly cycle', accent: 'amber' },
  ];

  monthlyData = [
    { month: 'Sep',  plan: '$11.0M', forecast: '$10.8M', planH: 62, forecastH: 60, isProjected: false, isCurrent: false },
    { month: 'Oct',  plan: '$11.2M', forecast: '$11.4M', planH: 64, forecastH: 66, isProjected: false, isCurrent: false },
    { month: 'Nov',  plan: '$11.6M', forecast: '$11.7M', planH: 68, forecastH: 69, isProjected: false, isCurrent: false },
    { month: 'Dec',  plan: '$11.9M', forecast: '$12.1M', planH: 72, forecastH: 74, isProjected: false, isCurrent: false },
    { month: 'Jan',  plan: '$12.2M', forecast: '$12.4M', planH: 76, forecastH: 78, isProjected: false, isCurrent: true },
    { month: 'Feb',  plan: '$12.5M', forecast: '$12.8M', planH: 80, forecastH: 83, isProjected: true,  isCurrent: false },
    { month: 'Mar',  plan: '$12.8M', forecast: '$13.0M', planH: 84, forecastH: 88, isProjected: true,  isCurrent: false },
    { month: 'Apr',  plan: '$13.0M', forecast: '$13.4M', planH: 86, forecastH: 92, isProjected: true,  isCurrent: false },
  ];

  scenarios = [
    { name: 'Base Case', description: 'Current run rate + known pipeline', color: 'var(--primary)', probability: '65%', revenue: '$38.2M', ebitda: '$9.6M', cash: '$8.2M' },
    { name: 'Upside',    description: 'GlobalTech deal + expansion rev',   color: '#059669',        probability: '20%', revenue: '$39.8M', ebitda: '$10.4M', cash: '$9.6M' },
    { name: 'Downside',  description: 'Churn risk + delayed closings',     color: '#DC2626',        probability: '15%', revenue: '$36.5M', ebitda: '$8.8M', cash: '$6.4M' },
  ];

  assumptions = [
    { label: 'Revenue growth rate', value: '8.2% MoM' },
    { label: 'Gross margin',        value: '71.4%' },
    { label: 'Headcount additions',  value: '+3 in Q1' },
    { label: 'Churn rate',          value: '1.2%' },
    { label: 'Pipeline conversion',  value: '28%' },
    { label: 'Avg deal size',       value: '$52K' },
  ];

  quarterlyData = [
    { metric: 'Revenue',        q1Plan: '$37.5M', q1Forecast: '$38.2M', q1Var: '+$0.7M',  q1Fav: true,  q2Plan: '$39.0M', q2Forecast: '$40.1M', fyPlan: '$153.8M', fyForecast: '$158.0M', isTotal: false },
    { metric: 'COGS',           q1Plan: '$10.7M', q1Forecast: '$10.9M', q1Var: '+$0.2M',  q1Fav: false, q2Plan: '$11.1M', q2Forecast: '$11.4M', fyPlan: '$43.8M',  fyForecast: '$45.0M',  isTotal: false },
    { metric: 'Gross Profit',   q1Plan: '$26.8M', q1Forecast: '$27.3M', q1Var: '+$0.5M',  q1Fav: true,  q2Plan: '$27.9M', q2Forecast: '$28.7M', fyPlan: '$110.0M', fyForecast: '$113.0M', isTotal: true },
    { metric: 'OpEx',           q1Plan: '$17.8M', q1Forecast: '$17.7M', q1Var: '-$0.1M',  q1Fav: true,  q2Plan: '$18.2M', q2Forecast: '$18.4M', fyPlan: '$72.8M',  fyForecast: '$73.5M',  isTotal: false },
    { metric: 'EBITDA',         q1Plan: '$9.0M',  q1Forecast: '$9.6M',  q1Var: '+$0.6M',  q1Fav: true,  q2Plan: '$9.7M',  q2Forecast: '$10.3M', fyPlan: '$37.2M',  fyForecast: '$39.5M',  isTotal: true },
    { metric: 'Net Income',     q1Plan: '$6.2M',  q1Forecast: '$6.7M',  q1Var: '+$0.5M',  q1Fav: true,  q2Plan: '$6.8M',  q2Forecast: '$7.2M',  fyPlan: '$26.4M',  fyForecast: '$28.2M',  isTotal: false },
    { metric: 'Free Cash Flow', q1Plan: '$5.8M',  q1Forecast: '$6.3M',  q1Var: '+$0.5M',  q1Fav: true,  q2Plan: '$6.2M',  q2Forecast: '$6.8M',  fyPlan: '$24.6M',  fyForecast: '$26.4M',  isTotal: false },
  ];
}