import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'afda-export-button',
  standalone: true,
  template: `
    <div class="dropdown">
      <button class="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
        <i class="bi bi-download me-1"></i> Export
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item" style="font-size:0.8125rem;" (click)="exportAs.emit('csv')"><i class="bi bi-filetype-csv me-2"></i>CSV</a></li>
        <li><a class="dropdown-item" style="font-size:0.8125rem;" (click)="exportAs.emit('xlsx')"><i class="bi bi-file-earmark-excel me-2"></i>Excel</a></li>
        <li><a class="dropdown-item" style="font-size:0.8125rem;" (click)="exportAs.emit('pdf')"><i class="bi bi-file-earmark-pdf me-2"></i>PDF</a></li>
      </ul>
    </div>
  `
})
export class ExportButtonComponent {
  @Output() exportAs = new EventEmitter<'csv' | 'xlsx' | 'pdf'>();
}
