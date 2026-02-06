import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'afda-top-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="afda-top-navbar">
      <!-- Brand -->
      <a class="afda-brand" routerLink="/command/overview">
        <div class="afda-brand-icon">
          <i class="bi bi-activity"></i>
        </div>
        <span class="afda-brand-text">Finance Director</span>
      </a>

      <!-- Module Tabs -->
      <div class="afda-nav-modules">
        @for (mod of modules; track mod.route) {
          <a class="afda-nav-module-link"
             [routerLink]="mod.route"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: false }">
            <i [class]="'bi ' + mod.icon"></i>
            {{ mod.label }}
          </a>
        }
      </div>

      <!-- Right Section -->
      <div class="afda-nav-right">
        <button class="afda-notification-btn">
          <i class="bi bi-bell"></i>
          <div class="afda-notification-dot"></div>
        </button>
        <div class="afda-nav-divider"></div>
        <div class="afda-user-block" (click)="onLogout()">
          <div class="afda-user-avatar">{{ userInitials() }}</div>
          <div>
            <div class="afda-user-name">{{ auth.user()?.full_name || 'Guest' }}</div>
            <div class="afda-user-role">{{ auth.user()?.role || 'Not signed in' }}</div>
          </div>
          <i class="bi bi-box-arrow-right" style="margin-left: 8px; color: #94a3b8;"></i>
        </div>
      </div>
    </nav>
  `
})
export class TopNavbarComponent {
  auth = inject(AuthService);

  modules = [
    { route: '/command',       label: 'Command Center', icon: 'bi-lightning-fill' },
    { route: '/fpa',           label: 'FP&A',           icon: 'bi-bar-chart-fill' },
    { route: '/treasury',      label: 'Treasury',       icon: 'bi-bank' },
    { route: '/accounting',    label: 'Accounting',     icon: 'bi-journal-text' },
    { route: '/agent-studio',  label: 'Agent Studio',   icon: 'bi-robot' },
    { route: '/risk',          label: 'Risk Intel',     icon: 'bi-shield-check' },
    { route: '/monitoring',    label: 'Monitoring',     icon: 'bi-broadcast' },
    { route: '/admin',         label: 'Admin',          icon: 'bi-gear-fill' },
  ];

  userInitials(): string {
    const name = this.auth.user()?.full_name;
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  onLogout() {
    this.auth.logout();
  }
}