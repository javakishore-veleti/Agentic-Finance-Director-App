import { Component } from '@angular/core';

@Component({
  selector: 'afda-fpa-variance',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-plus-slash-minus"></i>
      <h2>Variance Analysis</h2>
      <p>Drill-down variance by department and category</p>
      <span class="badge-wip">Phase 3 — FP&A</span>
    </div>
  `
})
export class VarianceAnalysisComponent {}
