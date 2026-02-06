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
