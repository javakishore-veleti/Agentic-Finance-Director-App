import { Component } from '@angular/core';

@Component({
  selector: 'afda-as-prompts',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-collection"></i>
      <h2>Prompt Library</h2>
      <p>System prompts and tool instructions</p>
      <span class="badge-wip">Phase 3 — Agent Studio</span>
    </div>
  `
})
export class PromptLibraryComponent {}
