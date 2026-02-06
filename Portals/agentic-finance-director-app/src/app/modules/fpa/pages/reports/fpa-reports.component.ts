import { Component } from '@angular/core';

@Component({
  selector: 'afda-fpa-reports',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-file-earmark-bar-graph"></i>
      <h2>Reports</h2>
      <p>Monthly and quarterly FP&A report generation</p>
      <span class="badge-wip">Phase 3 — FP&A</span>
    </div>
  `
})
export class FpaReportsComponent {}
