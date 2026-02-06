import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
  width?: string;
}

@Component({
  selector: 'afda-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="afda-card">
      @if (title) {
        <div class="afda-card-header">
          <div class="afda-card-title">{{ title }}</div>
          <ng-content select="[tableActions]" />
        </div>
      }
      <div style="overflow-x: auto;">
        <table class="table afda-table">
          <thead>
            <tr>
              @for (col of columns; track col.key) {
                <th [class.text-right]="col.align === 'right'"
                    [class.text-center]="col.align === 'center'"
                    [style.width]="col.width || 'auto'"
                    (click)="onSort(col.key)"
                    style="cursor: pointer;">
                  {{ col.label }}
                  @if (sortKey === col.key) {
                    <i class="bi" [class.bi-chevron-up]="sortDir === 'asc'"
                       [class.bi-chevron-down]="sortDir === 'desc'"
                       style="font-size: 0.625rem; margin-left: 2px;"></i>
                  }
                </th>
              }
            </tr>
          </thead>
          <tbody>
            <ng-content />
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DataTableComponent {
  @Input() title = '';
  @Input() columns: TableColumn[] = [];
  @Output() sort = new EventEmitter<{ key: string; direction: 'asc' | 'desc' }>();

  sortKey = '';
  sortDir: 'asc' | 'desc' = 'asc';

  onSort(key: string) {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
    this.sort.emit({ key: this.sortKey, direction: this.sortDir });
  }
}
