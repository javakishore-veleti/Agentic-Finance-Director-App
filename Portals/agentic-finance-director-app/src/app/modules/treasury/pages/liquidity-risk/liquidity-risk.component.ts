import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-treasury-liquidity',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/treasury/cash-position">Treasury</a>
      <span class="separator">/</span>
      <span class="current">Liquidity Risk</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Liquidity Risk</h1>
        <p class="afda-page-subtitle">Stress testing, concentration analysis, and contingency planning</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-clock-history"></i> History
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-play-fill"></i> Run Stress Test
        </button>
      </div>
    </div>

    <!-- Risk Score Banner -->
    <div class="risk-banner stagger">
      <div class="risk-score-block">
        <div class="risk-gauge">
          <svg viewBox="0 0 120 70" class="gauge-svg">
            <path d="M10 65 A50 50 0 0 1 110 65" fill="none" stroke="#E5E7EB" stroke-width="8" stroke-linecap="round"/>
            <path d="M10 65 A50 50 0 0 1 110 65" fill="none" stroke="url(#gaugeGrad)" stroke-width="8" stroke-linecap="round"
                  [attr.stroke-dasharray]="'157'" [attr.stroke-dashoffset]="gaugeOffset"/>
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#059669"/>
                <stop offset="50%" stop-color="#D97706"/>
                <stop offset="100%" stop-color="#DC2626"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="gauge-value">
            <span class="gauge-number font-mono">{{ riskScore }}</span>
            <span class="gauge-label">/ 100</span>
          </div>
        </div>
        <div class="risk-score-info">
          <div class="risk-score-title">Liquidity Risk Score</div>
          <span class="afda-badge afda-badge-success">Low Risk</span>
          <div class="risk-score-sub">Last assessed: Feb 5, 2026</div>
        </div>
      </div>
      <div class="risk-factors">
        @for (factor of riskFactors; track factor.label) {
          <div class="risk-factor-item">
            <div class="rf-header">
              <span class="rf-label">{{ factor.label }}</span>
              <span class="rf-score font-mono" [style.color]="factor.color">{{ factor.score }}</span>
            </div>
            <div class="rf-bar">
              <div class="rf-bar-fill" [style.width.%]="factor.pct" [style.background]="factor.color"></div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Two Column: Ratios + Concentration -->
    <div class="liquidity-grid">
      <!-- Key Ratios -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.08s both;">
        <div class="afda-card-title" style="margin-bottom: 16px;">Liquidity Ratios</div>
        @for (ratio of ratios; track ratio.name) {
          <div class="ratio-row">
            <div class="ratio-info">
              <div class="ratio-name">{{ ratio.name }}</div>
              <div class="ratio-desc">{{ ratio.description }}</div>
            </div>
            <div class="ratio-values">
              <div class="ratio-current">
                <span class="ratio-val font-mono">{{ ratio.current }}</span>
                <span class="ratio-period">Current</span>
              </div>
              <div class="ratio-prior">
                <span class="ratio-val font-mono">{{ ratio.prior }}</span>
                <span class="ratio-period">Prior Mo</span>
              </div>
              <div class="ratio-trend">
                <span class="afda-stat-trend" [ngClass]="ratio.trendDir">{{ ratio.trend }}</span>
              </div>
            </div>
            <div class="ratio-threshold">
              <div class="ratio-th-bar">
                <div class="ratio-th-fill" [style.width.%]="ratio.gaugeWidth"
                     [style.background]="ratio.gaugeColor"></div>
                <div class="ratio-th-marker" [style.left.%]="ratio.thresholdPos"></div>
              </div>
              <div class="ratio-th-labels">
                <span>{{ ratio.thresholdLabel }}</span>
                <span class="afda-badge" [ngClass]="ratio.statusClass" style="font-size: 9px;">{{ ratio.statusLabel }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Concentration Risk -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.1s both;">
        <div class="afda-card-title" style="margin-bottom: 16px;">Concentration Risk</div>

        <!-- Bank Concentration -->
        <div class="conc-section">
          <div class="conc-subtitle">Bank Exposure</div>
          @for (bank of bankConcentration; track bank.name) {
            <div class="conc-row">
              <span class="conc-name">{{ bank.name }}</span>
              <div class="conc-bar-wrapper">
                <div class="conc-bar">
                  <div class="conc-bar-fill" [style.width.%]="bank.pct"
                       [style.background]="bank.pct > 50 ? '#D97706' : 'var(--primary)'"></div>
                </div>
              </div>
              <span class="conc-pct font-mono">{{ bank.pct }}%</span>
              <span class="conc-amount font-mono">{{ bank.amount }}</span>
            </div>
          }
          <div class="conc-warning" *ngIf="true">
            <i class="bi bi-exclamation-triangle" style="color: var(--warning);"></i>
            <span>JPMorgan concentration at 76% — exceeds 50% diversification guideline</span>
          </div>
        </div>

        <!-- Client AR Concentration -->
        <div class="conc-section" style="margin-top: 18px;">
          <div class="conc-subtitle">AR Client Concentration</div>
          @for (client of arConcentration; track client.name) {
            <div class="conc-row">
              <span class="conc-name">{{ client.name }}</span>
              <div class="conc-bar-wrapper">
                <div class="conc-bar">
                  <div class="conc-bar-fill" [style.width.%]="client.pct"
                       [style.background]="client.pct > 25 ? '#DC2626' : 'var(--primary)'"></div>
                </div>
              </div>
              <span class="conc-pct font-mono">{{ client.pct }}%</span>
              <span class="conc-amount font-mono">{{ client.amount }}</span>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Stress Test Scenarios -->
    <div class="afda-card" style="margin-top: 16px; animation: fadeUp 0.4s ease 0.14s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Stress Test Scenarios</div>
        <span style="font-size: 11px; color: var(--text-tertiary);">Last run: Feb 5, 2026 · 7:00 AM</span>
      </div>
      <div class="stress-grid">
        @for (scenario of stressScenarios; track scenario.name) {
          <div class="stress-card" [class]="'stress-' + scenario.severity">
            <div class="stress-header">
              <span class="afda-badge" [ngClass]="scenario.badgeClass">{{ scenario.severityLabel }}</span>
              <span class="stress-name">{{ scenario.name }}</span>
            </div>
            <p class="stress-desc">{{ scenario.description }}</p>
            <div class="stress-metrics">
              <div class="stress-metric">
                <span class="sm-label">Cash Impact</span>
                <span class="sm-value font-mono text-unfavorable">{{ scenario.cashImpact }}</span>
              </div>
              <div class="stress-metric">
                <span class="sm-label">Ending Cash</span>
                <span class="sm-value font-mono">{{ scenario.endingCash }}</span>
              </div>
              <div class="stress-metric">
                <span class="sm-label">Runway</span>
                <span class="sm-value font-mono">{{ scenario.runway }}</span>
              </div>
            </div>
            <div class="stress-result">
              <i [class]="'bi ' + scenario.resultIcon" [style.color]="scenario.resultColor"></i>
              <span>{{ scenario.result }}</span>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Contingency Plan -->
    <div class="afda-card" style="margin-top: 16px; animation: fadeUp 0.4s ease 0.18s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">Contingency Liquidity Sources</div>
        <span style="font-size: 11px; color: var(--text-tertiary);">Total available: $8.2M</span>
      </div>
      <table class="afda-table">
        <thead>
          <tr>
            <th>Source</th>
            <th>Type</th>
            <th class="text-right">Available</th>
            <th class="text-right">Drawn</th>
            <th class="text-right">Remaining</th>
            <th>Access Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          @for (source of contingencySources; track source.name) {
            <tr>
              <td class="fw-600">{{ source.name }}</td>
              <td style="font-size: 12px; color: var(--text-secondary);">{{ source.type }}</td>
              <td class="text-right font-mono">{{ source.available }}</td>
              <td class="text-right font-mono">{{ source.drawn }}</td>
              <td class="text-right font-mono fw-600">{{ source.remaining }}</td>
              <td style="font-size: 12px;">{{ source.accessTime }}</td>
              <td><span class="afda-badge" [ngClass]="source.statusClass">{{ source.status }}</span></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Risk Banner */
    .risk-banner {
      display: flex; align-items: center; gap: 32px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 24px 28px;
      box-shadow: var(--shadow-card); margin-bottom: 20px;
      animation: fadeUp 0.4s ease both;
    }

    .risk-score-block {
      display: flex; align-items: center; gap: 16px;
      padding-right: 28px; border-right: 1px solid var(--border-light);
      flex-shrink: 0;
    }

    .risk-gauge { width: 110px; position: relative; }
    .gauge-svg { width: 100%; display: block; }

    .gauge-value {
      position: absolute; bottom: 4px; left: 50%;
      transform: translateX(-50%);
      text-align: center;
    }

    .gauge-number { font-size: 24px; font-weight: 700; color: #059669; }
    .gauge-label { font-size: 11px; color: var(--text-tertiary); display: block; }

    .risk-score-title { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
    .risk-score-sub { font-size: 11px; color: var(--text-tertiary); margin-top: 6px; }

    .risk-factors { flex: 1; display: flex; flex-direction: column; gap: 12px; }

    .risk-factor-item { }
    .rf-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .rf-label { font-size: 12.5px; color: var(--text-secondary); }
    .rf-score { font-size: 12.5px; font-weight: 600; }
    .rf-bar { height: 6px; background: var(--border-light); border-radius: 10px; overflow: hidden; }
    .rf-bar-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }

    .liquidity-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    /* Ratio Rows */
    .ratio-row {
      padding: 14px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .ratio-info { margin-bottom: 8px; }
    .ratio-name { font-size: 13.5px; font-weight: 600; color: var(--text-primary); }
    .ratio-desc { font-size: 11.5px; color: var(--text-tertiary); margin-top: 1px; }

    .ratio-values {
      display: flex; align-items: center; gap: 20px; margin-bottom: 8px;
    }

    .ratio-current, .ratio-prior { text-align: center; }
    .ratio-val { font-size: 16px; font-weight: 700; display: block; }
    .ratio-period { font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; }

    .ratio-threshold { }
    .ratio-th-bar {
      height: 6px; background: var(--border-light);
      border-radius: 10px; overflow: visible; position: relative;
    }

    .ratio-th-fill { height: 100%; border-radius: 10px; }

    .ratio-th-marker {
      position: absolute; top: -3px; bottom: -3px;
      width: 2px; background: var(--text-primary); border-radius: 2px;
    }

    .ratio-th-labels {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 4px; font-size: 10.5px; color: var(--text-tertiary);
    }

    /* Concentration */
    .conc-subtitle {
      font-size: 12px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.4px; color: var(--text-tertiary); margin-bottom: 10px;
    }

    .conc-row {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 0;
    }

    .conc-name { font-size: 12.5px; font-weight: 500; color: var(--text-primary); width: 110px; flex-shrink: 0; }

    .conc-bar-wrapper { flex: 1; }
    .conc-bar { height: 8px; background: var(--border-light); border-radius: 10px; overflow: hidden; }
    .conc-bar-fill { height: 100%; border-radius: 10px; transition: width 0.4s ease; }

    .conc-pct { font-size: 11.5px; color: var(--text-secondary); width: 36px; text-align: right; }
    .conc-amount { font-size: 11.5px; color: var(--text-tertiary); width: 60px; text-align: right; }

    .conc-warning {
      display: flex; align-items: center; gap: 8px;
      margin-top: 10px; padding: 8px 12px;
      background: var(--warning-bg); border-radius: var(--radius-sm);
      font-size: 12px; color: #92400E;
    }

    /* Stress Tests */
    .stress-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .stress-card {
      padding: 18px; border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
      transition: border-color 0.15s;
      &:hover { border-color: #D1D5DB; }
    }

    .stress-header {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 8px;
    }

    .stress-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }

    .stress-desc {
      font-size: 12px; color: var(--text-secondary);
      line-height: 1.5; margin-bottom: 12px;
    }

    .stress-metrics {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
      margin-bottom: 12px;
    }

    .stress-metric { text-align: center; }
    .sm-label { display: block; font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; }
    .sm-value { display: block; font-size: 13px; font-weight: 700; margin-top: 2px; }

    .stress-result {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 10px; background: var(--bg-section);
      border-radius: var(--radius-sm);
      font-size: 12px; color: var(--text-secondary);
      i { font-size: 14px; }
    }

    @media (max-width: 1100px) {
      .risk-banner { flex-direction: column; align-items: flex-start; }
      .risk-score-block { border-right: none; padding-right: 0; padding-bottom: 16px; border-bottom: 1px solid var(--border-light); }
      .liquidity-grid { grid-template-columns: 1fr; }
      .stress-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class LiquidityRiskComponent {
  riskScore = 24;
  gaugeOffset = 119; // lower = more filled (0-157 range)

  riskFactors = [
    { label: 'Cash Adequacy',     score: '92/100', pct: 92, color: '#059669' },
    { label: 'Revenue Diversity',  score: '78/100', pct: 78, color: '#059669' },
    { label: 'Debt Capacity',     score: '85/100', pct: 85, color: '#059669' },
    { label: 'AR Collection',     score: '64/100', pct: 64, color: '#D97706' },
    { label: 'Bank Diversification', score: '42/100', pct: 42, color: '#DC2626' },
  ];

  ratios = [
    { name: 'Current Ratio', description: 'Current assets / current liabilities', current: '2.1x', prior: '1.9x', trend: '↑ 0.2x', trendDir: 'positive', gaugeWidth: 70, gaugeColor: '#059669', thresholdPos: 50, thresholdLabel: 'Min: 1.5x', statusLabel: 'Healthy', statusClass: 'afda-badge-success' },
    { name: 'Quick Ratio', description: 'Liquid assets / current liabilities', current: '1.6x', prior: '1.5x', trend: '↑ 0.1x', trendDir: 'positive', gaugeWidth: 64, gaugeColor: '#059669', thresholdPos: 40, thresholdLabel: 'Min: 1.0x', statusLabel: 'Healthy', statusClass: 'afda-badge-success' },
    { name: 'Cash Ratio', description: 'Cash / current liabilities', current: '0.9x', prior: '0.8x', trend: '↑ 0.1x', trendDir: 'positive', gaugeWidth: 56, gaugeColor: '#D97706', thresholdPos: 44, thresholdLabel: 'Min: 0.5x', statusLabel: 'Adequate', statusClass: 'afda-badge-high' },
    { name: 'Operating Cash Flow Ratio', description: 'CFO / current liabilities', current: '1.4x', prior: '1.2x', trend: '↑ 0.2x', trendDir: 'positive', gaugeWidth: 60, gaugeColor: '#059669', thresholdPos: 36, thresholdLabel: 'Min: 1.0x', statusLabel: 'Healthy', statusClass: 'afda-badge-success' },
  ];

  bankConcentration = [
    { name: 'JPMorgan Chase', pct: 76, amount: '$3.64M' },
    { name: 'Deutsche Bank',  pct: 9,  amount: '$412K' },
    { name: 'SVB',            pct: 10, amount: '$480K' },
    { name: 'Barclays',       pct: 6,  amount: '$288K' },
  ];

  arConcentration = [
    { name: 'TechVentures',  pct: 32, amount: '$1.2M' },
    { name: 'Acme Corp',     pct: 22, amount: '$840K' },
    { name: 'GlobalTech',    pct: 14, amount: '$520K' },
    { name: 'NovaSoft',      pct: 11, amount: '$410K' },
    { name: 'Other (18)',    pct: 21, amount: '$780K' },
  ];

  stressScenarios = [
    {
      name: '30-Day Revenue Delay',
      description: 'All customer receipts delayed by 30 days while expenses remain on schedule.',
      severityLabel: 'MODERATE', badgeClass: 'afda-badge-high', severity: 'moderate',
      cashImpact: '-$2.8M', endingCash: '$2.0M', runway: '6.2 mo',
      result: 'Passes minimum cash threshold, but triggers covenant watch',
      resultIcon: 'bi-exclamation-triangle', resultColor: '#D97706'
    },
    {
      name: 'Top Client Default',
      description: 'TechVentures ($1.2M AR) defaults entirely with no recovery.',
      severityLabel: 'SEVERE', badgeClass: 'afda-badge-critical', severity: 'severe',
      cashImpact: '-$1.2M', endingCash: '$3.6M', runway: '10.8 mo',
      result: 'Passes all thresholds — manageable with contingency sources',
      resultIcon: 'bi-check-circle', resultColor: '#059669'
    },
    {
      name: 'Combined Stress',
      description: '20% revenue decline + 10% cost increase sustained for 3 months.',
      severityLabel: 'EXTREME', badgeClass: 'afda-badge-critical', severity: 'extreme',
      cashImpact: '-$4.1M', endingCash: '$720K', runway: '2.8 mo',
      result: 'Breaches minimum cash — requires credit facility draw',
      resultIcon: 'bi-x-circle', resultColor: '#DC2626'
    },
  ];

  contingencySources = [
    { name: 'Revolving Credit Facility', type: 'Credit Line',  available: '$5,000,000', drawn: '$0',         remaining: '$5,000,000', accessTime: 'Same day',   status: 'Active', statusClass: 'afda-badge-success' },
    { name: 'Savings Reserve',           type: 'Internal',     available: '$480,000',   drawn: '$0',         remaining: '$480,000',   accessTime: 'Same day',   status: 'Active', statusClass: 'afda-badge-success' },
    { name: 'Term Loan (Undrawn)',       type: 'Credit Line',  available: '$2,000,000', drawn: '$0',         remaining: '$2,000,000', accessTime: '3-5 days',   status: 'Active', statusClass: 'afda-badge-success' },
    { name: 'Invoice Factoring',         type: 'AR Finance',   available: '$750,000',   drawn: '$0',         remaining: '$750,000',   accessTime: '1-2 days',   status: 'Standby', statusClass: 'afda-badge-high' },
  ];
}