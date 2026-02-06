import { Component } from '@angular/core';

@Component({
  selector: 'afda-tr-forecast',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-calendar-range"></i>
      <h2>Cash Forecast</h2>
      <p>13-week rolling cash projection</p>
      <span class="badge-wip">Phase 3 — Treasury</span>
    </div>
  `
})
export class CashForecastComponent {}
