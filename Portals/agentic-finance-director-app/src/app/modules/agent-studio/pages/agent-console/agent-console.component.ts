import { Component } from '@angular/core';

@Component({
  selector: 'afda-as-console',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-chat-dots"></i>
      <h2>Agent Console</h2>
      <p>Interactive AI chat — talk to the Finance Director agent</p>
      <span class="badge-wip">Phase 3 — Agent Studio</span>
    </div>
  `
})
export class AgentConsoleComponent {}
