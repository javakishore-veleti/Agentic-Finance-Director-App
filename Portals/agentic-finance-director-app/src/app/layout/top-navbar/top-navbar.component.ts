import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface NavModule {
  route: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'afda-top-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="afda-top-navbar">
      <!-- Brand -->
      <a class="afda-brand" routerLink="/command">
        <div class="afda-brand-icon"><i class="bi bi-activity"></i></div>
        <span class="afda-brand-text">Finance Director</span>
      </a>

      <!-- Module links -->
      <div class="afda-nav-modules">
        @for (mod of modules; track mod.route) {
          <a class="afda-nav-module-link"
             [routerLink]="mod.route"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: false }">
            <i class="bi" [class]="mod.icon"></i>
            {{ mod.label }}
          </a>
        }
      </div>

      <!-- Right side -->
      <div class="afda-nav-right">
        <button class="afda-notification-btn" title="Notifications">
          <i class="bi bi-bell"></i>
          <span class="afda-notification-dot"></span>
        </button>
        <div class="afda-nav-divider"></div>
        <div class="afda-user-block" (click)="onLogout()">
          <div class="afda-user-avatar">FD</div>
          <div>
            <div class="afda-user-name">Admin User</div>
            <div class="afda-user-role">Finance Director</div>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class TopNavbarComponent {
  constructor(private router: Router) {}

  modules: NavModule[] = [
    { route: '/command',      label: 'Command Center',  icon: 'bi-speedometer2' },
    { route: '/fpa',          label: 'FP&A',            icon: 'bi-bar-chart-line' },
    { route: '/treasury',     label: 'Treasury',        icon: 'bi-bank' },
    { route: '/accounting',   label: 'Accounting',      icon: 'bi-journal-text' },
    { route: '/agent-studio', label: 'Agent Studio',    icon: 'bi-cpu' },
    { route: '/risk',         label: 'Risk Intel',      icon: 'bi-shield-exclamation' },
    { route: '/monitoring',   label: 'Monitoring',      icon: 'bi-activity' },
    { route: '/admin',        label: 'Admin',           icon: 'bi-sliders' },
  ];

  onLogout() {
    this.router.navigate(['/login']);
  }
}
