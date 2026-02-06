import { Component } from '@angular/core';

@Component({
  selector: 'afda-ri-rules',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-sliders"></i>
      <h2>Alert Rules</h2>
      <p>Configure thresholds, triggers, and notification rules</p>
      <span class="badge-wip">Phase 3 — Risk Intelligence</span>
    </div>
  `
})
export class AlertRulesComponent {}
