import { Component } from '@angular/core';

@Component({
  selector: 'afda-acc-tb',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-list-columns"></i>
      <h2>Trial Balance</h2>
      <p>Period trial balance with debit/credit totals</p>
      <span class="badge-wip">Phase 3 — Accounting</span>
    </div>
  `
})
export class TrialBalanceComponent {}
