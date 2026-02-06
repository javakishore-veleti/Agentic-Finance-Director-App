import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        notify.error('Cannot reach server. Is the backend running?');
      } else if (error.status === 401) {
        notify.warning('Session expired. Please log in again.');
      } else if (error.status === 403) {
        notify.warning('You do not have permission for this action.');
      } else if (error.status >= 500) {
        notify.error('Server error. Please try again later.');
      } else if (error.error?.message) {
        notify.error(error.error.message);
      }
      return throwError(() => error);
    })
  );
};
