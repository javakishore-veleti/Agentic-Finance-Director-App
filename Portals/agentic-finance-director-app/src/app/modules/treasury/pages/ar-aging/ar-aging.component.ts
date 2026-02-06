import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-treasury-ar-aging',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/treasury/cash-position">Treasury</a>
      <span class="separator">/</span>
      <span class="current">AR Aging</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">AR Aging</h1>
        <p class="afda-page-subtitle">Accounts receivable aging analysis and collection tracking</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>As of Feb 5, 2026</option>
          <option>As of Jan 31, 2026</option>
          <option>As of Dec 31, 2025</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-download"></i> Export
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-send"></i> Send Reminders
        </button>
      </div>
    </div>

    <!-- AR Summary KPIs -->
    <div class="kpi-row stagger">
      @for (kpi of arKpis; track kpi.label) {
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

    <!-- Aging Buckets Visual -->
    <div class="afda-card" style="margin-bottom: 16px; animation: fadeUp 0.4s ease 0.08s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Aging Distribution</div>
        <span style="font-size: 11px; color: var(--text-tertiary);">Total AR: $3.75M</span>
      </div>
      <!-- Stacked Bar -->
      <div class="aging-stacked-bar">
        @for (bucket of agingBuckets; track bucket.label) {
          <div class="stack-segment" [style.flex]="bucket.pct"
               [style.background]="bucket.color"
               (mouseenter)="hoveredBucket = bucket.label"
               (mouseleave)="hoveredBucket = ''">
            <span class="stack-label" *ngIf="bucket.pct > 8">{{ bucket.pct }}%</span>
          </div>
        }
      </div>
      <div class="aging-legend">
        @for (bucket of agingBuckets; track bucket.label) {
          <div class="aging-legend-item" [class.active]="hoveredBucket === bucket.label">
            <span class="legend-dot" [style.background]="bucket.color"></span>
            <div class="legend-info">
              <span class="legend-bucket">{{ bucket.label }}</span>
              <span class="legend-amount font-mono">{{ bucket.amount }}</span>
            </div>
            <span class="legend-pct font-mono">{{ bucket.pct }}%</span>
            <span class="legend-count">{{ bucket.invoices }} inv</span>
          </div>
        }
      </div>
    </div>

    <!-- Two Column: Priority + Trend -->
    <div class="ar-grid">
      <!-- Collection Priority -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.1s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Collection Priority</div>
          <span class="afda-badge afda-badge-danger">3 overdue</span>
        </div>
        @for (item of priorityItems; track item.client) {
          <div class="priority-row" [class.critical]="item.severity === 'critical'">
            <div class="priority-left">
              <div class="priority-severity" [style.background]="item.severityBg">
                <i [class]="'bi ' + item.severityIcon" [style.color]="item.severityColor"></i>
              </div>
              <div>
                <div class="priority-client">{{ item.client }}</div>
                <div class="priority-meta">{{ item.invoiceCount }} invoices · {{ item.aging }}</div>
              </div>
            </div>
            <div class="priority-right">
              <div class="priority-amount font-mono">{{ item.amount }}</div>
              <div class="priority-actions">
                <button class="mini-btn" title="Send reminder"><i class="bi bi-envelope"></i></button>
                <button class="mini-btn" title="Call"><i class="bi bi-telephone"></i></button>
                <button class="mini-btn" title="Escalate"><i class="bi bi-arrow-up-circle"></i></button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- DSO Trend + AI -->
      <div class="ar-right">
        <!-- DSO Trend -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.12s both;">
          <div class="afda-card-title" style="margin-bottom: 14px;">DSO Trend (6 Months)</div>
          <div class="dso-chart">
            @for (month of dsoTrend; track month.label) {
              <div class="dso-col">
                <div class="dso-bar-area">
                  <div class="dso-bar" [style.height.%]="month.barH"
                       [style.background]="month.value > 38 ? '#D97706' : 'var(--primary)'">
                    <span class="dso-val font-mono">{{ month.value }}d</span>
                  </div>
                </div>
                <div class="dso-label">{{ month.label }}</div>
              </div>
            }
          </div>
          <div class="dso-target">
            <span class="dso-target-line"></span>
            <span class="dso-target-label">Target: 38 days</span>
          </div>
        </div>

        <!-- AI Panel -->
        <div class="afda-ai-panel" style="animation: fadeUp 0.4s ease 0.14s both;">
          <div class="afda-ai-panel-header">
            <div class="afda-ai-icon"><i class="bi bi-stars"></i></div>
            <span class="afda-ai-label">AI Collection Insights</span>
          </div>
          <div class="afda-ai-body">
            <p><strong>TechVentures</strong> ($1.2M, 72 days) has historically paid within 5 days of second reminder. Recommend sending follow-up this week — AI predicts <strong>78% probability of collection within 10 days</strong>.</p>
            <p><strong>Pattern detected:</strong> Invoices to Acme Corp consistently clear on the 15th of each month. Expect $420K payment by Feb 15.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed AR Table -->
    <div class="afda-card" style="margin-top: 16px; animation: fadeUp 0.4s ease 0.18s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Invoice Detail</div>
        <div style="display: flex; gap: 6px;">
          @for (filter of bucketFilters; track filter) {
            <button class="filter-chip" [class.active]="activeBucketFilter === filter"
                    (click)="activeBucketFilter = filter">{{ filter }}</button>
          }
        </div>
      </div>
      <table class="afda-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Client</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th class="text-right">Amount</th>
            <th>Age</th>
            <th>Bucket</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          @for (inv of filteredInvoices; track inv.number) {
            <tr>
              <td class="font-mono" style="font-size: 12px;">{{ inv.number }}</td>
              <td class="fw-600">{{ inv.client }}</td>
              <td style="font-size: 12px; color: var(--text-secondary);">{{ inv.issueDate }}</td>
              <td style="font-size: 12px; color: var(--text-secondary);">{{ inv.dueDate }}</td>
              <td class="text-right font-mono fw-600">{{ inv.amount }}</td>
              <td>
                <span class="age-chip font-mono" [style.color]="inv.ageColor" [style.background]="inv.ageBg">
                  {{ inv.age }}
                </span>
              </td>
              <td>
                <span class="bucket-chip" [style.background]="inv.bucketBg" [style.color]="inv.bucketColor">
                  {{ inv.bucket }}
                </span>
              </td>
              <td>
                <span class="afda-badge" [ngClass]="inv.statusClass">{{ inv.status }}</span>
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

    /* Stacked Bar */
    .aging-stacked-bar {
      display: flex; height: 36px; border-radius: var(--radius-sm);
      overflow: hidden; gap: 2px; margin-bottom: 16px;
    }

    .stack-segment {
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: opacity 0.15s, transform 0.15s;
      min-width: 4px;
      &:hover { opacity: 0.85; transform: scaleY(1.08); }
    }

    .stack-label { font-size: 11px; font-weight: 700; color: white; }

    .aging-legend {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }

    .aging-legend-item {
      display: flex; align-items: center; gap: 8px;
      padding: 10px; border-radius: var(--radius-sm);
      border: 1px solid var(--border-light);
      transition: border-color 0.15s;
      &.active { border-color: var(--primary); background: var(--primary-subtle); }
    }

    .legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
    .legend-info { flex: 1; min-width: 0; }
    .legend-bucket { display: block; font-size: 11px; font-weight: 600; color: var(--text-primary); }
    .legend-amount { display: block; font-size: 12px; font-weight: 700; margin-top: 1px; }
    .legend-pct { font-size: 11px; color: var(--text-tertiary); }
    .legend-count { font-size: 10.5px; color: var(--text-tertiary); }

    .ar-grid {
      display: grid; grid-template-columns: 1fr 380px;
      gap: 16px;
    }

    .ar-right { display: flex; flex-direction: column; gap: 16px; }

    /* Priority Rows */
    .priority-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
      &.critical { background: #FFF5F5; margin: 0 -22px; padding: 14px 22px; border-radius: var(--radius-sm); }
    }

    .priority-left { display: flex; align-items: center; gap: 12px; }

    .priority-severity {
      width: 34px; height: 34px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 16px;
    }

    .priority-client { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .priority-meta { font-size: 11.5px; color: var(--text-tertiary); margin-top: 1px; }

    .priority-right { text-align: right; }
    .priority-amount { font-size: 15px; font-weight: 700; margin-bottom: 6px; }

    .priority-actions { display: flex; gap: 4px; justify-content: flex-end; }

    .mini-btn {
      width: 28px; height: 28px;
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      background: var(--bg-white); color: var(--text-tertiary);
      cursor: pointer; display: grid; place-items: center; font-size: 13px;
      transition: all 0.15s;
      &:hover { color: var(--primary); border-color: var(--primary); }
    }

    /* DSO Chart */
    .dso-chart {
      display: flex; align-items: flex-end; gap: 8px;
      height: 120px; padding-bottom: 4px;
    }

    .dso-col { flex: 1; text-align: center; height: 100%; display: flex; flex-direction: column; }

    .dso-bar-area { flex: 1; display: flex; align-items: flex-end; justify-content: center; }

    .dso-bar {
      width: 28px; border-radius: 4px 4px 0 0;
      position: relative; min-height: 4px;
      transition: height 0.5s ease;
    }

    .dso-val {
      position: absolute; top: -16px; left: 50%;
      transform: translateX(-50%);
      font-size: 10px; color: var(--text-tertiary); white-space: nowrap;
    }

    .dso-label { font-size: 11px; color: var(--text-secondary); margin-top: 6px; font-weight: 500; }

    .dso-target {
      display: flex; align-items: center; gap: 8px;
      margin-top: 10px; padding-top: 10px;
      border-top: 1px solid var(--border-light);
    }

    .dso-target-line {
      width: 20px; height: 0; border-top: 2px dashed var(--danger);
    }

    .dso-target-label { font-size: 11px; color: var(--text-tertiary); }

    /* Filter Chips */
    .filter-chip {
      padding: 4px 10px; font-size: 11.5px; font-weight: 500;
      border: 1px solid var(--border); border-radius: 20px;
      background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s;
      font-family: var(--font-sans);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 600; }
    }

    .age-chip {
      display: inline-flex; padding: 2px 8px;
      font-size: 11px; font-weight: 600;
      border-radius: 4px;
    }

    .bucket-chip {
      display: inline-flex; padding: 2px 8px;
      font-size: 10px; font-weight: 600;
      border-radius: 10px; text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    @media (max-width: 1100px) {
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
      .ar-grid { grid-template-columns: 1fr; }
      .aging-legend { grid-template-columns: repeat(3, 1fr); }
    }
  `]
})
export class ArAgingComponent {
  hoveredBucket = '';
  activeBucketFilter = 'All';
  bucketFilters = ['All', 'Current', '1-30', '31-60', '61-90', '90+'];

  arKpis = [
    { label: 'Total AR', value: '$3.75M', trend: '↑ $180K', trendDir: 'negative', footnote: 'outstanding receivables', accent: 'teal' },
    { label: 'DSO', value: '35 days', trend: '↓ 3 days', trendDir: 'positive', footnote: 'days sales outstanding', accent: 'green' },
    { label: 'Overdue Amount', value: '$1.48M', trend: '39% of AR', trendDir: 'negative', footnote: 'past due date', accent: 'red' },
    { label: 'Collection Rate', value: '94.2%', trend: '↑ 1.4%', trendDir: 'positive', footnote: 'trailing 90-day avg', accent: 'blue' },
  ];

  agingBuckets = [
    { label: 'Current',  amount: '$1,420,000', pct: 38, invoices: 12, color: '#059669' },
    { label: '1–30 days', amount: '$850,000',   pct: 23, invoices: 8,  color: '#0D6B5C' },
    { label: '31–60 days', amount: '$680,000',   pct: 18, invoices: 5,  color: '#D97706' },
    { label: '61–90 days', amount: '$520,000',   pct: 14, invoices: 3,  color: '#EA580C' },
    { label: '90+ days',  amount: '$280,000',   pct: 7,  invoices: 2,  color: '#DC2626' },
  ];

  priorityItems = [
    {
      client: 'TechVentures Inc.', amount: '$1,200,000', invoiceCount: 3, aging: 'Oldest: 72 days',
      severity: 'critical', severityBg: '#FEE2E2', severityIcon: 'bi-exclamation-triangle-fill', severityColor: '#DC2626'
    },
    {
      client: 'Acme Corp', amount: '$420,000', invoiceCount: 2, aging: 'Oldest: 45 days',
      severity: 'high', severityBg: '#FEF3C7', severityIcon: 'bi-clock-fill', severityColor: '#D97706'
    },
    {
      client: 'NovaSoft', amount: '$280,000', invoiceCount: 2, aging: 'Oldest: 38 days',
      severity: 'medium', severityBg: '#EFF6FF', severityIcon: 'bi-info-circle-fill', severityColor: '#2563EB'
    },
    {
      client: 'DataFlow Systems', amount: '$180,000', invoiceCount: 1, aging: 'Oldest: 28 days',
      severity: 'low', severityBg: '#E8F5F1', severityIcon: 'bi-check-circle-fill', severityColor: '#059669'
    },
    {
      client: 'CloudNine Ltd', amount: '$140,000', invoiceCount: 1, aging: 'Oldest: 15 days',
      severity: 'low', severityBg: '#E8F5F1', severityIcon: 'bi-check-circle-fill', severityColor: '#059669'
    },
  ];

  dsoTrend = [
    { label: 'Sep', value: 42, barH: 84 },
    { label: 'Oct', value: 40, barH: 80 },
    { label: 'Nov', value: 38, barH: 76 },
    { label: 'Dec', value: 36, barH: 72 },
    { label: 'Jan', value: 37, barH: 74 },
    { label: 'Feb', value: 35, barH: 70 },
  ];

  invoices = [
    { number: 'INV-2025-1842', client: 'TechVentures Inc.', issueDate: 'Nov 25, 2025', dueDate: 'Dec 25, 2025', amount: '$680,000', age: '72d', ageColor: '#DC2626', ageBg: '#FEE2E2', bucket: '61-90', bucketBg: '#FEF3C7', bucketColor: '#92400E', status: 'Overdue', statusClass: 'afda-badge-critical', bucketKey: '61-90' },
    { number: 'INV-2025-1856', client: 'TechVentures Inc.', issueDate: 'Dec 10, 2025', dueDate: 'Jan 10, 2026', amount: '$340,000', age: '56d', ageColor: '#EA580C', ageBg: '#FFF7ED', bucket: '31-60', bucketBg: '#FEF3C7', bucketColor: '#92400E', status: 'Overdue', statusClass: 'afda-badge-critical', bucketKey: '31-60' },
    { number: 'INV-2025-1870', client: 'TechVentures Inc.', issueDate: 'Dec 22, 2025', dueDate: 'Jan 22, 2026', amount: '$180,000', age: '44d', ageColor: '#D97706', ageBg: '#FFFBEB', bucket: '31-60', bucketBg: '#FEF3C7', bucketColor: '#92400E', status: 'Overdue', statusClass: 'afda-badge-high', bucketKey: '31-60' },
    { number: 'INV-2026-0012', client: 'Acme Corp', issueDate: 'Dec 20, 2025', dueDate: 'Jan 20, 2026', amount: '$420,000', age: '46d', ageColor: '#D97706', ageBg: '#FFFBEB', bucket: '31-60', bucketBg: '#FEF3C7', bucketColor: '#92400E', status: 'Reminder Sent', statusClass: 'afda-badge-high', bucketKey: '31-60' },
    { number: 'INV-2026-0028', client: 'NovaSoft', issueDate: 'Jan 2, 2026', dueDate: 'Feb 1, 2026', amount: '$280,000', age: '34d', ageColor: '#D97706', ageBg: '#FFFBEB', bucket: '31-60', bucketBg: '#FEF3C7', bucketColor: '#92400E', status: 'In Review', statusClass: 'afda-badge-medium', bucketKey: '31-60' },
    { number: 'INV-2026-0045', client: 'GlobalTech', issueDate: 'Jan 10, 2026', dueDate: 'Feb 10, 2026', amount: '$520,000', age: '26d', ageColor: '#0D6B5C', ageBg: '#E8F5F1', bucket: '1-30', bucketBg: '#E8F5F1', bucketColor: '#0D6B5C', status: 'Pending', statusClass: 'afda-badge-medium', bucketKey: '1-30' },
    { number: 'INV-2026-0058', client: 'DataFlow Systems', issueDate: 'Jan 18, 2026', dueDate: 'Feb 18, 2026', amount: '$180,000', age: '18d', ageColor: '#0D6B5C', ageBg: '#E8F5F1', bucket: '1-30', bucketBg: '#E8F5F1', bucketColor: '#0D6B5C', status: 'Pending', statusClass: 'afda-badge-medium', bucketKey: '1-30' },
    { number: 'INV-2026-0071', client: 'CloudNine Ltd', issueDate: 'Jan 22, 2026', dueDate: 'Feb 22, 2026', amount: '$140,000', age: '14d', ageColor: '#059669', ageBg: '#ECFDF5', bucket: 'Current', bucketBg: '#ECFDF5', bucketColor: '#059669', status: 'Current', statusClass: 'afda-badge-success', bucketKey: 'Current' },
    { number: 'INV-2026-0085', client: 'Meridian Group', issueDate: 'Jan 28, 2026', dueDate: 'Feb 28, 2026', amount: '$310,000', age: '8d', ageColor: '#059669', ageBg: '#ECFDF5', bucket: 'Current', bucketBg: '#ECFDF5', bucketColor: '#059669', status: 'Current', statusClass: 'afda-badge-success', bucketKey: 'Current' },
    { number: 'INV-2026-0092', client: 'Apex Industries', issueDate: 'Feb 1, 2026', dueDate: 'Mar 1, 2026', amount: '$240,000', age: '4d', ageColor: '#059669', ageBg: '#ECFDF5', bucket: 'Current', bucketBg: '#ECFDF5', bucketColor: '#059669', status: 'Current', statusClass: 'afda-badge-success', bucketKey: 'Current' },
  ];

  get filteredInvoices() {
    if (this.activeBucketFilter === 'All') return this.invoices;
    return this.invoices.filter(inv => inv.bucketKey === this.activeBucketFilter);
  }
}