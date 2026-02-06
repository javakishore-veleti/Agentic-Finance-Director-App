import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-prompt-library',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/agent-studio/agent-console">Agent Studio</a>
      <span class="separator">/</span>
      <span class="current">Prompt Library</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Prompt Library</h1>
        <p class="afda-page-subtitle">Reusable prompt templates for AI finance agents</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-upload"></i> Import
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-plus-lg"></i> New Prompt
        </button>
      </div>
    </div>

    <!-- Search + Filters -->
    <div class="search-bar stagger">
      <div class="search-input-wrap">
        <i class="bi bi-search"></i>
        <input type="text" class="search-input" placeholder="Search prompts by name, category, or tag..."
               (input)="onSearch($event)">
      </div>
      <div class="filter-row">
        @for (cat of categories; track cat) {
          <button class="filter-chip" [class.active]="activeCategory === cat" (click)="activeCategory = cat">
            {{ cat }}
          </button>
        }
      </div>
    </div>

    <!-- Stats Row -->
    <div class="prompt-stats stagger">
      @for (s of promptStats; track s.label) {
        <div class="ps-card">
          <div class="ps-value font-mono">{{ s.value }}</div>
          <div class="ps-label">{{ s.label }}</div>
        </div>
      }
    </div>

    <!-- Prompt Cards Grid -->
    <div class="prompt-grid stagger">
      @for (prompt of filteredPrompts; track prompt.id) {
        <div class="prompt-card" [class.selected]="selectedPrompt === prompt.id"
             (click)="selectedPrompt = prompt.id">
          <!-- Header -->
          <div class="pc-header">
            <div class="pc-icon" [style.background]="prompt.iconBg">
              <i [class]="'bi ' + prompt.icon" [style.color]="prompt.iconColor"></i>
            </div>
            <div class="pc-info">
              <div class="pc-name">{{ prompt.name }}</div>
              <div class="pc-category">{{ prompt.category }}</div>
            </div>
            <div class="pc-version font-mono">v{{ prompt.version }}</div>
          </div>

          <!-- Description -->
          <div class="pc-desc">{{ prompt.description }}</div>

          <!-- Tags -->
          <div class="pc-tags">
            @for (tag of prompt.tags; track tag) {
              <span class="pc-tag">{{ tag }}</span>
            }
          </div>

          <!-- Preview snippet -->
          <div class="pc-preview">
            <code class="pc-code">{{ prompt.snippet }}</code>
          </div>

          <!-- Metrics -->
          <div class="pc-metrics">
            <div class="pcm-item">
              <i class="bi bi-lightning" style="color: var(--primary);"></i>
              <span>{{ prompt.usageCount }} uses</span>
            </div>
            <div class="pcm-item">
              <i class="bi bi-star-fill" style="color: #D97706;"></i>
              <span>{{ prompt.rating }}</span>
            </div>
            <div class="pcm-item">
              <i class="bi bi-clock" style="color: var(--text-tertiary);"></i>
              <span>{{ prompt.lastUsed }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="pc-actions">
            <button class="afda-btn afda-btn-outline" style="flex: 1; font-size: 11px; padding: 5px 8px; justify-content: center;">
              <i class="bi bi-play-fill"></i> Test
            </button>
            <button class="afda-btn afda-btn-outline" style="flex: 1; font-size: 11px; padding: 5px 8px; justify-content: center;">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="afda-btn afda-btn-outline" style="font-size: 11px; padding: 5px 8px;">
              <i class="bi bi-copy"></i>
            </button>
          </div>
        </div>
      }
    </div>

    <!-- Prompt Detail Panel (below) -->
    <div class="detail-section" style="margin-top: 20px;">
      <div class="detail-grid">
        <!-- Full Prompt View -->
        <div class="afda-card" style="animation: fadeUp 0.4s ease 0.16s both;">
          <div class="afda-card-header">
            <div class="afda-card-title">{{ selectedPromptData.name }}</div>
            <div style="display: flex; gap: 6px;">
              <span class="afda-badge afda-badge-medium">v{{ selectedPromptData.version }}</span>
              <span class="afda-badge afda-badge-success">Active</span>
            </div>
          </div>
          <div class="prompt-full">
            <div class="pf-section">
              <div class="pf-label">System Prompt</div>
              <pre class="pf-code">{{ selectedPromptData.systemPrompt }}</pre>
            </div>
            <div class="pf-section">
              <div class="pf-label">User Template</div>
              <pre class="pf-code">{{ selectedPromptData.userTemplate }}</pre>
            </div>
            <div class="pf-section">
              <div class="pf-label">Variables</div>
              <div class="pf-vars">
                @for (v of selectedPromptData.variables; track v.name) {
                  <div class="pf-var">
                    <span class="pf-var-name font-mono">{{ '{{' + v.name + '}}' }}</span>
                    <span class="pf-var-type">{{ v.type }}</span>
                    <span class="pf-var-desc">{{ v.description }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Version History + Performance -->
        <div class="detail-side">
          <!-- Version History -->
          <div class="afda-card" style="animation: fadeUp 0.4s ease 0.18s both;">
            <div class="afda-card-title" style="margin-bottom: 12px;">Version History</div>
            @for (ver of versionHistory; track ver.version) {
              <div class="ver-row" [class.current]="ver.current">
                <div class="ver-dot" [style.background]="ver.current ? 'var(--primary)' : '#D1D5DB'"></div>
                <div class="ver-info">
                  <div class="ver-label font-mono">v{{ ver.version }}</div>
                  <div class="ver-date">{{ ver.date }}</div>
                </div>
                <div class="ver-change">{{ ver.change }}</div>
                @if (ver.current) {
                  <span class="afda-badge afda-badge-success" style="font-size: 9px;">Current</span>
                }
              </div>
            }
          </div>

          <!-- Performance -->
          <div class="afda-card" style="margin-top: 14px; animation: fadeUp 0.4s ease 0.2s both;">
            <div class="afda-card-title" style="margin-bottom: 12px;">Performance</div>
            @for (perf of performanceMetrics; track perf.label) {
              <div class="perf-row">
                <span class="perf-label">{{ perf.label }}</span>
                <div class="perf-bar-wrap">
                  <div class="perf-bar">
                    <div class="perf-bar-fill" [style.width.%]="perf.pct" [style.background]="perf.color"></div>
                  </div>
                  <span class="perf-value font-mono">{{ perf.value }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Search Bar */
    .search-bar {
      margin-bottom: 16px;
    }

    .search-input-wrap {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 16px; background: var(--bg-card);
      border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm); margin-bottom: 10px;
      i { color: var(--text-tertiary); font-size: 16px; }
    }

    .search-input {
      flex: 1; border: none; outline: none; background: transparent;
      font-size: 14px; font-family: var(--font-sans); color: var(--text-primary);
      &::placeholder { color: var(--text-tertiary); }
    }

    .filter-row { display: flex; gap: 6px; flex-wrap: wrap; }

    .filter-chip {
      padding: 5px 12px; font-size: 12px; font-weight: 500;
      border: 1px solid var(--border); border-radius: 20px;
      background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s; font-family: var(--font-sans);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 600; }
    }

    /* Stats */
    .prompt-stats {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 12px; margin-bottom: 20px;
    }

    .ps-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-md); padding: 14px 16px;
      box-shadow: var(--shadow-sm); text-align: center;
    }

    .ps-value { font-size: 20px; font-weight: 700; color: var(--text-primary); }
    .ps-label { font-size: 11px; color: var(--text-tertiary); margin-top: 1px; }

    /* Prompt Cards */
    .prompt-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .prompt-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 18px;
      box-shadow: var(--shadow-card); cursor: pointer;
      animation: fadeUp 0.4s ease both;
      transition: border-color 0.15s, box-shadow 0.15s;
      &:hover { border-color: #D1D5DB; box-shadow: var(--shadow-md); }
      &.selected { border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-light); }
    }

    .pc-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }

    .pc-icon {
      width: 34px; height: 34px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 15px; flex-shrink: 0;
    }

    .pc-info { flex: 1; }
    .pc-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .pc-category { font-size: 10.5px; color: var(--text-tertiary); }

    .pc-version {
      font-size: 10.5px; font-weight: 600; color: var(--text-tertiary);
      background: var(--bg-section); padding: 2px 8px; border-radius: 10px;
    }

    .pc-desc { font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; line-height: 1.5; }

    .pc-tags { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }

    .pc-tag {
      font-size: 10px; font-weight: 500; padding: 2px 7px;
      background: var(--bg-section); border: 1px solid var(--border-light);
      border-radius: 8px; color: var(--text-secondary);
    }

    .pc-preview {
      padding: 10px; background: #1E293B; border-radius: var(--radius-sm);
      margin-bottom: 10px; overflow: hidden;
    }

    .pc-code {
      font-family: var(--font-mono); font-size: 10.5px;
      color: #94A3B8; line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 3;
      -webkit-box-orient: vertical; overflow: hidden;
      white-space: pre-wrap; word-break: break-word;
    }

    .pc-metrics {
      display: flex; gap: 12px; margin-bottom: 12px;
      font-size: 11px; color: var(--text-secondary);
    }

    .pcm-item {
      display: flex; align-items: center; gap: 4px;
      i { font-size: 12px; }
    }

    .pc-actions { display: flex; gap: 6px; }

    /* Detail Section */
    .detail-grid {
      display: grid; grid-template-columns: 1fr 340px;
      gap: 16px;
    }

    .detail-side { display: flex; flex-direction: column; }

    .prompt-full { }

    .pf-section { margin-bottom: 16px; }
    .pf-label {
      font-size: 11px; font-weight: 600; color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px;
    }

    .pf-code {
      padding: 14px; background: #1E293B; color: #E2E8F0;
      border-radius: var(--radius-sm); font-family: var(--font-mono);
      font-size: 12px; line-height: 1.6; white-space: pre-wrap;
      word-break: break-word; overflow-x: auto; margin: 0;
    }

    .pf-vars { display: flex; flex-direction: column; gap: 6px; }

    .pf-var {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 12px; background: var(--bg-section);
      border-radius: var(--radius-sm);
    }

    .pf-var-name { font-size: 12px; font-weight: 600; color: var(--primary); min-width: 120px; }
    .pf-var-type {
      font-size: 10px; font-weight: 600; color: var(--text-tertiary);
      background: var(--bg-white); padding: 1px 6px; border-radius: 4px;
      border: 1px solid var(--border-light); text-transform: uppercase;
    }
    .pf-var-desc { font-size: 12px; color: var(--text-secondary); flex: 1; }

    /* Version History */
    .ver-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
      &.current { background: var(--primary-subtle); margin: 0 -22px; padding: 10px 22px; border-radius: var(--radius-sm); }
    }

    .ver-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .ver-info { min-width: 60px; }
    .ver-label { font-size: 12px; font-weight: 700; }
    .ver-date { font-size: 10.5px; color: var(--text-tertiary); }
    .ver-change { font-size: 11.5px; color: var(--text-secondary); flex: 1; }

    /* Performance */
    .perf-row {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 0;
    }

    .perf-label { font-size: 12px; color: var(--text-secondary); min-width: 100px; }

    .perf-bar-wrap { flex: 1; display: flex; align-items: center; gap: 8px; }

    .perf-bar {
      flex: 1; height: 6px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .perf-bar-fill { height: 100%; border-radius: 10px; }
    .perf-value { font-size: 12px; font-weight: 600; min-width: 40px; text-align: right; }

    @media (max-width: 1100px) {
      .prompt-stats { grid-template-columns: repeat(2, 1fr); }
      .prompt-grid { grid-template-columns: 1fr; }
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class PromptLibraryComponent {
  searchTerm = '';
  activeCategory = 'All';
  selectedPrompt = 'flux-commentary';
  categories = ['All', 'Accounting', 'Treasury', 'FP&A', 'Risk', 'Reporting'];

  promptStats = [
    { value: '24', label: 'Total Prompts' },
    { value: '6', label: 'Categories' },
    { value: '3,842', label: 'Total Executions' },
    { value: '97.1%', label: 'Avg Accuracy' },
  ];

  prompts = [
    {
      id: 'flux-commentary', name: 'Flux Commentary', category: 'FP&A',
      description: 'Generates variance explanations comparing actual vs budget for P&L line items.',
      icon: 'bi-chat-text', iconBg: '#EDE9FE', iconColor: '#7C3AED', version: '3.2',
      tags: ['Variance', 'P&L', 'Natural Language'],
      snippet: 'You are a senior financial analyst. Analyze the variance between actual and budget for {{account_name}}...',
      usageCount: '842', rating: '4.8', lastUsed: '2h ago'
    },
    {
      id: 'recon-match', name: 'Recon Pattern Match', category: 'Accounting',
      description: 'Identifies matching GL and bank transactions using fuzzy logic and amount tolerance.',
      icon: 'bi-check2-all', iconBg: '#EFF6FF', iconColor: '#2563EB', version: '2.4',
      tags: ['Reconciliation', 'Matching', 'Bank'],
      snippet: 'Given GL transaction: {{gl_entry}} and bank statement items: {{bank_items}}, identify the best match...',
      usageCount: '1,247', rating: '4.9', lastUsed: '30m ago'
    },
    {
      id: 'je-generator', name: 'Journal Entry Gen', category: 'Accounting',
      description: 'Creates properly formatted journal entries from natural language descriptions.',
      icon: 'bi-journal-plus', iconBg: '#E8F5F1', iconColor: '#0D6B5C', version: '2.1',
      tags: ['JE', 'Automation', 'GL'],
      snippet: 'Generate a journal entry for: {{description}}. Use the chart of accounts: {{coa}}...',
      usageCount: '624', rating: '4.7', lastUsed: '1h ago'
    },
    {
      id: 'cash-forecast', name: 'Cash Forecast Model', category: 'Treasury',
      description: 'Projects weekly cash balances using AR/AP pipelines and historical patterns.',
      icon: 'bi-graph-up-arrow', iconBg: '#FEF3C7', iconColor: '#D97706', version: '1.8',
      tags: ['Forecast', 'Cash', '13-Week'],
      snippet: 'Based on the following data: AR aging: {{ar_aging}}, AP schedule: {{ap_schedule}}...',
      usageCount: '312', rating: '4.6', lastUsed: '4h ago'
    },
    {
      id: 'risk-assessment', name: 'Risk Score Calculator', category: 'Risk',
      description: 'Calculates composite risk scores from multiple financial health indicators.',
      icon: 'bi-shield-check', iconBg: '#FEE2E2', iconColor: '#DC2626', version: '1.5',
      tags: ['Risk', 'Scoring', 'Liquidity'],
      snippet: 'Evaluate the following risk factors: {{risk_factors}} and calculate a composite score from 0-100...',
      usageCount: '186', rating: '4.5', lastUsed: '1d ago'
    },
    {
      id: 'exec-summary', name: 'Executive Summary', category: 'Reporting',
      description: 'Synthesizes financial data into concise executive briefings for board consumption.',
      icon: 'bi-file-earmark-text', iconBg: '#FCE7F3', iconColor: '#DB2777', version: '2.0',
      tags: ['Summary', 'Board', 'Executive'],
      snippet: 'Summarize the following financial results for the board: Revenue: {{revenue}}, EBITDA: {{ebitda}}...',
      usageCount: '148', rating: '4.8', lastUsed: '2d ago'
    },
  ];

  get filteredPrompts() {
    let result = this.prompts;
    if (this.activeCategory !== 'All') {
      result = result.filter(p => p.category === this.activeCategory);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.tags.some(t => t.toLowerCase().includes(term))
      );
    }
    return result;
  }

  get selectedPromptData(): any {
    const p = this.prompts.find(pr => pr.id === this.selectedPrompt) || this.prompts[0];
    const details: any = {
      'flux-commentary': {
        systemPrompt: `You are a senior financial analyst at a SaaS company.\nYour role is to provide clear, concise variance\nexplanations for month-end close reporting.\n\nRules:\n- Focus on materiality (>5% or >$10K)\n- Reference specific business drivers\n- Suggest follow-up actions when warranted\n- Use professional but accessible language`,
        userTemplate: `Analyze the following P&L variance:\n\nAccount: {{account_name}}\nBudget: {{budget_amount}}\nActual: {{actual_amount}}\nVariance: {{variance_amount}} ({{variance_pct}}%)\nPrior Year: {{prior_year_amount}}\n\nProvide a 2-3 sentence explanation.`,
        variables: [
          { name: 'account_name', type: 'string', description: 'GL account display name' },
          { name: 'budget_amount', type: 'number', description: 'Budgeted amount for the period' },
          { name: 'actual_amount', type: 'number', description: 'Actual posted amount' },
          { name: 'variance_amount', type: 'number', description: 'Dollar variance (actual - budget)' },
          { name: 'variance_pct', type: 'number', description: 'Percentage variance' },
          { name: 'prior_year_amount', type: 'number', description: 'Same period last year' },
        ]
      }
    };
    return { ...p, ...(details[p.id] || details['flux-commentary']) };
  }

  versionHistory = [
    { version: '3.2', date: 'Feb 3, 2026', change: 'Added prior year comparison logic', current: true },
    { version: '3.1', date: 'Jan 15, 2026', change: 'Improved materiality thresholds', current: false },
    { version: '3.0', date: 'Dec 20, 2025', change: 'Major rewrite — structured output', current: false },
    { version: '2.4', date: 'Nov 8, 2025', change: 'Added action suggestions', current: false },
    { version: '2.0', date: 'Sep 1, 2025', change: 'Initial production version', current: false },
  ];

  performanceMetrics = [
    { label: 'Accuracy', value: '97.1%', pct: 97, color: '#059669' },
    { label: 'Relevance', value: '94.8%', pct: 95, color: 'var(--primary)' },
    { label: 'Consistency', value: '92.3%', pct: 92, color: '#2563EB' },
    { label: 'Conciseness', value: '88.6%', pct: 89, color: '#D97706' },
    { label: 'Actionability', value: '85.2%', pct: 85, color: '#7C3AED' },
  ];

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }
}