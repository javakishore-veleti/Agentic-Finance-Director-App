import { Component, Input } from '@angular/core';

@Component({
  selector: 'afda-empty-state',
  standalone: true,
  template: `
    <div class="afda-empty-state">
      <i class="bi" [class]="icon"></i>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      @if (actionLabel) {
        <button class="btn btn-primary btn-sm mt-2" (click)="onAction()">{{ actionLabel }}</button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon = 'bi-inbox';
  @Input() title = 'No data yet';
  @Input() message = 'Data will appear here once available.';
  @Input() actionLabel = '';

  onAction() { /* override via output */ }
}
