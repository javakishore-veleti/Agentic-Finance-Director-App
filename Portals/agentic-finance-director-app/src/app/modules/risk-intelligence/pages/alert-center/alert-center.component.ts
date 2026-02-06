import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-alert-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/risk-intelligence">Risk Intelligence</a>
      <span class="separator">/</span>
      <span class="current">Alert Center</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Alert Center</h1>
        <p class="afda-page-subtitle">Real-time risk alerts, AI triage, and incident management</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-funnel"></i> Advanced Filters
        </button>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-check2-all"></i> Mark All Read
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-plus-lg"></i> Create Alert Rule
        </button>
      </div>
    </div>

    <!-- Alert Summary Banner -->
    <div class="alert-banner stagger">
      <div class="ab-left">
        <div class="ab-pulse-ring">
          <div class="ab-pulse-dot"></div>
        </div>
        <div>
          <div class="ab-live">LIVE MONITORING</div>
          <div class="ab-count">{{ totalActive }} active alerts across {{ ruleCount }} rules</div>
        </div>
      </div>
      <div class="ab-severity-pills">
        @for (sev of severitySummary; track sev.label) {
          <div class="sev-pill" [style.background]="sev.bg" [style.color]="sev.color" [style.border-color]="sev.border">
            <span class="sev-count font-mono">{{ sev.count }}</span>
            <span class="sev-label">{{ sev.label }}</span>
          </div>
        }
      </div>
    </div>

    <!-- KPI Row -->
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

    <!-- Filters -->
    <div class="filter-bar stagger">
      <div class="filter-search">
        <i class="bi bi-search"></i>
        <input type="text" placeholder="Search alerts..." class="filter-search-input" (input)="onSearch($event)">
      </div>
      <div class="filter-chips">
        @for (f of severityFilters; track f) {
          <button class="filter-chip" [class.active]="activeSeverity === f"
                  (click)="activeSeverity = f">{{ f }}</button>
        }
      </div>
      <div class="filter-chips">
        @for (f of statusFilters; track f) {
          <button class="filter-chip" [class.active]="activeStatus === f"
                  (click)="activeStatus = f">{{ f }}</button>
        }
      </div>
    </div>

    <!-- Alert Feed + Detail Panel -->
    <div class="alert-layout">
      <!-- Alert Feed -->
      <div class="alert-feed">
        @for (alert of filteredAlerts; track alert.id) {
          <div class="alert-item" [class.selected]="selectedAlert === alert.id"
               [class.unread]="!alert.read" (click)="selectedAlert = alert.id">
            <!-- Severity Indicator -->
            <div class="ai-severity" [style.background]="getSevColor(alert.severity)"></div>
            <div class="ai-content">
              <div class="ai-top">
                <span class="ai-badge" [style.background]="getSevBg(alert.severity)"
                      [style.color]="getSevColor(alert.severity)">{{ alert.severity }}</span>
                <span class="ai-category">{{ alert.category }}</span>
                <span class="ai-time">{{ alert.time }}</span>
              </div>
              <div class="ai-title">{{ alert.title }}</div>
              <div class="ai-desc">{{ alert.description }}</div>
              <div class="ai-bottom">
                <span class="ai-source">
                  <i [class]="'bi ' + alert.sourceIcon"></i> {{ alert.source }}
                </span>
                <span class="ai-status-chip" [style.background]="getStatusBg(alert.status)"
                      [style.color]="getStatusColor(alert.status)">{{ alert.status }}</span>
                @if (alert.aiTriaged) {
                  <span class="ai-triage-chip"><i class="bi bi-robot"></i> AI Triaged</span>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Detail Panel -->
      <div class="alert-detail">
        @if (selectedAlertData) {
          <!-- Header -->
          <div class="ad-header">
            <div class="ad-sev-bar" [style.background]="getSevColor(selectedAlertData.severity)"></div>
            <div class="ad-badge" [style.background]="getSevBg(selectedAlertData.severity)"
                 [style.color]="getSevColor(selectedAlertData.severity)">
              {{ selectedAlertData.severity }}
            </div>
            <div class="ad-title">{{ selectedAlertData.title }}</div>
            <div class="ad-meta">
              <span>{{ selectedAlertData.category }}</span>
              <span>·</span>
              <span>{{ selectedAlertData.time }}</span>
              <span>·</span>
              <span>{{ selectedAlertData.id }}</span>
            </div>
          </div>

          <!-- Description -->
          <div class="ad-section">
            <div class="ad-section-title">Description</div>
            <div class="ad-text">{{ selectedAlertData.fullDescription }}</div>
          </div>

          <!-- AI Analysis -->
          @if (selectedAlertData.aiAnalysis) {
            <div class="ad-section ai-analysis-section">
              <div class="ad-section-title">
                <i class="bi bi-robot" style="color: var(--primary);"></i> AI Analysis
              </div>
              <div class="ai-analysis-box">
                <div class="ai-analysis-text">{{ selectedAlertData.aiAnalysis }}</div>
                <div class="ai-confidence">
                  <span>Confidence</span>
                  <div class="ai-conf-bar">
                    <div class="ai-conf-fill" [style.width.%]="selectedAlertData.aiConfidence"></div>
                  </div>
                  <span class="font-mono">{{ selectedAlertData.aiConfidence }}%</span>
                </div>
              </div>
            </div>
          }

          <!-- Impact -->
          <div class="ad-section">
            <div class="ad-section-title">Impact Assessment</div>
            <div class="ad-impact-grid">
              @for (impact of selectedAlertData.impacts; track impact.label) {
                <div class="ad-impact-item">
                  <span class="ad-impact-label">{{ impact.label }}</span>
                  <span class="ad-impact-value font-mono" [style.color]="impact.color">{{ impact.value }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Timeline -->
          <div class="ad-section">
            <div class="ad-section-title">Timeline</div>
            @for (event of selectedAlertData.timeline; track event.time) {
              <div class="ad-timeline-item">
                <div class="ad-tl-dot" [style.background]="event.color"></div>
                <div class="ad-tl-content">
                  <span class="ad-tl-time font-mono">{{ event.time }}</span>
                  <span class="ad-tl-text">{{ event.text }}</span>
                </div>
              </div>
            }
          </div>

          <!-- Actions -->
          <div class="ad-actions">
            <button class="afda-btn afda-btn-primary" style="flex: 1; justify-content: center;">
              <i class="bi bi-check-lg"></i> Acknowledge
            </button>
            <button class="afda-btn afda-btn-outline" style="flex: 1; justify-content: center;">
              <i class="bi bi-person-plus"></i> Assign
            </button>
            <button class="afda-btn afda-btn-outline">
              <i class="bi bi-three-dots"></i>
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Alert Banner */
    .alert-banner {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 20px; background: var(--bg-card);
      border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card); margin-bottom: 16px;
    }

    .ab-left { display: flex; align-items: center; gap: 12px; }

    .ab-pulse-ring {
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(220, 38, 38, 0.1);
      display: grid; place-items: center;
      animation: pulseRing 2s ease-in-out infinite;
    }

    @keyframes pulseRing {
      0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.2); }
      50% { box-shadow: 0 0 0 8px rgba(220,38,38,0); }
    }

    .ab-pulse-dot {
      width: 10px; height: 10px; border-radius: 50%; background: #DC2626;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .ab-live {
      font-size: 10px; font-weight: 700; letter-spacing: 1px;
      color: #DC2626; text-transform: uppercase;
    }

    .ab-count { font-size: 13px; color: var(--text-secondary); margin-top: 1px; }

    .ab-severity-pills { display: flex; gap: 8px; }

    .sev-pill {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 20px;
      border: 1px solid; font-size: 12px; font-weight: 600;
    }

    .sev-count { font-size: 16px; font-weight: 700; }

    /* KPIs */
    .kpi-row {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 12px; margin-bottom: 16px;
    }

    /* Filters */
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

    /* Alert Layout */
    .alert-layout {
      display: grid; grid-template-columns: 1fr 400px;
      gap: 16px;
    }

    /* Alert Feed */
    .alert-feed {
      display: flex; flex-direction: column; gap: 6px;
      max-height: 620px; overflow-y: auto;
      padding-right: 4px;
    }

    .alert-item {
      display: flex; gap: 0;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-md); overflow: hidden;
      cursor: pointer; transition: all 0.15s;
      animation: fadeUp 0.3s ease both;
      &:hover { border-color: #D1D5DB; box-shadow: var(--shadow-sm); }
      &.selected { border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-light); }
      &.unread { background: #FEFFFE; }
      &.unread .ai-title { font-weight: 700; }
    }

    .ai-severity {
      width: 4px; flex-shrink: 0;
    }

    .ai-content { padding: 12px 16px; flex: 1; min-width: 0; }

    .ai-top {
      display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
    }

    .ai-badge {
      font-size: 10px; font-weight: 700; padding: 1px 8px;
      border-radius: 10px; text-transform: uppercase; letter-spacing: 0.3px;
    }

    .ai-category { font-size: 11px; color: var(--text-tertiary); }
    .ai-time { font-size: 11px; color: var(--text-tertiary); margin-left: auto; }

    .ai-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 3px; }
    .ai-desc {
      font-size: 12px; color: var(--text-secondary); line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }

    .ai-bottom {
      display: flex; align-items: center; gap: 8px; margin-top: 8px;
    }

    .ai-source {
      font-size: 11px; color: var(--text-tertiary);
      display: flex; align-items: center; gap: 4px;
    }

    .ai-status-chip {
      font-size: 10px; font-weight: 600; padding: 1px 8px;
      border-radius: 10px;
    }

    .ai-triage-chip {
      font-size: 10px; font-weight: 500; padding: 1px 8px;
      border-radius: 10px; background: var(--primary-light);
      color: var(--primary); display: flex; align-items: center; gap: 3px;
    }

    /* Detail Panel */
    .alert-detail {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card);
      padding: 0; overflow: hidden; max-height: 620px; overflow-y: auto;
      animation: fadeUp 0.4s ease 0.1s both;
    }

    .ad-header {
      padding: 18px 20px; border-bottom: 1px solid var(--border-light);
      position: relative;
    }

    .ad-sev-bar {
      position: absolute; top: 0; left: 0; right: 0; height: 3px;
    }

    .ad-badge {
      display: inline-flex; font-size: 10px; font-weight: 700;
      padding: 2px 10px; border-radius: 10px;
      text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px;
    }

    .ad-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }

    .ad-meta {
      display: flex; gap: 6px; font-size: 11.5px; color: var(--text-tertiary);
    }

    .ad-section { padding: 16px 20px; border-bottom: 1px solid var(--border-light); }
    .ad-section:last-of-type { border-bottom: none; }

    .ad-section-title {
      font-size: 11px; font-weight: 700; color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px;
      display: flex; align-items: center; gap: 6px;
    }

    .ad-text { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }

    /* AI Analysis */
    .ai-analysis-box {
      padding: 14px; background: var(--primary-subtle);
      border: 1px solid var(--primary-light); border-radius: var(--radius-sm);
    }

    .ai-analysis-text {
      font-size: 12.5px; color: var(--text-primary); line-height: 1.6; margin-bottom: 10px;
    }

    .ai-confidence {
      display: flex; align-items: center; gap: 8px;
      font-size: 11px; color: var(--text-tertiary);
    }

    .ai-conf-bar {
      flex: 1; height: 5px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .ai-conf-fill {
      height: 100%; border-radius: 10px; background: var(--primary);
    }

    /* Impact */
    .ad-impact-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
    }

    .ad-impact-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 12px; background: var(--bg-section);
      border-radius: var(--radius-sm);
    }

    .ad-impact-label { font-size: 12px; color: var(--text-secondary); }
    .ad-impact-value { font-size: 13px; font-weight: 700; }

    /* Timeline */
    .ad-timeline-item {
      display: flex; gap: 10px; padding: 6px 0;
      position: relative;
    }

    .ad-tl-dot {
      width: 8px; height: 8px; border-radius: 50%;
      margin-top: 4px; flex-shrink: 0;
    }

    .ad-tl-content { display: flex; gap: 8px; flex: 1; }
    .ad-tl-time { font-size: 11px; color: var(--text-tertiary); min-width: 60px; }
    .ad-tl-text { font-size: 12px; color: var(--text-secondary); }

    /* Actions */
    .ad-actions {
      display: flex; gap: 8px; padding: 14px 20px;
      border-top: 1px solid var(--border-light);
    }

    @media (max-width: 1100px) {
      .kpi-row { grid-template-columns: repeat(3, 1fr); }
      .alert-layout { grid-template-columns: 1fr; }
      .alert-feed { max-height: 400px; }
    }
  `]
})
export class AlertCenterComponent {
  activeSeverity = 'All';
  activeStatus = 'All';
  searchTerm = '';
  selectedAlert = 'ALT-1001';
  totalActive = 14;
  ruleCount = 28;

  severityFilters = ['All', 'Critical', 'High', 'Medium', 'Low'];
  statusFilters = ['All', 'Open', 'Acknowledged', 'Resolved'];

  severitySummary = [
    { label: 'Critical', count: 2, bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' },
    { label: 'High', count: 5, bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
    { label: 'Medium', count: 4, bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
    { label: 'Low', count: 3, bg: '#F3F4F6', color: '#6B7280', border: '#D1D5DB' },
  ];

  kpis = [
    { label: 'Active Alerts', value: '14', trend: '↑ 3', trendDir: 'negative', footnote: 'vs yesterday', accent: 'red' },
    { label: 'Avg Response Time', value: '4.2m', trend: '↓ 1.8m', trendDir: 'positive', footnote: 'to acknowledge', accent: 'teal' },
    { label: 'AI Auto-Triaged', value: '82%', trend: '↑ 6%', trendDir: 'positive', footnote: 'of all alerts', accent: 'blue' },
    { label: 'False Positive Rate', value: '3.1%', trend: '↓ 0.8%', trendDir: 'positive', footnote: 'last 30 days', accent: 'green' },
    { label: 'MTTR', value: '18m', trend: '↓ 4m', trendDir: 'positive', footnote: 'mean time to resolve', accent: 'purple' },
  ];

  alerts: any[] = [
    {
      id: 'ALT-1001', severity: 'Critical', category: 'Liquidity', title: 'Cash balance projected below $2M threshold',
      description: 'Week 6 forecast shows operating cash dipping to $1.8M, below the $2M minimum liquidity covenant.',
      time: '2m ago', source: 'Forecast Agent', sourceIcon: 'bi-robot', status: 'Open', read: false, aiTriaged: true,
      fullDescription: 'The 13-week cash forecast updated at 2:00 PM projects operating cash of $1.8M in Week 6 (Mar 17-21), which is $200K below the $2M minimum liquidity covenant. This is primarily driven by a $1.2M vendor payment to TechSolutions Inc due Mar 18 combined with delayed AR collections from two major clients totaling $680K.',
      aiAnalysis: 'Based on historical patterns, this cash dip is likely temporary. Two AR collections ($420K from Meridian Corp and $260K from Apex Ltd) have high probability of arriving by Mar 14. Recommend: (1) Contact AP to negotiate 7-day extension on TechSolutions payment, (2) Accelerate collection calls on flagged AR. Risk of actual covenant breach: 15%.',
      aiConfidence: 92,
      impacts: [
        { label: 'Financial Impact', value: '-$200K', color: '#DC2626' },
        { label: 'Covenant Risk', value: 'High', color: '#DC2626' },
        { label: 'Affected Entity', value: 'Parent Co.', color: 'var(--text-primary)' },
        { label: 'Recovery Window', value: '5 days', color: '#D97706' },
      ],
      timeline: [
        { time: '2:00 PM', text: 'Forecast Agent detected threshold breach in Week 6', color: '#DC2626' },
        { time: '2:01 PM', text: 'AI Risk Agent auto-triaged as Critical — covenant risk', color: 'var(--primary)' },
        { time: '2:01 PM', text: 'Notification sent to Treasury team and CFO', color: '#2563EB' },
        { time: '2:02 PM', text: 'AI generated mitigation recommendations', color: 'var(--primary)' },
      ]
    },
    {
      id: 'ALT-1002', severity: 'Critical', category: 'Reconciliation', title: 'Unreconciled variance exceeds $50K tolerance',
      description: 'Bank account 4892 has $62,400 in unmatched transactions after automated reconciliation.',
      time: '18m ago', source: 'Recon Agent', sourceIcon: 'bi-robot', status: 'Open', read: false, aiTriaged: true,
      fullDescription: 'Daily automated reconciliation for Bank Account ****4892 (Chase Operating) completed with $62,400 in unmatched items, exceeding the $50K auto-escalation threshold. 8 transactions remain unmatched after fuzzy matching and rule-based pattern analysis.',
      aiAnalysis: 'Analysis of the 8 unmatched items suggests 5 are timing differences (checks in transit) likely to clear within 48 hours. The remaining 3 items ($18,200 total) appear to be duplicate ERP postings from the Jan 31 batch upload. Recommend reviewing JE batch #4412.',
      aiConfidence: 88,
      impacts: [
        { label: 'Unmatched Amount', value: '$62.4K', color: '#DC2626' },
        { label: 'Suspected Duplicates', value: '$18.2K', color: '#D97706' },
        { label: 'Account', value: '****4892', color: 'var(--text-primary)' },
        { label: 'Close Impact', value: 'Blocking', color: '#DC2626' },
      ],
      timeline: [
        { time: '1:42 PM', text: 'Recon Agent completed daily reconciliation cycle', color: '#2563EB' },
        { time: '1:42 PM', text: 'Variance threshold exceeded — alert created', color: '#DC2626' },
        { time: '1:43 PM', text: 'AI analysis identified probable duplicates in JE batch', color: 'var(--primary)' },
      ]
    },
    {
      id: 'ALT-1003', severity: 'High', category: 'Intercompany', title: 'IC imbalance detected between Parent and EU Sub',
      description: 'Intercompany balances out of sync by $34,200 — elimination entries may be incomplete.',
      time: '45m ago', source: 'IC Recon Agent', sourceIcon: 'bi-robot', status: 'Acknowledged', read: true, aiTriaged: true,
      fullDescription: 'Intercompany reconciliation between Parent Co. and EU Subsidiary shows a $34,200 imbalance on account 2100 (IC Payable/Receivable). The EU side posted a management fee invoice on Jan 30 that has not been recognized by the Parent entity.',
      aiAnalysis: 'This appears to be a timing issue. The EU Subsidiary posted invoice #EU-2026-0142 for management fees on Jan 30. The Parent entity has the invoice in AP queue but has not yet posted the corresponding JE. Auto-generating the elimination entry would resolve the imbalance.',
      aiConfidence: 95,
      impacts: [
        { label: 'Imbalance', value: '$34.2K', color: '#D97706' },
        { label: 'Entities', value: 'Parent ↔ EU', color: 'var(--text-primary)' },
        { label: 'Root Cause', value: 'Timing', color: '#2563EB' },
        { label: 'Close Impact', value: 'Moderate', color: '#D97706' },
      ],
      timeline: [
        { time: '1:15 PM', text: 'IC reconciliation run detected imbalance', color: '#D97706' },
        { time: '1:16 PM', text: 'AI identified unposted invoice as root cause', color: 'var(--primary)' },
        { time: '1:22 PM', text: 'Acknowledged by Sarah Chen (Accounting Manager)', color: '#059669' },
      ]
    },
    {
      id: 'ALT-1004', severity: 'High', category: 'Variance', title: 'Marketing spend 42% over budget in January',
      description: 'Actual marketing expense of $284K vs budget of $200K — material variance requires commentary.',
      time: '1h ago', source: 'Flux Agent', sourceIcon: 'bi-robot', status: 'Open', read: true, aiTriaged: false,
      fullDescription: 'January marketing expense came in at $284K against a budget of $200K, representing a 42% unfavorable variance. This exceeds the 15% materiality threshold for automatic escalation.',
      aiAnalysis: '',
      aiConfidence: 0,
      impacts: [
        { label: 'Variance', value: '+$84K', color: '#DC2626' },
        { label: 'Variance %', value: '42%', color: '#DC2626' },
        { label: 'Department', value: 'Marketing', color: 'var(--text-primary)' },
        { label: 'YTD Impact', value: '+$84K', color: '#D97706' },
      ],
      timeline: [
        { time: '1:00 PM', text: 'Budget vs actual comparison flagged variance', color: '#D97706' },
        { time: '1:00 PM', text: 'Auto-escalated — exceeds 15% materiality threshold', color: '#DC2626' },
      ]
    },
    {
      id: 'ALT-1005', severity: 'High', category: 'AR Aging', title: '3 invoices moved to 90+ days past due',
      description: 'TechVentures ($42K), GlobalTech ($28K), and Nexus Corp ($18K) now in 90+ day bucket.',
      time: '2h ago', source: 'AR Agent', sourceIcon: 'bi-robot', status: 'Open', read: true, aiTriaged: true,
      fullDescription: 'Three customer invoices have crossed the 90-day aging threshold.',
      aiAnalysis: 'TechVentures has a pattern of late payment but has always paid. Recommend escalating to their VP Finance. GlobalTech dispute is pending resolution — expect payment once credit memo is issued. Nexus Corp shows signs of financial distress — recommend increasing reserve.',
      aiConfidence: 86,
      impacts: [
        { label: 'Total at Risk', value: '$88K', color: '#DC2626' },
        { label: 'Customers', value: '3', color: 'var(--text-primary)' },
        { label: 'Reserve Needed', value: '+$18K', color: '#D97706' },
        { label: 'DSO Impact', value: '+2.4 days', color: '#D97706' },
      ],
      timeline: [
        { time: '12:00 PM', text: 'Daily AR aging scan detected threshold crossing', color: '#D97706' },
        { time: '12:01 PM', text: 'AI assessed collection probability per customer', color: 'var(--primary)' },
      ]
    },
    {
      id: 'ALT-1006', severity: 'Medium', category: 'Close Process', title: 'Month-end close Day 5 — 3 tasks overdue',
      description: 'Revenue recognition, lease accounting, and stock comp tasks past deadline.',
      time: '3h ago', source: 'Close Agent', sourceIcon: 'bi-robot', status: 'Acknowledged', read: true, aiTriaged: false,
      fullDescription: 'Three close tasks are past their scheduled completion date for the January close cycle.',
      aiAnalysis: '', aiConfidence: 0,
      impacts: [
        { label: 'Tasks Overdue', value: '3', color: '#D97706' },
        { label: 'Close Day', value: '5 of 7', color: 'var(--text-primary)' },
        { label: 'Close Risk', value: 'Moderate', color: '#D97706' },
        { label: 'Assigned To', value: '2 people', color: 'var(--text-primary)' },
      ],
      timeline: [
        { time: '11:00 AM', text: 'Close task deadlines passed without completion', color: '#D97706' },
        { time: '11:05 AM', text: 'Acknowledged by Michael Torres (Controller)', color: '#059669' },
      ]
    },
    {
      id: 'ALT-1007', severity: 'Medium', category: 'System', title: 'LangGraph latency spike detected (>200ms)',
      description: 'Average response time increased from 42ms to 218ms over the last 15 minutes.',
      time: '4h ago', source: 'System Monitor', sourceIcon: 'bi-speedometer2', status: 'Resolved', read: true, aiTriaged: true,
      fullDescription: 'LangGraph orchestration engine latency increased 5x above normal baseline.',
      aiAnalysis: 'Spike correlated with concurrent execution of 8 graphs during month-end close batch. No errors detected — performance returned to baseline after batch completed.',
      aiConfidence: 98,
      impacts: [
        { label: 'Peak Latency', value: '218ms', color: '#D97706' },
        { label: 'Duration', value: '15 min', color: 'var(--text-primary)' },
        { label: 'Affected Agents', value: '3', color: 'var(--text-primary)' },
        { label: 'Data Loss', value: 'None', color: '#059669' },
      ],
      timeline: [
        { time: '10:00 AM', text: 'Latency threshold (200ms) breached', color: '#D97706' },
        { time: '10:15 AM', text: 'Batch execution completed — latency normalized', color: '#059669' },
        { time: '10:16 AM', text: 'Auto-resolved by monitoring agent', color: '#059669' },
      ]
    },
    {
      id: 'ALT-1008', severity: 'Low', category: 'Compliance', title: 'SOX control test reminder — Q1 sampling due',
      description: 'Quarterly SOX control testing cycle begins next week. 12 controls require evidence sampling.',
      time: '6h ago', source: 'Compliance Engine', sourceIcon: 'bi-shield-check', status: 'Open', read: true, aiTriaged: false,
      fullDescription: 'Routine reminder for quarterly SOX compliance testing.',
      aiAnalysis: '', aiConfidence: 0,
      impacts: [
        { label: 'Controls', value: '12', color: 'var(--text-primary)' },
        { label: 'Deadline', value: 'Feb 14', color: '#D97706' },
        { label: 'Priority', value: 'Routine', color: '#6B7280' },
        { label: 'Owner', value: 'Internal Audit', color: 'var(--text-primary)' },
      ],
      timeline: [
        { time: '8:00 AM', text: 'Automated compliance reminder generated', color: '#6B7280' },
      ]
    },
  ];

  get filteredAlerts() {
    let result = this.alerts;
    if (this.activeSeverity !== 'All') result = result.filter(a => a.severity === this.activeSeverity);
    if (this.activeStatus !== 'All') result = result.filter(a => a.status === this.activeStatus);
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(a => a.title.toLowerCase().includes(t) || a.category.toLowerCase().includes(t) || a.id.toLowerCase().includes(t));
    }
    return result;
  }

  get selectedAlertData() {
    return this.alerts.find(a => a.id === this.selectedAlert) || this.alerts[0];
  }

  getSevColor(sev: string): string {
    const map: any = { Critical: '#DC2626', High: '#D97706', Medium: '#2563EB', Low: '#6B7280' };
    return map[sev] || '#6B7280';
  }

  getSevBg(sev: string): string {
    const map: any = { Critical: '#FEE2E2', High: '#FEF3C7', Medium: '#EFF6FF', Low: '#F3F4F6' };
    return map[sev] || '#F3F4F6';
  }

  getStatusBg(status: string): string {
    const map: any = { Open: '#FEE2E2', Acknowledged: '#FEF3C7', Resolved: '#ECFDF5' };
    return map[status] || '#F3F4F6';
  }

  getStatusColor(status: string): string {
    const map: any = { Open: '#DC2626', Acknowledged: '#D97706', Resolved: '#059669' };
    return map[status] || '#6B7280';
  }

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }
}