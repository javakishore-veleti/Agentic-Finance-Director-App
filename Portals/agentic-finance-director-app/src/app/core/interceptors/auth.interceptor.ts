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
