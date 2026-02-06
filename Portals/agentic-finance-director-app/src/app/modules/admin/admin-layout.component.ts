import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModuleSidebarComponent, SidebarSection } from '../../layout/module-sidebar/module-sidebar.component';

@Component({
  selector: 'afda-admin-layout',
  standalone: true,
  imports: [RouterOutlet, ModuleSidebarComponent],
  template: `
    <afda-module-sidebar [sections]="sidebar" />
    <main class="afda-main">
      <router-outlet />
    </main>
  `
})
export class AdminLayoutComponent {
  sidebar: SidebarSection[] = [
    {
      heading: 'Configuration',
      items: [
        { route: '/admin/settings',    label: 'Platform Settings',  icon: 'bi-gear' },
        { route: '/admin/connections',  label: 'Data Connections',   icon: 'bi-plug' },
      ]
    },
    {
      heading: 'Access Control',
      items: [
        { route: '/admin/users', label: 'Users & Roles',   icon: 'bi-people' },
        { route: '/admin/keys',  label: 'API Keys',        icon: 'bi-key' },
      ]
    },
    {
      heading: 'Compliance',
      items: [
        { route: '/admin/audit', label: 'Audit Log',       icon: 'bi-shield-lock' },
      ]
    }
  ];
}
