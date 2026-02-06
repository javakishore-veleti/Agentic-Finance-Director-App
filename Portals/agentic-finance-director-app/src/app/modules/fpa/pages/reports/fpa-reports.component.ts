import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-fpa-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/fpa/budget">FP&A</a>
      <span class="separator">/</span>
      <span class="current">Reports</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Reports</h1>
        <p class="afda-page-subtitle">Financial report library and scheduled generation</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-clock-history"></i> Schedule
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-plus-lg"></i> New Report
        </button>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <i class="bi bi-search"></i>
        <input type="text" placeholder="Search reports..." class="search-input"
               (input)="onSearch($event)">
      </div>
      <div class="filter-chips">
        @for (cat of categories; track cat.key) {
          <button class="filter-chip" [class.active]="activeCategory === cat.key"
                  (click)="activeCategory = cat.key">
            {{ cat.label }}
            <span class="chip-count">{{ cat.count }}</span>
          </button>
        }
      </div>
    </div>

    <!-- Report Cards Grid -->
    <div class="report-grid stagger">
      @for (report of filteredReports; track report.id) {
        <div class="report-card">
          <!-- Report Icon -->
          <div class="rc-icon" [style.background]="report.iconBg">
            <i [class]="'bi ' + report.icon" [style.color]="report.iconColor"></i>
          </div>

          <!-- Report Info -->
          <div class="rc-body">
            <div class="rc-top">
              <span class="rc-category-chip" [style.background]="report.catBg" [style.color]="report.catColor">
                {{ report.category }}
              </span>
              @if (report.aiGenerated) {
                <span class="rc-ai-tag"><i class="bi bi-stars"></i> AI</span>
              }
              @if (report.scheduled) {
                <span class="rc-schedule-tag"><i class="bi bi-clock"></i> {{ report.scheduleFreq }}</span>
              }
            </div>
            <div class="rc-title">{{ report.title }}</div>
            <div class="rc-desc">{{ report.description }}</div>
            <div class="rc-meta">
              <span><i class="bi bi-calendar3"></i> {{ report.lastGenerated }}</span>
              <span><i class="bi bi-file-earmark"></i> {{ report.format }}</span>
              <span><i class="bi bi-person"></i> {{ report.owner }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="rc-actions">
            <button class="afda-btn afda-btn-primary" style="font-size: 11.5px; padding: 6px 12px;">
              <i class="bi bi-play-fill"></i> Generate
            </button>
            <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 6px 12px;">
              <i class="bi bi-download"></i> Last
            </button>
          </div>
        </div>
      }
    </div>

    <!-- Recent Report History -->
    <div class="afda-card" style="margin-top: 20px; animation: fadeUp 0.4s ease 0.2s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Recent Generation History</div>
        <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 5px 12px;">
          View all →
        </button>
      </div>
      <table class="afda-table">
        <thead>
          <tr>
            <th>Report</th>
            <th>Generated</th>
            <th>Triggered By</th>
            <th>Format</th>
            <th>Size</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (row of historyRows; track row.report) {
            <tr>
              <td class="fw-600">{{ row.report }}</td>
              <td style="font-size: 12px; color: var(--text-secondary);">{{ row.generated }}</td>
              <td>
                <span class="trigger-chip">
                  <i [class]="'bi ' + row.triggerIcon"></i>
                  {{ row.trigger }}
                </span>
              </td>
              <td>
                <span class="format-chip">{{ row.format }}</span>
              </td>
              <td class="font-mono" style="font-size: 12px;">{{ row.size }}</td>
              <td>
                <span class="afda-badge" [ngClass]="row.statusClass">{{ row.status }}</span>
              </td>
              <td>
                <button class="icon-btn"><i class="bi bi-download"></i></button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Scheduled Reports -->
    <div class="afda-card" style="margin-top: 16px; animation: fadeUp 0.4s ease 0.24s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Scheduled Reports</div>
        <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 5px 12px;">
          <i class="bi bi-plus-lg"></i> Add Schedule
        </button>
      </div>
      @for (sched of scheduledReports; track sched.report) {
        <div class="schedule-row">
          <div class="sched-info">
            <div class="sched-title">{{ sched.report }}</div>
            <div class="sched-meta">{{ sched.recipients }}</div>
          </div>
          <div class="sched-freq">
            <i class="bi bi-clock"></i> {{ sched.frequency }}
          </div>
          <div class="sched-next font-mono">{{ sched.nextRun }}</div>
          <div class="sched-toggle">
            <div class="toggle-switch" [class.active]="sched.active" (click)="sched.active = !sched.active">
              <div class="toggle-knob"></div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Search Bar */
    .search-bar {
      display: flex; flex-direction: column; gap: 12px;
      margin-bottom: 20px;
    }

    .search-input-wrapper {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 16px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      transition: border-color 0.15s;
      i { color: var(--text-tertiary); font-size: 16px; }
      &:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(13,107,92,0.1); }
    }

    .search-input {
      flex: 1; border: none; outline: none; background: transparent;
      font-size: 13.5px; font-family: var(--font-sans);
      color: var(--text-primary);
      &::placeholder { color: var(--text-tertiary); }
    }

    .filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }

    .filter-chip {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 14px; font-size: 12.5px; font-weight: 500;
      border: 1px solid var(--border); border-radius: 20px;
      background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s;
      font-family: var(--font-sans);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 600; }
    }

    .chip-count {
      font-size: 10.5px; font-weight: 600;
      background: var(--bg-section); padding: 1px 6px;
      border-radius: 10px;
    }

    .filter-chip.active .chip-count {
      background: rgba(13,107,92,0.15);
    }

    /* Report Cards */
    .report-grid {
      display: grid; grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }

    .report-card {
      display: flex; align-items: flex-start; gap: 16px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 18px;
      box-shadow: var(--shadow-card);
      animation: fadeUp 0.4s ease both;
      transition: border-color 0.15s, box-shadow 0.15s;
      &:hover { border-color: #D1D5DB; box-shadow: var(--shadow-md); }
    }

    .rc-icon {
      width: 44px; height: 44px; border-radius: var(--radius-md);
      display: grid; place-items: center; font-size: 20px;
      flex-shrink: 0;
    }

    .rc-body { flex: 1; min-width: 0; }

    .rc-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }

    .rc-category-chip {
      padding: 2px 8px; font-size: 10px; font-weight: 600;
      border-radius: 10px; text-transform: uppercase; letter-spacing: 0.3px;
    }

    .rc-ai-tag {
      font-size: 10.5px; font-weight: 600; color: var(--primary);
      display: inline-flex; align-items: center; gap: 3px;
      i { font-size: 11px; }
    }

    .rc-schedule-tag {
      font-size: 10.5px; color: var(--text-tertiary);
      display: inline-flex; align-items: center; gap: 3px;
      i { font-size: 11px; }
    }

    .rc-title {
      font-size: 14px; font-weight: 700; color: var(--text-primary);
      line-height: 1.3; margin-bottom: 4px;
    }

    .rc-desc {
      font-size: 12.5px; color: var(--text-secondary);
      line-height: 1.5; margin-bottom: 8px;
    }

    .rc-meta {
      display: flex; gap: 14px; font-size: 11px; color: var(--text-tertiary);
      i { margin-right: 3px; }
    }

    .rc-actions {
      display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;
    }

    /* History Table */
    .trigger-chip {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11.5px; color: var(--text-secondary);
      background: var(--bg-section); padding: 3px 8px;
      border-radius: 20px;
      i { font-size: 12px; }
    }

    .format-chip {
      display: inline-flex; padding: 2px 8px;
      font-size: 10.5px; font-weight: 600;
      background: var(--bg-section); color: var(--text-secondary);
      border-radius: 4px; text-transform: uppercase;
    }

    .icon-btn {
      width: 30px; height: 30px; border: 1px solid var(--border);
      border-radius: var(--radius-sm); background: var(--bg-white);
      color: var(--text-tertiary); cursor: pointer;
      display: grid; place-items: center; font-size: 14px;
      transition: all 0.15s;
      &:hover { color: var(--primary); border-color: var(--primary); }
    }

    /* Scheduled Reports */
    .schedule-row {
      display: flex; align-items: center; gap: 16px;
      padding: 14px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .sched-info { flex: 1; }
    .sched-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .sched-meta { font-size: 11.5px; color: var(--text-tertiary); margin-top: 1px; }

    .sched-freq {
      display: flex; align-items: center; gap: 5px;
      font-size: 12px; color: var(--text-secondary);
      i { font-size: 13px; }
    }

    .sched-next { font-size: 12px; color: var(--text-secondary); width: 100px; }

    /* Toggle Switch */
    .toggle-switch {
      width: 36px; height: 20px;
      background: #D1D5DB; border-radius: 10px;
      position: relative; cursor: pointer;
      transition: background 0.2s;
      &.active { background: var(--primary); }
    }

    .toggle-knob {
      width: 16px; height: 16px;
      background: white; border-radius: 50%;
      position: absolute; top: 2px; left: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
      transition: left 0.2s;
    }

    .toggle-switch.active .toggle-knob { left: 18px; }

    @media (max-width: 1100px) {
      .report-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class FpaReportsComponent {
  activeCategory = 'all';
  searchTerm = '';

  categories = [
    { key: 'all',        label: 'All Reports',   count: 8 },
    { key: 'financial',  label: 'Financial',      count: 3 },
    { key: 'variance',   label: 'Variance',       count: 2 },
    { key: 'forecast',   label: 'Forecast',       count: 2 },
    { key: 'compliance', label: 'Compliance',     count: 1 },
  ];

  reports = [
    {
      id: 1, title: 'Monthly Financial Package',
      description: 'Comprehensive P&L, balance sheet, and cash flow statement with commentary.',
      category: 'Financial', catBg: '#E8F5F1', catColor: '#0D6B5C',
      icon: 'bi-file-earmark-bar-graph', iconBg: '#E8F5F1', iconColor: '#0D6B5C',
      lastGenerated: 'Feb 3, 2026', format: 'PDF + Excel', owner: 'Lisa Wang',
      aiGenerated: true, scheduled: true, scheduleFreq: 'Monthly', catKey: 'financial'
    },
    {
      id: 2, title: 'Budget vs. Actual Variance Report',
      description: 'Department-level variance analysis with drill-down to GL accounts.',
      category: 'Variance', catBg: '#FEF3C7', catColor: '#92400E',
      icon: 'bi-clipboard-data', iconBg: '#FEF3C7', iconColor: '#92400E',
      lastGenerated: 'Feb 1, 2026', format: 'PDF', owner: 'Michael Park',
      aiGenerated: true, scheduled: true, scheduleFreq: 'Monthly', catKey: 'variance'
    },
    {
      id: 3, title: 'Rolling Forecast Summary',
      description: 'Quarterly forecast vs. plan with scenario analysis and key assumptions.',
      category: 'Forecast', catBg: '#EFF6FF', catColor: '#2563EB',
      icon: 'bi-graph-up-arrow', iconBg: '#EFF6FF', iconColor: '#2563EB',
      lastGenerated: 'Jan 28, 2026', format: 'PDF + PPT', owner: 'Sarah Chen',
      aiGenerated: true, scheduled: false, scheduleFreq: '', catKey: 'forecast'
    },
    {
      id: 4, title: 'Flux Commentary Package',
      description: 'AI-generated and analyst-reviewed variance explanations for all material items.',
      category: 'Variance', catBg: '#FEF3C7', catColor: '#92400E',
      icon: 'bi-chat-left-text', iconBg: '#FEF3C7', iconColor: '#92400E',
      lastGenerated: 'Feb 2, 2026', format: 'PDF', owner: 'Michael Park',
      aiGenerated: true, scheduled: true, scheduleFreq: 'Monthly', catKey: 'variance'
    },
    {
      id: 5, title: 'Board Financial Deck',
      description: 'Executive-level financial summary formatted for board presentation.',
      category: 'Financial', catBg: '#E8F5F1', catColor: '#0D6B5C',
      icon: 'bi-easel', iconBg: '#E8F5F1', iconColor: '#0D6B5C',
      lastGenerated: 'Jan 20, 2026', format: 'PPT', owner: 'CFO Office',
      aiGenerated: false, scheduled: false, scheduleFreq: '', catKey: 'financial'
    },
    {
      id: 6, title: 'Cash Flow Forecast Report',
      description: '13-week rolling cash forecast with liquidity projections and covenant compliance.',
      category: 'Forecast', catBg: '#EFF6FF', catColor: '#2563EB',
      icon: 'bi-wallet2', iconBg: '#EFF6FF', iconColor: '#2563EB',
      lastGenerated: 'Feb 4, 2026', format: 'Excel', owner: 'Sarah Chen',
      aiGenerated: false, scheduled: true, scheduleFreq: 'Weekly', catKey: 'forecast'
    },
    {
      id: 7, title: 'Revenue Recognition Schedule',
      description: 'ASC 606 compliant revenue recognition with deferred revenue roll-forward.',
      category: 'Compliance', catBg: '#FEE2E2', catColor: '#B91C1C',
      icon: 'bi-shield-check', iconBg: '#FEE2E2', iconColor: '#B91C1C',
      lastGenerated: 'Jan 31, 2026', format: 'Excel', owner: 'Lisa Wang',
      aiGenerated: false, scheduled: true, scheduleFreq: 'Monthly', catKey: 'compliance'
    },
    {
      id: 8, title: 'Departmental P&L Breakdown',
      description: 'Individual P&L statements for each cost center with allocation methodology.',
      category: 'Financial', catBg: '#E8F5F1', catColor: '#0D6B5C',
      icon: 'bi-building', iconBg: '#E8F5F1', iconColor: '#0D6B5C',
      lastGenerated: 'Feb 3, 2026', format: 'PDF + Excel', owner: 'Michael Park',
      aiGenerated: true, scheduled: true, scheduleFreq: 'Monthly', catKey: 'financial'
    },
  ];

  historyRows = [
    { report: 'Monthly Financial Package', generated: 'Feb 3, 2026 · 7:02 AM', trigger: 'Scheduled', triggerIcon: 'bi-clock', format: 'PDF', size: '2.4 MB', status: 'Complete', statusClass: 'afda-badge-success' },
    { report: 'Flux Commentary Package',   generated: 'Feb 2, 2026 · 8:15 AM', trigger: 'Scheduled', triggerIcon: 'bi-clock', format: 'PDF', size: '1.8 MB', status: 'Complete', statusClass: 'afda-badge-success' },
    { report: 'Budget vs. Actual Report',  generated: 'Feb 1, 2026 · 7:00 AM', trigger: 'Scheduled', triggerIcon: 'bi-clock', format: 'PDF', size: '3.1 MB', status: 'Complete', statusClass: 'afda-badge-success' },
    { report: 'Cash Flow Forecast',        generated: 'Jan 31, 2026 · 6:30 AM', trigger: 'Manual',   triggerIcon: 'bi-person', format: 'XLSX', size: '890 KB', status: 'Complete', statusClass: 'afda-badge-success' },
    { report: 'Board Financial Deck',      generated: 'Jan 20, 2026 · 3:45 PM', trigger: 'Manual',   triggerIcon: 'bi-person', format: 'PPTX', size: '5.2 MB', status: 'Complete', statusClass: 'afda-badge-success' },
  ];

  scheduledReports = [
    { report: 'Monthly Financial Package',     recipients: 'CFO, VP Finance, Board',     frequency: 'Monthly (1st)',  nextRun: 'Mar 1', active: true },
    { report: 'Budget vs. Actual Report',      recipients: 'FP&A Team, Dept Heads',      frequency: 'Monthly (1st)',  nextRun: 'Mar 1', active: true },
    { report: 'Cash Flow Forecast',            recipients: 'Treasury, CFO',              frequency: 'Weekly (Mon)',   nextRun: 'Feb 10', active: true },
    { report: 'Flux Commentary Package',       recipients: 'FP&A Team, Controller',      frequency: 'Monthly (2nd)', nextRun: 'Mar 2', active: true },
    { report: 'Revenue Recognition Schedule',  recipients: 'Controller, External Audit', frequency: 'Monthly (EOM)', nextRun: 'Feb 28', active: false },
  ];

  get filteredReports() {
    let results = this.reports;
    if (this.activeCategory !== 'all') {
      results = results.filter(r => r.catKey === this.activeCategory);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      results = results.filter(r =>
        r.title.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term)
      );
    }
    return results;
  }

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }
}