import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="modal d-block" style="background:rgba(0,0,0,0.35);" (click)="onCancel()">
        <div class="modal-dialog modal-sm modal-dialog-centered" (click)="$event.stopPropagation()">
          <div class="modal-content border-0 shadow">
            <div class="modal-body text-center p-4">
              <i class="bi" [class]="icon" style="font-size:2rem;color:var(--afda-warning);"></i>
              <h6 class="mt-2 mb-1">{{ title }}</h6>
              <p class="text-muted mb-3" style="font-size:0.8125rem;">{{ message }}</p>
              <div class="d-flex gap-2 justify-content-center">
                <button class="btn btn-sm btn-outline-secondary" (click)="onCancel()">Cancel</button>
                <button class="btn btn-sm" [class]="confirmClass" (click)="onConfirm()">{{ confirmLabel }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmationDialogComponent {
  @Input() visible = false;
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() confirmLabel = 'Confirm';
  @Input() confirmClass = 'btn-danger';
  @Input() icon = 'bi-exclamation-triangle';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() { this.confirmed.emit(); }
  onCancel() { this.cancelled.emit(); }
}
