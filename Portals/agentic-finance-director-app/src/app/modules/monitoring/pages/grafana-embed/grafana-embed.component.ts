import { Component } from '@angular/core';

@Component({
  selector: 'afda-mon-grafana',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-window-desktop"></i>
      <h2>Grafana Dashboards</h2>
      <p>Embedded Grafana observability dashboards</p>
      <span class="badge-wip">Phase 3 — Monitoring</span>
    </div>
  `
})
export class GrafanaEmbedComponent {}
