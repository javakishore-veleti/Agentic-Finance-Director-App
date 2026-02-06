import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Stub — will add JWT/token injection when auth is implemented
  // const token = inject(AuthService).getToken();
  // if (token) { req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }); }
  return next(req);
};
