import { Component, Input } from '@angular/core';

@Component({
  selector: 'afda-ai-insight',
  standalone: true,
  template: `
    <div class="afda-ai-panel">
      <div class="afda-ai-panel-header">
        <i class="bi bi-stars"></i>
        <span>{{ title || 'AI Insight' }}</span>
      </div>
      <div class="afda-ai-panel-body">
        <ng-content />
      </div>
    </div>
  `
})
export class AiInsightPanelComponent {
  @Input() title = 'AI Insight';
}
