import { Component } from '@angular/core';

@Component({
  selector: 'afda-adm-audit',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-shield-lock"></i>
      <h2>Audit Log</h2>
      <p>System-wide activity and change audit trail</p>
      <span class="badge-wip">Phase 3 — Administration</span>
    </div>
  `
})
export class AuditLogComponent {}
