import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-fpa-variance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/fpa/budget">FP&A</a>
      <span class="separator">/</span>
      <span class="current">Variance Analysis</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Variance Analysis</h1>
        <p class="afda-page-subtitle">Drill-down variance by department and category</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>January 2026</option>
          <option>December 2025</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-funnel"></i> Filters
        </button>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-download"></i> Export
        </button>
      </div>
    </div>

    <!-- Variance Summary -->
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

    <!-- Waterfall Chart -->
    <div class="afda-card" style="margin-bottom: 16px; animation: fadeUp 0.4s ease 0.08s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Variance Waterfall — Budget to Actual</div>
        <span style="font-size: 11px; color: var(--text-tertiary);">January 2026</span>
      </div>
      <div class="waterfall">
        @for (bar of waterfallBars; track bar.label) {
          <div class="wf-col">
            <div class="wf-bar-area">
              <span class="wf-val font-mono" [style.color]="bar.color">{{ bar.value }}</span>
              <div class="wf-bar"
                   [style.height.px]="bar.height"
                   [style.marginTop.px]="bar.offset"
                   [style.background]="bar.color"
                   [style.borderRadius]="bar.isTotal ? '4px' : '4px 4px 0 0'">
              </div>
            </div>
            <div class="wf-label">{{ bar.label }}</div>
          </div>
        }
      </div>
    </div>

    <!-- Department Heatmap -->
    <div class="afda-card" style="margin-bottom: 16px; animation: fadeUp 0.4s ease 0.12s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Department Variance Heatmap</div>
        <div class="heatmap-legend">
          <span class="hl-item"><span class="hl-box" style="background: #DCFCE7;"></span> Favorable</span>
          <span class="hl-item"><span class="hl-box" style="background: #FEE2E2;"></span> Unfavorable</span>
        </div>
      </div>
      <div class="heatmap-grid">
        <div class="hm-header">
          <div class="hm-dept-label"></div>
          @for (cat of categories; track cat) {
            <div class="hm-cat-label">{{ cat }}</div>
          }
          <div class="hm-cat-label" style="font-weight: 700;">Total</div>
        </div>
        @for (row of heatmapData; track row.dept) {
          <div class="hm-row">
            <div class="hm-dept-label">{{ row.dept }}</div>
            @for (cell of row.cells; track $index) {
              <div class="hm-cell"
                   [style.background]="getCellBg(cell.value)"
                   [style.color]="getCellColor(cell.value)">
                <span class="font-mono">{{ cell.display }}</span>
              </div>
            }
            <div class="hm-cell hm-total"
                 [style.background]="getCellBg(row.total)"
                 [style.color]="getCellColor(row.total)">
              <span class="font-mono" style="font-weight: 700;">{{ row.totalDisplay }}</span>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Detail Drill-Down Table -->
    <div class="afda-card" style="animation: fadeUp 0.4s ease 0.16s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Line Item Detail — {{ selectedDept }}</div>
        <div style="display: flex; gap: 6px;">
          @for (dept of deptTabs; track dept) {
            <button class="dept-tab" [class.active]="selectedDept === dept" (click)="selectedDept = dept">
              {{ dept }}
            </button>
          }
        </div>
      </div>
      <table class="afda-table">
        <thead>
          <tr>
            <th>GL Account</th>
            <th>Category</th>
            <th class="text-right">Budget</th>
            <th class="text-right">Actual</th>
            <th class="text-right">Variance ($)</th>
            <th class="text-right">Variance (%)</th>
            <th>Impact</th>
          </tr>
        </thead>
        <tbody>
          @for (row of getDetailRows(); track row.account) {
            <tr>
              <td class="font-mono" style="font-size: 12px;">{{ row.account }}</td>
              <td>{{ row.category }}</td>
              <td class="text-right font-mono">{{ row.budget }}</td>
              <td class="text-right font-mono">{{ row.actual }}</td>
              <td class="text-right font-mono" [class]="row.favorable ? 'text-favorable' : 'text-unfavorable'">
                {{ row.variance }}
              </td>
              <td class="text-right font-mono" [class]="row.favorable ? 'text-favorable' : 'text-unfavorable'">
                {{ row.variancePct }}
              </td>
              <td>
                <div class="impact-bar-wrapper">
                  <div class="impact-bar">
                    <div class="impact-fill"
                         [style.width.%]="row.impactWidth"
                         [style.background]="row.favorable ? 'var(--success)' : 'var(--danger)'"></div>
                  </div>
                </div>
              </td>
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

    /* Waterfall */
    .waterfall {
      display: flex; align-items: flex-end; justify-content: space-between;
      gap: 8px; padding: 16px 0; min-height: 220px;
    }

    .wf-col { flex: 1; text-align: center; }

    .wf-bar-area {
      display: flex; flex-direction: column; align-items: center;
      height: 180px; justify-content: flex-end;
    }

    .wf-val { font-size: 11px; font-weight: 600; margin-bottom: 4px; }

    .wf-bar {
      width: 40px; min-height: 4px;
      transition: height 0.5s cubic-bezier(0.16,1,0.3,1);
    }

    .wf-label {
      font-size: 11px; color: var(--text-secondary);
      margin-top: 8px; line-height: 1.3;
    }

    /* Heatmap */
    .heatmap-legend { display: flex; gap: 16px; font-size: 11px; color: var(--text-tertiary); }
    .hl-item { display: flex; align-items: center; gap: 5px; }
    .hl-box { width: 14px; height: 14px; border-radius: 3px; }

    .heatmap-grid { overflow-x: auto; }

    .hm-header, .hm-row {
      display: grid;
      grid-template-columns: 130px repeat(5, 1fr) 100px;
      gap: 4px;
    }

    .hm-header { margin-bottom: 4px; }

    .hm-cat-label {
      font-size: 10.5px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.4px; color: var(--text-tertiary);
      text-align: center; padding: 6px 4px;
    }

    .hm-dept-label {
      font-size: 12.5px; font-weight: 600; color: var(--text-primary);
      display: flex; align-items: center; padding: 0 4px;
    }

    .hm-row { margin-bottom: 4px; }

    .hm-cell {
      padding: 10px 8px; border-radius: var(--radius-sm);
      text-align: center; font-size: 12px;
      transition: transform 0.15s;
      &:hover { transform: scale(1.04); }
    }

    .hm-total { font-weight: 700; }

    /* Department Tabs */
    .dept-tab {
      padding: 5px 12px; font-size: 12px; font-weight: 500;
      border: 1px solid var(--border); border-radius: 20px;
      background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s;
      font-family: var(--font-sans);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 600; }
    }

    /* Impact Bar */
    .impact-bar-wrapper { width: 80px; }
    .impact-bar {
      height: 6px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }
    .impact-fill { height: 100%; border-radius: 10px; }

    @media (max-width: 1100px) {
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class VarianceAnalysisComponent {
  selectedDept = 'Marketing';
  deptTabs = ['Engineering', 'Marketing', 'Sales', 'Operations', 'G&A'];
  categories = ['Payroll', 'Contractors', 'Software', 'Travel', 'Other'];

  summaryKpis = [
    { label: 'Favorable Variance', value: '$170K', trend: '3 depts', trendDir: 'positive', footnote: 'under budget savings', accent: 'green' },
    { label: 'Unfavorable Variance', value: '$120K', trend: '2 depts', trendDir: 'negative', footnote: 'over budget spend', accent: 'red' },
    { label: 'Net Variance', value: '-$10K', trend: 'Favorable', trendDir: 'positive', footnote: '0.2% under budget', accent: 'teal' },
    { label: 'Largest Driver', value: 'Marketing', trend: '+$102K', trendDir: 'negative', footnote: 'contractor overspend', accent: 'amber' },
  ];

  waterfallBars = [
    { label: 'Budget',       value: '$5.41M', height: 150, offset: 0,  color: 'var(--primary)', isTotal: true },
    { label: 'Engineering',  value: '-$120K', height: 32,  offset: 118, color: '#059669', isTotal: false },
    { label: 'Marketing',    value: '+$102K', height: 28,  offset: 90,  color: '#DC2626', isTotal: false },
    { label: 'Sales',        value: '-$20K',  height: 6,   offset: 112, color: '#059669', isTotal: false },
    { label: 'Operations',   value: '+$18K',  height: 5,   offset: 113, color: '#DC2626', isTotal: false },
    { label: 'G&A',          value: '-$10K',  height: 4,   offset: 114, color: '#059669', isTotal: false },
    { label: 'Actual',       value: '$5.40M', height: 148, offset: 0,   color: 'var(--primary)', isTotal: true },
  ];

  heatmapData = [
    {
      dept: 'Engineering', total: -120000, totalDisplay: '-$120K',
      cells: [
        { value: -80000, display: '-$80K' },
        { value: -25000, display: '-$25K' },
        { value: -10000, display: '-$10K' },
        { value: -3000,  display: '-$3K' },
        { value: -2000,  display: '-$2K' },
      ]
    },
    {
      dept: 'Marketing', total: 102000, totalDisplay: '+$102K',
      cells: [
        { value: 12000,  display: '+$12K' },
        { value: 78000,  display: '+$78K' },
        { value: 5000,   display: '+$5K' },
        { value: 4000,   display: '+$4K' },
        { value: 3000,   display: '+$3K' },
      ]
    },
    {
      dept: 'Sales', total: -20000, totalDisplay: '-$20K',
      cells: [
        { value: -5000,  display: '-$5K' },
        { value: -8000,  display: '-$8K' },
        { value: -2000,  display: '-$2K' },
        { value: -4000,  display: '-$4K' },
        { value: -1000,  display: '-$1K' },
      ]
    },
    {
      dept: 'Operations', total: 18000, totalDisplay: '+$18K',
      cells: [
        { value: 2000,   display: '+$2K' },
        { value: 10000,  display: '+$10K' },
        { value: 3000,   display: '+$3K' },
        { value: 1000,   display: '+$1K' },
        { value: 2000,   display: '+$2K' },
      ]
    },
    {
      dept: 'G&A', total: -10000, totalDisplay: '-$10K',
      cells: [
        { value: -4000,  display: '-$4K' },
        { value: -2000,  display: '-$2K' },
        { value: -1000,  display: '-$1K' },
        { value: -2000,  display: '-$2K' },
        { value: -1000,  display: '-$1K' },
      ]
    },
  ];

  detailData: Record<string, any[]> = {
    'Engineering': [
      { account: '6100-ENG', category: 'Payroll',      budget: '$1,400,000', actual: '$1,320,000', variance: '-$80,000',  variancePct: '-5.7%',  favorable: true,  impactWidth: 67 },
      { account: '6200-ENG', category: 'Contractors',   budget: '$380,000',   actual: '$355,000',   variance: '-$25,000',  variancePct: '-6.6%',  favorable: true,  impactWidth: 21 },
      { account: '6300-ENG', category: 'Software',      budget: '$200,000',   actual: '$190,000',   variance: '-$10,000',  variancePct: '-5.0%',  favorable: true,  impactWidth: 8 },
      { account: '6400-ENG', category: 'Travel',        budget: '$60,000',    actual: '$57,000',    variance: '-$3,000',   variancePct: '-5.0%',  favorable: true,  impactWidth: 3 },
      { account: '6900-ENG', category: 'Other',         budget: '$60,000',    actual: '$58,000',    variance: '-$2,000',   variancePct: '-3.3%',  favorable: true,  impactWidth: 2 },
    ],
    'Marketing': [
      { account: '6100-MKT', category: 'Payroll',      budget: '$320,000',  actual: '$332,000',  variance: '+$12,000',  variancePct: '+3.8%',  favorable: false, impactWidth: 12 },
      { account: '6200-MKT', category: 'Contractors',   budget: '$240,000',  actual: '$318,000',  variance: '+$78,000',  variancePct: '+32.5%', favorable: false, impactWidth: 76 },
      { account: '6300-MKT', category: 'Software',      budget: '$140,000',  actual: '$145,000',  variance: '+$5,000',   variancePct: '+3.6%',  favorable: false, impactWidth: 5 },
      { account: '6400-MKT', category: 'Travel',        budget: '$80,000',   actual: '$84,000',   variance: '+$4,000',   variancePct: '+5.0%',  favorable: false, impactWidth: 4 },
      { account: '6900-MKT', category: 'Other',         budget: '$70,000',   actual: '$73,000',   variance: '+$3,000',   variancePct: '+4.3%',  favorable: false, impactWidth: 3 },
    ],
    'Sales': [
      { account: '6100-SAL', category: 'Payroll',      budget: '$900,000',  actual: '$895,000',  variance: '-$5,000',   variancePct: '-0.6%',  favorable: true,  impactWidth: 25 },
      { account: '6200-SAL', category: 'Contractors',   budget: '$180,000',  actual: '$172,000',  variance: '-$8,000',   variancePct: '-4.4%',  favorable: true,  impactWidth: 40 },
      { account: '6300-SAL', category: 'Software',      budget: '$120,000',  actual: '$118,000',  variance: '-$2,000',   variancePct: '-1.7%',  favorable: true,  impactWidth: 10 },
      { account: '6400-SAL', category: 'Travel',        budget: '$140,000',  actual: '$136,000',  variance: '-$4,000',   variancePct: '-2.9%',  favorable: true,  impactWidth: 20 },
      { account: '6900-SAL', category: 'Other',         budget: '$60,000',   actual: '$59,000',   variance: '-$1,000',   variancePct: '-1.7%',  favorable: true,  impactWidth: 5 },
    ],
    'Operations': [
      { account: '6100-OPS', category: 'Payroll',      budget: '$280,000',  actual: '$282,000',  variance: '+$2,000',   variancePct: '+0.7%',  favorable: false, impactWidth: 11 },
      { account: '6200-OPS', category: 'Contractors',   budget: '$160,000',  actual: '$170,000',  variance: '+$10,000',  variancePct: '+6.3%',  favorable: false, impactWidth: 56 },
      { account: '6300-OPS', category: 'Software',      budget: '$100,000',  actual: '$103,000',  variance: '+$3,000',   variancePct: '+3.0%',  favorable: false, impactWidth: 17 },
      { account: '6400-OPS', category: 'Travel',        budget: '$50,000',   actual: '$51,000',   variance: '+$1,000',   variancePct: '+2.0%',  favorable: false, impactWidth: 6 },
      { account: '6900-OPS', category: 'Other',         budget: '$50,000',   actual: '$52,000',   variance: '+$2,000',   variancePct: '+4.0%',  favorable: false, impactWidth: 11 },
    ],
    'G&A': [
      { account: '6100-GA',  category: 'Payroll',      budget: '$200,000',  actual: '$196,000',  variance: '-$4,000',   variancePct: '-2.0%',  favorable: true,  impactWidth: 40 },
      { account: '6200-GA',  category: 'Contractors',   budget: '$80,000',   actual: '$78,000',   variance: '-$2,000',   variancePct: '-2.5%',  favorable: true,  impactWidth: 20 },
      { account: '6300-GA',  category: 'Software',      budget: '$60,000',   actual: '$59,000',   variance: '-$1,000',   variancePct: '-1.7%',  favorable: true,  impactWidth: 10 },
      { account: '6400-GA',  category: 'Travel',        budget: '$40,000',   actual: '$38,000',   variance: '-$2,000',   variancePct: '-5.0%',  favorable: true,  impactWidth: 20 },
      { account: '6900-GA',  category: 'Other',         budget: '$40,000',   actual: '$39,000',   variance: '-$1,000',   variancePct: '-2.5%',  favorable: true,  impactWidth: 10 },
    ],
  };

  getDetailRows() {
    return this.detailData[this.selectedDept] || [];
  }

  getCellBg(value: number): string {
    if (value < 0) {
      const intensity = Math.min(Math.abs(value) / 100000, 1);
      return `rgba(220,252,231,${0.3 + intensity * 0.7})`;
    }
    const intensity = Math.min(value / 100000, 1);
    return `rgba(254,226,226,${0.3 + intensity * 0.7})`;
  }

  getCellColor(value: number): string {
    return value < 0 ? '#166534' : '#B91C1C';
  }
}