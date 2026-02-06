import { Component } from '@angular/core';

@Component({
  selector: 'afda-mon-api',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-graph-up"></i>
      <h2>API Metrics</h2>
      <p>Request volume, latency, and error rates</p>
      <span class="badge-wip">Phase 3 — Monitoring</span>
    </div>
  `
})
export class ApiMetricsComponent {}
