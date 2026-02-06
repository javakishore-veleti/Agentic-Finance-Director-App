import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModuleSidebarComponent, SidebarSection } from '../../layout/module-sidebar/module-sidebar.component';

@Component({
  selector: 'afda-accounting-layout',
  standalone: true,
  imports: [RouterOutlet, ModuleSidebarComponent],
  template: `
    <afda-module-sidebar [sections]="sidebar" />
    <main class="afda-main">
      <router-outlet />
    </main>
  `
})
export class AccountingLayoutComponent {
  sidebar: SidebarSection[] = [
    {
      heading: 'General Ledger',
      items: [
        { route: '/accounting/gl',  label: 'GL Summary',        icon: 'bi-journal-text' },
        { route: '/accounting/tb',  label: 'Trial Balance',     icon: 'bi-list-columns' },
        { route: '/accounting/ic',  label: 'Intercompany',      icon: 'bi-arrow-left-right' },
      ]
    },
    {
      heading: 'Close Process',
      items: [
        { route: '/accounting/recon', label: 'Reconciliation',  icon: 'bi-check2-all' },
        { route: '/accounting/close', label: 'Close Management', icon: 'bi-card-checklist' },
      ]
    }
  ];
}
