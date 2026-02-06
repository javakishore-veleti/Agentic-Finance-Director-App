import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-treasury-cash-forecast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/treasury/cash-position">Treasury</a>
      <span class="separator">/</span>
      <span class="current">Cash Forecast</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Cash Forecast</h1>
        <p class="afda-page-subtitle">13-week rolling cash projection with scenario modeling</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>13-Week View</option>
          <option>6-Month View</option>
          <option>12-Month View</option>
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

    <!-- Forecast Chart + AI Panel -->
    <div class="forecast-layout">
      <!-- Weekly Projection Chart -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.08s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Weekly Cash Balance Projection</div>
          <div class="chart-legend">
            <span><span class="legend-bar" style="background: var(--primary);"></span> Projected</span>
            <span><span class="legend-bar" style="background: #059669;"></span> Inflows</span>
            <span><span class="legend-bar" style="background: #DC2626;"></span> Outflows</span>
            <span class="legend-line-item"><span class="legend-dashed"></span> Minimum</span>
          </div>
        </div>
        <div class="weekly-chart">
          @for (week of weeklyProjection; track week.label) {
            <div class="wk-col" [class.current]="week.isCurrent">
              <div class="wk-bars">
                <!-- Balance bar -->
                <div class="wk-bar balance-bar" [style.height.%]="week.balanceH">
                  <span class="wk-val">{{ week.balance }}</span>
                </div>
              </div>
              <!-- Inflow/Outflow mini bars -->
              <div class="wk-flow">
                <div class="wk-flow-bar inflow" [style.width.%]="week.inflowW"></div>
                <div class="wk-flow-bar outflow" [style.width.%]="week.outflowW"></div>
              </div>
              <div class="wk-label">{{ week.label }}</div>
            </div>
          }
          <!-- Minimum line -->
          <div class="min-line" [style.bottom.%]="30">
            <span class="min-label font-mono">$2.0M min</span>
          </div>
        </div>
      </div>

      <!-- AI + Covenants -->
      <div class="forecast-side">
        <!-- AI Commentary -->
        <div class="afda-ai-panel" style="animation: fadeUp 0.4s ease 0.1s both;">
          <div class="afda-ai-panel-header">
            <div class="afda-ai-icon"><i class="bi bi-stars"></i></div>
            <span class="afda-ai-label">AI Forecast Notes</span>
          </div>
          <div class="afda-ai-body">
            <p>Cash position is projected to remain <strong>above the $2.0M minimum threshold</strong> throughout the 13-week period. Lowest point expected in Week 6 at $3.8M due to quarterly tax payment.</p>
            <p><strong>Watch item:</strong> If the TechVentures AR ($1.2M) remains uncollected past Week 4, the forecast dips to $3.2M — still above minimum but warrants monitoring.</p>
          </div>
        </div>

        <!-- Covenant Compliance -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.14s both;">
          <div class="afda-card-title" style="margin-bottom: 14px;">Covenant Compliance</div>
          @for (cov of covenants; track cov.name) {
            <div class="covenant-row">
              <div class="cov-info">
                <div class="cov-name">{{ cov.name }}</div>
                <div class="cov-req">Req: {{ cov.requirement }}</div>
              </div>
              <div class="cov-actual">
                <span class="cov-value font-mono">{{ cov.actual }}</span>
                <span class="afda-badge" [ngClass]="cov.passClass">{{ cov.passLabel }}</span>
              </div>
              <div class="cov-gauge">
                <div class="cov-gauge-track">
                  <div class="cov-gauge-fill" [style.width.%]="cov.gaugeWidth" [style.background]="cov.gaugeColor"></div>
                  <div class="cov-gauge-threshold" [style.left.%]="cov.thresholdPos"></div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Detailed 13-Week Table -->
    <div class="afda-card" style="margin-top: 16px; animation: fadeUp 0.4s ease 0.18s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">13-Week Cash Flow Detail</div>
        <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 5px 12px;">
          <i class="bi bi-download"></i> Export
        </button>
      </div>
      <div style="overflow-x: auto;">
        <table class="afda-table" style="min-width: 900px;">
          <thead>
            <tr>
              <th style="position: sticky; left: 0; background: var(--bg-section); z-index: 2;">Line Item</th>
              @for (wk of weekHeaders; track wk) {
                <th class="text-right" style="min-width: 80px;">{{ wk }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of detailRows; track row.item) {
              <tr [style.background]="row.isTotal ? 'var(--bg-section)' : 'transparent'"
                  [style.font-weight]="row.isTotal ? '700' : '400'">
                <td style="position: sticky; left: 0; background: inherit; z-index: 1;" class="fw-600">
                  {{ row.item }}
                </td>
                @for (val of row.values; track $index) {
                  <td class="text-right font-mono"
                      [class]="row.isHighlight && isNegative(val) ? 'text-unfavorable' : ''">
                    {{ val }}
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .kpi-row {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px; margin-bottom: 20px;
    }

    .forecast-layout {
      display: grid; grid-template-columns: 1fr 340px;
      gap: 16px;
    }

    .forecast-side { display: flex; flex-direction: column; gap: 16px; }

    /* Weekly Chart */
    .weekly-chart {
      display: flex; gap: 6px; padding: 16px 0 8px;
      position: relative; min-height: 220px;
    }

    .wk-col { flex: 1; text-align: center; display: flex; flex-direction: column; }
    .wk-col.current { background: var(--primary-subtle); border-radius: var(--radius-sm); padding: 4px 2px; }

    .wk-bars {
      flex: 1; display: flex; align-items: flex-end; justify-content: center;
      height: 160px;
    }

    .wk-bar {
      width: 24px; border-radius: 3px 3px 0 0;
      position: relative; min-height: 4px;
      transition: height 0.5s cubic-bezier(0.16,1,0.3,1);
    }

    .balance-bar { background: var(--primary); }

    .wk-val {
      position: absolute; top: -16px; left: 50%;
      transform: translateX(-50%);
      font-size: 9px; font-family: var(--font-mono);
      color: var(--text-tertiary); white-space: nowrap;
    }

    .wk-flow {
      display: flex; gap: 2px; height: 6px; margin: 6px 4px 0;
    }

    .wk-flow-bar {
      border-radius: 3px; min-width: 2px;
      transition: width 0.4s ease;
    }

    .wk-flow-bar.inflow  { background: #059669; }
    .wk-flow-bar.outflow { background: #DC2626; }

    .wk-label { font-size: 10px; color: var(--text-secondary); margin-top: 6px; font-weight: 500; }

    .min-line {
      position: absolute; left: 0; right: 0;
      border-top: 2px dashed var(--danger);
      opacity: 0.5;
    }

    .min-label {
      position: absolute; right: 4px; top: -14px;
      font-size: 9px; color: var(--danger);
    }

    .chart-legend {
      display: flex; gap: 12px; font-size: 10.5px; color: var(--text-tertiary);
      flex-wrap: wrap;
    }

    .legend-bar {
      display: inline-block; width: 12px; height: 8px;
      border-radius: 2px; vertical-align: middle; margin-right: 3px;
    }

    .legend-line-item { display: inline-flex; align-items: center; gap: 3px; }

    .legend-dashed {
      display: inline-block; width: 14px; height: 0;
      border-top: 2px dashed var(--danger); opacity: 0.6;
      vertical-align: middle;
    }

    /* Covenants */
    .covenant-row {
      padding: 12px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .cov-info { margin-bottom: 6px; }
    .cov-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .cov-req { font-size: 11px; color: var(--text-tertiary); }

    .cov-actual {
      display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
    }

    .cov-value { font-size: 14px; font-weight: 700; color: var(--text-primary); }

    .cov-gauge-track {
      height: 8px; background: var(--border-light);
      border-radius: 10px; overflow: visible; position: relative;
    }

    .cov-gauge-fill {
      height: 100%; border-radius: 10px;
      transition: width 0.5s ease;
    }

    .cov-gauge-threshold {
      position: absolute; top: -3px; bottom: -3px;
      width: 2px; background: var(--text-primary);
      border-radius: 2px;
    }

    @media (max-width: 1100px) {
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
      .forecast-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class CashForecastComponent {
  forecastKpis = [
    { label: 'Ending Cash (Wk 13)', value: '$5.6M', trend: '↑ 16%', trendDir: 'positive', footnote: 'projected from current', accent: 'teal' },
    { label: 'Lowest Point', value: '$3.8M', trend: 'Week 6', trendDir: '', footnote: 'quarterly tax payment', accent: 'amber' },
    { label: 'Avg Weekly Inflow', value: '$920K', trend: '↑ 4%', trendDir: 'positive', footnote: 'trailing 13-week avg', accent: 'green' },
    { label: 'Cash Runway', value: '14.2 mo', trend: 'Healthy', trendDir: 'positive', footnote: 'at current burn rate', accent: 'blue' },
  ];

  weeklyProjection = [
    { label: 'W1',  balance: '$4.8M', balanceH: 70, inflowW: 60, outflowW: 40, isCurrent: true },
    { label: 'W2',  balance: '$4.9M', balanceH: 72, inflowW: 65, outflowW: 38, isCurrent: false },
    { label: 'W3',  balance: '$4.6M', balanceH: 66, inflowW: 45, outflowW: 55, isCurrent: false },
    { label: 'W4',  balance: '$4.4M', balanceH: 62, inflowW: 50, outflowW: 52, isCurrent: false },
    { label: 'W5',  balance: '$4.2M', balanceH: 58, inflowW: 48, outflowW: 50, isCurrent: false },
    { label: 'W6',  balance: '$3.8M', balanceH: 50, inflowW: 40, outflowW: 65, isCurrent: false },
    { label: 'W7',  balance: '$4.0M', balanceH: 54, inflowW: 58, outflowW: 42, isCurrent: false },
    { label: 'W8',  balance: '$4.3M', balanceH: 60, inflowW: 62, outflowW: 38, isCurrent: false },
    { label: 'W9',  balance: '$4.5M', balanceH: 64, inflowW: 58, outflowW: 40, isCurrent: false },
    { label: 'W10', balance: '$4.8M', balanceH: 70, inflowW: 65, outflowW: 36, isCurrent: false },
    { label: 'W11', balance: '$5.1M', balanceH: 76, inflowW: 68, outflowW: 34, isCurrent: false },
    { label: 'W12', balance: '$5.4M', balanceH: 82, inflowW: 70, outflowW: 36, isCurrent: false },
    { label: 'W13', balance: '$5.6M', balanceH: 86, inflowW: 66, outflowW: 32, isCurrent: false },
  ];

  covenants = [
    { name: 'Minimum Cash Balance', requirement: '≥ $2.0M', actual: '$4.82M', passLabel: 'Pass', passClass: 'afda-badge-success', gaugeWidth: 82, gaugeColor: '#059669', thresholdPos: 34 },
    { name: 'Current Ratio',        requirement: '≥ 1.5x',  actual: '2.1x',   passLabel: 'Pass', passClass: 'afda-badge-success', gaugeWidth: 70, gaugeColor: '#059669', thresholdPos: 50 },
    { name: 'Debt Service Coverage', requirement: '≥ 1.2x',  actual: '2.8x',   passLabel: 'Pass', passClass: 'afda-badge-success', gaugeWidth: 90, gaugeColor: '#059669', thresholdPos: 30 },
    { name: 'Interest Coverage',     requirement: '≥ 3.0x',  actual: '6.4x',   passLabel: 'Pass', passClass: 'afda-badge-success', gaugeWidth: 85, gaugeColor: '#059669', thresholdPos: 40 },
  ];

  weekHeaders = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13'];

  detailRows = [
    { item: 'Opening Balance',     isTotal: false, isHighlight: false, values: ['$4.5M', '$4.8M', '$4.9M', '$4.6M', '$4.4M', '$4.2M', '$3.8M', '$4.0M', '$4.3M', '$4.5M', '$4.8M', '$5.1M', '$5.4M'] },
    { item: 'Customer Receipts',   isTotal: false, isHighlight: false, values: ['$720K', '$680K', '$540K', '$580K', '$560K', '$480K', '$640K', '$700K', '$680K', '$740K', '$760K', '$780K', '$720K'] },
    { item: 'Other Inflows',       isTotal: false, isHighlight: false, values: ['$120K', '$140K', '$80K',  '$100K', '$90K',  '$60K',  '$110K', '$120K', '$100K', '$130K', '$120K', '$140K', '$100K'] },
    { item: 'Total Inflows',       isTotal: true,  isHighlight: false, values: ['$840K', '$820K', '$620K', '$680K', '$650K', '$540K', '$750K', '$820K', '$780K', '$870K', '$880K', '$920K', '$820K'] },
    { item: 'Payroll',             isTotal: false, isHighlight: false, values: ['-$280K', '-$0',   '-$280K', '-$0',   '-$280K', '-$0',   '-$280K', '-$0',   '-$280K', '-$0',   '-$280K', '-$0',   '-$280K'] },
    { item: 'Vendor Payments',     isTotal: false, isHighlight: false, values: ['-$140K', '-$180K', '-$160K', '-$200K', '-$150K', '-$120K', '-$140K', '-$160K', '-$140K', '-$180K', '-$160K', '-$170K', '-$140K'] },
    { item: 'Tax Payments',        isTotal: false, isHighlight: true,  values: ['-$0',    '-$0',    '-$0',    '-$0',    '-$0',    '-$480K', '-$0',    '-$0',    '-$0',    '-$0',    '-$0',    '-$0',    '-$0'] },
    { item: 'Rent & Facilities',   isTotal: false, isHighlight: false, values: ['-$60K',  '-$0',    '-$0',    '-$60K',  '-$0',    '-$0',    '-$60K',  '-$0',    '-$0',    '-$60K',  '-$0',    '-$0',    '-$60K'] },
    { item: 'Debt Service',        isTotal: false, isHighlight: false, values: ['-$50K',  '-$50K',  '-$50K',  '-$50K',  '-$50K',  '-$50K',  '-$50K',  '-$50K',  '-$50K',  '-$50K',  '-$50K',  '-$50K',  '-$50K'] },
    { item: 'Other Outflows',      isTotal: false, isHighlight: false, values: ['-$10K',  '-$20K',  '-$40K',  '-$10K',  '-$20K',  '-$30K',  '-$20K',  '-$10K',  '-$10K',  '-$30K',  '-$20K',  '-$20K',  '-$10K'] },
    { item: 'Total Outflows',      isTotal: true,  isHighlight: false, values: ['-$540K', '-$250K', '-$530K', '-$320K', '-$500K', '-$680K', '-$550K', '-$220K', '-$480K', '-$320K', '-$510K', '-$240K', '-$540K'] },
    { item: 'Net Cash Flow',       isTotal: false, isHighlight: true,  values: ['+$300K', '+$570K', '+$90K',  '+$360K', '+$150K', '-$140K', '+$200K', '+$600K', '+$300K', '+$550K', '+$370K', '+$680K', '+$280K'] },
    { item: 'Closing Balance',     isTotal: true,  isHighlight: false, values: ['$4.8M', '$4.9M', '$4.6M', '$4.4M', '$4.2M', '$3.8M', '$4.0M', '$4.3M', '$4.5M', '$4.8M', '$5.1M', '$5.4M', '$5.6M'] },
  ];

  isNegative(val: string): boolean {
    return val.startsWith('-') && val !== '-$0';
  }
}