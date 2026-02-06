import { Component } from '@angular/core';

@Component({
  selector: 'afda-adm-connections',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-plug"></i>
      <h2>Data Connections</h2>
      <p>Database, cache, and service connection management</p>
      <span class="badge-wip">Phase 3 — Administration</span>
    </div>
  `
})
export class DataConnectionsComponent {}
