import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-execution-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/agent-studio/agent-console">Agent Studio</a>
      <span class="separator">/</span>
      <span class="current">Execution History</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Execution History</h1>
        <p class="afda-page-subtitle">Agent and workflow run logs, performance tracking, and error analysis</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>This month</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-download"></i> Export
        </button>
      </div>
    </div>

    <!-- Summary KPIs -->
    <div class="kpi-row stagger">
      @for (kpi of kpis; track kpi.label) {
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

    <!-- Execution Volume Chart -->
    <div class="afda-card" style="margin-bottom: 16px; animation: fadeUp 0.4s ease 0.06s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Daily Execution Volume</div>
        <div class="chart-legend">
          <span><span class="legend-bar" style="background: #059669;"></span> Success</span>
          <span><span class="legend-bar" style="background: #DC2626;"></span> Failed</span>
          <span><span class="legend-bar" style="background: #D97706;"></span> Warning</span>
        </div>
      </div>
      <div class="volume-chart">
        @for (day of volumeData; track day.label) {
          <div class="vol-col">
            <div class="vol-stack">
              <div class="vol-segment" style="background: #D97706;" [style.height.px]="day.warn * 1.2"></div>
              <div class="vol-segment" style="background: #DC2626;" [style.height.px]="day.fail * 1.2"></div>
              <div class="vol-segment" style="background: #059669;" [style.height.px]="day.success * 0.8"></div>
            </div>
            <div class="vol-total font-mono">{{ day.total }}</div>
            <div class="vol-label">{{ day.label }}</div>
          </div>
        }
      </div>
    </div>

    <!-- Filters + Table -->
    <div class="afda-card" style="animation: fadeUp 0.4s ease 0.1s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Run Log</div>
        <div style="display: flex; gap: 6px; align-items: center;">
          <div class="table-search">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="Filter runs..." class="table-search-input"
                   (input)="onSearch($event)">
          </div>
          @for (f of statusFilters; track f) {
            <button class="filter-chip" [class.active]="activeStatus === f" (click)="activeStatus = f">{{ f }}</button>
          }
        </div>
      </div>
      <table class="afda-table">
        <thead>
          <tr>
            <th>Run ID</th>
            <th>Workflow / Agent</th>
            <th>Trigger</th>
            <th>Started</th>
            <th>Duration</th>
            <th>Steps</th>
            <th>Tokens</th>
            <th>Cost</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          @for (run of filteredRuns; track run.id) {
            <tr class="run-row" [class.expanded]="expandedRun === run.id" (click)="toggleRun(run.id)">
              <td class="font-mono" style="font-size: 11px; color: var(--text-tertiary);">{{ run.id }}</td>
              <td>
                <div class="run-workflow">
                  <div class="run-wf-icon" [style.background]="run.iconBg">
                    <i [class]="'bi ' + run.icon" [style.color]="run.iconColor"></i>
                  </div>
                  <div>
                    <div class="run-wf-name">{{ run.workflow }}</div>
                    <div class="run-wf-agent">{{ run.agent }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="trigger-chip" [style.background]="run.triggerBg" [style.color]="run.triggerColor">
                  {{ run.trigger }}
                </span>
              </td>
              <td style="font-size: 12px; color: var(--text-secondary);">{{ run.started }}</td>
              <td class="font-mono" style="font-size: 12px;">{{ run.duration }}</td>
              <td class="font-mono" style="font-size: 12px;">{{ run.steps }}</td>
              <td class="font-mono" style="font-size: 12px;">{{ run.tokens }}</td>
              <td class="font-mono" style="font-size: 12px;">{{ run.cost }}</td>
              <td><span class="afda-badge" [ngClass]="run.badgeClass">{{ run.status }}</span></td>
            </tr>
            @if (expandedRun === run.id) {
              <tr class="detail-row">
                <td colspan="9">
                  <div class="run-detail">
                    <div class="rd-steps">
                      <div class="rd-label">Step Execution</div>
                      @for (step of run.stepDetails; track step.name) {
                        <div class="rd-step">
                          <div class="rd-step-status" [style.background]="step.statusBg">
                            <i [class]="'bi ' + step.statusIcon" [style.color]="step.statusColor"></i>
                          </div>
                          <div class="rd-step-info">
                            <span class="rd-step-name">{{ step.name }}</span>
                            <span class="rd-step-dur font-mono">{{ step.duration }}</span>
                          </div>
                          <div class="rd-step-bar">
                            <div class="rd-step-fill" [style.width.%]="step.pct" [style.background]="step.statusColor"></div>
                          </div>
                        </div>
                      }
                    </div>
                    @if (run.errorMsg) {
                      <div class="rd-error">
                        <div class="rd-label">Error Details</div>
                        <div class="rd-error-box">
                          <i class="bi bi-exclamation-triangle-fill" style="color: #DC2626;"></i>
                          <span>{{ run.errorMsg }}</span>
                        </div>
                      </div>
                    }
                    <div class="rd-output">
                      <div class="rd-label">Output Summary</div>
                      <div class="rd-output-text">{{ run.outputSummary }}</div>
                    </div>
                  </div>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>

    <!-- Cost + Error Breakdown -->
    <div class="bottom-grid">
      <!-- Cost by Agent -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.14s both;">
        <div class="afda-card-title" style="margin-bottom: 14px;">Cost by Agent (7 Days)</div>
        @for (agent of costByAgent; track agent.name) {
          <div class="cost-row">
            <div class="cost-agent">
              <div class="cost-dot" [style.background]="agent.color"></div>
              <span>{{ agent.name }}</span>
            </div>
            <div class="cost-bar-wrap">
              <div class="cost-bar">
                <div class="cost-bar-fill" [style.width.%]="agent.pct" [style.background]="agent.color"></div>
              </div>
            </div>
            <div class="cost-values">
              <span class="cost-amount font-mono">{{ agent.cost }}</span>
              <span class="cost-tokens font-mono">{{ agent.tokens }}</span>
            </div>
          </div>
        }
        <div class="cost-total">
          <span>Total</span>
          <span class="font-mono fw-600">$12.48</span>
          <span class="font-mono" style="color: var(--text-tertiary);">1.24M tokens</span>
        </div>
      </div>

      <!-- Error Analysis -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.16s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Error Analysis</div>
          <span class="afda-badge afda-badge-danger">8 errors</span>
        </div>
        @for (err of errorBreakdown; track err.type) {
          <div class="error-row">
            <div class="err-icon" [style.background]="err.iconBg">
              <i [class]="'bi ' + err.icon" [style.color]="err.iconColor"></i>
            </div>
            <div class="err-info">
              <div class="err-type">{{ err.type }}</div>
              <div class="err-desc">{{ err.description }}</div>
            </div>
            <div class="err-count font-mono">{{ err.count }}</div>
            <div class="err-trend" [ngClass]="err.trendDir">{{ err.trend }}</div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .kpi-row {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 14px; margin-bottom: 20px;
    }

    /* Volume Chart */
    .volume-chart {
      display: flex; align-items: flex-end; gap: 6px; height: 130px; padding: 8px 0;
    }

    .vol-col { flex: 1; text-align: center; height: 100%; display: flex; flex-direction: column; }

    .vol-stack {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: flex-end; gap: 1px;
    }

    .vol-segment { width: 20px; border-radius: 2px; min-height: 1px; }
    .vol-total { font-size: 10px; font-weight: 700; margin-top: 4px; }
    .vol-label { font-size: 10px; color: var(--text-tertiary); }

    .chart-legend { display: flex; gap: 12px; font-size: 11px; color: var(--text-tertiary); }

    .legend-bar {
      display: inline-block; width: 12px; height: 8px;
      border-radius: 2px; vertical-align: middle; margin-right: 3px;
    }

    /* Table Search */
    .table-search {
      display: flex; align-items: center; gap: 6px;
      padding: 4px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm);
      i { font-size: 12px; color: var(--text-tertiary); }
    }

    .table-search-input {
      border: none; outline: none; background: transparent;
      font-size: 12px; font-family: var(--font-sans);
      color: var(--text-primary); width: 120px;
      &::placeholder { color: var(--text-tertiary); }
    }

    .filter-chip {
      padding: 4px 10px; font-size: 11.5px; font-weight: 500;
      border: 1px solid var(--border); border-radius: 20px;
      background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s; font-family: var(--font-sans);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 600; }
    }

    .trigger-chip {
      display: inline-flex; padding: 2px 8px; font-size: 10.5px;
      font-weight: 600; border-radius: 10px;
    }

    /* Run Row */
    .run-row { cursor: pointer; transition: background 0.1s; }
    .run-row:hover { background: var(--bg-section) !important; }
    .run-row.expanded { background: var(--primary-subtle) !important; }

    .run-workflow { display: flex; align-items: center; gap: 8px; }

    .run-wf-icon {
      width: 28px; height: 28px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 13px; flex-shrink: 0;
    }

    .run-wf-name { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
    .run-wf-agent { font-size: 10.5px; color: var(--text-tertiary); }

    /* Expanded Detail */
    .detail-row td { padding: 0 !important; background: var(--bg-section) !important; }

    .run-detail {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 16px; padding: 16px 20px;
    }

    .rd-label {
      font-size: 10.5px; font-weight: 600; color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px;
    }

    .rd-steps { grid-row: span 2; }

    .rd-step { display: flex; align-items: center; gap: 8px; padding: 6px 0; }

    .rd-step-status {
      width: 22px; height: 22px; border-radius: 50%;
      display: grid; place-items: center; font-size: 10px; flex-shrink: 0;
    }

    .rd-step-info { min-width: 120px; display: flex; justify-content: space-between; }
    .rd-step-name { font-size: 12px; font-weight: 500; }
    .rd-step-dur { font-size: 11px; color: var(--text-tertiary); }

    .rd-step-bar {
      flex: 1; height: 5px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .rd-step-fill { height: 100%; border-radius: 10px; }

    .rd-error-box {
      display: flex; align-items: flex-start; gap: 8px;
      padding: 10px; background: #FEF2F2;
      border: 1px solid #FECACA; border-radius: var(--radius-sm);
      font-size: 12px; color: #991B1B;
    }

    .rd-output-text { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }

    /* Bottom Grid */
    .bottom-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 16px; margin-top: 16px;
    }

    .cost-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; }

    .cost-agent {
      display: flex; align-items: center; gap: 6px;
      font-size: 12.5px; color: var(--text-primary); min-width: 120px;
    }

    .cost-dot { width: 8px; height: 8px; border-radius: 3px; }
    .cost-bar-wrap { flex: 1; }

    .cost-bar {
      height: 8px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .cost-bar-fill { height: 100%; border-radius: 10px; }

    .cost-values { display: flex; gap: 8px; min-width: 120px; justify-content: flex-end; }
    .cost-amount { font-size: 12px; font-weight: 600; }
    .cost-tokens { font-size: 11px; color: var(--text-tertiary); }

    .cost-total {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 10px; margin-top: 8px;
      border-top: 2px solid var(--border);
      font-size: 13px; color: var(--text-primary);
    }

    .error-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .err-icon {
      width: 30px; height: 30px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 13px; flex-shrink: 0;
    }

    .err-info { flex: 1; }
    .err-type { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
    .err-desc { font-size: 11px; color: var(--text-tertiary); }
    .err-count { font-size: 16px; font-weight: 700; min-width: 30px; text-align: center; }
    .err-trend { font-size: 11px; font-weight: 500; min-width: 50px; text-align: right; }

    @media (max-width: 1100px) {
      .kpi-row { grid-template-columns: repeat(3, 1fr); }
      .bottom-grid { grid-template-columns: 1fr; }
      .run-detail { grid-template-columns: 1fr; }
    }
  `]
})
export class ExecutionHistoryComponent {
  activeStatus = 'All';
  searchTerm = '';
  expandedRun = '';
  statusFilters = ['All', 'Success', 'Running', 'Failed', 'Warning'];

  kpis = [
    { label: 'Total Runs', value: '1,247', trend: '↑ 18%', trendDir: 'positive', footnote: 'last 7 days', accent: 'teal' },
    { label: 'Success Rate', value: '98.4%', trend: '↑ 0.6%', trendDir: 'positive', footnote: '1,227 succeeded', accent: 'green' },
    { label: 'Avg Duration', value: '6.2m', trend: '↓ 0.8m', trendDir: 'positive', footnote: 'per execution', accent: 'blue' },
    { label: 'Total Tokens', value: '1.24M', trend: '↑ 12%', trendDir: '', footnote: 'API consumption', accent: 'purple' },
    { label: 'Total Cost', value: '$12.48', trend: '↓ $1.20', trendDir: 'positive', footnote: 'last 7 days', accent: 'amber' },
  ];

  volumeData = [
    { label: 'Jan 31', total: 168, success: 164, fail: 2, warn: 2 },
    { label: 'Feb 1', total: 182, success: 178, fail: 1, warn: 3 },
    { label: 'Feb 2', total: 174, success: 171, fail: 2, warn: 1 },
    { label: 'Feb 3', total: 198, success: 195, fail: 1, warn: 2 },
    { label: 'Feb 4', total: 186, success: 182, fail: 3, warn: 1 },
    { label: 'Feb 5', total: 192, success: 189, fail: 1, warn: 2 },
    { label: 'Feb 6', total: 147, success: 144, fail: 1, warn: 2 },
  ];

  runs: any[] = [
    {
      id: 'RUN-4821', workflow: 'Month-End Close', agent: 'Close Agent', trigger: 'Manual',
      triggerBg: '#E8F5F1', triggerColor: '#0D6B5C', icon: 'bi-calendar-check', iconBg: '#E8F5F1', iconColor: '#0D6B5C',
      started: 'Today 2:00 PM', duration: '14m 22s', steps: '3/5', tokens: '42.1K', cost: '$0.42',
      status: 'Running', badgeClass: 'afda-badge-high', statusKey: 'Running',
      stepDetails: [
        { name: 'Sub-ledger Close', duration: '3m 12s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
        { name: 'JE Posting', duration: '4m 48s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
        { name: 'Reconciliation', duration: '6m 22s', pct: 65, statusBg: '#E8F5F1', statusIcon: 'bi-play-fill', statusColor: 'var(--primary)' },
        { name: 'Review', duration: '—', pct: 0, statusBg: '#F3F4F6', statusIcon: 'bi-circle', statusColor: '#9CA3AF' },
        { name: 'Certify', duration: '—', pct: 0, statusBg: '#F3F4F6', statusIcon: 'bi-circle', statusColor: '#9CA3AF' },
      ],
      errorMsg: '', outputSummary: 'Phase 1 complete. Phase 2 at 5/6. Reconciliation in progress — 78% matched.'
    },
    {
      id: 'RUN-4820', workflow: 'Variance Commentary', agent: 'Flux Agent', trigger: 'Scheduled',
      triggerBg: '#EDE9FE', triggerColor: '#7C3AED', icon: 'bi-chat-text', iconBg: '#EDE9FE', iconColor: '#7C3AED',
      started: 'Today 2:01 PM', duration: '3m 45s', steps: '2/4', tokens: '18.4K', cost: '$0.18',
      status: 'Running', badgeClass: 'afda-badge-high', statusKey: 'Running',
      stepDetails: [
        { name: 'Extract Data', duration: '0m 42s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
        { name: 'Analyze Variances', duration: '1m 18s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
        { name: 'Generate Commentary', duration: '1m 45s', pct: 50, statusBg: '#E8F5F1', statusIcon: 'bi-play-fill', statusColor: 'var(--primary)' },
        { name: 'Review Output', duration: '—', pct: 0, statusBg: '#F3F4F6', statusIcon: 'bi-circle', statusColor: '#9CA3AF' },
      ],
      errorMsg: '', outputSummary: '8 of 12 commentaries generated. Processing remaining material variances.'
    },
    {
      id: 'RUN-4819', workflow: '13-Week Forecast', agent: 'Forecast Agent', trigger: 'Scheduled',
      triggerBg: '#FEF3C7', triggerColor: '#D97706', icon: 'bi-graph-up-arrow', iconBg: '#FEF3C7', iconColor: '#D97706',
      started: 'Today 1:45 PM', duration: '6m 02s', steps: '4/4', tokens: '28.6K', cost: '$0.29',
      status: 'Success', badgeClass: 'afda-badge-success', statusKey: 'Success',
      stepDetails: [
        { name: 'Collect Data', duration: '1m 22s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
        { name: 'Run Model', duration: '2m 48s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
        { name: 'Scenario Analysis', duration: '1m 12s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
        { name: 'Publish', duration: '0m 40s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
      ],
      errorMsg: '', outputSummary: '13-week forecast updated. Ending cash Week 13: $5.6M. Flagged Week 6 dip ($3.8M).'
    },
    {
      id: 'RUN-4818', workflow: 'Daily Reconciliation', agent: 'Recon Agent', trigger: 'Scheduled',
      triggerBg: '#EFF6FF', triggerColor: '#2563EB', icon: 'bi-check2-all', iconBg: '#EFF6FF', iconColor: '#2563EB',
      started: 'Today 7:00 AM', duration: '8m 14s', steps: '4/4', tokens: '34.2K', cost: '$0.34',
      status: 'Success', badgeClass: 'afda-badge-success', statusKey: 'Success',
      stepDetails: [
        { name: 'Fetch Statements', duration: '1m 08s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
        { name: 'Auto-Match', duration: '4m 22s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
        { name: 'Exception Review', duration: '2m 04s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
        { name: 'Post Results', duration: '0m 40s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
      ],
      errorMsg: '', outputSummary: '142 transactions matched. 12 exceptions flagged for manual review.'
    },
    {
      id: 'RUN-4817', workflow: 'AR Collection', agent: 'AR Agent', trigger: 'Event',
      triggerBg: '#FCE7F3', triggerColor: '#DB2777', icon: 'bi-envelope', iconBg: '#FCE7F3', iconColor: '#DB2777',
      started: 'Today 12:00 PM', duration: '2m 18s', steps: '4/4', tokens: '8.2K', cost: '$0.08',
      status: 'Warning', badgeClass: 'afda-badge-high', statusKey: 'Warning',
      stepDetails: [
        { name: 'Scan AR Aging', duration: '0m 28s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
        { name: 'Classify Priority', duration: '0m 32s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
        { name: 'Send Reminders', duration: '1m 02s', pct: 100, statusBg: '#FEF3C7', statusIcon: 'bi-exclamation-triangle', statusColor: '#D97706' },
        { name: 'Log Activity', duration: '0m 16s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
      ],
      errorMsg: '', outputSummary: '2 reminders sent. TechVentures email bounced — contact info may be outdated.'
    },
    {
      id: 'RUN-4816', workflow: 'IC Elimination', agent: 'JE Agent', trigger: 'Manual',
      triggerBg: '#E8F5F1', triggerColor: '#0D6B5C', icon: 'bi-journal-plus', iconBg: '#E8F5F1', iconColor: '#0D6B5C',
      started: 'Yesterday 4:30 PM', duration: '1m 42s', steps: '2/3', tokens: '12.4K', cost: '$0.12',
      status: 'Failed', badgeClass: 'afda-badge-critical', statusKey: 'Failed',
      stepDetails: [
        { name: 'Validate Balances', duration: '0m 22s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
        { name: 'Generate Entries', duration: '0m 58s', pct: 100, statusBg: '#ECFDF5', statusIcon: 'bi-check', statusColor: '#059669' },
        { name: 'Post to GL', duration: '0m 22s', pct: 40, statusBg: '#FEE2E2', statusIcon: 'bi-x', statusColor: '#DC2626' },
      ],
      errorMsg: 'GL posting failed: Account 9100 (IC Elimination) is locked for period January 2026. Unlock required before posting.',
      outputSummary: '6 elimination entries generated but posting blocked by period lock.'
    },
  ];

  get filteredRuns() {
    let result = this.runs;
    if (this.activeStatus !== 'All') result = result.filter(r => r.statusKey === this.activeStatus);
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(r => r.workflow.toLowerCase().includes(t) || r.agent.toLowerCase().includes(t) || r.id.toLowerCase().includes(t));
    }
    return result;
  }

  costByAgent = [
    { name: 'Close Agent', cost: '$4.20', tokens: '420K', pct: 34, color: '#0D6B5C' },
    { name: 'Recon Agent', cost: '$3.42', tokens: '342K', pct: 27, color: '#2563EB' },
    { name: 'Forecast Agent', cost: '$2.06', tokens: '206K', pct: 17, color: '#D97706' },
    { name: 'Flux Agent', cost: '$1.48', tokens: '148K', pct: 12, color: '#7C3AED' },
    { name: 'Other', cost: '$1.32', tokens: '124K', pct: 10, color: '#9CA3AF' },
  ];

  errorBreakdown = [
    { type: 'Period Lock', description: 'GL posting blocked by locked period', count: 3, trend: '↓ 2', trendDir: 'positive', icon: 'bi-lock', iconBg: '#FEE2E2', iconColor: '#DC2626' },
    { type: 'Timeout', description: 'Agent exceeded max execution time', count: 2, trend: '↑ 1', trendDir: 'negative', icon: 'bi-clock', iconBg: '#FEF3C7', iconColor: '#D97706' },
    { type: 'Data Missing', description: 'Required input data not available', count: 2, trend: '→ 0', trendDir: '', icon: 'bi-database-x', iconBg: '#EDE9FE', iconColor: '#7C3AED' },
    { type: 'API Error', description: 'External service returned error', count: 1, trend: '↓ 1', trendDir: 'positive', icon: 'bi-cloud-slash', iconBg: '#EFF6FF', iconColor: '#2563EB' },
  ];

  toggleRun(id: string) { this.expandedRun = this.expandedRun === id ? '' : id; }

  onSearch(event: Event) { this.searchTerm = (event.target as HTMLInputElement).value; }
}