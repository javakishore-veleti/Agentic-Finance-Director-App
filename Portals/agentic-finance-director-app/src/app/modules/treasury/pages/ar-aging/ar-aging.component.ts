import { Component } from '@angular/core';

@Component({
  selector: 'afda-tr-ar',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-clock-history"></i>
      <h2>AR Aging</h2>
      <p>Accounts receivable aging buckets and collection</p>
      <span class="badge-wip">Phase 3 — Treasury</span>
    </div>
  `
})
export class ArAgingComponent {}
