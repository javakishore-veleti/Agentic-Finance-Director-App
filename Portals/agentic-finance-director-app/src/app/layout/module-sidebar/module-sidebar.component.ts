import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule, RouterLink, RouterLinkActive],
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

      <!-- Engine Status (footer) -->
      <div class="sidebar-engine-card">
        <div class="sidebar-engine-label">Active Engine</div>
        <div class="sidebar-engine-row">
          <div class="sidebar-engine-dot"></div>
          <span class="sidebar-engine-name">n8n Workflow Engine</span>
        </div>
        <div class="sidebar-engine-meta">3 active workflows · 142 runs today</div>
      </div>
    </aside>
  `
})
export class ModuleSidebarComponent {
  @Input() sections: SidebarSection[] = [];
}