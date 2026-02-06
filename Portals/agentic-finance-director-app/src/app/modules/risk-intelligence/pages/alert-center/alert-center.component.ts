import { Component } from '@angular/core';

@Component({
  selector: 'afda-ri-alerts',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-exclamation-triangle"></i>
      <h2>Alert Center</h2>
      <p>Active AI-identified financial risk alerts</p>
      <span class="badge-wip">Phase 3 — Risk Intelligence</span>
    </div>
  `
})
export class AlertCenterComponent {}
