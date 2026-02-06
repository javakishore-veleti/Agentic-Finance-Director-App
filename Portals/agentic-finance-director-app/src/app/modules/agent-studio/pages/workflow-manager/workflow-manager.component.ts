import { Component } from '@angular/core';

@Component({
  selector: 'afda-as-workflows',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-diagram-3"></i>
      <h2>Workflow Manager</h2>
      <p>View, import, and manage agent workflow definitions</p>
      <span class="badge-wip">Phase 3 — Agent Studio</span>
    </div>
  `
})
export class WorkflowManagerComponent {}
