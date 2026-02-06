#!/bin/bash
###############################################################################
# 19_auth_piece2_angular.sh
# Creates: Angular auth service, token interceptor, auth guard, login/signup
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

SRC="Portals/agentic-finance-director-app/src/app"

echo "🔧 [19] Auth Piece 2 — Angular auth service, guard, interceptor..."

# =============================================================================
# 1. Auth models
# =============================================================================
mkdir -p "$SRC/core/models"

cat > "$SRC/core/models/auth.model.ts" << 'EOF'
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
  department?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department: string | null;
  status: string;
  last_login_at: string | null;
  created_at: string;
}
EOF

echo "  ✅ auth.model.ts — LoginRequest, SignupRequest, TokenResponse, UserProfile"

# =============================================================================
# 2. Auth service
# =============================================================================
mkdir -p "$SRC/core/services"

cat > "$SRC/core/services/auth.service.ts" << 'EOF'
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  SignupRequest,
  TokenResponse,
  UserProfile,
} from '../models/auth.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly AUTH_URL = `${environment.apiBaseUrl}/auth`;
  private readonly ACCESS_TOKEN_KEY = 'afda_access_token';
  private readonly REFRESH_TOKEN_KEY = 'afda_refresh_token';
  private readonly USER_KEY = 'afda_user';

  // Reactive state
  readonly user = signal<UserProfile | null>(this._loadUser());
  readonly isAuthenticated = computed(() => !!this.user() && !!this.getAccessToken());
  readonly userRole = computed(() => this.user()?.role ?? 'guest');

  // For components that need Observable
  private userSubject = new BehaviorSubject<UserProfile | null>(this._loadUser());
  readonly user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ── Login ──
  login(data: LoginRequest): Observable<ApiResponse<TokenResponse>> {
    return this.http
      .post<ApiResponse<TokenResponse>>(`${this.AUTH_URL}/login`, data)
      .pipe(
        tap((res) => {
          if (res.success) {
            this._storeTokens(res.data);
            this._fetchAndStoreProfile();
          }
        })
      );
  }

  // ── Signup ──
  signup(data: SignupRequest): Observable<ApiResponse<TokenResponse>> {
    return this.http
      .post<ApiResponse<TokenResponse>>(`${this.AUTH_URL}/signup`, data)
      .pipe(
        tap((res) => {
          if (res.success) {
            this._storeTokens(res.data);
            this._fetchAndStoreProfile();
          }
        })
      );
  }

  // ── Refresh Token ──
  refreshToken(): Observable<ApiResponse<TokenResponse> | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return of(null);
    }

    return this.http
      .post<ApiResponse<TokenResponse>>(`${this.AUTH_URL}/refresh`, {
        refresh_token: refreshToken,
      })
      .pipe(
        tap((res) => {
          if (res?.success) {
            this._storeTokens(res.data);
          }
        }),
        catchError(() => {
          this.logout();
          return of(null);
        })
      );
  }

  // ── Get Profile ──
  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.AUTH_URL}/me`);
  }

  // ── Logout ──
  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.user.set(null);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ── Token Access ──
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  // ── Role Checks ──
  hasRole(...roles: string[]): boolean {
    return roles.includes(this.userRole());
  }

  // ── Private Helpers ──
  private _storeTokens(tokens: TokenResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
  }

  private _fetchAndStoreProfile(): void {
    this.getProfile().subscribe({
      next: (res) => {
        if (res.success) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
          this.user.set(res.data);
          this.userSubject.next(res.data);
        }
      },
      error: () => {
        // Token might not be attached yet on first call — retry once
        setTimeout(() => {
          this.getProfile().subscribe({
            next: (res) => {
              if (res.success) {
                localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
                this.user.set(res.data);
                this.userSubject.next(res.data);
              }
            },
          });
        }, 500);
      },
    });
  }

  private _loadUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem('afda_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
EOF

echo "  ✅ auth.service.ts — login, signup, refresh, logout, token mgmt, role checks"

# =============================================================================
# 3. Auth interceptor (attaches Bearer token to all /api requests)
# =============================================================================
cat > "$SRC/core/interceptors/auth.interceptor.ts" << 'EOF'
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Skip auth endpoints (login/signup don't need Bearer)
  if (req.url.includes('/auth/login') || req.url.includes('/auth/signup')) {
    return next(req);
  }

  const token = auth.getAccessToken();

  // Attach token if available
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 and we have a refresh token, try refreshing
      if (error.status === 401 && auth.getRefreshToken() && !req.url.includes('/auth/refresh')) {
        return auth.refreshToken().pipe(
          switchMap((res) => {
            if (res?.success) {
              // Retry original request with new token
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${auth.getAccessToken()}`,
                },
              });
              return next(retryReq);
            }
            auth.logout();
            return throwError(() => error);
          }),
          catchError(() => {
            auth.logout();
            return throwError(() => error);
          })
        );
      }

      // 403 — insufficient permissions
      if (error.status === 403) {
        console.warn('Access forbidden — insufficient permissions');
      }

      return throwError(() => error);
    })
  );
};
EOF

echo "  ✅ auth.interceptor.ts — auto-attach Bearer, 401 auto-refresh, 403 handling"

# =============================================================================
# 4. Auth guard
# =============================================================================
mkdir -p "$SRC/core/guards"

cat > "$SRC/core/guards/auth.guard.ts" << 'EOF'
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated() && !auth.isTokenExpired()) {
    return true;
  }

  // Try refresh if token is expired but refresh token exists
  if (auth.getRefreshToken() && auth.isTokenExpired()) {
    // Let the interceptor handle refresh on next API call
    // For now, redirect to login
  }

  router.navigate(['/login'], {
    queryParams: { returnUrl: router.url },
  });
  return false;
};

// Role-based guard factory
export const roleGuard = (...allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    if (auth.hasRole(...allowedRoles)) {
      return true;
    }

    // Redirect to dashboard if authenticated but wrong role
    router.navigate(['/']);
    return false;
  };
};

// Guest guard (for login/signup — redirect if already logged in)
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated() && !auth.isTokenExpired()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
EOF

echo "  ✅ auth.guard.ts — authGuard, roleGuard('admin'), guestGuard"

# =============================================================================
# 5. Login page component
# =============================================================================
mkdir -p "$SRC/pages/login"

cat > "$SRC/pages/login/login.component.ts" << 'EOF'
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
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>AFDA</h1>
          <p>Agentic Finance Director App</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="admin@afda.io"
              required
              [disabled]="isLoading()"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
              [disabled]="isLoading()"
            />
          </div>

          @if (error()) {
            <div class="error-message">{{ error() }}</div>
          }

          <button type="submit" [disabled]="isLoading()" class="btn-login">
            {{ isLoading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="login-footer">
          <p>Don't have an account? <a routerLink="/signup">Sign up</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 2.5rem;
      background: #1e293b;
      border-radius: 12px;
      border: 1px solid #334155;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    }
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .login-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #60a5fa;
      margin: 0;
      letter-spacing: 0.05em;
    }
    .login-header p {
      color: #94a3b8;
      margin: 0.5rem 0 0;
      font-size: 0.875rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #cbd5e1;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .form-group input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #f1f5f9;
      font-size: 0.9rem;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-group input:focus {
      outline: none;
      border-color: #60a5fa;
      box-shadow: 0 0 0 3px rgba(96,165,250,0.15);
    }
    .form-group input::placeholder {
      color: #475569;
    }
    .error-message {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      color: #fca5a5;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
    .btn-login {
      width: 100%;
      padding: 0.75rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-login:hover:not(:disabled) {
      background: #2563eb;
    }
    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .login-footer {
      text-align: center;
      margin-top: 1.5rem;
    }
    .login-footer p {
      color: #64748b;
      font-size: 0.85rem;
    }
    .login-footer a {
      color: #60a5fa;
      text-decoration: none;
    }
    .login-footer a:hover {
      text-decoration: underline;
    }
  `]
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
        if (res.success) {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.detail || err.error?.message || 'Login failed');
      },
    });
  }
}
EOF

echo "  ✅ login.component.ts — styled login page with error handling"

# =============================================================================
# 6. Signup page component
# =============================================================================
mkdir -p "$SRC/pages/signup"

cat > "$SRC/pages/signup/signup.component.ts" << 'EOF'
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
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>AFDA</h1>
          <p>Create your account</p>
        </div>

        <form (ngSubmit)="onSignup()" class="login-form">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input id="name" type="text" [(ngModel)]="fullName" name="name"
              placeholder="John Doe" required [disabled]="isLoading()" />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" [(ngModel)]="email" name="email"
              placeholder="john@company.com" required [disabled]="isLoading()" />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" [(ngModel)]="password" name="password"
              placeholder="Min 6 characters" required [disabled]="isLoading()" />
          </div>

          <div class="form-group">
            <label for="department">Department (optional)</label>
            <input id="department" type="text" [(ngModel)]="department" name="department"
              placeholder="Finance, Engineering, etc." [disabled]="isLoading()" />
          </div>

          @if (error()) {
            <div class="error-message">{{ error() }}</div>
          }

          <button type="submit" [disabled]="isLoading()" class="btn-login">
            {{ isLoading() ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <div class="login-footer">
          <p>Already have an account? <a routerLink="/login">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 2.5rem;
      background: #1e293b;
      border-radius: 12px;
      border: 1px solid #334155;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    }
    .login-header { text-align: center; margin-bottom: 2rem; }
    .login-header h1 { font-size: 2rem; font-weight: 700; color: #60a5fa; margin: 0; letter-spacing: 0.05em; }
    .login-header p { color: #94a3b8; margin: 0.5rem 0 0; font-size: 0.875rem; }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; color: #cbd5e1; font-size: 0.875rem; font-weight: 500; }
    .form-group input {
      width: 100%; padding: 0.75rem 1rem; background: #0f172a; border: 1px solid #334155;
      border-radius: 8px; color: #f1f5f9; font-size: 0.9rem; transition: border-color 0.2s; box-sizing: border-box;
    }
    .form-group input:focus { outline: none; border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,0.15); }
    .form-group input::placeholder { color: #475569; }
    .error-message { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; }
    .btn-login { width: 100%; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn-login:hover:not(:disabled) { background: #2563eb; }
    .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
    .login-footer { text-align: center; margin-top: 1.5rem; }
    .login-footer p { color: #64748b; font-size: 0.85rem; }
    .login-footer a { color: #60a5fa; text-decoration: none; }
    .login-footer a:hover { text-decoration: underline; }
  `]
})
export class SignupComponent {
  fullName = '';
  email = '';
  password = '';
  department = '';
  error = signal('');
  isLoading = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  onSignup(): void {
    if (!this.fullName || !this.email || !this.password) {
      this.error.set('Please fill in all required fields');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.auth.signup({
      email: this.email,
      password: this.password,
      full_name: this.fullName,
      department: this.department || undefined,
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.detail || err.error?.message || 'Signup failed');
      },
    });
  }
}
EOF

echo "  ✅ signup.component.ts — styled signup page"

# =============================================================================
# 7. Wire auth interceptor into app.config.ts
# =============================================================================
CONFIG_FILE="$SRC/app.config.ts"

if [ -f "$CONFIG_FILE" ]; then
  if ! grep -q "authInterceptor" "$CONFIG_FILE"; then
    python3 << 'PYEOF'
with open("Portals/agentic-finance-director-app/src/app/app.config.ts", "r") as f:
    content = f.read()

# Add import for authInterceptor
if "authInterceptor" not in content:
    # Add import at top
    content = content.replace(
        "import { provideHttpClient",
        "import { provideHttpClient, withInterceptors"
    ) if "withInterceptors" not in content else content

    # If provideHttpClient() has no args, add withInterceptors
    if "provideHttpClient()" in content:
        content = "import { authInterceptor } from './core/interceptors/auth.interceptor';\n" + content
        content = content.replace(
            "provideHttpClient()",
            "provideHttpClient(withInterceptors([authInterceptor]))"
        )
    elif "provideHttpClient(withInterceptors" in content:
        # Already has interceptors, add ours
        if "authInterceptor" not in content:
            content = "import { authInterceptor } from './core/interceptors/auth.interceptor';\n" + content
            content = content.replace(
                "withInterceptors([",
                "withInterceptors([authInterceptor, "
            )

with open("Portals/agentic-finance-director-app/src/app/app.config.ts", "w") as f:
    f.write(content)

print("  ✅ Auth interceptor wired into app.config.ts")
PYEOF
  else
    echo "  ⏭️  Auth interceptor already in app.config.ts"
  fi
else
  echo "  ⚠️  app.config.ts not found — you'll need to manually add authInterceptor"
fi

# =============================================================================
# 8. Add login/signup routes to app.routes.ts
# =============================================================================
ROUTES_FILE="$SRC/app.routes.ts"

if [ -f "$ROUTES_FILE" ]; then
  if ! grep -q "LoginComponent" "$ROUTES_FILE"; then
    python3 << 'PYEOF'
with open("Portals/agentic-finance-director-app/src/app/app.routes.ts", "r") as f:
    content = f.read()

if "LoginComponent" not in content:
    # Add auth routes before the first route or at the start of the routes array
    auth_routes = """
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent),
  },"""

    # Find the routes array and add auth routes at the beginning
    if "Routes = [" in content:
        content = content.replace("Routes = [", "Routes = [" + auth_routes)
    elif "routes = [" in content:
        content = content.replace("routes = [", "routes = [" + auth_routes)
    elif "routes: Routes = [" in content:
        content = content.replace("routes: Routes = [", "routes: Routes = [" + auth_routes)

    with open("Portals/agentic-finance-director-app/src/app/app.routes.ts", "w") as f:
        f.write(content)

    print("  ✅ Login + Signup routes added to app.routes.ts")
else:
    print("  ⏭️  Login routes already in app.routes.ts")
PYEOF
  else
    echo "  ⏭️  Login routes already in app.routes.ts"
  fi
else
  echo "  ⚠️  app.routes.ts not found — add login/signup routes manually"
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "✅ [19] Auth Piece 2 complete!"
echo ""
echo "  Files created:"
echo "    → core/models/auth.model.ts          — DTOs"
echo "    → core/services/auth.service.ts      — login, signup, refresh, logout"
echo "    → core/interceptors/auth.interceptor.ts — auto-attach Bearer, 401 refresh"
echo "    → core/guards/auth.guard.ts          — authGuard, roleGuard, guestGuard"
echo "    → pages/login/login.component.ts     — styled login page"
echo "    → pages/signup/signup.component.ts   — styled signup page"
echo ""
echo "  Routes added:"
echo "    /login  → LoginComponent"
echo "    /signup → SignupComponent"
echo ""
echo "  Usage in routes:"
echo "    { path: 'dashboard', canActivate: [authGuard], component: ... }"
echo "    { path: 'admin', canActivate: [roleGuard('admin', 'cfo')], component: ... }"
echo ""
echo "  Test: Open http://localhost:4200/login"
echo "    Email: admin@afda.io"
echo "    Password: admin123"
