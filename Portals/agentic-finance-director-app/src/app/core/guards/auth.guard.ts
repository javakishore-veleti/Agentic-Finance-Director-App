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
