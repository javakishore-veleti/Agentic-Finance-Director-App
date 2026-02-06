import { Component } from '@angular/core';

@Component({
  selector: 'afda-fpa-forecast',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-binoculars"></i>
      <h2>Forecasting</h2>
      <p>Rolling forecast vs. plan comparison</p>
      <span class="badge-wip">Phase 3 — FP&A</span>
    </div>
  `
})
export class ForecastingComponent {}
