import { Component } from '@angular/core';

@Component({
  selector: 'afda-as-history',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-clock-history"></i>
      <h2>Execution History</h2>
      <p>Agent run logs, token usage, and performance</p>
      <span class="badge-wip">Phase 3 — Agent Studio</span>
    </div>
  `
})
export class ExecutionHistoryComponent {}
