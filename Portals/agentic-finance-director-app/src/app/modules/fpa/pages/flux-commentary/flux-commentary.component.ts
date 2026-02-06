import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-fpa-flux',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/fpa/budget">FP&A</a>
      <span class="separator">/</span>
      <span class="current">Flux Commentary</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Flux Commentary</h1>
        <p class="afda-page-subtitle">AI-generated variance explanations and analyst commentary</p>
      </div>
      <div class="afda-page-actions">
        <select class="form-select-sm">
          <option>January 2026</option>
          <option>December 2025</option>
        </select>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-check2-all"></i> Approve All
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-arrow-repeat"></i> Regenerate AI
        </button>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="status-bar stagger">
      <div class="status-segment">
        <i class="bi bi-file-text" style="color: var(--primary);"></i>
        <span><strong>12</strong> flux items generated</span>
      </div>
      <div class="status-divider"></div>
      <div class="status-segment">
        <i class="bi bi-check-circle" style="color: var(--success);"></i>
        <span><strong>8</strong> approved</span>
      </div>
      <div class="status-divider"></div>
      <div class="status-segment">
        <i class="bi bi-pencil-square" style="color: var(--warning);"></i>
        <span><strong>3</strong> pending review</span>
      </div>
      <div class="status-divider"></div>
      <div class="status-segment">
        <i class="bi bi-exclamation-circle" style="color: var(--danger);"></i>
        <span><strong>1</strong> flagged</span>
      </div>
      <div class="status-progress">
        <div class="status-progress-fill" style="width: 67%;"></div>
      </div>
      <span style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">67% complete</span>
    </div>

    <!-- Commentary Cards -->
    <div class="commentary-list">
      @for (item of commentaryItems; track item.id; let i = $index) {
        <div class="commentary-card" [style.animation-delay]="(i * 0.04) + 's'"
             [class.flagged]="item.status === 'flagged'">
          <!-- Card Header -->
          <div class="cc-header">
            <div class="cc-header-left">
              <span class="cc-dept-chip">{{ item.department }}</span>
              <span class="cc-account font-mono">{{ item.account }}</span>
              <span class="cc-category">{{ item.category }}</span>
            </div>
            <div class="cc-header-right">
              <span class="afda-badge" [ngClass]="getStatusClass(item.status)">{{ item.statusLabel }}</span>
            </div>
          </div>

          <!-- Variance Numbers -->
          <div class="cc-numbers">
            <div class="cc-num-item">
              <span class="cc-num-label">Budget</span>
              <span class="cc-num-value font-mono">{{ item.budget }}</span>
            </div>
            <div class="cc-num-item">
              <span class="cc-num-label">Actual</span>
              <span class="cc-num-value font-mono">{{ item.actual }}</span>
            </div>
            <div class="cc-num-item">
              <span class="cc-num-label">Variance</span>
              <span class="cc-num-value font-mono" [class]="item.favorable ? 'text-favorable' : 'text-unfavorable'">
                {{ item.variance }}
              </span>
            </div>
            <div class="cc-num-item">
              <span class="cc-num-label">Var %</span>
              <span class="cc-num-value font-mono" [class]="item.favorable ? 'text-favorable' : 'text-unfavorable'">
                {{ item.variancePct }}
              </span>
            </div>
            <div class="cc-impact-bar">
              <div class="cc-impact-track">
                <div class="cc-impact-fill"
                     [style.width.%]="item.impactWidth"
                     [style.background]="item.favorable ? 'var(--success)' : 'var(--danger)'"></div>
              </div>
            </div>
          </div>

          <!-- AI Commentary -->
          <div class="cc-ai-section">
            <div class="cc-ai-header">
              <div class="cc-ai-badge">
                <i class="bi bi-stars"></i> AI Generated
              </div>
              <span class="cc-ai-confidence">Confidence: {{ item.confidence }}%</span>
            </div>
            <p class="cc-ai-text">{{ item.aiCommentary }}</p>
          </div>

          <!-- Analyst Notes -->
          @if (item.analystNote) {
            <div class="cc-analyst-section">
              <div class="cc-analyst-header">
                <div class="cc-analyst-avatar" [style.background]="item.analystColor">{{ item.analystInitials }}</div>
                <span class="cc-analyst-name">{{ item.analystName }}</span>
                <span class="cc-analyst-time">{{ item.analystTime }}</span>
              </div>
              <p class="cc-analyst-text">{{ item.analystNote }}</p>
            </div>
          }

          <!-- Actions -->
          <div class="cc-actions">
            <button class="afda-btn afda-btn-outline" style="font-size: 12px; padding: 5px 12px;"
                    *ngIf="item.status !== 'approved'" (click)="item.status = 'approved'; item.statusLabel = 'Approved'">
              <i class="bi bi-check-lg"></i> Approve
            </button>
            <button class="afda-btn afda-btn-outline" style="font-size: 12px; padding: 5px 12px;">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="afda-btn afda-btn-outline" style="font-size: 12px; padding: 5px 12px;"
                    *ngIf="item.status !== 'flagged'" (click)="item.status = 'flagged'; item.statusLabel = 'Flagged'">
              <i class="bi bi-flag"></i> Flag
            </button>
            <span class="cc-action-spacer"></span>
            <button class="afda-btn afda-btn-outline" style="font-size: 12px; padding: 5px 12px;">
              <i class="bi bi-arrow-repeat"></i> Regenerate
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Status Bar */
    .status-bar {
      display: flex; align-items: center; gap: 16px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 14px 22px;
      box-shadow: var(--shadow-card); margin-bottom: 20px;
      animation: fadeUp 0.4s ease both;
      font-size: 13px; color: var(--text-secondary);
      flex-wrap: wrap;

      strong { color: var(--text-primary); }
      i { font-size: 16px; }
    }

    .status-segment { display: flex; align-items: center; gap: 6px; }
    .status-divider { width: 1px; height: 20px; background: var(--border-light); }

    .status-progress {
      flex: 1; min-width: 120px; height: 6px;
      background: var(--border-light); border-radius: 10px; overflow: hidden;
    }

    .status-progress-fill {
      height: 100%; background: var(--primary); border-radius: 10px;
      transition: width 0.5s ease;
    }

    /* Commentary Cards */
    .commentary-list { display: flex; flex-direction: column; gap: 14px; }

    .commentary-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 20px;
      box-shadow: var(--shadow-card);
      animation: fadeUp 0.4s ease both;
      transition: border-color 0.15s;

      &:hover { border-color: #D1D5DB; }
      &.flagged { border-left: 3px solid var(--danger); }
    }

    .cc-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 14px;
    }

    .cc-header-left { display: flex; align-items: center; gap: 10px; }

    .cc-dept-chip {
      padding: 3px 10px; font-size: 11px; font-weight: 600;
      background: var(--primary-light); color: var(--primary);
      border-radius: 20px;
    }

    .cc-account { font-size: 12px; color: var(--text-tertiary); }
    .cc-category { font-size: 12.5px; color: var(--text-secondary); font-weight: 500; }

    /* Numbers Row */
    .cc-numbers {
      display: flex; align-items: center; gap: 24px;
      padding: 14px 16px; background: var(--bg-section);
      border-radius: var(--radius-sm); margin-bottom: 14px;
    }

    .cc-num-item { display: flex; flex-direction: column; }
    .cc-num-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; color: var(--text-tertiary); }
    .cc-num-value { font-size: 14px; font-weight: 600; margin-top: 2px; }

    .cc-impact-bar { flex: 1; display: flex; align-items: center; }
    .cc-impact-track {
      width: 100%; height: 6px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }
    .cc-impact-fill { height: 100%; border-radius: 10px; }

    /* AI Section */
    .cc-ai-section {
      margin-bottom: 12px;
    }

    .cc-ai-header {
      display: flex; align-items: center; gap: 10px; margin-bottom: 6px;
    }

    .cc-ai-badge {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 10.5px; font-weight: 600;
      color: var(--primary);
      i { font-size: 12px; }
    }

    .cc-ai-confidence {
      font-size: 11px; color: var(--text-tertiary);
    }

    .cc-ai-text {
      font-size: 13px; line-height: 1.65; color: var(--text-secondary);
      padding-left: 2px;
    }

    /* Analyst Section */
    .cc-analyst-section {
      padding: 12px; background: #FFFBEB;
      border-radius: var(--radius-sm); border: 1px solid #FEF3C7;
      margin-bottom: 12px;
    }

    .cc-analyst-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
    }

    .cc-analyst-avatar {
      width: 22px; height: 22px; border-radius: 50%;
      display: grid; place-items: center;
      color: white; font-size: 9px; font-weight: 700;
    }

    .cc-analyst-name { font-size: 12px; font-weight: 600; color: var(--text-primary); }
    .cc-analyst-time { font-size: 11px; color: var(--text-tertiary); }
    .cc-analyst-text { font-size: 12.5px; line-height: 1.6; color: #92400E; }

    /* Actions */
    .cc-actions {
      display: flex; align-items: center; gap: 6px;
      padding-top: 12px; border-top: 1px solid var(--border-light);
    }

    .cc-action-spacer { flex: 1; }
  `]
})
export class FluxCommentaryComponent {

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'afda-badge-success';
      case 'pending':  return 'afda-badge-high';
      case 'flagged':  return 'afda-badge-critical';
      default: return 'afda-badge-medium';
    }
  }

  commentaryItems = [
    {
      id: 1, department: 'Marketing', account: '6200-MKT', category: 'Contractors',
      budget: '$240,000', actual: '$318,000', variance: '+$78,000', variancePct: '+32.5%',
      favorable: false, impactWidth: 85,
      status: 'flagged', statusLabel: 'Flagged',
      confidence: 94,
      aiCommentary: 'Marketing contractor spend exceeded budget by $78K (32.5%), the largest unfavorable variance this period. Primary drivers include two unplanned agency engagements for the product launch campaign ($52K) and extended scope on the brand refresh project ($26K). This represents a structural overspend pattern — contractor costs have exceeded budget in 3 of the last 4 months.',
      analystNote: 'Confirmed with CMO — the product launch agency was approved verbally but the PO was not updated. Recommend formalizing the budget amendment for Q2. The brand refresh overage needs a scope review.',
      analystName: 'Michael Park', analystInitials: 'MP', analystColor: '#2563EB', analystTime: '2h ago'
    },
    {
      id: 2, department: 'Engineering', account: '6100-ENG', category: 'Payroll',
      budget: '$1,400,000', actual: '$1,320,000', variance: '-$80,000', variancePct: '-5.7%',
      favorable: true, impactWidth: 65,
      status: 'approved', statusLabel: 'Approved',
      confidence: 97,
      aiCommentary: 'Engineering payroll came in $80K under budget, driven by two senior engineer positions that remained open through January. Recruiting pipeline shows both roles in final interview stages — expect this favorable variance to normalize by March as hires onboard.',
      analystNote: null, analystName: '', analystInitials: '', analystColor: '', analystTime: ''
    },
    {
      id: 3, department: 'Marketing', account: '6100-MKT', category: 'Payroll',
      budget: '$320,000', actual: '$332,000', variance: '+$12,000', variancePct: '+3.8%',
      favorable: false, impactWidth: 18,
      status: 'approved', statusLabel: 'Approved',
      confidence: 91,
      aiCommentary: 'Marketing payroll variance of $12K is attributable to one mid-month hire starting earlier than the February budget assumption, plus overtime pay for two team members during the product launch sprint. Within acceptable threshold for the department.',
      analystNote: null, analystName: '', analystInitials: '', analystColor: '', analystTime: ''
    },
    {
      id: 4, department: 'Operations', account: '6200-OPS', category: 'Contractors',
      budget: '$160,000', actual: '$170,000', variance: '+$10,000', variancePct: '+6.3%',
      favorable: false, impactWidth: 22,
      status: 'pending', statusLabel: 'Pending Review',
      confidence: 86,
      aiCommentary: 'Operations contractor overspend of $10K is linked to an emergency IT support engagement ($7K) following the January 18 database outage, plus temporary staffing for the office relocation project ($3K). Both are one-time expenses not expected to recur.',
      analystNote: 'Need to verify the IT support invoice against the incident report. Waiting on Ops manager confirmation.',
      analystName: 'Sarah Chen', analystInitials: 'SC', analystColor: '#0D6B5C', analystTime: '4h ago'
    },
    {
      id: 5, department: 'Sales', account: '6200-SAL', category: 'Contractors',
      budget: '$180,000', actual: '$172,000', variance: '-$8,000', variancePct: '-4.4%',
      favorable: true, impactWidth: 14,
      status: 'approved', statusLabel: 'Approved',
      confidence: 93,
      aiCommentary: 'Sales contractor spend came in $8K favorable due to delayed start of the CRM integration project. The contractor engagement has been pushed to February, so this variance will reverse next month. Net impact across the quarter is expected to be neutral.',
      analystNote: null, analystName: '', analystInitials: '', analystColor: '', analystTime: ''
    },
    {
      id: 6, department: 'Engineering', account: '6200-ENG', category: 'Contractors',
      budget: '$380,000', actual: '$355,000', variance: '-$25,000', variancePct: '-6.6%',
      favorable: true, impactWidth: 30,
      status: 'pending', statusLabel: 'Pending Review',
      confidence: 89,
      aiCommentary: 'Engineering contractor savings of $25K resulted from renegotiating the DevOps automation contract mid-month (saving $15K) and completing the security audit ahead of schedule ($10K). The DevOps savings are recurring; the audit savings are one-time.',
      analystNote: 'Verified the contract amendment. Good cost management by the engineering team. Recommend highlighting in the board deck.',
      analystName: 'Lisa Wang', analystInitials: 'LW', analystColor: '#7C3AED', analystTime: '1d ago'
    },
    {
      id: 7, department: 'G&A', account: '6100-GA', category: 'Payroll',
      budget: '$200,000', actual: '$196,000', variance: '-$4,000', variancePct: '-2.0%',
      favorable: true, impactWidth: 8,
      status: 'approved', statusLabel: 'Approved',
      confidence: 95,
      aiCommentary: 'Minor favorable variance in G&A payroll due to one fewer working day in January versus the budget assumption. No structural change — expect to be in line with budget for the remainder of the quarter.',
      analystNote: null, analystName: '', analystInitials: '', analystColor: '', analystTime: ''
    },
    {
      id: 8, department: 'Engineering', account: '6300-ENG', category: 'Software',
      budget: '$200,000', actual: '$190,000', variance: '-$10,000', variancePct: '-5.0%',
      favorable: true, impactWidth: 15,
      status: 'pending', statusLabel: 'Pending Review',
      confidence: 88,
      aiCommentary: 'Software license savings of $10K driven by consolidating two overlapping monitoring tools (Datadog and New Relic) into a single platform. Annual savings projected at $120K. Migration completed January 22.',
      analystNote: null, analystName: '', analystInitials: '', analystColor: '', analystTime: ''
    },
  ];
}