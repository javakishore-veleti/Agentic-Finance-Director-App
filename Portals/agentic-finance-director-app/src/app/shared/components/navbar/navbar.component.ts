import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OrgContextService } from '../../../core/services/org-context.service';
import { OrgSwitcherComponent } from '../org-switcher/org-switcher.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, OrgSwitcherComponent],
  template: `
    <nav class="navbar">
      <div class="nav-left">
        <a routerLink="/" class="brand">
          <span class="brand-text">AFDA</span>
        </a>

        <!-- Org Switcher -->
        <app-org-switcher />

        <!-- Module Nav -->
        <div class="nav-links">
          <a routerLink="/command-center" routerLinkActive="active">Command Center</a>
          <a routerLink="/fpa" routerLinkActive="active">FP&A</a>
          <a routerLink="/treasury" routerLinkActive="active">Treasury</a>
          <a routerLink="/accounting" routerLinkActive="active">Accounting</a>
          <a routerLink="/risk" routerLinkActive="active">Risk</a>
          <a routerLink="/monitoring" routerLinkActive="active">Monitoring</a>
          @if (auth.isCustomerAdmin()) {
            <a routerLink="/admin" routerLinkActive="active">Admin</a>
          }
        </div>
      </div>

      <div class="nav-right">
        <div class="user-info">
          <span class="user-role">{{ orgContext.roleInOrg() }}</span>
          <span class="user-name">{{ auth.user()?.display_name }}</span>
        </div>
        <button class="logout-btn" (click)="auth.logout()">Logout</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      height: 56px;
      background: #0f172a;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .nav-left { display: flex; align-items: center; gap: 16px; }
    .brand { text-decoration: none; }
    .brand-text {
      font-size: 18px;
      font-weight: 700;
      color: #a5b4fc;
      letter-spacing: 1.5px;
    }
    .nav-links { display: flex; gap: 4px; margin-left: 12px; }
    .nav-links a {
      padding: 6px 12px;
      border-radius: 6px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s;
    }
    .nav-links a:hover { color: #e2e8f0; background: rgba(255,255,255,0.05); }
    .nav-links a.active { color: #a5b4fc; background: rgba(99,102,241,0.12); }
    .nav-right { display: flex; align-items: center; gap: 14px; }
    .user-info { display: flex; align-items: center; gap: 8px; }
    .user-role {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(99,102,241,0.15);
      color: #a5b4fc;
    }
    .user-name { color: #e2e8f0; font-size: 13px; font-weight: 500; }
    .logout-btn {
      padding: 6px 14px;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 6px;
      background: transparent;
      color: #94a3b8;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .logout-btn:hover { color: #f87171; border-color: rgba(248,113,113,0.3); }
  `],
})
export class NavbarComponent {
  auth = inject(AuthService);
  orgContext = inject(OrgContextService);
}
