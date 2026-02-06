import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-cc-briefing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/command/overview">Command Center</a>
      <span class="separator">/</span>
      <span class="current">Executive Briefing</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Executive Briefing</h1>
        <p class="afda-page-subtitle">AI-generated daily briefing for leadership</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>Feb 5, 2026</option>
          <option>Feb 4, 2026</option>
          <option>Feb 3, 2026</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-printer"></i> Print
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-arrow-repeat"></i> Regenerate
        </button>
      </div>
    </div>

    <!-- Briefing Meta -->
    <div class="briefing-meta stagger">
      <div class="afda-ai-panel" style="margin-bottom: 0;">
        <div class="afda-ai-panel-header">
          <div class="afda-ai-icon"><i class="bi bi-stars"></i></div>
          <span class="afda-ai-label">Daily Executive Briefing</span>
          <span class="afda-ai-time">Generated today at 7:00 AM EST · Claude 3.5 Sonnet</span>
        </div>
      </div>
    </div>

    <!-- Two Column Layout -->
    <div class="briefing-layout">
      <!-- Left: Briefing Content -->
      <div class="briefing-content">

        <!-- Situation Summary -->
        <div class="briefing-section" style="animation: fadeUp 0.4s ease 0.05s both;">
          <div class="section-header">
            <div class="section-number">01</div>
            <div>
              <div class="section-title">Situation Summary</div>
              <div class="section-sub">High-level financial snapshot</div>
            </div>
          </div>
          <div class="section-body">
            <p>Revenue performance remains strong at <strong>$12.4M</strong>, tracking 8.2% above prior month. The enterprise segment continues to outperform with three new logos closed in the final week of January.</p>
            <p>Operating margin compressed to <strong>18.7%</strong> (target: 20%) driven primarily by a $180K unplanned cloud infrastructure upgrade and increased contractor spend in marketing. Treasury reports a healthy cash position of <strong>$4.8M</strong> with no immediate liquidity concerns.</p>
          </div>
        </div>

        <!-- Key Developments -->
        <div class="briefing-section" style="animation: fadeUp 0.4s ease 0.1s both;">
          <div class="section-header">
            <div class="section-number">02</div>
            <div>
              <div class="section-title">Key Developments</div>
              <div class="section-sub">Notable events in the past 24 hours</div>
            </div>
          </div>
          <div class="section-body">
            @for (dev of developments; track dev.title) {
              <div class="development-item">
                <div class="dev-icon" [style.background]="dev.iconBg">
                  <i [class]="'bi ' + dev.icon" [style.color]="dev.iconColor"></i>
                </div>
                <div>
                  <div class="dev-title">{{ dev.title }}</div>
                  <div class="dev-desc">{{ dev.description }}</div>
                </div>
                <span class="afda-badge" [ngClass]="dev.badgeClass">{{ dev.badge }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Risk Assessment -->
        <div class="briefing-section" style="animation: fadeUp 0.4s ease 0.15s both;">
          <div class="section-header">
            <div class="section-number">03</div>
            <div>
              <div class="section-title">Risk Assessment</div>
              <div class="section-sub">AI-identified risks and mitigations</div>
            </div>
          </div>
          <div class="section-body">
            @for (risk of risks; track risk.title) {
              <div class="risk-item">
                <div class="risk-header">
                  <span class="afda-badge" [ngClass]="risk.severityClass">{{ risk.severity }}</span>
                  <span class="risk-title">{{ risk.title }}</span>
                </div>
                <p class="risk-desc">{{ risk.description }}</p>
                <div class="risk-mitigation">
                  <i class="bi bi-lightbulb" style="color: var(--warning);"></i>
                  <span><strong>Recommended:</strong> {{ risk.mitigation }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Forecast Outlook -->
        <div class="briefing-section" style="animation: fadeUp 0.4s ease 0.2s both;">
          <div class="section-header">
            <div class="section-number">04</div>
            <div>
              <div class="section-title">Forecast Outlook</div>
              <div class="section-sub">AI projections for the coming period</div>
            </div>
          </div>
          <div class="section-body">
            <p>Based on current run rate and pipeline data, the AI model projects <strong>Q1 revenue of $38.2M</strong> (102% of plan). Key upside risk is the pending GlobalTech enterprise deal ($420K ACV) expected to close by Feb 15.</p>
            <p>Cash runway remains comfortable at <strong>14.2 months</strong> assuming current burn rate. No capital raise required within the forecast window.</p>
            <div class="forecast-grid">
              @for (fc of forecasts; track fc.label) {
                <div class="forecast-item">
                  <div class="forecast-label">{{ fc.label }}</div>
                  <div class="forecast-value font-mono">{{ fc.value }}</div>
                  <div class="forecast-conf">{{ fc.confidence }} confidence</div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Sidebar Widgets -->
      <div class="briefing-sidebar">
        <!-- Quick Metrics -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.08s both;">
          <div class="afda-card-title" style="margin-bottom: 14px;">Today's Pulse</div>
          @for (metric of pulseMetrics; track metric.label) {
            <div class="pulse-row">
              <span class="pulse-label">{{ metric.label }}</span>
              <span class="pulse-value font-mono" [style.color]="metric.color">{{ metric.value }}</span>
            </div>
          }
        </div>

        <!-- Pending Approvals -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.12s both;">
          <div class="afda-card-title" style="margin-bottom: 14px;">Pending Approvals</div>
          @for (item of approvals; track item.title) {
            <div class="approval-item">
              <div class="approval-info">
                <div class="approval-title">{{ item.title }}</div>
                <div class="approval-meta">{{ item.meta }}</div>
              </div>
              <div class="approval-amount font-mono">{{ item.amount }}</div>
            </div>
          }
          <button class="afda-btn afda-btn-outline" style="width: 100%; margin-top: 12px; justify-content: center;">
            Review all ({{ approvals.length }}) →
          </button>
        </div>

        <!-- AI Confidence -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.16s both;">
          <div class="afda-card-title" style="margin-bottom: 14px;">Briefing Confidence</div>
          <div class="confidence-row">
            <span>Data freshness</span>
            <div class="confidence-bar"><div class="confidence-fill" style="width: 96%;"></div></div>
            <span class="font-mono" style="font-size: 12px;">96%</span>
          </div>
          <div class="confidence-row">
            <span>Source coverage</span>
            <div class="confidence-bar"><div class="confidence-fill" style="width: 88%;"></div></div>
            <span class="font-mono" style="font-size: 12px;">88%</span>
          </div>
          <div class="confidence-row">
            <span>Anomaly detection</span>
            <div class="confidence-bar"><div class="confidence-fill" style="width: 92%;"></div></div>
            <span class="font-mono" style="font-size: 12px;">92%</span>
          </div>
          <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 10px;">
            Sources: PostgreSQL, n8n workflows, GL export (Feb 5)
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .briefing-meta { margin-bottom: 20px; }

    .briefing-layout {
      display: grid; grid-template-columns: 1fr 320px;
      gap: 16px;
    }

    .briefing-content { display: flex; flex-direction: column; gap: 16px; }

    .briefing-section {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 24px;
      box-shadow: var(--shadow-card);
    }

    .section-header {
      display: flex; align-items: center; gap: 14px;
      margin-bottom: 16px; padding-bottom: 14px;
      border-bottom: 1px solid var(--border-light);
    }

    .section-number {
      width: 36px; height: 36px;
      background: var(--primary-light); color: var(--primary);
      border-radius: var(--radius-sm);
      display: grid; place-items: center;
      font-size: 13px; font-weight: 700; font-family: var(--font-mono);
    }

    .section-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .section-sub { font-size: 12px; color: var(--text-tertiary); margin-top: 1px; }

    .section-body p {
      font-size: 13.5px; line-height: 1.7; color: var(--text-secondary);
      margin-bottom: 10px;
      &:last-child { margin-bottom: 0; }
      strong { color: var(--text-primary); }
    }

    .development-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 12px; border-radius: var(--radius-sm);
      border: 1px solid var(--border-light); margin-bottom: 10px;
      &:last-child { margin-bottom: 0; }
    }

    .dev-icon {
      width: 34px; height: 34px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 15px; flex-shrink: 0;
    }

    .dev-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .dev-desc { font-size: 12.5px; color: var(--text-secondary); margin-top: 2px; line-height: 1.5; }

    .risk-item {
      padding: 14px; border-radius: var(--radius-sm);
      border: 1px solid var(--border-light); margin-bottom: 12px;
      &:last-child { margin-bottom: 0; }
    }

    .risk-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .risk-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .risk-desc { font-size: 12.5px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 10px; }

    .risk-mitigation {
      display: flex; align-items: flex-start; gap: 8px;
      font-size: 12.5px; color: var(--text-secondary);
      padding: 10px; background: var(--warning-bg);
      border-radius: var(--radius-sm); line-height: 1.5;
      strong { color: var(--text-primary); }
    }

    .forecast-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 12px; margin-top: 16px;
    }

    .forecast-item {
      padding: 14px; background: var(--bg-section);
      border-radius: var(--radius-sm); border: 1px solid var(--border-light);
      text-align: center;
    }

    .forecast-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.4px; }
    .forecast-value { font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 4px 0; }
    .forecast-conf { font-size: 11px; color: var(--success); }

    .briefing-sidebar { display: flex; flex-direction: column; gap: 16px; }

    .pulse-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .pulse-label { font-size: 12.5px; color: var(--text-secondary); }
    .pulse-value { font-size: 13px; font-weight: 600; }

    .approval-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .approval-title { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
    .approval-meta { font-size: 11px; color: var(--text-tertiary); margin-top: 1px; }
    .approval-amount { font-size: 13px; font-weight: 600; color: var(--text-primary); }

    .confidence-row {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 10px;
      span:first-child { font-size: 12px; color: var(--text-secondary); width: 110px; flex-shrink: 0; }
    }

    .confidence-bar {
      flex: 1; height: 6px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .confidence-fill {
      height: 100%; background: var(--primary);
      border-radius: 10px;
    }

    @media (max-width: 1100px) {
      .briefing-layout { grid-template-columns: 1fr; }
      .forecast-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class ExecutiveBriefingComponent {
  developments = [
    {
      title: 'Enterprise deal pipeline update',
      description: 'GlobalTech ($420K ACV) moved to final negotiation stage. Expected close by Feb 15.',
      icon: 'bi-trophy', iconBg: '#ECFDF5', iconColor: '#059669',
      badge: 'Revenue', badgeClass: 'afda-badge-success'
    },
    {
      title: 'Cloud infrastructure cost spike',
      description: 'Unplanned $180K AWS spend for database migration. Engineering to provide RCA by Friday.',
      icon: 'bi-exclamation-triangle', iconBg: '#FEF2F2', iconColor: '#DC2626',
      badge: 'Cost', badgeClass: 'afda-badge-danger'
    },
    {
      title: 'Month-end close on track',
      description: 'January close at 85% completion. Remaining items: 2 intercompany eliminations, 1 bank reconciliation.',
      icon: 'bi-check-circle', iconBg: '#EFF6FF', iconColor: '#2563EB',
      badge: 'Operations', badgeClass: 'afda-badge-medium'
    },
  ];

  risks = [
    {
      severity: 'HIGH', severityClass: 'afda-badge-critical',
      title: 'AR concentration risk — single client $1.2M past 60 days',
      description: 'Client TechVentures Inc. has $1.2M outstanding beyond 60 days. Account rep reports internal budget approval delay on their end.',
      mitigation: 'Escalate to VP of Client Success. Initiate formal collections process if no response by Feb 10.'
    },
    {
      severity: 'MEDIUM', severityClass: 'afda-badge-high',
      title: 'Marketing department budget overrun trending',
      description: 'Marketing is 12% over budget driven by contractor spend. If trend continues, will exceed annual allocation by $240K.',
      mitigation: 'Schedule budget review with CMO. Consider shifting Q2 contractor budget to cover Q1 overage.'
    },
  ];

  forecasts = [
    { label: 'Q1 Revenue', value: '$38.2M', confidence: '94%' },
    { label: 'Q1 EBITDA', value: '$9.6M', confidence: '88%' },
    { label: 'Cash Runway', value: '14.2mo', confidence: '96%' },
  ];

  pulseMetrics = [
    { label: 'Revenue MTD', value: '$2.1M', color: 'var(--text-primary)' },
    { label: 'Burn Rate', value: '$820K/mo', color: 'var(--text-primary)' },
    { label: 'Open Invoices', value: '24', color: 'var(--warning)' },
    { label: 'Agent Tasks Today', value: '142', color: 'var(--primary)' },
    { label: 'Close Progress', value: '85%', color: 'var(--success)' },
    { label: 'Active Alerts', value: '3', color: 'var(--danger)' },
  ];

  approvals = [
    { title: 'Marketing contractor PO', meta: 'Submitted by Sarah Chen · 2h ago', amount: '$45,000' },
    { title: 'AWS infrastructure upgrade', meta: 'Submitted by DevOps · 1d ago', amount: '$180,000' },
    { title: 'Q2 headcount request', meta: 'Submitted by HR · 3d ago', amount: '$320,000' },
  ];
}