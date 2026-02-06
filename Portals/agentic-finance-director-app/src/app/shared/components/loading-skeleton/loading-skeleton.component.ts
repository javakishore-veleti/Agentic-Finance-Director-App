import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (variant) {
      @case ('card') {
        <div class="afda-stat-card">
          <div class="afda-skeleton" style="width:40%;height:12px;margin-bottom:8px;"></div>
          <div class="afda-skeleton" style="width:60%;height:28px;margin-bottom:4px;"></div>
          <div class="afda-skeleton" style="width:30%;height:10px;"></div>
        </div>
      }
      @case ('table-row') {
        <tr>
          @for (col of colArray; track col) {
            <td><div class="afda-skeleton" style="height:14px;" [style.width]="col + '%'"></div></td>
          }
        </tr>
      }
      @default {
        <div class="afda-skeleton" [style.width]="width" [style.height]="height"></div>
      }
    }
  `
})
export class LoadingSkeletonComponent {
  @Input() variant: 'inline' | 'card' | 'table-row' = 'inline';
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() columns = 5;

  get colArray(): number[] {
    return Array.from({ length: this.columns }, () => 40 + Math.random() * 50);
  }
}
