import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModuleSidebarComponent, SidebarSection } from '../../layout/module-sidebar/module-sidebar.component';

@Component({
  selector: 'afda-command-center-layout',
  standalone: true,
  imports: [RouterOutlet, ModuleSidebarComponent],
  template: `
    <afda-module-sidebar [sections]="sidebar" />
    <main class="afda-main">
      <router-outlet />
    </main>
  `
})
export class CommandCenterLayoutComponent {
  sidebar: SidebarSection[] = [
    {
      heading: 'Intelligence',
      items: [
        { route: '/command/overview', label: 'Executive Overview',  icon: 'bi-speedometer2' },
        { route: '/command/kpi',      label: 'KPI Scorecard',       icon: 'bi-bullseye' },
        { route: '/command/briefing', label: 'Executive Briefing',  icon: 'bi-file-earmark-text' },
        { route: '/command/actions',  label: 'Action Items',        icon: 'bi-check2-square' },
      ]
    }
  ];
}
