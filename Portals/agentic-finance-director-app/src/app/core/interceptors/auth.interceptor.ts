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
