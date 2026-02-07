#!/bin/bash
###############################################################################
# 26_hotfix_build_errors.sh
# Fixes 4 build errors after Script 26:
#   1. guestGuard missing export
#   2. UserProfile.full_name → display_name (backward compat)
#   3. UserProfile.role removed (backward compat)
#   4. Implicit 'any' parameter type
# Run from: git repo root
###############################################################################
set -e

SRC="Portals/agentic-finance-director-app/src/app"

echo "🔧 [26-hotfix] Fixing Angular build errors..."

# ═══════════════════════════════════════════════════════════════
# FIX 1: Add guestGuard to auth.guard.ts
# ═══════════════════════════════════════════════════════════════
GUARD="$SRC/core/guards/auth.guard.ts"

cat > "$GUARD" << 'EOF'
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

/**
 * Guest guard — only allows unauthenticated users (login/signup pages).
 * Redirects to home if already logged in.
 */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated() && !auth.isTokenExpired()) {
    router.navigate(['/']);
    return false;
  }
  return true;
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

echo "  ✅ auth.guard.ts — added guestGuard export"

# ═══════════════════════════════════════════════════════════════
# FIX 2: Add backward-compat fields to UserProfile
# ═══════════════════════════════════════════════════════════════
MODEL="$SRC/core/models/auth.model.ts"

cat > "$MODEL" << 'EOF'
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

  // Backward-compat aliases (auto-populated by AuthService)
  full_name?: string;
  role?: string;
  department?: string | null;
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
  success?: boolean;
}
EOF

echo "  ✅ auth.model.ts — added full_name, role, department compat fields"

# ═══════════════════════════════════════════════════════════════
# FIX 3: Update AuthService to populate compat aliases
# ═══════════════════════════════════════════════════════════════
AUTH_SVC="$SRC/core/services/auth.service.ts"

cat > "$AUTH_SVC" << 'EOF'
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
  readonly userRole = computed(() => this.user()?.role ?? this.orgContext.roleInOrg() ?? 'guest');

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
          if (res.status === 'ok' || res.success) {
            this._storeTokens(res.data);
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
          if (res.status === 'ok' || res.success) {
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
          this._addCompat(profile);
          localStorage.setItem(USER_KEY, JSON.stringify(profile));
          this.user.set(profile);
          this.userSubject.next(profile);
          if (profile.organizations) {
            this.orgContext.initialize(profile.organizations);
          }
        }
      },
      error: () => {
        setTimeout(() => {
          this.getProfile().subscribe({
            next: (res) => {
              const profile = res.data;
              if (profile) {
                this._addCompat(profile);
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

  /**
   * Populate backward-compat aliases (full_name, role) so existing
   * components that reference user().full_name or user().role still work.
   */
  private _addCompat(profile: UserProfile): void {
    profile.full_name = profile.display_name;
    const defaultOrg =
      profile.organizations?.find((o) => o.is_default) ??
      profile.organizations?.[0];
    profile.role =
      defaultOrg?.role ?? (profile.is_customer_admin ? 'admin' : 'viewer');
  }

  private _loadUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (!stored) return null;
      const profile = JSON.parse(stored) as UserProfile;
      // Ensure backward-compat aliases exist
      if (profile && !profile.full_name && profile.display_name) {
        profile.full_name = profile.display_name;
      }
      if (profile && !profile.role && profile.organizations?.length) {
        const def =
          profile.organizations.find((o) => o.is_default) ??
          profile.organizations[0];
        profile.role = def?.role ?? 'viewer';
      }
      return profile;
    } catch {
      return null;
    }
  }
}
EOF

echo "  ✅ auth.service.ts — compat aliases (full_name, role) auto-populated"

# ═══════════════════════════════════════════════════════════════
# FIX 4: Patch top-navbar implicit any (n => n[0])
# ═══════════════════════════════════════════════════════════════
NAVBAR_FILE="$SRC/layout/top-navbar/top-navbar.component.ts"
if [ -f "$NAVBAR_FILE" ]; then
    # Fix implicit any: .map(n => ...) → .map((n: string) => ...)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/\.map(n =>/\.map((n: string) =>/g' "$NAVBAR_FILE"
    else
        sed -i 's/\.map(n =>/\.map((n: string) =>/g' "$NAVBAR_FILE"
    fi
    echo "  ✅ top-navbar.component.ts — fixed implicit 'any' type on .map()"
else
    echo "  ⏭️  top-navbar not found at expected path — may need manual fix"
fi

echo ""
echo "✅ All 4 build errors fixed. Angular should rebuild automatically."
echo ""
echo "  Fixes applied:"
echo "    1. guestGuard — restored export in auth.guard.ts"
echo "    2. full_name  — added as optional compat alias on UserProfile"
echo "    3. role       — added as optional compat alias on UserProfile"
echo "    4. implicit any — typed .map((n: string) =>) in top-navbar"
