import { Component } from '@angular/core';

@Component({
  selector: 'afda-cc-actions',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-check2-square"></i>
      <h2>Action Items</h2>
      <p>AI-flagged items requiring executive attention</p>
      <span class="badge-wip">Phase 3 — Command Center</span>
    </div>
  `
})
export class ActionItemsComponent {}
