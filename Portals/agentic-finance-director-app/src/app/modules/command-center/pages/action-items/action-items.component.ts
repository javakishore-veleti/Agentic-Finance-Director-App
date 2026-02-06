import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-cc-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/command/overview">Command Center</a>
      <span class="separator">/</span>
      <span class="current">Action Items</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Action Items</h1>
        <p class="afda-page-subtitle">AI-flagged items requiring executive attention</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-outline" (click)="toggleView()">
          <i [class]="'bi ' + (viewMode === 'list' ? 'bi-kanban' : 'bi-list-ul')"></i>
          {{ viewMode === 'list' ? 'Board View' : 'List View' }}
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-plus-lg"></i> Add Item
        </button>
      </div>
    </div>

    <!-- Summary Strip -->
    <div class="summary-strip stagger">
      @for (s of summaryItems; track s.label) {
        <div class="summary-chip" [class.active]="activeFilter === s.filter" (click)="activeFilter = s.filter">
          <span class="summary-dot" [style.background]="s.color"></span>
          <span class="summary-count font-mono">{{ s.count }}</span>
          <span class="summary-label">{{ s.label }}</span>
        </div>
      }
    </div>

    <!-- List View -->
    @if (viewMode === 'list') {
      <div class="afda-card" style="animation: fadeUp 0.4s ease both;">
        <table class="afda-table">
          <thead>
            <tr>
              <th style="width: 40px;"></th>
              <th>Action Item</th>
              <th>Source</th>
              <th>Assigned To</th>
              <th>Due</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (item of filteredItems; track item.id) {
              <tr>
                <td>
                  <div class="check-box" [class.checked]="item.status === 'Done'"
                       (click)="toggleItem(item)">
                    @if (item.status === 'Done') {
                      <i class="bi bi-check-lg"></i>
                    }
                  </div>
                </td>
                <td>
                  <div class="item-title" [class.done]="item.status === 'Done'">{{ item.title }}</div>
                  <div class="item-desc">{{ item.description }}</div>
                </td>
                <td>
                  <span class="source-chip">
                    <i [class]="'bi ' + item.sourceIcon"></i>
                    {{ item.source }}
                  </span>
                </td>
                <td>
                  <div class="assignee">
                    <div class="assignee-avatar" [style.background]="item.avatarColor">{{ item.initials }}</div>
                    <span>{{ item.assignee }}</span>
                  </div>
                </td>
                <td>
                  <span class="due-date" [class.overdue]="item.overdue">
                    {{ item.due }}
                  </span>
                </td>
                <td>
                  <span class="afda-badge" [ngClass]="item.priorityClass">{{ item.priority }}</span>
                </td>
                <td>
                  <span class="status-pill" [ngClass]="'status-' + item.statusKey">{{ item.status }}</span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- Board View -->
    @if (viewMode === 'board') {
      <div class="board-grid">
        @for (col of boardColumns; track col.key) {
          <div class="board-column" [style.animation-delay]="col.delay">
            <div class="board-col-header">
              <span class="board-col-dot" [style.background]="col.color"></span>
              <span class="board-col-title">{{ col.label }}</span>
              <span class="board-col-count font-mono">{{ getColumnItems(col.key).length }}</span>
            </div>
            <div class="board-col-body">
              @for (item of getColumnItems(col.key); track item.id) {
                <div class="board-card">
                  <div class="board-card-top">
                    <span class="afda-badge" [ngClass]="item.priorityClass" style="font-size: 9px;">{{ item.priority }}</span>
                    <span class="due-date" [class.overdue]="item.overdue" style="font-size: 11px;">{{ item.due }}</span>
                  </div>
                  <div class="board-card-title">{{ item.title }}</div>
                  <div class="board-card-desc">{{ item.description }}</div>
                  <div class="board-card-footer">
                    <div class="assignee" style="font-size: 11.5px;">
                      <div class="assignee-avatar" [style.background]="item.avatarColor" style="width: 22px; height: 22px; font-size: 9px;">{{ item.initials }}</div>
                      {{ item.assignee }}
                    </div>
                    <span class="source-chip" style="font-size: 10px; padding: 2px 6px;">
                      <i [class]="'bi ' + item.sourceIcon" style="font-size: 10px;"></i>
                      {{ item.source }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .summary-strip {
      display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;
    }

    .summary-chip {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 40px; cursor: pointer;
      transition: all 0.15s ease;
      animation: fadeUp 0.3s ease both;
      &:hover { border-color: var(--primary); }
      &.active { border-color: var(--primary); background: var(--primary-light); }
    }

    .summary-dot { width: 8px; height: 8px; border-radius: 50%; }
    .summary-count { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .summary-label { font-size: 12.5px; color: var(--text-secondary); }

    .check-box {
      width: 20px; height: 20px;
      border: 2px solid var(--border);
      border-radius: 4px; cursor: pointer;
      display: grid; place-items: center;
      transition: all 0.15s ease;
      color: white; font-size: 12px;
      &:hover { border-color: var(--primary); }
      &.checked {
        background: var(--primary); border-color: var(--primary);
      }
    }

    .item-title {
      font-size: 13px; font-weight: 600; color: var(--text-primary);
      &.done { text-decoration: line-through; color: var(--text-tertiary); }
    }

    .item-desc {
      font-size: 12px; color: var(--text-tertiary);
      margin-top: 2px; line-height: 1.4;
      max-width: 360px;
    }

    .source-chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 8px; font-size: 11px;
      background: var(--bg-section); border-radius: 20px;
      color: var(--text-secondary);
      i { font-size: 12px; }
    }

    .assignee {
      display: flex; align-items: center; gap: 8px;
      font-size: 12.5px; color: var(--text-primary);
    }

    .assignee-avatar {
      width: 26px; height: 26px; border-radius: 50%;
      display: grid; place-items: center;
      color: white; font-size: 10px; font-weight: 700;
      flex-shrink: 0;
    }

    .due-date {
      font-size: 12.5px; color: var(--text-secondary);
      &.overdue { color: var(--danger); font-weight: 600; }
    }

    .status-pill {
      display: inline-flex; padding: 3px 10px;
      font-size: 11px; font-weight: 600;
      border-radius: 20px;
    }

    .status-todo    { background: var(--bg-section); color: var(--text-secondary); }
    .status-progress { background: #EFF6FF; color: #2563EB; }
    .status-review   { background: #FFFBEB; color: #D97706; }
    .status-done     { background: var(--success-bg); color: var(--success); }

    /* Board View */
    .board-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .board-column {
      background: var(--bg-section);
      border-radius: var(--radius-lg);
      padding: 14px;
      min-height: 400px;
      animation: fadeUp 0.4s ease both;
    }

    .board-col-header {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 14px; padding-bottom: 12px;
      border-bottom: 1px solid var(--border-light);
    }

    .board-col-dot { width: 10px; height: 10px; border-radius: 50%; }
    .board-col-title { font-size: 12.5px; font-weight: 700; color: var(--text-primary); }
    .board-col-count {
      margin-left: auto; font-size: 11px; font-weight: 600;
      background: var(--bg-white); padding: 2px 8px;
      border-radius: 20px; color: var(--text-secondary);
    }

    .board-col-body { display: flex; flex-direction: column; gap: 10px; }

    .board-card {
      background: var(--bg-white);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 14px;
      box-shadow: var(--shadow-sm);
      transition: box-shadow 0.15s, transform 0.15s;
      cursor: pointer;
      &:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
    }

    .board-card-top {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 8px;
    }

    .board-card-title { font-size: 13px; font-weight: 600; color: var(--text-primary); line-height: 1.3; }
    .board-card-desc { font-size: 11.5px; color: var(--text-tertiary); margin-top: 4px; line-height: 1.4; }

    .board-card-footer {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 12px; padding-top: 10px;
      border-top: 1px solid var(--border-light);
    }

    @media (max-width: 1100px) {
      .board-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class ActionItemsComponent {
  viewMode: 'list' | 'board' = 'list';
  activeFilter = 'all';

  summaryItems = [
    { label: 'All Items', count: 9, color: 'var(--text-tertiary)', filter: 'all' },
    { label: 'To Do', count: 3, color: '#9CA3AF', filter: 'todo' },
    { label: 'In Progress', count: 3, color: '#2563EB', filter: 'progress' },
    { label: 'In Review', count: 1, color: '#D97706', filter: 'review' },
    { label: 'Done', count: 2, color: '#059669', filter: 'done' },
  ];

  boardColumns = [
    { key: 'todo', label: 'To Do', color: '#9CA3AF', delay: '0s' },
    { key: 'progress', label: 'In Progress', color: '#2563EB', delay: '0.05s' },
    { key: 'review', label: 'In Review', color: '#D97706', delay: '0.1s' },
    { key: 'done', label: 'Done', color: '#059669', delay: '0.15s' },
  ];

  items = [
    {
      id: 1, title: 'Follow up on TechVentures AR ($1.2M)',
      description: 'Receivable aging beyond 60 days — escalate to VP Client Success',
      source: 'Treasury', sourceIcon: 'bi-bank',
      assignee: 'Sarah Chen', initials: 'SC', avatarColor: '#0D6B5C',
      due: 'Feb 7', overdue: false, priority: 'CRITICAL', priorityClass: 'afda-badge-critical',
      status: 'In Progress', statusKey: 'progress'
    },
    {
      id: 2, title: 'Review marketing contractor spend',
      description: '12% over budget — schedule review with CMO',
      source: 'FP&A', sourceIcon: 'bi-bar-chart-fill',
      assignee: 'Michael Park', initials: 'MP', avatarColor: '#2563EB',
      due: 'Feb 6', overdue: true, priority: 'HIGH', priorityClass: 'afda-badge-high',
      status: 'To Do', statusKey: 'todo'
    },
    {
      id: 3, title: 'Complete GL reconciliation (3 accounts)',
      description: 'Bank recon, prepaid assets, and accrued liabilities pending',
      source: 'Accounting', sourceIcon: 'bi-journal-text',
      assignee: 'Lisa Wang', initials: 'LW', avatarColor: '#7C3AED',
      due: 'Feb 8', overdue: false, priority: 'HIGH', priorityClass: 'afda-badge-high',
      status: 'In Progress', statusKey: 'progress'
    },
    {
      id: 4, title: 'Approve AWS infrastructure PO ($180K)',
      description: 'Unplanned database migration — needs CFO sign-off',
      source: 'Operations', sourceIcon: 'bi-gear',
      assignee: 'James Liu', initials: 'JL', avatarColor: '#DC2626',
      due: 'Feb 5', overdue: true, priority: 'HIGH', priorityClass: 'afda-badge-high',
      status: 'In Review', statusKey: 'review'
    },
    {
      id: 5, title: 'Submit January close package',
      description: 'Final close deliverables for board reporting',
      source: 'Accounting', sourceIcon: 'bi-journal-text',
      assignee: 'Lisa Wang', initials: 'LW', avatarColor: '#7C3AED',
      due: 'Feb 10', overdue: false, priority: 'MEDIUM', priorityClass: 'afda-badge-medium',
      status: 'In Progress', statusKey: 'progress'
    },
    {
      id: 6, title: 'Update 13-week cash forecast',
      description: 'Incorporate latest pipeline data and revised burn rate',
      source: 'Treasury', sourceIcon: 'bi-bank',
      assignee: 'Sarah Chen', initials: 'SC', avatarColor: '#0D6B5C',
      due: 'Feb 9', overdue: false, priority: 'MEDIUM', priorityClass: 'afda-badge-medium',
      status: 'To Do', statusKey: 'todo'
    },
    {
      id: 7, title: 'Configure n8n variance alert workflow',
      description: 'Auto-flag departments exceeding 10% budget variance',
      source: 'Agent Studio', sourceIcon: 'bi-robot',
      assignee: 'Dev Team', initials: 'DT', avatarColor: '#D97706',
      due: 'Feb 12', overdue: false, priority: 'LOW', priorityClass: 'afda-badge-low',
      status: 'To Do', statusKey: 'todo'
    },
    {
      id: 8, title: 'Resolve intercompany elimination discrepancy',
      description: 'Q4 intercompany entries reconciled and eliminated',
      source: 'Accounting', sourceIcon: 'bi-journal-text',
      assignee: 'Lisa Wang', initials: 'LW', avatarColor: '#7C3AED',
      due: 'Feb 3', overdue: false, priority: 'HIGH', priorityClass: 'afda-badge-high',
      status: 'Done', statusKey: 'done'
    },
    {
      id: 9, title: 'Set up Prometheus alerting rules',
      description: 'Configure API latency and error rate thresholds',
      source: 'Monitoring', sourceIcon: 'bi-broadcast',
      assignee: 'Dev Team', initials: 'DT', avatarColor: '#D97706',
      due: 'Feb 1', overdue: false, priority: 'MEDIUM', priorityClass: 'afda-badge-medium',
      status: 'Done', statusKey: 'done'
    },
  ];

  get filteredItems() {
    if (this.activeFilter === 'all') return this.items;
    return this.items.filter(i => i.statusKey === this.activeFilter);
  }

  getColumnItems(key: string) {
    return this.items.filter(i => i.statusKey === key);
  }

  toggleView() {
    this.viewMode = this.viewMode === 'list' ? 'board' : 'list';
  }

  toggleItem(item: any) {
    item.status = item.status === 'Done' ? 'To Do' : 'Done';
    item.statusKey = item.status === 'Done' ? 'done' : 'todo';
  }
}