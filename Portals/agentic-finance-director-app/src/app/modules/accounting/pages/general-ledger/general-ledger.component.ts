import { Component } from '@angular/core';

@Component({
  selector: 'afda-acc-gl',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-journal-text"></i>
      <h2>General Ledger</h2>
      <p>GL account summary by period and entity</p>
      <span class="badge-wip">Phase 3 — Accounting</span>
    </div>
  `
})
export class GeneralLedgerComponent {}
