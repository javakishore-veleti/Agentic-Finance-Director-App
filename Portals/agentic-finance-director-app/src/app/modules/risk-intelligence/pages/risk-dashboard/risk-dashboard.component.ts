import { Component } from '@angular/core';

@Component({
  selector: 'afda-ri-dashboard',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-shield-check"></i>
      <h2>Risk Dashboard</h2>
      <p>Aggregated risk scoring and trend visualization</p>
      <span class="badge-wip">Phase 3 — Risk Intelligence</span>
    </div>
  `
})
export class RiskDashboardComponent {}
