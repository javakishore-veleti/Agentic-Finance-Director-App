import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-alert-rules',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/risk-intelligence">Risk Intelligence</a>
      <span class="separator">/</span>
      <span class="current">Alert Rules</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Alert Rules</h1>
        <p class="afda-page-subtitle">Configure automated risk detection rules, thresholds, and notifications</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-upload"></i> Import Rules
        </button>
        <button class="afda-btn afda-btn-primary" (click)="showCreateRule = true">
          <i class="bi bi-plus-lg"></i> Create Rule
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="stats-row stagger">
      @for (s of ruleStats; track s.label) {
        <div class="rs-card">
          <div class="rs-icon" [style.background]="s.iconBg">
            <i [class]="'bi ' + s.icon" [style.color]="s.iconColor"></i>
          </div>
          <div>
            <div class="rs-value font-mono">{{ s.value }}</div>
            <div class="rs-label">{{ s.label }}</div>
          </div>
        </div>
      }
    </div>

    <!-- Category Filter -->
    <div class="filter-bar stagger">
      <div class="filter-search">
        <i class="bi bi-search"></i>
        <input type="text" placeholder="Search rules..." class="filter-search-input" (input)="onSearch($event)">
      </div>
      <div class="filter-chips">
        @for (cat of categories; track cat) {
          <button class="filter-chip" [class.active]="activeCategory === cat"
                  (click)="activeCategory = cat">{{ cat }}</button>
        }
      </div>
    </div>

    <!-- Rules List -->
    <div class="rules-list">
      @for (rule of filteredRules; track rule.id) {
        <div class="rule-card" [class.disabled-rule]="!rule.enabled" [class.expanded]="expandedRule === rule.id">
          <!-- Rule Header -->
          <div class="rc-header" (click)="toggleRule(rule.id)">
            <div class="rc-severity-dot" [style.background]="getSevColor(rule.severity)"></div>
            <div class="rc-info">
              <div class="rc-name">{{ rule.name }}</div>
              <div class="rc-meta">
                <span class="rc-id font-mono">{{ rule.id }}</span>
                <span class="rc-category-chip" [style.background]="rule.catBg" [style.color]="rule.catColor">
                  {{ rule.category }}
                </span>
                <span class="rc-sev-chip" [style.background]="getSevBg(rule.severity)" [style.color]="getSevColor(rule.severity)">
                  {{ rule.severity }}
                </span>
              </div>
            </div>
            <div class="rc-stats-mini">
              <div class="rcs-item">
                <span class="rcs-value font-mono">{{ rule.triggered }}</span>
                <span class="rcs-label">Triggered</span>
              </div>
              <div class="rcs-item">
                <span class="rcs-value font-mono">{{ rule.lastTriggered }}</span>
                <span class="rcs-label">Last Fired</span>
              </div>
              <div class="rcs-item">
                <span class="rcs-value font-mono">{{ rule.falsePositive }}</span>
                <span class="rcs-label">False +</span>
              </div>
            </div>
            <div class="rc-toggle" [class.on]="rule.enabled"
                 (click)="rule.enabled = !rule.enabled; $event.stopPropagation()">
              <div class="rc-toggle-knob"></div>
            </div>
            <button class="rc-expand-btn">
              <i [class]="expandedRule === rule.id ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
            </button>
          </div>

          <!-- Expanded Config -->
          @if (expandedRule === rule.id) {
            <div class="rc-expanded">
              <div class="rc-grid">
                <!-- Conditions -->
                <div class="rc-section">
                  <div class="rcs-title">Conditions</div>
                  @for (cond of rule.conditions; track cond.field; let idx = $index) {
                    @if (idx > 0) {
                      <div class="cond-connector">{{ rule.conditionLogic }}</div>
                    }
                    <div class="cond-pill">
                      <span class="cond-field font-mono">{{ cond.field }}</span>
                      <span class="cond-op">{{ cond.operator }}</span>
                      <span class="cond-value font-mono">{{ cond.value }}</span>
                    </div>
                  }
                  <button class="add-cond-btn">
                    <i class="bi bi-plus"></i> Add Condition
                  </button>
                </div>

                <!-- Thresholds + Timing -->
                <div class="rc-section">
                  <div class="rcs-title">Thresholds & Timing</div>
                  @for (th of rule.thresholds; track th.label) {
                    <div class="th-row">
                      <span class="th-label">{{ th.label }}</span>
                      <div class="th-input-wrap">
                        @if (th.type === 'number' || th.type === 'text') {
                          <input type="text" [value]="th.value" class="th-input font-mono">
                        }
                        @if (th.type === 'select') {
                          <select class="th-select">
                            @for (opt of th.options; track opt) {
                              <option [selected]="opt === th.value">{{ opt }}</option>
                            }
                          </select>
                        }
                      </div>
                    </div>
                  }
                </div>

                <!-- Notifications -->
                <div class="rc-section">
                  <div class="rcs-title">Notifications</div>
                  @for (notif of rule.notifications; track notif.channel) {
                    <div class="notif-row">
                      <div class="notif-icon" [style.background]="notif.iconBg">
                        <i [class]="'bi ' + notif.icon" [style.color]="notif.iconColor"></i>
                      </div>
                      <div class="notif-info">
                        <div class="notif-channel">{{ notif.channel }}</div>
                        <div class="notif-target">{{ notif.target }}</div>
                      </div>
                      <div class="rc-toggle small" [class.on]="notif.enabled"
                           (click)="notif.enabled = !notif.enabled">
                        <div class="rc-toggle-knob"></div>
                      </div>
                    </div>
                  }
                  <button class="add-cond-btn" style="margin-top: 8px;">
                    <i class="bi bi-plus"></i> Add Channel
                  </button>
                </div>
              </div>

              <!-- Action Bar -->
              <div class="rc-action-bar">
                <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 6px 14px;">
                  <i class="bi bi-play-fill"></i> Test Rule
                </button>
                <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 6px 14px;">
                  <i class="bi bi-clock-history"></i> View History
                </button>
                <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 6px 14px;">
                  <i class="bi bi-clipboard"></i> Duplicate
                </button>
                <div style="flex: 1;"></div>
                <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 6px 14px; color: #DC2626; border-color: #FCA5A5;">
                  <i class="bi bi-trash3"></i> Delete
                </button>
                <button class="afda-btn afda-btn-primary" style="font-size: 11.5px; padding: 6px 14px;">
                  <i class="bi bi-check-lg"></i> Save Changes
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Create Rule Modal -->
    @if (showCreateRule) {
      <div class="modal-overlay" (click)="showCreateRule = false">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Create Alert Rule</h3>
            <button class="modal-close" (click)="showCreateRule = false"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="modal-body">
            <div class="modal-field">
              <label class="modal-label">Rule Name</label>
              <input type="text" class="modal-input" placeholder="e.g., Cash Below $2M Threshold">
            </div>
            <div class="modal-row">
              <div class="modal-field" style="flex: 1;">
                <label class="modal-label">Category</label>
                <select class="modal-select">
                  <option>Liquidity</option><option>Credit / AR</option><option>Operational</option>
                  <option>Compliance</option><option>Variance</option><option>System</option>
                </select>
              </div>
              <div class="modal-field" style="flex: 1;">
                <label class="modal-label">Severity</label>
                <select class="modal-select">
                  <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                </select>
              </div>
            </div>
            <div class="modal-field">
              <label class="modal-label">Description</label>
              <textarea class="modal-textarea" rows="2" placeholder="Describe what this rule monitors..."></textarea>
            </div>
            <div class="modal-section-label">Condition Builder</div>
            <div class="modal-row">
              <div class="modal-field" style="flex: 2;">
                <label class="modal-label">Metric / Field</label>
                <select class="modal-select">
                  <option>cash_balance</option><option>ar_aging_90d</option><option>budget_variance_pct</option>
                  <option>recon_unmatched_amount</option><option>ic_imbalance</option><option>agent_latency_ms</option>
                  <option>close_task_overdue_hours</option><option>sox_deadline_days</option>
                </select>
              </div>
              <div class="modal-field" style="flex: 1;">
                <label class="modal-label">Operator</label>
                <select class="modal-select">
                  <option>&lt;</option><option>&gt;</option><option>=</option><option>≥</option><option>≤</option><option>≠</option>
                </select>
              </div>
              <div class="modal-field" style="flex: 1;">
                <label class="modal-label">Value</label>
                <input type="text" class="modal-input font-mono" placeholder="2000000">
              </div>
            </div>
            <div class="modal-section-label">Notification Channels</div>
            <div class="modal-notif-grid">
              @for (ch of newRuleChannels; track ch.name) {
                <div class="mnc-item" [class.active]="ch.enabled" (click)="ch.enabled = !ch.enabled">
                  <i [class]="'bi ' + ch.icon" [style.color]="ch.enabled ? ch.color : 'var(--text-tertiary)'"></i>
                  <span>{{ ch.name }}</span>
                </div>
              }
            </div>
          </div>
          <div class="modal-footer">
            <button class="afda-btn afda-btn-outline" (click)="showCreateRule = false">Cancel</button>
            <button class="afda-btn afda-btn-primary">
              <i class="bi bi-plus-lg"></i> Create Rule
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .stats-row {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 12px; margin-bottom: 16px;
    }

    .rs-card {
      display: flex; align-items: center; gap: 12px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-md); padding: 14px 16px;
      box-shadow: var(--shadow-sm);
    }

    .rs-icon {
      width: 36px; height: 36px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 15px; flex-shrink: 0;
    }

    .rs-value { font-size: 18px; font-weight: 700; color: var(--text-primary); }
    .rs-label { font-size: 11px; color: var(--text-tertiary); }

    .filter-bar {
      display: flex; gap: 10px; align-items: center; margin-bottom: 16px; flex-wrap: wrap;
    }

    .filter-search {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 14px; background: var(--bg-card);
      border: 1px solid var(--border); border-radius: var(--radius-md);
      i { color: var(--text-tertiary); font-size: 14px; }
    }

    .filter-search-input {
      border: none; outline: none; background: transparent;
      font-size: 13px; font-family: var(--font-sans);
      color: var(--text-primary); width: 180px;
      &::placeholder { color: var(--text-tertiary); }
    }

    .filter-chips { display: flex; gap: 4px; }

    .filter-chip {
      padding: 5px 12px; font-size: 11.5px; font-weight: 500;
      border: 1px solid var(--border); border-radius: 20px;
      background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s; font-family: var(--font-sans);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 600; }
    }

    .rules-list { display: flex; flex-direction: column; gap: 8px; }

    .rule-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); overflow: hidden;
      box-shadow: var(--shadow-card); animation: fadeUp 0.4s ease both;
      transition: border-color 0.15s;
      &:hover { border-color: #D1D5DB; }
      &.expanded { box-shadow: var(--shadow-md); border-color: var(--primary); }
      &.disabled-rule { opacity: 0.55; }
    }

    .rc-header {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 20px; cursor: pointer;
      transition: background 0.1s;
      &:hover { background: var(--bg-section); }
    }

    .rc-severity-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

    .rc-info { flex: 1; min-width: 0; }
    .rc-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .rc-meta { display: flex; align-items: center; gap: 8px; margin-top: 3px; }
    .rc-id { font-size: 10.5px; color: var(--text-tertiary); }

    .rc-category-chip, .rc-sev-chip {
      display: inline-flex; padding: 1px 8px; font-size: 10px;
      font-weight: 600; border-radius: 10px;
    }

    .rc-stats-mini { display: flex; gap: 20px; }

    .rcs-item { text-align: center; min-width: 55px; }
    .rcs-value { display: block; font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .rcs-label { display: block; font-size: 9.5px; color: var(--text-tertiary); text-transform: uppercase; }

    .rc-toggle {
      width: 40px; height: 22px; background: #D1D5DB;
      border-radius: 11px; position: relative; cursor: pointer;
      transition: background 0.2s; flex-shrink: 0;
      &.on { background: var(--primary); }
      &.small { width: 34px; height: 18px; }
    }

    .rc-toggle-knob {
      width: 18px; height: 18px; background: white;
      border-radius: 50%; position: absolute; top: 2px; left: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
      transition: left 0.2s;
    }

    .rc-toggle.on .rc-toggle-knob { left: 20px; }
    .rc-toggle.small .rc-toggle-knob { width: 14px; height: 14px; }
    .rc-toggle.small.on .rc-toggle-knob { left: 18px; }

    .rc-expand-btn {
      background: none; border: none; color: var(--text-tertiary);
      cursor: pointer; padding: 4px; font-size: 16px;
    }

    .rc-expanded {
      padding: 0 20px 16px;
      border-top: 1px solid var(--border-light);
      animation: slideDown 0.2s ease;
    }

    @keyframes slideDown { from { opacity: 0; } to { opacity: 1; } }

    .rc-grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      gap: 20px; padding: 16px 0;
    }

    .rcs-title {
      font-size: 11px; font-weight: 700; color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 12px;
    }

    .cond-connector {
      display: inline-flex; padding: 1px 10px; font-size: 10px;
      font-weight: 700; color: var(--primary); background: var(--primary-light);
      border-radius: 8px; text-transform: uppercase;
      margin: 4px 0 4px 12px;
    }

    .cond-pill {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 12px; background: var(--bg-section);
      border: 1px solid var(--border-light); border-radius: var(--radius-sm);
      margin-bottom: 4px;
    }

    .cond-field { font-size: 12px; font-weight: 600; color: var(--primary); }
    .cond-op { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
    .cond-value { font-size: 12px; font-weight: 700; color: var(--text-primary); }

    .add-cond-btn {
      display: flex; align-items: center; gap: 4px;
      padding: 6px 10px; font-size: 11px; font-weight: 500;
      border: 1px dashed var(--border); border-radius: var(--radius-sm);
      background: transparent; color: var(--text-tertiary);
      cursor: pointer; font-family: var(--font-sans);
      transition: all 0.15s; margin-top: 6px;
      &:hover { border-color: var(--primary); color: var(--primary); }
    }

    .th-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 7px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .th-label { font-size: 12px; color: var(--text-secondary); }

    .th-input {
      width: 120px; padding: 5px 8px; border: 1px solid var(--border);
      border-radius: var(--radius-sm); font-size: 12px;
      background: var(--bg-section); color: var(--text-primary); text-align: right;
      outline: none;
      &:focus { border-color: var(--primary); }
    }

    .th-select {
      width: 130px; padding: 5px 8px; border: 1px solid var(--border);
      border-radius: var(--radius-sm); font-size: 12px;
      background: var(--bg-white); color: var(--text-primary);
      font-family: var(--font-sans);
    }

    .notif-row {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .notif-icon {
      width: 28px; height: 28px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 13px; flex-shrink: 0;
    }

    .notif-info { flex: 1; }
    .notif-channel { font-size: 12px; font-weight: 600; color: var(--text-primary); }
    .notif-target { font-size: 10.5px; color: var(--text-tertiary); }

    .rc-action-bar {
      display: flex; gap: 8px; padding-top: 14px;
      border-top: 1px solid var(--border-light);
    }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: grid; place-items: center; z-index: 1000;
      animation: fadeIn 0.15s ease;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .modal-panel {
      background: var(--bg-card); border-radius: var(--radius-lg);
      box-shadow: 0 24px 48px rgba(0,0,0,0.2);
      width: 620px; max-height: 85vh; overflow-y: auto;
      animation: scaleIn 0.2s ease;
    }

    @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid var(--border-light);
    }

    .modal-title { font-size: 16px; font-weight: 700; margin: 0; }

    .modal-close {
      background: none; border: none; font-size: 18px;
      color: var(--text-tertiary); cursor: pointer;
      &:hover { color: var(--text-primary); }
    }

    .modal-body { padding: 20px 24px; }

    .modal-field { margin-bottom: 12px; }

    .modal-label {
      display: block; font-size: 11px; font-weight: 600;
      color: var(--text-tertiary); text-transform: uppercase;
      letter-spacing: 0.3px; margin-bottom: 4px;
    }

    .modal-input, .modal-select, .modal-textarea {
      width: 100%; padding: 8px 12px; border: 1px solid var(--border);
      border-radius: var(--radius-sm); font-size: 13px;
      background: var(--bg-section); color: var(--text-primary);
      font-family: var(--font-sans); outline: none; box-sizing: border-box;
      &:focus { border-color: var(--primary); }
      &::placeholder { color: var(--text-tertiary); }
    }

    .modal-textarea { resize: vertical; min-height: 48px; }
    .modal-row { display: flex; gap: 12px; margin-bottom: 12px; }

    .modal-section-label {
      font-size: 12px; font-weight: 700; color: var(--text-primary);
      text-transform: uppercase; letter-spacing: 0.3px;
      margin: 16px 0 10px; padding-top: 12px;
      border-top: 1px solid var(--border-light);
    }

    .modal-notif-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
    }

    .mnc-item {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 12px 8px; border: 2px solid var(--border);
      border-radius: var(--radius-md); cursor: pointer;
      font-size: 11px; color: var(--text-tertiary);
      transition: all 0.15s; text-align: center;
      i { font-size: 18px; }
      &:hover { border-color: var(--primary); }
      &.active { border-color: var(--primary); background: var(--primary-subtle); color: var(--text-primary); }
    }

    .modal-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 16px 24px; border-top: 1px solid var(--border-light);
    }

    @media (max-width: 1100px) {
      .stats-row { grid-template-columns: repeat(3, 1fr); }
      .rc-stats-mini { display: none; }
      .rc-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AlertRulesComponent {
  activeCategory = 'All';
  searchTerm = '';
  expandedRule = '';
  showCreateRule = false;

  categories = ['All', 'Liquidity', 'Credit / AR', 'Operational', 'Variance', 'Compliance', 'System'];

  ruleStats = [
    { value: '28', label: 'Total Rules', icon: 'bi-list-check', iconBg: '#E8F5F1', iconColor: '#0D6B5C' },
    { value: '22', label: 'Active', icon: 'bi-lightning', iconBg: '#ECFDF5', iconColor: '#059669' },
    { value: '6', label: 'Paused', icon: 'bi-pause-circle', iconBg: '#F3F4F6', iconColor: '#6B7280' },
    { value: '142', label: 'Triggers (30d)', icon: 'bi-bell', iconBg: '#FEF3C7', iconColor: '#D97706' },
    { value: '3.1%', label: 'False Positive', icon: 'bi-shield-check', iconBg: '#EFF6FF', iconColor: '#2563EB' },
  ];

  rules: any[] = [
    {
      id: 'RUL-001', name: 'Cash Balance Below Minimum Covenant', category: 'Liquidity',
      catBg: '#EFF6FF', catColor: '#2563EB', severity: 'Critical', enabled: true,
      triggered: 8, lastTriggered: '2m ago', falsePositive: '0%', conditionLogic: 'AND',
      conditions: [
        { field: 'cash_balance_projected', operator: '<', value: '$2,000,000' },
        { field: 'forecast_horizon', operator: '≤', value: '8 weeks' },
      ],
      thresholds: [
        { label: 'Threshold Amount', value: '$2,000,000', type: 'text' },
        { label: 'Evaluation Frequency', value: 'Every 30 min', type: 'select', options: ['Real-time', 'Every 15 min', 'Every 30 min', 'Hourly', 'Daily'] },
        { label: 'Cooldown Period', value: '4 hours', type: 'select', options: ['None', '1 hour', '4 hours', '12 hours', '24 hours'] },
        { label: 'Auto-Escalation', value: 'After 1 hour', type: 'select', options: ['Disabled', 'After 30 min', 'After 1 hour', 'After 4 hours'] },
      ],
      notifications: [
        { channel: 'Email', target: 'CFO, Treasury Team', icon: 'bi-envelope', iconBg: '#EFF6FF', iconColor: '#2563EB', enabled: true },
        { channel: 'Slack', target: '#treasury-alerts', icon: 'bi-chat-dots', iconBg: '#EDE9FE', iconColor: '#7C3AED', enabled: true },
        { channel: 'SMS', target: 'CFO mobile (after-hours)', icon: 'bi-phone', iconBg: '#ECFDF5', iconColor: '#059669', enabled: true },
        { channel: 'In-App', target: 'Alert Center', icon: 'bi-bell', iconBg: '#FEF3C7', iconColor: '#D97706', enabled: true },
      ],
    },
    {
      id: 'RUL-002', name: 'Unreconciled Variance Exceeds Tolerance', category: 'Operational',
      catBg: '#E8F5F1', catColor: '#0D6B5C', severity: 'Critical', enabled: true,
      triggered: 12, lastTriggered: '18m ago', falsePositive: '2.4%', conditionLogic: 'AND',
      conditions: [
        { field: 'recon_unmatched_total', operator: '>', value: '$50,000' },
        { field: 'account_type', operator: '=', value: 'Bank' },
      ],
      thresholds: [
        { label: 'Tolerance Amount', value: '$50,000', type: 'text' },
        { label: 'Evaluation Frequency', value: 'After recon run', type: 'select', options: ['After recon run', 'Hourly', 'Daily'] },
        { label: 'Cooldown Period', value: '12 hours', type: 'select', options: ['None', '4 hours', '12 hours', '24 hours'] },
        { label: 'Auto-Escalation', value: 'After 4 hours', type: 'select', options: ['Disabled', 'After 1 hour', 'After 4 hours'] },
      ],
      notifications: [
        { channel: 'Email', target: 'Controller, Accounting Team', icon: 'bi-envelope', iconBg: '#EFF6FF', iconColor: '#2563EB', enabled: true },
        { channel: 'Slack', target: '#accounting-ops', icon: 'bi-chat-dots', iconBg: '#EDE9FE', iconColor: '#7C3AED', enabled: true },
        { channel: 'In-App', target: 'Alert Center', icon: 'bi-bell', iconBg: '#FEF3C7', iconColor: '#D97706', enabled: true },
      ],
    },
    {
      id: 'RUL-003', name: 'AR Invoice Crosses 90-Day Aging', category: 'Credit / AR',
      catBg: '#FEF3C7', catColor: '#92400E', severity: 'High', enabled: true,
      triggered: 18, lastTriggered: '2h ago', falsePositive: '1.2%', conditionLogic: 'AND',
      conditions: [
        { field: 'invoice_days_outstanding', operator: '≥', value: '90 days' },
        { field: 'invoice_amount', operator: '>', value: '$10,000' },
      ],
      thresholds: [
        { label: 'Aging Threshold', value: '90 days', type: 'text' },
        { label: 'Minimum Amount', value: '$10,000', type: 'text' },
        { label: 'Evaluation Frequency', value: 'Daily', type: 'select', options: ['Hourly', 'Daily', 'Weekly'] },
        { label: 'Cooldown Period', value: '24 hours', type: 'select', options: ['None', '12 hours', '24 hours', '7 days'] },
      ],
      notifications: [
        { channel: 'Email', target: 'AR Manager', icon: 'bi-envelope', iconBg: '#EFF6FF', iconColor: '#2563EB', enabled: true },
        { channel: 'Slack', target: '#collections', icon: 'bi-chat-dots', iconBg: '#EDE9FE', iconColor: '#7C3AED', enabled: true },
        { channel: 'In-App', target: 'Alert Center', icon: 'bi-bell', iconBg: '#FEF3C7', iconColor: '#D97706', enabled: true },
      ],
    },
    {
      id: 'RUL-004', name: 'Budget Variance Exceeds Materiality', category: 'Variance',
      catBg: '#EDE9FE', catColor: '#5B21B6', severity: 'High', enabled: true,
      triggered: 24, lastTriggered: '1h ago', falsePositive: '5.8%', conditionLogic: 'OR',
      conditions: [
        { field: 'budget_variance_pct', operator: '>', value: '15%' },
        { field: 'budget_variance_amt', operator: '>', value: '$50,000' },
      ],
      thresholds: [
        { label: 'Pct Threshold', value: '15%', type: 'text' },
        { label: 'Amount Threshold', value: '$50,000', type: 'text' },
        { label: 'Evaluation Frequency', value: 'Daily', type: 'select', options: ['Hourly', 'Daily', 'Weekly'] },
      ],
      notifications: [
        { channel: 'Email', target: 'VP Finance, Budget Owners', icon: 'bi-envelope', iconBg: '#EFF6FF', iconColor: '#2563EB', enabled: true },
        { channel: 'In-App', target: 'Alert Center', icon: 'bi-bell', iconBg: '#FEF3C7', iconColor: '#D97706', enabled: true },
      ],
    },
    {
      id: 'RUL-005', name: 'IC Balance Imbalance Detection', category: 'Operational',
      catBg: '#E8F5F1', catColor: '#0D6B5C', severity: 'High', enabled: true,
      triggered: 6, lastTriggered: '45m ago', falsePositive: '0%', conditionLogic: 'AND',
      conditions: [
        { field: 'ic_imbalance_amount', operator: '>', value: '$10,000' },
        { field: 'close_period_active', operator: '=', value: 'true' },
      ],
      thresholds: [
        { label: 'Imbalance Threshold', value: '$10,000', type: 'text' },
        { label: 'Evaluation Frequency', value: 'Every 30 min', type: 'select', options: ['Real-time', 'Every 30 min', 'Hourly'] },
        { label: 'Active Window', value: 'Close period', type: 'select', options: ['Always', 'Close period', 'Weekdays'] },
      ],
      notifications: [
        { channel: 'Email', target: 'Controller', icon: 'bi-envelope', iconBg: '#EFF6FF', iconColor: '#2563EB', enabled: true },
        { channel: 'Slack', target: '#intercompany', icon: 'bi-chat-dots', iconBg: '#EDE9FE', iconColor: '#7C3AED', enabled: true },
        { channel: 'In-App', target: 'Alert Center', icon: 'bi-bell', iconBg: '#FEF3C7', iconColor: '#D97706', enabled: true },
      ],
    },
    {
      id: 'RUL-006', name: 'Agent Latency Above 200ms Sustained', category: 'System',
      catBg: '#F3F4F6', catColor: '#374151', severity: 'Medium', enabled: true,
      triggered: 4, lastTriggered: '4h ago', falsePositive: '8.2%', conditionLogic: 'AND',
      conditions: [
        { field: 'agent_latency_avg_ms', operator: '>', value: '200' },
        { field: 'sustained_minutes', operator: '≥', value: '5' },
      ],
      thresholds: [
        { label: 'Latency Threshold', value: '200ms', type: 'text' },
        { label: 'Sustained Duration', value: '5 min', type: 'text' },
        { label: 'Evaluation Frequency', value: 'Real-time', type: 'select', options: ['Real-time', 'Every 5 min'] },
      ],
      notifications: [
        { channel: 'Slack', target: '#engineering-alerts', icon: 'bi-chat-dots', iconBg: '#EDE9FE', iconColor: '#7C3AED', enabled: true },
        { channel: 'Webhook', target: 'PagerDuty', icon: 'bi-broadcast', iconBg: '#F3F4F6', iconColor: '#374151', enabled: true },
      ],
    },
    {
      id: 'RUL-007', name: 'SOX Control Testing Reminder', category: 'Compliance',
      catBg: '#ECFDF5', catColor: '#059669', severity: 'Low', enabled: true,
      triggered: 2, lastTriggered: '6h ago', falsePositive: '0%', conditionLogic: 'AND',
      conditions: [
        { field: 'sox_deadline_days', operator: '≤', value: '14' },
      ],
      thresholds: [
        { label: 'Days Before Deadline', value: '14', type: 'number' },
        { label: 'Reminder Frequency', value: 'Weekly', type: 'select', options: ['Daily', 'Weekly'] },
      ],
      notifications: [
        { channel: 'Email', target: 'Internal Audit', icon: 'bi-envelope', iconBg: '#EFF6FF', iconColor: '#2563EB', enabled: true },
        { channel: 'In-App', target: 'Alert Center', icon: 'bi-bell', iconBg: '#FEF3C7', iconColor: '#D97706', enabled: true },
      ],
    },
    {
      id: 'RUL-008', name: 'Close Task Overdue Escalation', category: 'Operational',
      catBg: '#E8F5F1', catColor: '#0D6B5C', severity: 'Medium', enabled: false,
      triggered: 0, lastTriggered: '—', falsePositive: '—', conditionLogic: 'AND',
      conditions: [
        { field: 'close_task_overdue_hours', operator: '>', value: '24' },
      ],
      thresholds: [
        { label: 'Overdue Threshold', value: '24 hours', type: 'text' },
        { label: 'Evaluation Frequency', value: 'Hourly', type: 'select', options: ['Every 30 min', 'Hourly', 'Daily'] },
      ],
      notifications: [
        { channel: 'Email', target: 'Controller', icon: 'bi-envelope', iconBg: '#EFF6FF', iconColor: '#2563EB', enabled: true },
        { channel: 'In-App', target: 'Alert Center', icon: 'bi-bell', iconBg: '#FEF3C7', iconColor: '#D97706', enabled: true },
      ],
    },
  ];

  newRuleChannels = [
    { name: 'Email', icon: 'bi-envelope', color: '#2563EB', enabled: true },
    { name: 'Slack', icon: 'bi-chat-dots', color: '#7C3AED', enabled: true },
    { name: 'SMS', icon: 'bi-phone', color: '#059669', enabled: false },
    { name: 'In-App', icon: 'bi-bell', color: '#D97706', enabled: true },
    { name: 'Webhook', icon: 'bi-broadcast', color: '#374151', enabled: false },
    { name: 'Teams', icon: 'bi-microsoft-teams', color: '#5558AF', enabled: false },
    { name: 'PagerDuty', icon: 'bi-telephone-inbound', color: '#059669', enabled: false },
    { name: 'Jira', icon: 'bi-kanban', color: '#2563EB', enabled: false },
  ];

  get filteredRules() {
    let result = this.rules;
    if (this.activeCategory !== 'All') result = result.filter(r => r.category === this.activeCategory);
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(t) || r.id.toLowerCase().includes(t) || r.category.toLowerCase().includes(t));
    }
    return result;
  }

  getSevColor(sev: string): string {
    const m: any = { Critical: '#DC2626', High: '#D97706', Medium: '#2563EB', Low: '#6B7280' };
    return m[sev] || '#6B7280';
  }

  getSevBg(sev: string): string {
    const m: any = { Critical: '#FEE2E2', High: '#FEF3C7', Medium: '#EFF6FF', Low: '#F3F4F6' };
    return m[sev] || '#F3F4F6';
  }

  toggleRule(id: string) { this.expandedRule = this.expandedRule === id ? '' : id; }

  onSearch(event: Event) { this.searchTerm = (event.target as HTMLInputElement).value; }
}