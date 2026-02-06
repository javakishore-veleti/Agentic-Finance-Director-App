import { Component } from '@angular/core';

@Component({
  selector: 'afda-tr-banks',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-bank"></i>
      <h2>Bank Accounts</h2>
      <p>Account registry, balances, and bank relationships</p>
      <span class="badge-wip">Phase 3 — Treasury</span>
    </div>
  `
})
export class BankAccountsComponent {}
