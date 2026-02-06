import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      const message = error.error?.message || error.message || 'An unexpected error occurred';
      console.error(`[AFDA HTTP Error] ${req.method} ${req.url}:`, message);
      return throwError(() => error);
    })
  );
};
