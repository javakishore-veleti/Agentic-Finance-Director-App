import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="afda-stat-card h-100">
      <div class="afda-stat-label">{{ label }}</div>
      <div class="d-flex align-items-end justify-content-between">
        <div class="afda-stat-value">{{ value }}</div>
        @if (trend) {
          <div class="afda-stat-trend" [ngClass]="trendDirection">
            <i class="bi" [ngClass]="{
              'bi-arrow-up-short': trendDirection === 'positive',
              'bi-arrow-down-short': trendDirection === 'negative',
              'bi-dash': trendDirection === 'neutral'
            }"></i>
            {{ trend }}
          </div>
        }
      </div>
      @if (footnote) {
        <div class="afda-stat-footnote">{{ footnote }}</div>
      }
    </div>
  `
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() trend = '';
  @Input() trendDirection: 'positive' | 'negative' | 'neutral' = 'neutral';
  @Input() footnote = '';
}
