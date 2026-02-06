import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-workflow-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/agent-studio/agent-console">Agent Studio</a>
      <span class="separator">/</span>
      <span class="current">Workflow Manager</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Workflow Manager</h1>
        <p class="afda-page-subtitle">Orchestration workflows, scheduling, and execution management</p>
      </div>
      <div class="afda-page-actions">
        <div class="toggle-group">
          @for (v of viewModes; track v) {
            <button class="toggle-btn" [class.active]="activeView === v" (click)="activeView = v">
              <i [class]="'bi ' + v.icon"></i> {{ v.label }}
            </button>
          }
        </div>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-plus-lg"></i> New Workflow
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="wf-stats stagger">
      @for (s of wfStats; track s.label) {
        <div class="wf-stat-card">
          <div class="wfs-value font-mono">{{ s.value }}</div>
          <div class="wfs-label">{{ s.label }}</div>
          <div class="wfs-trend" [ngClass]="s.trendDir">{{ s.trend }}</div>
        </div>
      }
    </div>

    <!-- Workflow Cards Grid -->
    <div class="wf-grid stagger">
      @for (wf of workflows; track wf.id) {
        <div class="wf-card" [class.active-run]="wf.status === 'Running'">
          <!-- Card Header -->
          <div class="wfc-header">
            <div class="wfc-icon" [style.background]="wf.iconBg">
              <i [class]="'bi ' + wf.icon" [style.color]="wf.iconColor"></i>
            </div>
            <div class="wfc-info">
              <div class="wfc-name">{{ wf.name }}</div>
              <div class="wfc-engine">{{ wf.engine }}</div>
            </div>
            <span class="afda-badge" [ngClass]="wf.badgeClass">{{ wf.status }}</span>
          </div>

          <!-- Description -->
          <div class="wfc-desc">{{ wf.description }}</div>

          <!-- DAG Preview -->
          <div class="dag-preview">
            @for (step of wf.steps; track step.name; let last = $last) {
              <div class="dag-step" [class.complete]="step.done" [class.active]="step.active">
                <div class="dag-node" [style.borderColor]="step.done ? '#059669' : step.active ? 'var(--primary)' : '#D1D5DB'">
                  @if (step.done) { <i class="bi bi-check" style="color: #059669; font-size: 11px;"></i> }
                  @else if (step.active) { <div class="dag-pulse"></div> }
                  @else { <div class="dag-dot"></div> }
                </div>
                <span class="dag-label">{{ step.name }}</span>
                @if (!last) { <div class="dag-arrow"><i class="bi bi-chevron-right"></i></div> }
              </div>
            }
          </div>

          <!-- Metrics Row -->
          <div class="wfc-metrics">
            <div class="wfc-metric">
              <span class="wfcm-label">Last Run</span>
              <span class="wfcm-value">{{ wf.lastRun }}</span>
            </div>
            <div class="wfc-metric">
              <span class="wfcm-label">Duration</span>
              <span class="wfcm-value font-mono">{{ wf.duration }}</span>
            </div>
            <div class="wfc-metric">
              <span class="wfcm-label">Success</span>
              <span class="wfcm-value font-mono">{{ wf.successRate }}</span>
            </div>
            <div class="wfc-metric">
              <span class="wfcm-label">Schedule</span>
              <span class="wfcm-value">{{ wf.schedule }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="wfc-actions">
            <button class="afda-btn afda-btn-outline" style="flex: 1; font-size: 11px; padding: 5px 8px; justify-content: center;">
              <i class="bi bi-play-fill"></i> Run
            </button>
            <button class="afda-btn afda-btn-outline" style="flex: 1; font-size: 11px; padding: 5px 8px; justify-content: center;">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="afda-btn afda-btn-outline" style="font-size: 11px; padding: 5px 8px;">
              <i class="bi bi-clock-history"></i>
            </button>
            <button class="afda-btn afda-btn-outline" style="font-size: 11px; padding: 5px 8px;">
              <i class="bi bi-three-dots"></i>
            </button>
          </div>
        </div>
      }
    </div>

    <!-- Execution History + Schedule -->
    <div class="bottom-grid">
      <!-- Recent Runs -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.16s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Recent Runs</div>
          <button class="afda-btn afda-btn-outline" style="font-size: 11px; padding: 4px 10px;">View all</button>
        </div>
        <table class="afda-table">
          <thead>
            <tr>
              <th>Workflow</th>
              <th>Trigger</th>
              <th>Started</th>
              <th>Duration</th>
              <th>Steps</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (run of recentRuns; track run.id) {
              <tr>
                <td class="fw-600">{{ run.workflow }}</td>
                <td>
                  <span class="trigger-chip" [style.background]="run.triggerBg" [style.color]="run.triggerColor">
                    <i [class]="'bi ' + run.triggerIcon" style="font-size: 10px;"></i>
                    {{ run.trigger }}
                  </span>
                </td>
                <td style="font-size: 12px; color: var(--text-secondary);">{{ run.started }}</td>
                <td class="font-mono" style="font-size: 12px;">{{ run.duration }}</td>
                <td class="font-mono" style="font-size: 12px;">{{ run.steps }}</td>
                <td><span class="afda-badge" [ngClass]="run.badgeClass">{{ run.status }}</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Upcoming Schedule -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.18s both;">
        <div class="afda-card-title" style="margin-bottom: 14px;">Upcoming Schedule</div>
        @for (sched of upcomingSchedule; track sched.time) {
          <div class="sched-row">
            <div class="sched-time font-mono">{{ sched.time }}</div>
            <div class="sched-info">
              <div class="sched-name">{{ sched.name }}</div>
              <div class="sched-freq">{{ sched.frequency }}</div>
            </div>
            <div class="sched-toggle" [class.active]="sched.enabled" (click)="sched.enabled = !sched.enabled">
              <div class="sched-knob"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Toggle Group */
    .toggle-group {
      display: flex; border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden;
    }

    .toggle-btn {
      padding: 6px 12px; font-size: 12px; font-weight: 500;
      border: none; background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; font-family: var(--font-sans);
      display: flex; align-items: center; gap: 4px;
      transition: all 0.15s;
      &:not(:last-child) { border-right: 1px solid var(--border); }
      &:hover { background: var(--bg-section); }
      &.active { background: var(--primary); color: white; font-weight: 600; }
    }

    /* Stats */
    .wf-stats {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 12px; margin-bottom: 20px;
    }

    .wf-stat-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-md); padding: 14px 16px;
      box-shadow: var(--shadow-sm);
      animation: fadeUp 0.4s ease both;
    }

    .wfs-value { font-size: 20px; font-weight: 700; color: var(--text-primary); }
    .wfs-label { font-size: 11px; color: var(--text-tertiary); margin-top: 1px; }
    .wfs-trend { font-size: 11px; margin-top: 4px; font-weight: 500; }

    /* Workflow Cards */
    .wf-grid {
      display: grid; grid-template-columns: repeat(2, 1fr);
      gap: 14px; margin-bottom: 20px;
    }

    .wf-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 20px;
      box-shadow: var(--shadow-card);
      animation: fadeUp 0.4s ease both;
      transition: border-color 0.15s;
      &:hover { border-color: #D1D5DB; }
      &.active-run { border-left: 3px solid var(--primary); }
    }

    .wfc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }

    .wfc-icon {
      width: 38px; height: 38px; border-radius: var(--radius-md);
      display: grid; place-items: center; font-size: 17px; flex-shrink: 0;
    }

    .wfc-info { flex: 1; }
    .wfc-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .wfc-engine { font-size: 11px; color: var(--text-tertiary); }

    .wfc-desc { font-size: 12.5px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.5; }

    /* DAG Preview */
    .dag-preview {
      display: flex; align-items: center; gap: 2px;
      padding: 12px 8px; background: var(--bg-section);
      border-radius: var(--radius-sm); margin-bottom: 14px;
      overflow-x: auto;
    }

    .dag-step {
      display: flex; align-items: center; gap: 4px;
      white-space: nowrap;
    }

    .dag-node {
      width: 22px; height: 22px; border-radius: 50%;
      border: 2px solid #D1D5DB; display: grid; place-items: center;
      background: white; flex-shrink: 0; transition: all 0.2s;
    }

    .dag-step.complete .dag-node { border-color: #059669; background: #ECFDF5; }
    .dag-step.active .dag-node { border-color: var(--primary); background: var(--primary-subtle); }

    .dag-pulse {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--primary);
      animation: pulse 1.5s ease-in-out infinite;
    }

    .dag-dot { width: 4px; height: 4px; border-radius: 50%; background: #D1D5DB; }

    .dag-label { font-size: 10px; color: var(--text-secondary); font-weight: 500; }
    .dag-step.complete .dag-label { color: #059669; }
    .dag-step.active .dag-label { color: var(--primary); font-weight: 600; }

    .dag-arrow {
      font-size: 9px; color: #D1D5DB; margin: 0 2px;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.3); }
    }

    /* Metrics */
    .wfc-metrics {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 6px; margin-bottom: 14px;
    }

    .wfc-metric { text-align: center; }
    .wfcm-label { display: block; font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; }
    .wfcm-value { display: block; font-size: 12px; font-weight: 600; color: var(--text-primary); margin-top: 1px; }

    .wfc-actions { display: flex; gap: 6px; }

    /* Bottom Grid */
    .bottom-grid {
      display: grid; grid-template-columns: 1fr 340px;
      gap: 16px;
    }

    .trigger-chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; font-size: 10.5px; font-weight: 600;
      border-radius: 10px;
    }

    /* Schedule */
    .sched-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .sched-time {
      font-size: 13px; font-weight: 700; color: var(--primary);
      min-width: 64px;
    }

    .sched-info { flex: 1; }
    .sched-name { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
    .sched-freq { font-size: 11px; color: var(--text-tertiary); }

    .sched-toggle {
      width: 36px; height: 20px; background: #D1D5DB;
      border-radius: 10px; position: relative; cursor: pointer;
      transition: background 0.2s;
      &.active { background: var(--primary); }
    }

    .sched-knob {
      width: 16px; height: 16px; background: white;
      border-radius: 50%; position: absolute; top: 2px; left: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
      transition: left 0.2s;
    }

    .sched-toggle.active .sched-knob { left: 18px; }

    @media (max-width: 1100px) {
      .wf-stats { grid-template-columns: repeat(3, 1fr); }
      .wf-grid { grid-template-columns: 1fr; }
      .bottom-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class WorkflowManagerComponent {
  activeView = { label: 'Cards', icon: 'bi-grid' };
  viewModes = [
    { label: 'Cards', icon: 'bi-grid' },
    { label: 'List', icon: 'bi-list' },
  ];

  wfStats = [
    { value: '12', label: 'Total Workflows', trend: '+2 this month', trendDir: 'positive' },
    { value: '4', label: 'Running Now', trend: '2 scheduled', trendDir: '' },
    { value: '842', label: 'Runs This Month', trend: '↑ 18%', trendDir: 'positive' },
    { value: '98.4%', label: 'Success Rate', trend: '↑ 1.2%', trendDir: 'positive' },
    { value: '6.2m', label: 'Avg Duration', trend: '↓ 0.8m', trendDir: 'positive' },
  ];

  workflows = [
    {
      id: 'wf-close', name: 'Month-End Close', engine: 'LangGraph · Multi-Agent',
      description: 'Orchestrates the full month-end close — sub-ledger close, JE posting, reconciliation, and certification.',
      icon: 'bi-calendar-check', iconBg: '#E8F5F1', iconColor: '#0D6B5C',
      status: 'Running', badgeClass: 'afda-badge-high',
      lastRun: 'Now', duration: '14m 22s', successRate: '99.4%', schedule: 'Monthly',
      steps: [
        { name: 'Sub-ledger', done: true, active: false },
        { name: 'JE Post', done: true, active: false },
        { name: 'Recon', done: false, active: true },
        { name: 'Review', done: false, active: false },
        { name: 'Certify', done: false, active: false },
      ]
    },
    {
      id: 'wf-recon', name: 'Daily Reconciliation', engine: 'AWS Bedrock · Single Agent',
      description: 'Auto-matches bank transactions to GL entries using 4-tier matching rules and AI pattern detection.',
      icon: 'bi-check2-all', iconBg: '#EFF6FF', iconColor: '#2563EB',
      status: 'Scheduled', badgeClass: 'afda-badge-medium',
      lastRun: 'Today 7:00 AM', duration: '8m 14s', successRate: '97.8%', schedule: 'Daily 7AM',
      steps: [
        { name: 'Fetch', done: true, active: false },
        { name: 'Match', done: true, active: false },
        { name: 'Review', done: true, active: false },
        { name: 'Post', done: true, active: false },
      ]
    },
    {
      id: 'wf-flux', name: 'Variance Commentary', engine: 'LangGraph · Single Agent',
      description: 'Generates AI-powered flux commentary for material P&L variances against budget and prior period.',
      icon: 'bi-chat-text', iconBg: '#EDE9FE', iconColor: '#7C3AED',
      status: 'Running', badgeClass: 'afda-badge-high',
      lastRun: 'Now', duration: '3m 45s', successRate: '96.2%', schedule: 'Monthly',
      steps: [
        { name: 'Extract', done: true, active: false },
        { name: 'Analyze', done: true, active: false },
        { name: 'Generate', done: false, active: true },
        { name: 'Review', done: false, active: false },
      ]
    },
    {
      id: 'wf-forecast', name: '13-Week Cash Forecast', engine: 'n8n · Scheduled',
      description: 'Refreshes rolling 13-week cash forecast using AR/AP projections, payroll schedule, and historical patterns.',
      icon: 'bi-graph-up-arrow', iconBg: '#FEF3C7', iconColor: '#D97706',
      status: 'Complete', badgeClass: 'afda-badge-success',
      lastRun: 'Today 1:45 PM', duration: '6m 02s', successRate: '99.1%', schedule: 'Weekly Mon',
      steps: [
        { name: 'Collect', done: true, active: false },
        { name: 'Model', done: true, active: false },
        { name: 'Scenario', done: true, active: false },
        { name: 'Publish', done: true, active: false },
      ]
    },
    {
      id: 'wf-ar', name: 'AR Collection Workflow', engine: 'n8n · Event-Driven',
      description: 'Monitors AR aging and sends automated collection reminders at 30, 60, and 90 day thresholds.',
      icon: 'bi-envelope', iconBg: '#FCE7F3', iconColor: '#DB2777',
      status: 'Idle', badgeClass: 'afda-badge-medium',
      lastRun: 'Today 12:00 PM', duration: '2m 18s', successRate: '94.6%', schedule: 'On trigger',
      steps: [
        { name: 'Scan AR', done: true, active: false },
        { name: 'Classify', done: true, active: false },
        { name: 'Send', done: true, active: false },
        { name: 'Log', done: true, active: false },
      ]
    },
    {
      id: 'wf-report', name: 'Financial Package Gen', engine: 'LangGraph · Multi-Agent',
      description: 'Compiles monthly P&L, balance sheet, cash flow, and executive summary into a board-ready package.',
      icon: 'bi-file-earmark-text', iconBg: '#FEE2E2', iconColor: '#DC2626',
      status: 'Scheduled', badgeClass: 'afda-badge-medium',
      lastRun: 'Jan 8', duration: '12m 40s', successRate: '98.8%', schedule: 'Monthly',
      steps: [
        { name: 'Extract', done: false, active: false },
        { name: 'Format', done: false, active: false },
        { name: 'Charts', done: false, active: false },
        { name: 'Compile', done: false, active: false },
        { name: 'Deliver', done: false, active: false },
      ]
    },
  ];

  recentRuns = [
    { id: 1, workflow: 'Month-End Close', trigger: 'Manual', triggerIcon: 'bi-person', triggerBg: '#E8F5F1', triggerColor: '#0D6B5C', started: '2:00 PM', duration: '14m 22s', steps: '3/5', status: 'Running', badgeClass: 'afda-badge-high' },
    { id: 2, workflow: 'Variance Commentary', trigger: 'Scheduled', triggerIcon: 'bi-clock', triggerBg: '#EDE9FE', triggerColor: '#7C3AED', started: '2:01 PM', duration: '3m 45s', steps: '2/4', status: 'Running', badgeClass: 'afda-badge-high' },
    { id: 3, workflow: '13-Week Forecast', trigger: 'Scheduled', triggerIcon: 'bi-clock', triggerBg: '#FEF3C7', triggerColor: '#D97706', started: '1:45 PM', duration: '6m 02s', steps: '4/4', status: 'Complete', badgeClass: 'afda-badge-success' },
    { id: 4, workflow: 'Daily Reconciliation', trigger: 'Scheduled', triggerIcon: 'bi-clock', triggerBg: '#EFF6FF', triggerColor: '#2563EB', started: '7:00 AM', duration: '8m 14s', steps: '4/4', status: 'Complete', badgeClass: 'afda-badge-success' },
    { id: 5, workflow: 'AR Collection', trigger: 'Event', triggerIcon: 'bi-lightning', triggerBg: '#FCE7F3', triggerColor: '#DB2777', started: '12:00 PM', duration: '2m 18s', steps: '4/4', status: 'Complete', badgeClass: 'afda-badge-success' },
  ];

  upcomingSchedule = [
    { time: '7:00 AM', name: 'Daily Reconciliation', frequency: 'Every day', enabled: true },
    { time: '8:00 AM', name: 'Risk Monitoring Scan', frequency: 'Every day', enabled: true },
    { time: '9:00 AM', name: 'AR Aging Check', frequency: 'Mon/Wed/Fri', enabled: true },
    { time: '6:00 PM', name: 'Daily Close Tasks', frequency: 'Weekdays', enabled: true },
    { time: '10:00 PM', name: 'Forecast Data Refresh', frequency: 'Sunday', enabled: false },
  ];
}