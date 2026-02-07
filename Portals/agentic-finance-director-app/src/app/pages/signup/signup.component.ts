import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="signup-page">
      <div class="signup-card">
        <div class="signup-header">
          <h1>AFDA</h1>
          <p>Create your account</p>
        </div>

        <form (ngSubmit)="onSignup()" class="signup-form">
          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }

          <div class="field">
            <label for="name">Full Name</label>
            <input
              id="name"
              type="text"
              [(ngModel)]="displayName"
              name="displayName"
              placeholder="Aruna Kishore Veleti"
              [disabled]="isLoading()"
            />
          </div>

          <div class="field">
            <label for="company">Company Name <span class="optional">(optional)</span></label>
            <input
              id="company"
              type="text"
              [(ngModel)]="companyName"
              name="companyName"
              placeholder="Acme Financial Corp"
              [disabled]="isLoading()"
            />
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="you@company.com"
              [disabled]="isLoading()"
            />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="At least 6 characters"
              [disabled]="isLoading()"
            />
          </div>

          <button type="submit" class="signup-btn" [disabled]="isLoading()">
            {{ isLoading() ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <div class="signup-footer">
          Already have an account?
          <a routerLink="/login">Sign in</a>
        </div>

        <div class="signup-note">
          This creates a new company account with you as admin.
          A default organization and admin role will be set up automatically.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .signup-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
    }
    .signup-card {
      width: 420px;
      padding: 40px;
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .signup-header { text-align: center; margin-bottom: 28px; }
    .signup-header h1 { font-size: 28px; color: #a5b4fc; font-weight: 700; letter-spacing: 2px; margin: 0; }
    .signup-header p { color: #64748b; font-size: 14px; margin-top: 4px; }
    .signup-form { display: flex; flex-direction: column; gap: 14px; }
    .field { display: flex; flex-direction: column; gap: 5px; }
    .field label { font-size: 13px; color: #94a3b8; font-weight: 500; }
    .field input {
      padding: 10px 14px;
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 14px;
    }
    .field input:focus { outline: none; border-color: #6366f1; }
    .field input::placeholder { color: #475569; }
    .optional { font-weight: 400; color: #475569; font-size: 11px; }
    .signup-btn {
      padding: 12px;
      background: #6366f1;
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 6px;
    }
    .signup-btn:hover:not(:disabled) { background: #4f46e5; }
    .signup-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .error-msg {
      padding: 10px 14px;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 8px;
      color: #f87171;
      font-size: 13px;
    }
    .signup-footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 13px; }
    .signup-footer a { color: #a5b4fc; text-decoration: none; }
    .signup-note {
      text-align: center;
      margin-top: 16px;
      padding: 10px;
      background: rgba(99,102,241,0.06);
      border-radius: 8px;
      color: #64748b;
      font-size: 11px;
      line-height: 1.5;
    }
  `],
})
export class SignupComponent {
  email = '';
  password = '';
  displayName = '';
  companyName = '';
  error = signal('');
  isLoading = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  onSignup(): void {
    if (!this.email || !this.password || !this.displayName) {
      this.error.set('Please fill in all required fields');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.auth
      .signup({
        email: this.email,
        password: this.password,
        display_name: this.displayName,
        company_name: this.companyName || undefined,
      })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.status === 'ok' || (res as any).success) {
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set(
            err.error?.detail || err.error?.message || 'Signup failed'
          );
        },
      });
  }
}
