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
