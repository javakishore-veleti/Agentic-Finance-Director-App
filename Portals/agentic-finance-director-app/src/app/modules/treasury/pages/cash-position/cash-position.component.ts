import { Component } from '@angular/core';

@Component({
  selector: 'afda-tr-cash',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-wallet2"></i>
      <h2>Cash Position</h2>
      <p>Daily cash balances across all accounts</p>
      <span class="badge-wip">Phase 3 — Treasury</span>
    </div>
  `
})
export class CashPositionComponent {}
