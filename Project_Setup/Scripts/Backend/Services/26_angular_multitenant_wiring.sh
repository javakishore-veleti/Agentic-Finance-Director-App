#!/bin/bash
###############################################################################
# 26_angular_multitenant_wiring.sh
# Wires: Angular frontend to the multi-tenant platform service
#   1. Updated auth models (organizations, customer_id)
#   2. OrgContext service (selected org, localStorage persist)
#   3. Updated AuthService (platform service URL, org-aware profile)
#   4. Updated interceptor (adds X-Organization-Id header)
#   5. Org-switcher component (navbar dropdown)
#   6. Updated login/signup (company_name field, new response format)
#   7. Environment config (platformApiUrl)
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

SRC="Portals/agentic-finance-director-app/src/app"
ENV="Portals/agentic-finance-director-app/src/environments"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  [26] Angular Multi-Tenant Wiring                            ║"
echo "║  Org context, updated auth, org switcher, interceptor         ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# ═══════════════════════════════════════════════════════════════
# PART 1: ENVIRONMENT — Add platformApiUrl
# ═══════════════════════════════════════════════════════════════
mkdir -p "$ENV"

cat > "$ENV/environment.ts" << 'EOF'
export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  platformApiUrl: '/api/v1/platform',
  agentApiUrl: '/api/v1/agent',
};
EOF

cat > "$ENV/environment.prod.ts" << 'EOF'
export const environment = {
  production: true,
  apiBaseUrl: '/api/v1',
  platformApiUrl: '/api/v1/platform',
  agentApiUrl: '/api/v1/agent',
};
EOF

echo "  ✅ environments — added platformApiUrl"

# ═══════════════════════════════════════════════════════════════
# PART 2: AUTH MODELS — Multi-tenant aware
# ═══════════════════════════════════════════════════════════════
mkdir -p "$SRC/core/models"

cat > "$SRC/core/models/auth.model.ts" << 'EOF'
// ── Auth Request/Response ──

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  display_name: string;
  company_name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RefreshRequest {
  refresh_token: string;
}

// ── Organization ──

export interface UserOrganization {
  id: string;
  name: string;
  code: string;
  role: string;
  is_default: boolean;
}

// ── User Profile (from /auth/me) ──

export interface UserProfile {
  id: string;
  customer_id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  status: string;
  is_customer_admin: boolean;
  last_login_at: string | null;
  created_at: string | null;
  organizations: UserOrganization[];
}

// ── JWT Payload (decoded from token) ──

export interface JwtPayload {
  sub: string;
  customer_id: string;
  email: string;
  display_name: string;
  is_customer_admin: boolean;
  organizations: UserOrganization[];
  exp: number;
  iat: number;
  type: string;
}

// ── API Response Wrapper ──

export interface ApiResponse<T = any> {
  status: string;
  data: T;
  message?: string;
  meta?: Record<string, any>;
}
EOF

echo "  ✅ auth.model.ts — updated with UserOrganization, JwtPayload, customer_id"

# ═══════════════════════════════════════════════════════════════
# PART 3: ORG CONTEXT SERVICE — Selected org state management
# ═══════════════════════════════════════════════════════════════
mkdir -p "$SRC/core/services"

cat > "$SRC/core/services/org-context.service.ts" << 'EOF'
import { Injectable, signal, computed, effect } from '@angular/core';
import { UserOrganization } from '../models/auth.model';

const ORG_STORAGE_KEY = 'afda_selected_org';

/**
 * OrgContextService manages the currently selected organization.
 *
 * - Persists selection in localStorage
 * - Provides the organization_id for X-Organization-Id header
 * - Exposes reactive signals for org name, code, role
 * - Emits when org changes so modules can refresh data
 */
@Injectable({ providedIn: 'root' })
export class OrgContextService {
  /** All organizations the user belongs to */
  readonly organizations = signal<UserOrganization[]>([]);

  /** Currently selected organization */
  readonly selectedOrg = signal<UserOrganization | null>(null);

  /** Derived signals */
  readonly organizationId = computed(() => this.selectedOrg()?.id ?? '');
  readonly organizationName = computed(() => this.selectedOrg()?.name ?? '');
  readonly organizationCode = computed(() => this.selectedOrg()?.code ?? '');
  readonly roleInOrg = computed(() => this.selectedOrg()?.role ?? 'viewer');
  readonly hasMultipleOrgs = computed(() => this.organizations().length > 1);

  constructor() {
    // Persist selection to localStorage on change
    effect(() => {
      const org = this.selectedOrg();
      if (org) {
        localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(org));
      }
    });
  }

  /**
   * Initialize with user's organizations (called after login/profile load).
   * Restores previous selection or falls back to default org.
   */
  initialize(orgs: UserOrganization[]): void {
    this.organizations.set(orgs);

    if (orgs.length === 0) {
      this.selectedOrg.set(null);
      return;
    }

    // Try to restore previous selection
    const stored = this._loadStored();
    if (stored) {
      const match = orgs.find((o) => o.id === stored.id);
      if (match) {
        this.selectedOrg.set(match);
        return;
      }
    }

    // Fall back to default org
    const defaultOrg = orgs.find((o) => o.is_default) ?? orgs[0];
    this.selectedOrg.set(defaultOrg);
  }

  /**
   * Switch to a different organization.
   * Returns true if switch was successful.
   */
  switchOrg(orgId: string): boolean {
    const org = this.organizations().find((o) => o.id === orgId);
    if (!org) return false;
    this.selectedOrg.set(org);
    return true;
  }

  /**
   * Clear state (called on logout).
   */
  clear(): void {
    this.organizations.set([]);
    this.selectedOrg.set(null);
    localStorage.removeItem(ORG_STORAGE_KEY);
  }

  /**
   * Check if user has a specific permission in the current org.
   */
  hasRole(...roles: string[]): boolean {
    return roles.includes(this.roleInOrg());
  }

  private _loadStored(): UserOrganization | null {
    try {
      const stored = localStorage.getItem(ORG_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
EOF

echo "  ✅ org-context.service.ts — selected org state, persist, switch, role check"

# ═══════════════════════════════════════════════════════════════
# PART 4: AUTH SERVICE — Platform service URL, org-aware
# ═══════════════════════════════════════════════════════════════
cat > "$SRC/core/services/auth.service.ts" << 'EOF'
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  SignupRequest,
  TokenResponse,
  UserProfile,
  JwtPayload,
  ApiResponse,
} from '../models/auth.model';
import { OrgContextService } from './org-context.service';

const ACCESS_TOKEN_KEY = 'afda_access_token';
const REFRESH_TOKEN_KEY = 'afda_refresh_token';
const USER_KEY = 'afda_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly AUTH_URL = `${environment.platformApiUrl}/identity/auth`;

  private orgContext = inject(OrgContextService);

  // Reactive state
  readonly user = signal<UserProfile | null>(this._loadUser());
  readonly isAuthenticated = computed(() => !!this.user() && !!this.getAccessToken());
  readonly isCustomerAdmin = computed(() => this.user()?.is_customer_admin ?? false);

  // For components that need Observable
  private userSubject = new BehaviorSubject<UserProfile | null>(this._loadUser());
  readonly user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Initialize org context from stored user
    const storedUser = this._loadUser();
    if (storedUser?.organizations) {
      this.orgContext.initialize(storedUser.organizations);
    }
  }

  // ── Login ──
  login(data: LoginRequest): Observable<ApiResponse<TokenResponse>> {
    return this.http
      .post<ApiResponse<TokenResponse>>(`${this.AUTH_URL}/login`, data)
      .pipe(
        tap((res) => {
          if (res.status === 'ok' || (res as any).success) {
            this._storeTokens(res.data);
            // Decode JWT to get org list immediately
            this._initFromToken(res.data.access_token);
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
          if (res.status === 'ok' || (res as any).success) {
            this._storeTokens(res.data);
            this._initFromToken(res.data.access_token);
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
          if (res?.data) {
            this._storeTokens(res.data);
            this._initFromToken(res.data.access_token);
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
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
    this.userSubject.next(null);
    this.orgContext.clear();
    this.router.navigate(['/login']);
  }

  // ── Token Access ──
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
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

  /**
   * Decode JWT and extract org list for immediate use after login.
   */
  decodeToken(): JwtPayload | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    } catch {
      return null;
    }
  }

  // ── Role Checks ──
  hasRole(...roles: string[]): boolean {
    return this.orgContext.hasRole(...roles);
  }

  // ── Private Helpers ──
  private _storeTokens(tokens: TokenResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  }

  /**
   * Initialize user + org context from decoded JWT (no API call needed).
   */
  private _initFromToken(accessToken: string): void {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1])) as JwtPayload;
      if (payload.organizations) {
        this.orgContext.initialize(payload.organizations);
      }
    } catch {
      // JWT decode failed — profile fetch will handle it
    }
  }

  private _fetchAndStoreProfile(): void {
    this.getProfile().subscribe({
      next: (res) => {
        const profile = res.data;
        if (profile) {
          localStorage.setItem(USER_KEY, JSON.stringify(profile));
          this.user.set(profile);
          this.userSubject.next(profile);
          // Refresh org context with full profile data
          if (profile.organizations) {
            this.orgContext.initialize(profile.organizations);
          }
        }
      },
      error: () => {
        // Token might not be attached yet — retry once
        setTimeout(() => {
          this.getProfile().subscribe({
            next: (res) => {
              const profile = res.data;
              if (profile) {
                localStorage.setItem(USER_KEY, JSON.stringify(profile));
                this.user.set(profile);
                this.userSubject.next(profile);
                if (profile.organizations) {
                  this.orgContext.initialize(profile.organizations);
                }
              }
            },
          });
        }, 500);
      },
    });
  }

  private _loadUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
EOF

echo "  ✅ auth.service.ts — platform URL, org-aware login/signup, JWT decode"

# ═══════════════════════════════════════════════════════════════
# PART 5: AUTH INTERCEPTOR — Add X-Organization-Id header
# ═══════════════════════════════════════════════════════════════
mkdir -p "$SRC/core/interceptors"

cat > "$SRC/core/interceptors/auth.interceptor.ts" << 'EOF'
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { OrgContextService } from '../services/org-context.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const orgContext = inject(OrgContextService);

  // Skip auth endpoints (login/signup don't need Bearer)
  if (req.url.includes('/auth/login') || req.url.includes('/auth/signup')) {
    return next(req);
  }

  const token = auth.getAccessToken();
  const orgId = orgContext.organizationId();

  // Build headers
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (orgId) {
    headers['X-Organization-Id'] = orgId;
  }

  const authReq = req.clone({ setHeaders: headers });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 and we have a refresh token, try refreshing
      if (
        error.status === 401 &&
        auth.getRefreshToken() &&
        !req.url.includes('/auth/refresh')
      ) {
        return auth.refreshToken().pipe(
          switchMap((res) => {
            if (res?.data) {
              // Retry original request with new token
              const retryHeaders: Record<string, string> = {
                Authorization: `Bearer ${auth.getAccessToken()}`,
              };
              if (orgId) {
                retryHeaders['X-Organization-Id'] = orgId;
              }
              const retryReq = req.clone({ setHeaders: retryHeaders });
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

      return throwError(() => error);
    })
  );
};
EOF

echo "  ✅ auth.interceptor.ts — Bearer + X-Organization-Id on every request"

# ═══════════════════════════════════════════════════════════════
# PART 6: ORG SWITCHER COMPONENT — Navbar dropdown
# ═══════════════════════════════════════════════════════════════
mkdir -p "$SRC/shared/components/org-switcher"

cat > "$SRC/shared/components/org-switcher/org-switcher.component.ts" << 'EOF'
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrgContextService } from '../../../core/services/org-context.service';
import { UserOrganization } from '../../../core/models/auth.model';

@Component({
  selector: 'app-org-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (orgContext.hasMultipleOrgs()) {
      <div class="org-switcher">
        <button
          class="org-switcher-btn"
          (click)="toggleDropdown()"
          [class.open]="isOpen"
        >
          <span class="org-code">{{ orgContext.organizationCode() }}</span>
          <span class="org-name">{{ orgContext.organizationName() }}</span>
          <svg class="chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 5L6 8L9 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>

        @if (isOpen) {
          <div class="org-dropdown" (click)="$event.stopPropagation()">
            <div class="org-dropdown-header">Switch Organization</div>
            @for (org of orgContext.organizations(); track org.id) {
              <button
                class="org-option"
                [class.active]="org.id === orgContext.organizationId()"
                (click)="selectOrg(org)"
              >
                <span class="option-code">{{ org.code }}</span>
                <span class="option-name">{{ org.name }}</span>
                <span class="option-role">{{ org.role }}</span>
                @if (org.is_default) {
                  <span class="default-badge">default</span>
                }
              </button>
            }
          </div>
          <div class="org-backdrop" (click)="isOpen = false"></div>
        }
      </div>
    } @else if (orgContext.selectedOrg()) {
      <div class="org-single">
        <span class="org-code">{{ orgContext.organizationCode() }}</span>
        <span class="org-name">{{ orgContext.organizationName() }}</span>
      </div>
    }
  `,
  styles: [`
    .org-switcher { position: relative; }

    .org-switcher-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      background: rgba(255,255,255,0.06);
      color: #e2e8f0;
      cursor: pointer;
      transition: all 0.15s;
      font-size: 13px;
    }
    .org-switcher-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.25); }
    .org-switcher-btn.open { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.3); }

    .org-code {
      background: rgba(99,102,241,0.3);
      color: #a5b4fc;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .org-name { font-weight: 500; }
    .chevron { transition: transform 0.2s; }
    .open .chevron { transform: rotate(180deg); }

    .org-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      min-width: 280px;
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.3);
      z-index: 1001;
      overflow: hidden;
    }
    .org-dropdown-header {
      padding: 10px 14px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .org-option {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 14px;
      border: none;
      background: transparent;
      color: #cbd5e1;
      cursor: pointer;
      text-align: left;
      font-size: 13px;
      transition: background 0.1s;
    }
    .org-option:hover { background: rgba(255,255,255,0.05); }
    .org-option.active { background: rgba(99,102,241,0.15); color: #a5b4fc; }
    .option-code {
      background: rgba(99,102,241,0.2);
      color: #a5b4fc;
      padding: 2px 5px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: 600;
    }
    .option-name { flex: 1; }
    .option-role { font-size: 11px; color: #64748b; }
    .default-badge {
      font-size: 9px;
      background: rgba(34,197,94,0.15);
      color: #4ade80;
      padding: 1px 5px;
      border-radius: 3px;
    }

    .org-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
    }

    .org-single {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      color: #94a3b8;
      font-size: 13px;
    }
  `],
})
export class OrgSwitcherComponent {
  orgContext = inject(OrgContextService);
  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectOrg(org: UserOrganization): void {
    this.orgContext.switchOrg(org.id);
    this.isOpen = false;
    // Reload current page to refresh data with new org context
    window.location.reload();
  }
}
EOF

echo "  ✅ org-switcher.component.ts — dark-themed dropdown, role badges, reload on switch"

# ═══════════════════════════════════════════════════════════════
# PART 7: UPDATED LOGIN COMPONENT
# ═══════════════════════════════════════════════════════════════
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
EOF

echo "  ✅ login.component.ts — updated for platform service response format"

# ═══════════════════════════════════════════════════════════════
# PART 8: SIGNUP COMPONENT — With company_name field
# ═══════════════════════════════════════════════════════════════
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
EOF

echo "  ✅ signup.component.ts — company_name field, new signup flow"

# ═══════════════════════════════════════════════════════════════
# PART 9: NAVBAR PATCH — Add org switcher + user info
# ═══════════════════════════════════════════════════════════════
mkdir -p "$SRC/shared/components/navbar"

cat > "$SRC/shared/components/navbar/navbar.component.ts" << 'EOF'
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
EOF

echo "  ✅ navbar.component.ts — org switcher, role badge, user name"

# ═══════════════════════════════════════════════════════════════
# PART 10: PLATFORM API SERVICE — For admin screens
# ═══════════════════════════════════════════════════════════════
cat > "$SRC/core/services/platform-api.service.ts" << 'EOF'
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';

/**
 * Service for calling Platform Service APIs (:8002).
 * Used by admin screens: users, roles, orgs, settings, etc.
 * Auth + X-Organization-Id headers are added automatically by interceptor.
 */
@Injectable({ providedIn: 'root' })
export class PlatformApiService {
  private http = inject(HttpClient);
  private readonly BASE = environment.platformApiUrl;

  // ── Identity ──
  listUsers(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/identity/users`);
  }
  createUser(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.BASE}/identity/users`, data);
  }
  updateUser(id: string, data: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.BASE}/identity/users/${id}`, data);
  }
  deleteUser(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.BASE}/identity/users/${id}`);
  }

  listRoles(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/identity/roles`);
  }
  createRole(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.BASE}/identity/roles`, data);
  }

  listUserOrgs(userId: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/identity/user-orgs/${userId}`);
  }
  assignUserOrg(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.BASE}/identity/user-orgs`, data);
  }

  // ── Tenancy ──
  getCustomer(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/tenancy/customer`);
  }
  updateCustomer(data: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.BASE}/tenancy/customer`, data);
  }

  listOrganizations(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/tenancy/organizations`);
  }
  createOrganization(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.BASE}/tenancy/organizations`, data);
  }
  updateOrganization(id: string, data: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.BASE}/tenancy/organizations/${id}`, data);
  }

  listCurrencies(orgId: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/tenancy/organizations/${orgId}/currencies`);
  }

  // ── Access ──
  listPolicies(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/access/policies`);
  }
  createPolicy(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.BASE}/access/policies`, data);
  }

  // ── Config ──
  listApiKeys(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/config/api-keys`);
  }
  createApiKey(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.BASE}/config/api-keys`, data);
  }
  revokeApiKey(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.BASE}/config/api-keys/${id}`);
  }

  listSettings(orgId?: string): Observable<ApiResponse> {
    const params = orgId ? `?org_id=${orgId}` : '';
    return this.http.get<ApiResponse>(`${this.BASE}/config/settings${params}`);
  }
  upsertSetting(data: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.BASE}/config/settings`, data);
  }

  listAuditLog(limit = 100): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/config/audit-log?limit=${limit}`);
  }

  listDataConnections(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.BASE}/config/data-connections`);
  }
  createDataConnection(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.BASE}/config/data-connections`, data);
  }
}
EOF

echo "  ✅ platform-api.service.ts — typed client for all platform service endpoints"

# ═══════════════════════════════════════════════════════════════
# PART 11: AUTH GUARD UPDATE
# ═══════════════════════════════════════════════════════════════
mkdir -p "$SRC/core/guards"

cat > "$SRC/core/guards/auth.guard.ts" << 'EOF'
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated() && !auth.isTokenExpired()) {
    return true;
  }

  // Try refresh if token expired but refresh token exists
  if (auth.getRefreshToken() && auth.isTokenExpired()) {
    auth.refreshToken().subscribe({
      next: (res) => {
        if (res?.data) {
          router.navigate([state.url]);
        } else {
          router.navigate(['/login']);
        }
      },
      error: () => router.navigate(['/login']),
    });
    return false;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (!auth.isCustomerAdmin()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
EOF

echo "  ✅ auth.guard.ts — auth + admin guards"

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Script 26 Complete — Angular Multi-Tenant Wiring          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "  Files created/updated:"
echo ""
echo "  Core Services:"
echo "    ✓ core/services/auth.service.ts         — platform URL, JWT decode, org init"
echo "    ✓ core/services/org-context.service.ts   — selected org state, persist, switch"
echo "    ✓ core/services/platform-api.service.ts  — typed HTTP client for all platform APIs"
echo ""
echo "  Models:"
echo "    ✓ core/models/auth.model.ts    — UserOrganization, JwtPayload, updated UserProfile"
echo ""
echo "  Interceptor:"
echo "    ✓ core/interceptors/auth.interceptor.ts  — Bearer + X-Organization-Id headers"
echo ""
echo "  Components:"
echo "    ✓ shared/components/org-switcher/    — dark dropdown, role badges"
echo "    ✓ shared/components/navbar/           — org switcher + role + user name"
echo "    ✓ pages/login/login.component.ts      — updated response handling"
echo "    ✓ pages/signup/signup.component.ts     — company_name field"
echo ""
echo "  Guards:"
echo "    ✓ core/guards/auth.guard.ts     — auth + admin guards"
echo ""
echo "  Environment:"
echo "    ✓ environments/environment.ts    — platformApiUrl: '/api/v1/platform'"
echo ""
echo "  Architecture:"
echo "    Login  → POST /api/v1/platform/identity/auth/login    → JWT with organizations[]"
echo "    Signup → POST /api/v1/platform/identity/auth/signup   → creates customer+org+user"
echo "    Every API call gets:"
echo "      Authorization: Bearer <jwt>"
echo "      X-Organization-Id: <selected-org-uuid>"
echo ""
echo "    Org switcher in navbar → switchOrg() → reload → all data refreshed"
echo ""
echo "  ════════════════════════════════════════════════════════"
echo "  MULTI-TENANT MIGRATION COMPLETE (Scripts 22-26)"
echo "  ════════════════════════════════════════════════════════"
echo ""
echo "  Request flow:"
echo "    Angular :4200 → proxy → Platform :8002 (auth/identity/tenancy)"
echo "                  → proxy → CRUD API :8000  (domain data, org-filtered)"
echo "                  → proxy → Agent GW :8001  (agents)"
echo ""
echo "  Data isolation:"
echo "    • JWT contains customer_id + organizations[]"
echo "    • Every request includes X-Organization-Id header"
echo "    • CRUD API validates org access via JWT (no DB call)"
echo "    • All queries: WHERE organization_id = <from-header>"
echo "    • Signup creates isolated customer → org → user → role chain"
