import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModuleSidebarComponent, SidebarSection } from '../../layout/module-sidebar/module-sidebar.component';

@Component({
  selector: 'afda-fpa-layout',
  standalone: true,
  imports: [RouterOutlet, ModuleSidebarComponent],
  template: `
    <afda-module-sidebar [sections]="sidebar" />
    <main class="afda-main">
      <router-outlet />
    </main>
  `
})
export class FpaLayoutComponent {
  sidebar: SidebarSection[] = [
    {
      heading: 'Analysis',
      items: [
        { route: '/fpa/budget',   label: 'Budget vs. Actual',  icon: 'bi-bar-chart-line' },
        { route: '/fpa/variance', label: 'Variance Analysis',  icon: 'bi-plus-slash-minus' },
        { route: '/fpa/flux',     label: 'Flux Commentary',    icon: 'bi-stars' },
        { route: '/fpa/forecast', label: 'Forecasting',        icon: 'bi-binoculars' },
      ]
    },
    {
      heading: 'Output',
      items: [
        { route: '/fpa/reports',  label: 'Reports',            icon: 'bi-file-earmark-bar-graph' },
      ]
    }
  ];
}
