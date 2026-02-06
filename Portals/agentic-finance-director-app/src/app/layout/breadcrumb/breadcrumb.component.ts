import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Breadcrumb {
  label: string;
  route?: string;
}

@Component({
  selector: 'afda-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="afda-breadcrumb">
      @for (item of items; track item.label; let last = $last) {
        @if (item.route && !last) {
          <a [routerLink]="item.route">{{ item.label }}</a>
        } @else {
          <span [class.current]="last">{{ item.label }}</span>
        }
        @if (!last) {
          <span class="separator">/</span>
        }
      }
    </nav>
  `
})
export class BreadcrumbComponent {
  @Input() items: Breadcrumb[] = [];
}
