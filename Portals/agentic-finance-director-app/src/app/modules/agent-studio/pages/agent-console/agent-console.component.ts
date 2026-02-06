import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-agent-console',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/agent-studio/agent-console">Agent Studio</a>
      <span class="separator">/</span>
      <span class="current">Agent Console</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Agent Console</h1>
        <p class="afda-page-subtitle">Monitor, interact with, and manage AI finance agents</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-arrow-repeat"></i> Refresh
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-plus-lg"></i> Deploy Agent
        </button>
      </div>
    </div>

    <!-- Agent Fleet Summary -->
    <div class="fleet-strip stagger">
      @for (s of fleetStats; track s.label) {
        <div class="fleet-card">
          <div class="fc-icon" [style.background]="s.iconBg">
            <i [class]="'bi ' + s.icon" [style.color]="s.iconColor"></i>
          </div>
          <div>
            <div class="fc-value font-mono">{{ s.value }}</div>
            <div class="fc-label">{{ s.label }}</div>
          </div>
        </div>
      }
    </div>

    <!-- Main Layout: Agent List + Chat -->
    <div class="console-layout">
      <!-- Agent List -->
      <div class="agent-list-panel afda-card" style="padding: 0; animation: fadeUp 0.4s ease 0.08s both;">
        <div class="alp-header">
          <span class="alp-title">Active Agents</span>
          <span class="alp-count">{{ agents.length }}</span>
        </div>
        @for (agent of agents; track agent.id) {
          <div class="agent-item" [class.active]="selectedAgent === agent.id"
               (click)="selectedAgent = agent.id">
            <div class="agent-avatar" [style.background]="agent.color">
              <i [class]="'bi ' + agent.icon" style="color: white; font-size: 16px;"></i>
            </div>
            <div class="agent-info">
              <div class="agent-name">{{ agent.name }}</div>
              <div class="agent-engine">{{ agent.engine }}</div>
            </div>
            <div class="agent-status-col">
              <div class="agent-pulse" [style.background]="agent.statusColor"></div>
              <span class="agent-status-text">{{ agent.status }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Agent Detail + Chat -->
      <div class="agent-detail-panel">
        <!-- Agent Header Card -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.1s both;">
          <div class="ad-header">
            <div class="ad-avatar" [style.background]="activeAgentData.color">
              <i [class]="'bi ' + activeAgentData.icon" style="color: white; font-size: 22px;"></i>
            </div>
            <div class="ad-info">
              <div class="ad-name">{{ activeAgentData.name }}</div>
              <div class="ad-desc">{{ activeAgentData.description }}</div>
              <div class="ad-tags">
                @for (tag of activeAgentData.tags; track tag) {
                  <span class="ad-tag">{{ tag }}</span>
                }
              </div>
            </div>
            <div class="ad-actions">
              <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 6px 12px;">
                <i class="bi bi-pause-fill"></i> Pause
              </button>
              <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 6px 12px;">
                <i class="bi bi-gear"></i> Config
              </button>
            </div>
          </div>

          <!-- Agent Metrics -->
          <div class="ad-metrics">
            @for (m of activeAgentData.metrics; track m.label) {
              <div class="ad-metric">
                <div class="adm-value font-mono">{{ m.value }}</div>
                <div class="adm-label">{{ m.label }}</div>
              </div>
            }
          </div>
        </div>

        <!-- Chat Interface -->
        <div class="afda-card chat-card" style="margin-top: 14px; animation: fadeUp 0.4s ease 0.14s both;">
          <div class="chat-header">
            <div class="afda-card-title">Agent Chat</div>
            <span style="font-size: 11px; color: var(--text-tertiary);">Session: 14m 22s</span>
          </div>
          <div class="chat-messages">
            @for (msg of chatMessages; track msg.text) {
              <div class="chat-msg" [class.agent]="msg.from === 'agent'" [class.user]="msg.from === 'user'">
                @if (msg.from === 'agent') {
                  <div class="chat-avatar" [style.background]="activeAgentData.color">
                    <i class="bi bi-robot" style="color: white; font-size: 12px;"></i>
                  </div>
                }
                <div class="chat-bubble" [class.agent-bubble]="msg.from === 'agent'" [class.user-bubble]="msg.from === 'user'">
                  <div class="chat-text" [innerHTML]="msg.text"></div>
                  <div class="chat-time">{{ msg.time }}</div>
                </div>
              </div>
            }
          </div>
          <div class="chat-input-area">
            <input type="text" class="chat-input" placeholder="Ask the agent or give instructions...">
            <button class="afda-btn afda-btn-primary" style="padding: 8px 16px;">
              <i class="bi bi-send"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Activity + Recent -->
      <div class="console-side">
        <!-- Live Activity Feed -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.12s both;">
          <div class="afda-card-header">
            <div class="afda-card-title">Live Activity</div>
            <div class="live-dot-wrap">
              <div class="live-dot"></div>
              <span style="font-size: 11px; color: var(--text-tertiary);">Live</span>
            </div>
          </div>
          @for (activity of activityFeed; track activity.time) {
            <div class="activity-item">
              <div class="act-icon" [style.background]="activity.iconBg">
                <i [class]="'bi ' + activity.icon" [style.color]="activity.iconColor"></i>
              </div>
              <div class="act-info">
                <div class="act-msg">{{ activity.message }}</div>
                <div class="act-time">{{ activity.time }}</div>
              </div>
              <span class="afda-badge" [ngClass]="activity.badgeClass" style="font-size: 9px;">{{ activity.badge }}</span>
            </div>
          }
        </div>

        <!-- Recent Executions -->
        <div class="afda-card" style="margin-top: 14px; animation: fadeUp 0.4s ease 0.16s both;">
          <div class="afda-card-title" style="margin-bottom: 12px;">Recent Executions</div>
          @for (exec of recentExecs; track exec.id) {
            <div class="exec-row">
              <div class="exec-info">
                <div class="exec-name">{{ exec.name }}</div>
                <div class="exec-meta">{{ exec.agent }} · {{ exec.duration }}</div>
              </div>
              <span class="afda-badge" [ngClass]="exec.badgeClass">{{ exec.status }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Fleet Strip */
    .fleet-strip {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 12px; margin-bottom: 20px;
    }

    .fleet-card {
      display: flex; align-items: center; gap: 12px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 14px 18px;
      box-shadow: var(--shadow-card);
      animation: fadeUp 0.4s ease both;
    }

    .fc-icon {
      width: 40px; height: 40px; border-radius: var(--radius-md);
      display: grid; place-items: center; font-size: 17px; flex-shrink: 0;
    }

    .fc-value { font-size: 18px; font-weight: 700; color: var(--text-primary); }
    .fc-label { font-size: 11px; color: var(--text-tertiary); }

    /* Console Layout */
    .console-layout {
      display: grid; grid-template-columns: 240px 1fr 280px;
      gap: 14px;
    }

    /* Agent List */
    .alp-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 16px; border-bottom: 1px solid var(--border-light);
    }

    .alp-title { font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .alp-count {
      font-size: 11px; font-weight: 600; background: var(--primary-light);
      color: var(--primary); padding: 2px 8px; border-radius: 10px;
    }

    .agent-item {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; cursor: pointer;
      border-bottom: 1px solid var(--border-light);
      transition: all 0.1s;
      &:hover { background: var(--bg-section); }
      &.active { background: var(--primary-subtle); border-left: 3px solid var(--primary); }
    }

    .agent-avatar {
      width: 34px; height: 34px; border-radius: var(--radius-md);
      display: grid; place-items: center; flex-shrink: 0;
    }

    .agent-info { flex: 1; min-width: 0; }
    .agent-name { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
    .agent-engine { font-size: 10.5px; color: var(--text-tertiary); }

    .agent-status-col { display: flex; align-items: center; gap: 4px; }

    .agent-pulse {
      width: 8px; height: 8px; border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .agent-status-text { font-size: 10px; color: var(--text-tertiary); }

    /* Agent Detail */
    .ad-header { display: flex; align-items: flex-start; gap: 16px; }

    .ad-avatar {
      width: 50px; height: 50px; border-radius: var(--radius-lg);
      display: grid; place-items: center; flex-shrink: 0;
    }

    .ad-info { flex: 1; }
    .ad-name { font-size: 16px; font-weight: 700; color: var(--text-primary); }
    .ad-desc { font-size: 12.5px; color: var(--text-secondary); margin-top: 2px; }

    .ad-tags { display: flex; gap: 4px; margin-top: 8px; flex-wrap: wrap; }

    .ad-tag {
      font-size: 10px; font-weight: 600; padding: 2px 8px;
      background: var(--bg-section); border: 1px solid var(--border-light);
      border-radius: 10px; color: var(--text-secondary);
    }

    .ad-actions { display: flex; gap: 6px; }

    .ad-metrics {
      display: flex; gap: 16px; margin-top: 16px;
      padding-top: 14px; border-top: 1px solid var(--border-light);
    }

    .ad-metric {
      flex: 1; text-align: center; padding: 8px;
      background: var(--bg-section); border-radius: var(--radius-sm);
    }

    .adm-value { font-size: 16px; font-weight: 700; color: var(--text-primary); }
    .adm-label { font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; margin-top: 1px; }

    /* Chat */
    .chat-card { display: flex; flex-direction: column; }

    .chat-header {
      display: flex; justify-content: space-between; align-items: center;
      padding-bottom: 12px; border-bottom: 1px solid var(--border-light);
      margin-bottom: 12px;
    }

    .chat-messages {
      flex: 1; max-height: 320px; overflow-y: auto;
      display: flex; flex-direction: column; gap: 10px;
    }

    .chat-msg {
      display: flex; gap: 8px;
      &.user { justify-content: flex-end; }
    }

    .chat-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      display: grid; place-items: center; flex-shrink: 0;
    }

    .chat-bubble {
      max-width: 80%; padding: 10px 14px;
      border-radius: 12px; font-size: 13px; line-height: 1.5;
    }

    .agent-bubble {
      background: var(--bg-section); color: var(--text-primary);
      border-bottom-left-radius: 4px;
    }

    .user-bubble {
      background: var(--primary); color: white;
      border-bottom-right-radius: 4px;
    }

    .chat-time { font-size: 10px; opacity: 0.6; margin-top: 4px; }

    .chat-input-area {
      display: flex; gap: 8px; margin-top: 12px;
      padding-top: 12px; border-top: 1px solid var(--border-light);
    }

    .chat-input {
      flex: 1; padding: 10px 14px; border: 1px solid var(--border);
      border-radius: var(--radius-md); font-size: 13px;
      font-family: var(--font-sans); outline: none;
      transition: border-color 0.15s;
      &:focus { border-color: var(--primary); }
      &::placeholder { color: var(--text-tertiary); }
    }

    /* Side Panel */
    .console-side { display: flex; flex-direction: column; }

    .live-dot-wrap { display: flex; align-items: center; gap: 6px; }

    .live-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #DC2626; animation: pulse 1.5s ease-in-out infinite;
    }

    .activity-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .act-icon {
      width: 28px; height: 28px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 13px; flex-shrink: 0;
    }

    .act-info { flex: 1; }
    .act-msg { font-size: 12px; color: var(--text-primary); }
    .act-time { font-size: 10.5px; color: var(--text-tertiary); }

    /* Recent Execs */
    .exec-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .exec-name { font-size: 12px; font-weight: 600; color: var(--text-primary); }
    .exec-meta { font-size: 10.5px; color: var(--text-tertiary); }

    @media (max-width: 1200px) {
      .fleet-strip { grid-template-columns: repeat(3, 1fr); }
      .console-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class AgentConsoleComponent {
  selectedAgent = 'close-agent';

  fleetStats = [
    { value: '8', label: 'Total Agents', icon: 'bi-robot', iconBg: '#E8F5F1', iconColor: '#0D6B5C' },
    { value: '5', label: 'Running', icon: 'bi-play-circle', iconBg: '#ECFDF5', iconColor: '#059669' },
    { value: '2', label: 'Idle', icon: 'bi-pause-circle', iconBg: '#FEF3C7', iconColor: '#D97706' },
    { value: '1,247', label: 'Tasks Today', icon: 'bi-lightning', iconBg: '#EFF6FF', iconColor: '#2563EB' },
    { value: '99.2%', label: 'Success Rate', icon: 'bi-graph-up', iconBg: '#EDE9FE', iconColor: '#7C3AED' },
  ];

  agents = [
    { id: 'close-agent', name: 'Close Agent', engine: 'LangGraph', icon: 'bi-calendar-check', color: '#0D6B5C', status: 'Running', statusColor: '#059669' },
    { id: 'recon-agent', name: 'Recon Agent', engine: 'AWS Bedrock', icon: 'bi-check2-all', color: '#2563EB', status: 'Running', statusColor: '#059669' },
    { id: 'flux-agent', name: 'Flux Agent', engine: 'LangGraph', icon: 'bi-chat-text', color: '#7C3AED', status: 'Running', statusColor: '#059669' },
    { id: 'forecast-agent', name: 'Forecast Agent', engine: 'n8n', icon: 'bi-graph-up-arrow', color: '#D97706', status: 'Running', statusColor: '#059669' },
    { id: 'je-agent', name: 'JE Agent', engine: 'LangGraph', icon: 'bi-journal-plus', color: '#059669', status: 'Running', statusColor: '#059669' },
    { id: 'ar-agent', name: 'AR Collection', engine: 'n8n', icon: 'bi-envelope', color: '#DB2777', status: 'Idle', statusColor: '#D97706' },
    { id: 'risk-agent', name: 'Risk Monitor', engine: 'AWS Bedrock', icon: 'bi-shield-check', color: '#DC2626', status: 'Idle', statusColor: '#D97706' },
    { id: 'report-agent', name: 'Report Gen', engine: 'LangGraph', icon: 'bi-file-earmark-text', color: '#6366F1', status: 'Stopped', statusColor: '#9CA3AF' },
  ];

  get activeAgentData() {
    const agent = this.agents.find(a => a.id === this.selectedAgent) || this.agents[0];
    const details: any = {
      'close-agent': {
        description: 'Manages month-end close workflow — automates JE posting, reconciliation triggers, and checklist progression',
        tags: ['Month-End', 'Automation', 'LangGraph', 'Multi-Step'],
        metrics: [
          { value: '847', label: 'Tasks Completed' },
          { value: '14m', label: 'Avg Duration' },
          { value: '99.4%', label: 'Accuracy' },
          { value: '$42K', label: 'Cost Savings' },
          { value: '3.2s', label: 'Latency' },
        ]
      }
    };
    const d = details[agent.id] || details['close-agent'];
    return { ...agent, ...d };
  }

  chatMessages = [
    { from: 'user', text: 'What\'s the status of the January close?', time: '2:08 PM' },
    { from: 'agent', text: 'The January 2026 close is <strong>68% complete</strong>. Phase 1 (Sub-ledger Close) and most of Phase 2 (Journal Entries) are done. Currently working on Phase 3 — account reconciliation is at 78% with 12 unmatched items remaining.', time: '2:08 PM' },
    { from: 'user', text: 'What are the main blockers?', time: '2:10 PM' },
    { from: 'agent', text: 'Two blockers identified:<br><br>1. <strong>Accrued expenses recon</strong> — 7 unmatched items ($15.8K). I\'ve identified 3 auto-match candidates at 92-98% confidence.<br><br>2. <strong>DE entity IC entry</strong> — $42K management fee awaiting Berlin approval. I\'ve sent a reminder to the AFDA-DE controller.', time: '2:10 PM' },
    { from: 'user', text: 'Go ahead and accept the auto-match suggestions.', time: '2:12 PM' },
    { from: 'agent', text: 'Done! ✅ Accepted 3 matches:<br>• AWS credit memo → AWS refund ($1,200)<br>• Vendor payment → Check #4821 ($8,400)<br>• Client receipt → Wire TXN-98321 ($24,600)<br><br>Reconciliation is now at <strong>94%</strong> with 4 items remaining. Estimated close completion: <strong>Feb 8</strong>.', time: '2:12 PM' },
  ];

  activityFeed = [
    { message: 'Close Agent posted 3 adjusting entries', time: '2:14 PM', icon: 'bi-journal-plus', iconBg: '#E8F5F1', iconColor: '#0D6B5C', badge: 'JE', badgeClass: 'afda-badge-success' },
    { message: 'Recon Agent matched 3 items ($34.2K)', time: '2:12 PM', icon: 'bi-check2-all', iconBg: '#EFF6FF', iconColor: '#2563EB', badge: 'Recon', badgeClass: 'afda-badge-success' },
    { message: 'Flux Agent generated 4 commentaries', time: '2:05 PM', icon: 'bi-chat-text', iconBg: '#EDE9FE', iconColor: '#7C3AED', badge: 'Flux', badgeClass: 'afda-badge-success' },
    { message: 'Forecast Agent updated 13-week model', time: '1:45 PM', icon: 'bi-graph-up-arrow', iconBg: '#FEF3C7', iconColor: '#D97706', badge: 'Forecast', badgeClass: 'afda-badge-success' },
    { message: 'JE Agent flagged duplicate entry JE-0819', time: '1:30 PM', icon: 'bi-exclamation-circle', iconBg: '#FEE2E2', iconColor: '#DC2626', badge: 'Alert', badgeClass: 'afda-badge-high' },
    { message: 'AR Agent sent 2 collection reminders', time: '12:00 PM', icon: 'bi-envelope', iconBg: '#FCE7F3', iconColor: '#DB2777', badge: 'AR', badgeClass: 'afda-badge-success' },
  ];

  recentExecs = [
    { id: 1, name: 'Monthly close workflow', agent: 'Close Agent', duration: '14m 22s', status: 'Running', badgeClass: 'afda-badge-high' },
    { id: 2, name: 'Account reconciliation', agent: 'Recon Agent', duration: '8m 14s', status: 'Complete', badgeClass: 'afda-badge-success' },
    { id: 3, name: 'Flux commentary gen', agent: 'Flux Agent', duration: '3m 45s', status: 'Complete', badgeClass: 'afda-badge-success' },
    { id: 4, name: '13-week forecast refresh', agent: 'Forecast Agent', duration: '6m 02s', status: 'Complete', badgeClass: 'afda-badge-success' },
    { id: 5, name: 'Duplicate JE detection', agent: 'JE Agent', duration: '1m 18s', status: 'Alert', badgeClass: 'afda-badge-danger' },
  ];
}