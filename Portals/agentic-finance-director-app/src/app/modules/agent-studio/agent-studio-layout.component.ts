import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModuleSidebarComponent, SidebarSection } from '../../layout/module-sidebar/module-sidebar.component';

@Component({
  selector: 'afda-agent-studio-layout',
  standalone: true,
  imports: [RouterOutlet, ModuleSidebarComponent],
  template: `
    <afda-module-sidebar [sections]="sidebar" />
    <main class="afda-main">
      <router-outlet />
    </main>
  `
})
export class AgentStudioLayoutComponent {
  sidebar: SidebarSection[] = [
    {
      heading: 'Interact',
      items: [
        { route: '/agent-studio/console',   label: 'Agent Console',      icon: 'bi-chat-dots' },
      ]
    },
    {
      heading: 'Manage',
      items: [
        { route: '/agent-studio/workflows', label: 'Workflow Manager',   icon: 'bi-diagram-3' },
        { route: '/agent-studio/prompts',   label: 'Prompt Library',     icon: 'bi-collection' },
        { route: '/agent-studio/history',   label: 'Execution History',  icon: 'bi-clock-history' },
        { route: '/agent-studio/engine',    label: 'Engine Config',      icon: 'bi-cpu' },
      ]
    }
  ];
}
