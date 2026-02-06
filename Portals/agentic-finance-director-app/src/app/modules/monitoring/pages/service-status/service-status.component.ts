import { Component } from '@angular/core';

@Component({
  selector: 'afda-mon-services',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-hdd-stack"></i>
      <h2>Service Status</h2>
      <p>Docker container status across all AFDA services</p>
      <span class="badge-wip">Phase 3 — Monitoring</span>
    </div>
  `
})
export class ServiceStatusComponent {}
