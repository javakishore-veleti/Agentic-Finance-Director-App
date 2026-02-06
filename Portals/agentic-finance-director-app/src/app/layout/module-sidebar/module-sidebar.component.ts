import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface SidebarItem {
  route: string;
  label: string;
  icon: string;
}

export interface SidebarSection {
  heading?: string;
  items: SidebarItem[];
}

@Component({
  selector: 'afda-module-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="afda-module-sidebar">
      @for (section of sections; track section.heading; let idx = $index) {
        @if (idx > 0) {
          <div class="afda-sidebar-divider"></div>
        }
        @if (section.heading) {
          <div class="afda-sidebar-section-label">{{ section.heading }}</div>
        }
        @for (item of section.items; track item.route) {
          <a class="afda-sidebar-link"
             [routerLink]="item.route"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: true }">
            <i class="bi" [class]="item.icon"></i>
            <span>{{ item.label }}</span>
          </a>
        }
      }
    </aside>
  `
})
export class ModuleSidebarComponent {
  @Input() sections: SidebarSection[] = [];
}
