import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModuleSidebarComponent, SidebarSection } from '../../layout/module-sidebar/module-sidebar.component';

@Component({
  selector: 'afda-treasury-layout',
  standalone: true,
  imports: [RouterOutlet, ModuleSidebarComponent],
  template: `
    <afda-module-sidebar [sections]="sidebar" />
    <main class="afda-main">
      <router-outlet />
    </main>
  `
})
export class TreasuryLayoutComponent {
  sidebar: SidebarSection[] = [
    {
      heading: 'Cash Management',
      items: [
        { route: '/treasury/cash',      label: 'Cash Position',    icon: 'bi-wallet2' },
        { route: '/treasury/forecast',  label: 'Cash Forecast',    icon: 'bi-calendar-range' },
        { route: '/treasury/banks',     label: 'Bank Accounts',    icon: 'bi-bank' },
      ]
    },
    {
      heading: 'Risk & Collections',
      items: [
        { route: '/treasury/liquidity', label: 'Liquidity Risk',   icon: 'bi-droplet-half' },
        { route: '/treasury/ar-aging',  label: 'AR Aging',         icon: 'bi-clock-history' },
      ]
    }
  ];
}
