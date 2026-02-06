import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModuleSidebarComponent, SidebarSection } from '../../layout/module-sidebar/module-sidebar.component';

@Component({
  selector: 'afda-monitoring-layout',
  standalone: true,
  imports: [RouterOutlet, ModuleSidebarComponent],
  template: `
    <afda-module-sidebar [sections]="sidebar" />
    <main class="afda-main">
      <router-outlet />
    </main>
  `
})
export class MonitoringLayoutComponent {
  sidebar: SidebarSection[] = [
    {
      heading: 'Observability',
      items: [
        { route: '/monitoring/health',   label: 'System Health',       icon: 'bi-heart-pulse' },
        { route: '/monitoring/services', label: 'Service Status',      icon: 'bi-hdd-stack' },
        { route: '/monitoring/api',      label: 'API Metrics',         icon: 'bi-graph-up' },
        { route: '/monitoring/grafana',  label: 'Grafana Dashboards',  icon: 'bi-window-desktop' },
      ]
    }
  ];
}
