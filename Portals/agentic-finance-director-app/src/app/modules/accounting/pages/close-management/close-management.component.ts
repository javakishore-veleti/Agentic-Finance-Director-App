import { Component } from '@angular/core';

@Component({
  selector: 'afda-acc-close',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-card-checklist"></i>
      <h2>Close Management</h2>
      <p>Month-end close checklist and progress tracking</p>
      <span class="badge-wip">Phase 3 — Accounting</span>
    </div>
  `
})
export class CloseManagementComponent {}
