import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-accounting-close',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/accounting/general-ledger">Accounting</a>
      <span class="separator">/</span>
      <span class="current">Close Management</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Close Management</h1>
        <p class="afda-page-subtitle">Period close checklist, task tracking, and certification workflow</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>January 2026</option>
          <option>December 2025</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-clock-history"></i> History
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-lock"></i> Certify & Lock Period
        </button>
      </div>
    </div>

    <!-- Close Status Banner -->
    <div class="close-banner stagger">
      <div class="cb-progress">
        <div class="cb-ring">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" stroke-width="8"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--primary)" stroke-width="8"
                    stroke-linecap="round" stroke-dasharray="264"
                    [attr.stroke-dashoffset]="264 * (1 - closePct / 100)"
                    transform="rotate(-90 50 50)"/>
          </svg>
          <div class="cb-ring-center">
            <span class="cb-ring-pct font-mono">{{ closePct }}%</span>
            <span class="cb-ring-label">Complete</span>
          </div>
        </div>
        <div>
          <div class="cb-title">January 2026 Close</div>
          <div class="cb-status">
            <span class="afda-badge afda-badge-high">In Progress</span>
            <span class="cb-date">Day 5 of 7 · Target: Feb 7</span>
          </div>
        </div>
      </div>
      <div class="cb-stats">
        @for (stat of closeStats; track stat.label) {
          <div class="cb-stat">
            <div class="cb-stat-value font-mono" [style.color]="stat.color">{{ stat.value }}</div>
            <div class="cb-stat-label">{{ stat.label }}</div>
          </div>
        }
      </div>
    </div>

    <!-- Timeline -->
    <div class="afda-card" style="animation: fadeUp 0.4s ease 0.06s both;">
      <div class="afda-card-title" style="margin-bottom: 14px;">Close Timeline</div>
      <div class="timeline-track">
        @for (day of timelineDays; track day.label) {
          <div class="tl-day" [class.today]="day.isToday" [class.past]="day.isPast" [class.future]="day.isFuture">
            <div class="tl-marker" [style.background]="day.isToday ? 'var(--primary)' : day.isPast ? '#059669' : '#D1D5DB'">
              @if (day.isPast) { <i class="bi bi-check" style="color: white; font-size: 10px;"></i> }
              @if (day.isToday) { <div class="tl-pulse"></div> }
            </div>
            <div class="tl-label">{{ day.label }}</div>
            <div class="tl-date">{{ day.date }}</div>
            <div class="tl-tasks">{{ day.tasks }}</div>
          </div>
        }
        <div class="tl-line"></div>
      </div>
    </div>

    <!-- Checklist + Side Panel -->
    <div class="close-grid">
      <!-- Main Checklist -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.1s both;">
        <div class="afda-card-header">
          <div class="afda-card-title">Close Checklist</div>
          <div style="display: flex; gap: 6px;">
            @for (f of checklistFilters; track f) {
              <button class="filter-chip" [class.active]="activeChecklistFilter === f"
                      (click)="activeChecklistFilter = f">{{ f }}</button>
            }
          </div>
        </div>

        @for (phase of filteredPhases; track phase.name) {
          <div class="phase-section">
            <div class="phase-header">
              <div class="phase-left">
                <span class="phase-dot" [style.background]="phase.color"></span>
                <span class="phase-name">{{ phase.name }}</span>
              </div>
              <div class="phase-right">
                <span class="phase-progress font-mono">{{ phase.completed }}/{{ phase.total }}</span>
                <div class="phase-bar">
                  <div class="phase-bar-fill" [style.width.%]="(phase.completed / phase.total) * 100"
                       [style.background]="phase.color"></div>
                </div>
              </div>
            </div>

            @for (task of phase.tasks; track task.name) {
              <div class="task-row" [class.completed]="task.status === 'Complete'">
                <div class="task-check" [class.checked]="task.status === 'Complete'"
                     [class.in-progress]="task.status === 'In Progress'">
                  @if (task.status === 'Complete') { <i class="bi bi-check"></i> }
                  @if (task.status === 'In Progress') { <i class="bi bi-play-fill"></i> }
                </div>
                <div class="task-info">
                  <div class="task-name">{{ task.name }}</div>
                  <div class="task-meta">{{ task.description }}</div>
                </div>
                <div class="task-assignee">
                  <div class="ta-avatar" [style.background]="task.assigneeColor">{{ task.assigneeInit }}</div>
                  <span class="ta-name">{{ task.assignee }}</span>
                </div>
                <div class="task-due">
                  <span [class]="task.overdue ? 'text-unfavorable' : ''">{{ task.due }}</span>
                </div>
                <span class="afda-badge" [ngClass]="task.badgeClass">{{ task.status }}</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- Side Panel -->
      <div class="close-side">
        <!-- Blockers -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.12s both;">
          <div class="afda-card-header">
            <div class="afda-card-title">Blockers</div>
            <span class="afda-badge afda-badge-danger">2 active</span>
          </div>
          @for (blocker of blockers; track blocker.title) {
            <div class="blocker-item">
              <div class="blocker-icon" [style.background]="blocker.iconBg">
                <i [class]="'bi ' + blocker.icon" [style.color]="blocker.iconColor"></i>
              </div>
              <div class="blocker-info">
                <div class="blocker-title">{{ blocker.title }}</div>
                <div class="blocker-desc">{{ blocker.description }}</div>
                <div class="blocker-impact">
                  <i class="bi bi-exclamation-triangle" style="font-size: 10px;"></i>
                  Blocks: {{ blocker.blocks }}
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Period Comparison -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.14s both;">
          <div class="afda-card-title" style="margin-bottom: 14px;">Close Speed (Last 6)</div>
          <div class="speed-chart">
            @for (month of closeHistory; track month.label) {
              <div class="speed-col">
                <div class="speed-bar-area">
                  <div class="speed-bar" [style.height.%]="month.barH"
                       [style.background]="month.days <= 5 ? '#059669' : month.days <= 7 ? 'var(--primary)' : '#D97706'">
                  </div>
                </div>
                <div class="speed-val font-mono">{{ month.days }}d</div>
                <div class="speed-label">{{ month.label }}</div>
              </div>
            }
          </div>
          <div class="speed-target">
            <span class="speed-target-line"></span>
            <span class="speed-target-text">Target: 5 business days</span>
          </div>
        </div>

        <!-- AI Panel -->
        <div class="afda-ai-panel" style="animation: fadeUp 0.4s ease 0.16s both;">
          <div class="afda-ai-panel-header">
            <div class="afda-ai-icon"><i class="bi bi-stars"></i></div>
            <span class="afda-ai-label">AI Close Assistant</span>
          </div>
          <div class="afda-ai-body">
            <p><strong>On track for Feb 7 target.</strong> Two items need attention:</p>
            <p>The accrued expenses reconciliation (Task 3.2) is the critical path — once the 7 unmatched items are resolved, the remaining tasks can complete in parallel.</p>
            <p><strong>Suggestion:</strong> Auto-match has 3 high-confidence suggestions ready. Accepting them would bring the recon to 94% and likely unblock certification.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Close Banner */
    .close-banner {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 22px 28px;
      box-shadow: var(--shadow-card); margin-bottom: 20px;
      animation: fadeUp 0.4s ease both;
    }

    .cb-progress { display: flex; align-items: center; gap: 20px; }

    .cb-ring { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
    .cb-ring svg { width: 100%; height: 100%; }

    .cb-ring-center {
      position: absolute; inset: 0; display: flex;
      flex-direction: column; align-items: center; justify-content: center;
    }

    .cb-ring-pct { font-size: 18px; font-weight: 700; color: var(--primary); }
    .cb-ring-label { font-size: 10px; color: var(--text-tertiary); }

    .cb-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }

    .cb-status {
      display: flex; align-items: center; gap: 8px; margin-top: 4px;
    }

    .cb-date { font-size: 12px; color: var(--text-secondary); }

    .cb-stats { display: flex; gap: 24px; }

    .cb-stat { text-align: center; }
    .cb-stat-value { font-size: 22px; font-weight: 700; }
    .cb-stat-label { font-size: 10.5px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; margin-top: 2px; }

    /* Timeline */
    .timeline-track {
      display: flex; justify-content: space-between; position: relative;
      padding: 0 20px;
    }

    .tl-line {
      position: absolute; top: 10px; left: 40px; right: 40px;
      height: 3px; background: #E5E7EB; z-index: 0;
    }

    .tl-day {
      display: flex; flex-direction: column; align-items: center;
      z-index: 1; min-width: 70px;
    }

    .tl-marker {
      width: 22px; height: 22px; border-radius: 50%;
      display: grid; place-items: center; margin-bottom: 6px;
      position: relative;
    }

    .tl-pulse {
      width: 8px; height: 8px; background: white; border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
    }

    .tl-label { font-size: 11.5px; font-weight: 600; color: var(--text-primary); }
    .tl-date { font-size: 10.5px; color: var(--text-tertiary); }
    .tl-tasks { font-size: 10px; color: var(--text-tertiary); margin-top: 2px; }

    .tl-day.today .tl-label { color: var(--primary); font-weight: 700; }

    /* Close Grid */
    .close-grid {
      display: grid; grid-template-columns: 1fr 360px;
      gap: 16px; margin-top: 16px;
    }

    .close-side { display: flex; flex-direction: column; gap: 16px; }

    /* Filter Chips */
    .filter-chip {
      padding: 4px 10px; font-size: 11.5px; font-weight: 500;
      border: 1px solid var(--border); border-radius: 20px;
      background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s; font-family: var(--font-sans);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 600; }
    }

    /* Phase Sections */
    .phase-section {
      margin-bottom: 8px;
      &:last-child { margin-bottom: 0; }
    }

    .phase-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 0; border-bottom: 1px solid var(--border-light);
    }

    .phase-left { display: flex; align-items: center; gap: 8px; }
    .phase-dot { width: 10px; height: 10px; border-radius: 3px; }
    .phase-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }

    .phase-right { display: flex; align-items: center; gap: 8px; }
    .phase-progress { font-size: 11.5px; color: var(--text-secondary); }

    .phase-bar {
      width: 60px; height: 6px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .phase-bar-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }

    /* Task Rows */
    .task-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 0 12px 8px; border-bottom: 1px solid var(--border-light);
      transition: background 0.1s;
      &:hover { background: var(--bg-section); margin: 0 -22px; padding-left: 30px; padding-right: 22px; border-radius: var(--radius-sm); }
      &:last-child { border-bottom: none; }
      &.completed { opacity: 0.65; }
    }

    .task-check {
      width: 24px; height: 24px; border-radius: 50%;
      border: 2px solid #D1D5DB; display: grid; place-items: center;
      font-size: 12px; flex-shrink: 0; transition: all 0.15s;
      &.checked { background: #059669; border-color: #059669; color: white; }
      &.in-progress { background: var(--primary); border-color: var(--primary); color: white; }
    }

    .task-info { flex: 1; min-width: 0; }
    .task-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .task-meta { font-size: 11px; color: var(--text-tertiary); margin-top: 1px; }

    .task-assignee {
      display: flex; align-items: center; gap: 6px; min-width: 100px;
    }

    .ta-avatar {
      width: 22px; height: 22px; border-radius: 50%;
      display: grid; place-items: center;
      color: white; font-size: 9px; font-weight: 700;
    }

    .ta-name { font-size: 11.5px; color: var(--text-secondary); }

    .task-due {
      font-size: 11.5px; color: var(--text-secondary); min-width: 50px;
      text-align: right;
    }

    /* Blockers */
    .blocker-item {
      display: flex; gap: 12px; padding: 12px 0;
      border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .blocker-icon {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 14px; flex-shrink: 0;
    }

    .blocker-title { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
    .blocker-desc { font-size: 11.5px; color: var(--text-secondary); margin-top: 2px; }

    .blocker-impact {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; color: #DC2626; margin-top: 4px;
      font-weight: 500;
    }

    /* Speed Chart */
    .speed-chart {
      display: flex; align-items: flex-end; gap: 8px; height: 100px;
    }

    .speed-col { flex: 1; text-align: center; height: 100%; display: flex; flex-direction: column; }
    .speed-bar-area { flex: 1; display: flex; align-items: flex-end; justify-content: center; }

    .speed-bar {
      width: 24px; border-radius: 4px 4px 0 0;
      min-height: 4px; transition: height 0.5s ease;
    }

    .speed-val { font-size: 11px; font-weight: 700; margin-top: 4px; }
    .speed-label { font-size: 10.5px; color: var(--text-tertiary); }

    .speed-target {
      display: flex; align-items: center; gap: 8px;
      margin-top: 10px; padding-top: 10px;
      border-top: 1px solid var(--border-light);
    }

    .speed-target-line { width: 20px; border-top: 2px dashed #059669; }
    .speed-target-text { font-size: 11px; color: var(--text-tertiary); }

    @media (max-width: 1100px) {
      .close-banner { flex-direction: column; gap: 16px; align-items: flex-start; }
      .close-grid { grid-template-columns: 1fr; }
      .timeline-track { overflow-x: auto; }
    }
  `]
})
export class CloseManagementComponent {
  closePct = 68;
  activeChecklistFilter = 'All';
  checklistFilters = ['All', 'Pending', 'In Progress', 'Complete'];

  closeStats = [
    { value: '14', label: 'Tasks Done', color: '#059669' },
    { value: '5', label: 'In Progress', color: 'var(--primary)' },
    { value: '3', label: 'Pending', color: '#D97706' },
    { value: '2', label: 'Blockers', color: '#DC2626' },
  ];

  timelineDays = [
    { label: 'Day 1', date: 'Feb 3', tasks: '6 tasks', isPast: true, isToday: false, isFuture: false },
    { label: 'Day 2', date: 'Feb 4', tasks: '5 tasks', isPast: true, isToday: false, isFuture: false },
    { label: 'Day 3', date: 'Feb 5', tasks: '4 tasks', isPast: true, isToday: false, isFuture: false },
    { label: 'Day 4', date: 'Feb 6', tasks: '3 tasks', isPast: true, isToday: false, isFuture: false },
    { label: 'Day 5', date: 'Feb 7', tasks: '5 tasks', isPast: false, isToday: true, isFuture: false },
    { label: 'Day 6', date: 'Feb 8', tasks: '3 tasks', isPast: false, isToday: false, isFuture: true },
    { label: 'Day 7', date: 'Feb 9', tasks: 'Final', isPast: false, isToday: false, isFuture: true },
  ];

  phases = [
    {
      name: 'Phase 1: Sub-ledger Close', color: '#059669', completed: 6, total: 6,
      tasks: [
        { name: 'Close AP sub-ledger', description: 'Post final AP transactions, verify aging', assignee: 'S. Chen', assigneeInit: 'SC', assigneeColor: '#0D6B5C', due: 'Feb 3', overdue: false, status: 'Complete', badgeClass: 'afda-badge-success', statusKey: 'Complete' },
        { name: 'Close AR sub-ledger', description: 'Post collections, run aging report', assignee: 'M. Park', assigneeInit: 'MP', assigneeColor: '#2563EB', due: 'Feb 3', overdue: false, status: 'Complete', badgeClass: 'afda-badge-success', statusKey: 'Complete' },
        { name: 'Payroll processing', description: 'Final payroll run, tax deposits', assignee: 'L. Wong', assigneeInit: 'LW', assigneeColor: '#7C3AED', due: 'Feb 3', overdue: false, status: 'Complete', badgeClass: 'afda-badge-success', statusKey: 'Complete' },
        { name: 'Fixed asset depreciation', description: 'Run depreciation schedule', assignee: 'S. Chen', assigneeInit: 'SC', assigneeColor: '#0D6B5C', due: 'Feb 4', overdue: false, status: 'Complete', badgeClass: 'afda-badge-success', statusKey: 'Complete' },
        { name: 'Revenue recognition', description: 'Process deferred rev schedule', assignee: 'M. Park', assigneeInit: 'MP', assigneeColor: '#2563EB', due: 'Feb 4', overdue: false, status: 'Complete', badgeClass: 'afda-badge-success', statusKey: 'Complete' },
        { name: 'Inventory valuation', description: 'FIFO calculation and adjustments', assignee: 'L. Wong', assigneeInit: 'LW', assigneeColor: '#7C3AED', due: 'Feb 4', overdue: false, status: 'Complete', badgeClass: 'afda-badge-success', statusKey: 'Complete' },
      ]
    },
    {
      name: 'Phase 2: Journal Entries', color: '#0D6B5C', completed: 5, total: 6,
      tasks: [
        { name: 'Post standard recurring JEs', description: '14 auto-generated entries', assignee: 'AI Agent', assigneeInit: 'AI', assigneeColor: '#0D6B5C', due: 'Feb 5', overdue: false, status: 'Complete', badgeClass: 'afda-badge-success', statusKey: 'Complete' },
        { name: 'Accrual entries', description: 'Expense accruals and prepaid amortization', assignee: 'S. Chen', assigneeInit: 'SC', assigneeColor: '#0D6B5C', due: 'Feb 5', overdue: false, status: 'Complete', badgeClass: 'afda-badge-success', statusKey: 'Complete' },
        { name: 'Intercompany eliminations', description: '6 elimination entries across 4 entities', assignee: 'AI Agent', assigneeInit: 'AI', assigneeColor: '#0D6B5C', due: 'Feb 5', overdue: false, status: 'Complete', badgeClass: 'afda-badge-success', statusKey: 'Complete' },
        { name: 'FX revaluation', description: 'Mark-to-market EUR, GBP, CAD positions', assignee: 'M. Park', assigneeInit: 'MP', assigneeColor: '#2563EB', due: 'Feb 6', overdue: false, status: 'Complete', badgeClass: 'afda-badge-success', statusKey: 'Complete' },
        { name: 'Tax provision entries', description: 'Quarterly income tax estimate', assignee: 'L. Wong', assigneeInit: 'LW', assigneeColor: '#7C3AED', due: 'Feb 6', overdue: false, status: 'Complete', badgeClass: 'afda-badge-success', statusKey: 'Complete' },
        { name: 'Post adjusting entries', description: 'Manual adjustments per review findings', assignee: 'S. Chen', assigneeInit: 'SC', assigneeColor: '#0D6B5C', due: 'Feb 7', overdue: false, status: 'In Progress', badgeClass: 'afda-badge-high', statusKey: 'In Progress' },
      ]
    },
    {
      name: 'Phase 3: Reconciliation & Review', color: '#2563EB', completed: 3, total: 5,
      tasks: [
        { name: 'Bank reconciliation', description: '6 accounts — auto-matched 96%', assignee: 'AI Agent', assigneeInit: 'AI', assigneeColor: '#0D6B5C', due: 'Feb 6', overdue: false, status: 'Complete', badgeClass: 'afda-badge-success', statusKey: 'Complete' },
        { name: 'Account reconciliation', description: '18 accounts — 14 reconciled', assignee: 'S. Chen', assigneeInit: 'SC', assigneeColor: '#0D6B5C', due: 'Feb 7', overdue: false, status: 'In Progress', badgeClass: 'afda-badge-high', statusKey: 'In Progress' },
        { name: 'Trial balance review', description: 'Verify TB balances, check adjustments', assignee: 'M. Park', assigneeInit: 'MP', assigneeColor: '#2563EB', due: 'Feb 7', overdue: false, status: 'Complete', badgeClass: 'afda-badge-success', statusKey: 'Complete' },
        { name: 'Flux analysis generation', description: 'AI-generate variance commentary', assignee: 'AI Agent', assigneeInit: 'AI', assigneeColor: '#0D6B5C', due: 'Feb 7', overdue: false, status: 'In Progress', badgeClass: 'afda-badge-high', statusKey: 'In Progress' },
        { name: 'Management review', description: 'CFO sign-off on financials', assignee: 'J. Adams', assigneeInit: 'JA', assigneeColor: '#DC2626', due: 'Feb 8', overdue: false, status: 'Pending', badgeClass: 'afda-badge-medium', statusKey: 'Pending' },
      ]
    },
    {
      name: 'Phase 4: Reporting & Certification', color: '#7C3AED', completed: 0, total: 5,
      tasks: [
        { name: 'Generate financial package', description: 'P&L, Balance Sheet, Cash Flow', assignee: 'AI Agent', assigneeInit: 'AI', assigneeColor: '#0D6B5C', due: 'Feb 8', overdue: false, status: 'Pending', badgeClass: 'afda-badge-medium', statusKey: 'Pending' },
        { name: 'Board deck preparation', description: 'Monthly financial summary slides', assignee: 'M. Park', assigneeInit: 'MP', assigneeColor: '#2563EB', due: 'Feb 8', overdue: false, status: 'Pending', badgeClass: 'afda-badge-medium', statusKey: 'Pending' },
        { name: 'Controller certification', description: 'Attest to accuracy and completeness', assignee: 'S. Chen', assigneeInit: 'SC', assigneeColor: '#0D6B5C', due: 'Feb 9', overdue: false, status: 'Pending', badgeClass: 'afda-badge-medium', statusKey: 'Pending' },
        { name: 'Lock period', description: 'Prevent further postings to January', assignee: 'S. Chen', assigneeInit: 'SC', assigneeColor: '#0D6B5C', due: 'Feb 9', overdue: false, status: 'Pending', badgeClass: 'afda-badge-medium', statusKey: 'Pending' },
        { name: 'Publish results', description: 'Distribute to stakeholders', assignee: 'J. Adams', assigneeInit: 'JA', assigneeColor: '#DC2626', due: 'Feb 9', overdue: false, status: 'Pending', badgeClass: 'afda-badge-medium', statusKey: 'Pending' },
      ]
    },
  ];

  get filteredPhases() {
    if (this.activeChecklistFilter === 'All') return this.phases;
    return this.phases.map(p => ({
      ...p,
      tasks: p.tasks.filter(t => t.statusKey === this.activeChecklistFilter)
    })).filter(p => p.tasks.length > 0);
  }

  blockers = [
    { title: 'Accrued expenses reconciliation', description: '7 unmatched items ($15.8K) — awaiting vendor confirmation for 3 invoices', blocks: 'Phase 3 completion, Management review', icon: 'bi-exclamation-triangle-fill', iconBg: '#FEE2E2', iconColor: '#DC2626' },
    { title: 'DE entity IC entry pending', description: 'AFDA-DE management fee ($42K) awaiting counterparty approval in Berlin', blocks: 'IC elimination finalization', icon: 'bi-clock-fill', iconBg: '#FEF3C7', iconColor: '#D97706' },
  ];

  closeHistory = [
    { label: 'Aug', days: 6.2, barH: 78 },
    { label: 'Sep', days: 5.8, barH: 73 },
    { label: 'Oct', days: 5.4, barH: 68 },
    { label: 'Nov', days: 4.8, barH: 60 },
    { label: 'Dec', days: 5.2, barH: 65 },
    { label: 'Jan', days: 5.0, barH: 63 },
  ];
}