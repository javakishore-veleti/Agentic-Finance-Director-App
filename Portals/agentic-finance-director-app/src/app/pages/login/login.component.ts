import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <h1>AFDA</h1>
          <p>Agentic Finance Director</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form">
          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }

          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="admin@afda.io"
              autocomplete="email"
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
              placeholder="••••••••"
              autocomplete="current-password"
              [disabled]="isLoading()"
            />
          </div>

          <button type="submit" class="login-btn" [disabled]="isLoading()">
            {{ isLoading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="login-footer">
          Don't have an account?
          <a routerLink="/signup">Create one</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
    }
    .login-card {
      width: 400px;
      padding: 40px;
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .login-header { text-align: center; margin-bottom: 32px; }
    .login-header h1 { font-size: 28px; color: #a5b4fc; font-weight: 700; letter-spacing: 2px; margin: 0; }
    .login-header p { color: #64748b; font-size: 14px; margin-top: 4px; }
    .login-form { display: flex; flex-direction: column; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: 13px; color: #94a3b8; font-weight: 500; }
    .field input {
      padding: 10px 14px;
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .field input:focus { outline: none; border-color: #6366f1; }
    .field input::placeholder { color: #475569; }
    .login-btn {
      padding: 12px;
      background: #6366f1;
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 8px;
    }
    .login-btn:hover:not(:disabled) { background: #4f46e5; }
    .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .error-msg {
      padding: 10px 14px;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 8px;
      color: #f87171;
      font-size: 13px;
    }
    .login-footer { text-align: center; margin-top: 24px; color: #64748b; font-size: 13px; }
    .login-footer a { color: #a5b4fc; text-decoration: none; }
    .login-footer a:hover { text-decoration: underline; }
  `],
})
export class LoginComponent {
  email = '';
  password = '';
  error = signal('');
  isLoading = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  onLogin(): void {
    if (!this.email || !this.password) {
      this.error.set('Please enter email and password');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.status === 'ok' || (res as any).success) {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(
          err.error?.detail || err.error?.message || 'Invalid email or password'
        );
      },
    });
  }
}
