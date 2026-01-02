import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment.development';
import { catchError, throwError, tap } from 'rxjs';
import { mostrarSnack } from '../../shared/utils/mostrar-snack.util';
import { AuthService } from '../services/auth.service';

// Función para revisar expiración del JWT
function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (e) {
    return true;
  }
}
export const supabaseInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const snack = inject(MatSnackBar);
  const auth = inject(AuthService);
  if (!req.url.includes('supabase.co')) {
    return next(req);
  }

  const token = localStorage.getItem('access_token');
  const apikey = environment.anonApiKey;

  // Clonamos la petición siempre con apikey
  const cloneReq = req.clone({
    setHeaders: {
      apikey: apikey,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  // Revisar token expirado solo para endpoints que no sean login, signup o reset
  const publicEndpoints = [
    '/auth/v1/token',
  ];

  if (!publicEndpoints.some(url => req.url.includes(url)) && isTokenExpired(token)) {
    auth.clearSession();
    mostrarSnack(snack, 'Sesión expirada, ingresa de nuevo', 'OK', 5000);
    router.navigate(['/login']);
    return throwError(() => new Error('Token expirado'));
  }

  return next(cloneReq).pipe(
    tap({
      error: (err: any) => {
        if (err.status === 401) {
          auth.clearSession();

          mostrarSnack(snack, 'Token inválido, ingresa de nuevo', 'OK', 5000);
          router.navigate(['/login']);
        }
      }
    }),
    catchError((err) => throwError(() => err))
  );
};

