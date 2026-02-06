import { Component } from '@angular/core';

@Component({
  selector: 'afda-ri-history',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-clock-history"></i>
      <h2>Alert History</h2>
      <p>Historical alert log with resolution tracking</p>
      <span class="badge-wip">Phase 3 — Risk Intelligence</span>
    </div>
  `
})
export class AlertHistoryComponent {}
