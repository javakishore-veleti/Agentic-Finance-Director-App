import { Component } from '@angular/core';

@Component({
  selector: 'afda-adm-keys',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-key"></i>
      <h2>API Keys</h2>
      <p>Manage API keys for external integrations</p>
      <span class="badge-wip">Phase 3 — Administration</span>
    </div>
  `
})
export class ApiKeysComponent {}
