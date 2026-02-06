import { Component } from '@angular/core';

@Component({
  selector: 'afda-as-engine',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-cpu"></i>
      <h2>Engine Configuration</h2>
      <p>Select and configure agentic AI engine</p>
      <span class="badge-wip">Phase 3 — Agent Studio</span>
    </div>
  `
})
export class EngineConfigComponent {}
