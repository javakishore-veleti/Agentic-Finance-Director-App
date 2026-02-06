import { Component } from '@angular/core';

@Component({
  selector: 'afda-adm-settings',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-gear"></i>
      <h2>Platform Settings</h2>
      <p>Global configuration and preferences</p>
      <span class="badge-wip">Phase 3 — Administration</span>
    </div>
  `
})
export class SettingsComponent {}
