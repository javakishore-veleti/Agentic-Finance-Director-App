import { Component } from '@angular/core';

@Component({
  selector: 'afda-fpa-budget',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-bar-chart-line"></i>
      <h2>Budget vs. Actual</h2>
      <p>Period-over-period budget performance analysis</p>
      <span class="badge-wip">Phase 3 — FP&A</span>
    </div>
  `
})
export class BudgetVsActualComponent {}
