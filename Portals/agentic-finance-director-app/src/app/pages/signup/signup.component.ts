import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'afda-signup',
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
            Start your<br>
            <span class="accent">AI finance journey.</span>
          </h1>
          <p class="auth-tagline">
            Deploy autonomous agents across your entire finance stack in minutes.
          </p>
          <div style="margin-top: 40px; display: flex; flex-direction: column; gap: 16px;">
            <div class="auth-check-item">
              <div class="auth-check-dot"><i class="bi bi-check2" style="font-size: 10px;"></i></div>
              Multi-engine agent orchestration
            </div>
            <div class="auth-check-item">
              <div class="auth-check-dot"><i class="bi bi-check2" style="font-size: 10px;"></i></div>
              Real-time cash &amp; liquidity intelligence
            </div>
            <div class="auth-check-item">
              <div class="auth-check-dot"><i class="bi bi-check2" style="font-size: 10px;"></i></div>
              AI-powered variance &amp; flux analysis
            </div>
          </div>
        </div>
      </div>

      <!-- Form Panel -->
      <div class="auth-form-panel">
        <div class="dot-pattern"></div>
        <div class="auth-form-container">
          <h2 class="auth-form-title">Create your account</h2>
          <p class="auth-form-subtitle">Get started with AI-powered finance in 2 minutes</p>

          <div style="display: flex; gap: 12px; margin-bottom: 14px;">
            <div class="auth-field" style="flex: 1;">
              <label>First name</label>
              <input type="text" placeholder="Jane" />
            </div>
            <div class="auth-field" style="flex: 1;">
              <label>Last name</label>
              <input type="text" placeholder="Smith" />
            </div>
          </div>

          <div class="auth-field" style="margin-bottom: 14px;">
            <label>Work email</label>
            <input type="email" placeholder="jane&#64;company.com" />
          </div>

          <div class="auth-field" style="margin-bottom: 14px;">
            <label>Organization</label>
            <input type="text" placeholder="Acme Corp" />
          </div>

          <div class="auth-field" style="margin-bottom: 14px;">
            <label>Password</label>
            <input type="password" placeholder="Min 8 characters" />
          </div>

          <div class="auth-field" style="margin-bottom: 16px;">
            <label>Primary AI Engine</label>
            <select>
              <option>n8n (Recommended for getting started)</option>
              <option>LangGraph (Python-native)</option>
              <option>AWS Bedrock Agents</option>
            </select>
          </div>

          <button class="auth-btn-primary" [disabled]="loading()" (click)="onSignup()">
            @if (loading()) {
              <span class="spinner"></span> Creating account...
            } @else {
              Create account
            }
          </button>

          <p class="auth-footer">
            Already have an account?
            <a routerLink="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class SignupComponent {
  loading = signal(false);

  constructor(private router: Router) {}

  onSignup() {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.router.navigate(['/command']);
    }, 1200);
  }
}
