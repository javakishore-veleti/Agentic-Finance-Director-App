import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'afda-login',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="auth-wrapper">
      <!-- Brand Panel -->
      <div class="auth-brand-panel">
        <div class="glow-circle blue"></div>
        <div class="glow-circle gold"></div>
        <div class="auth-brand-content">
          <div class="auth-logo">
            <div class="auth-logo-icon"><i class="bi bi-activity"></i></div>
            <div>
              <div class="auth-logo-text">Finance Director</div>
              <div class="auth-logo-sub">Agentic AI Platform</div>
            </div>
          </div>
          <h1 class="auth-headline">
            Autonomous Finance.<br>
            <span class="accent">Intelligent Decisions.</span>
          </h1>
          <p class="auth-tagline">
            AI-powered decision engine connecting FP&A, Treasury, and Accounting
            into one unified command center.
          </p>
          <div class="auth-stats">
            <div>
              <div class="auth-stat-value">3</div>
              <div class="auth-stat-label">AI Engines</div>
            </div>
            <div>
              <div class="auth-stat-value">37</div>
              <div class="auth-stat-label">Analytics Views</div>
            </div>
            <div>
              <div class="auth-stat-value">Real-time</div>
              <div class="auth-stat-label">Cash Intelligence</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Panel -->
      <div class="auth-form-panel">
        <div class="dot-pattern"></div>
        <div class="auth-form-container">
          <h2 class="auth-form-title">Welcome back</h2>
          <p class="auth-form-subtitle">Sign in to access your finance command center</p>

          <div class="auth-field" style="margin-bottom: 16px;">
            <label>Email</label>
            <input type="email" placeholder="admin&#64;company.com" (keyup.enter)="onLogin()" />
          </div>

          <div class="auth-field" style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <label style="margin-bottom: 0;">Password</label>
              <a routerLink="/login" style="font-size: 12px; color: var(--afda-primary); font-weight: 500;">
                Forgot password?
              </a>
            </div>
            <input type="password" placeholder="••••••••" (keyup.enter)="onLogin()" />
          </div>

          <button class="auth-btn-primary" [disabled]="loading()" (click)="onLogin()">
            @if (loading()) {
              <span class="spinner"></span> Signing in...
            } @else {
              Sign in
            }
          </button>

          <div class="auth-divider"><span>OR</span></div>

          <button class="auth-btn-social">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p class="auth-footer">
            Don't have an account?
            <a routerLink="/signup">Create account</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loading = signal(false);

  constructor(private router: Router) {}

  onLogin() {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.router.navigate(['/command']);
    }, 1000);
  }
}
