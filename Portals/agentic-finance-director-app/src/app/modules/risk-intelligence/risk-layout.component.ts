import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModuleSidebarComponent, SidebarSection } from '../../layout/module-sidebar/module-sidebar.component';

@Component({
  selector: 'afda-risk-layout',
  standalone: true,
  imports: [RouterOutlet, ModuleSidebarComponent],
  template: `
    <afda-module-sidebar [sections]="sidebar" />
    <main class="afda-main">
      <router-outlet />
    </main>
  `
})
export class RiskLayoutComponent {
  sidebar: SidebarSection[] = [
    {
      heading: 'Monitoring',
      items: [
        { route: '/risk/alerts',    label: 'Alert Center',    icon: 'bi-exclamation-triangle' },
        { route: '/risk/dashboard', label: 'Risk Dashboard',  icon: 'bi-shield-check' },
      ]
    },
    {
      heading: 'Configuration',
      items: [
        { route: '/risk/rules',   label: 'Alert Rules',      icon: 'bi-sliders' },
        { route: '/risk/history', label: 'Alert History',     icon: 'bi-clock-history' },
      ]
    }
  ];
}
