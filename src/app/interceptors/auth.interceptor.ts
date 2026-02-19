import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP pour ajouter automatiquement le token JWT aux requêtes
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Récupérer le token
  const token = authService.getToken();

  // Cloner la requête et ajouter le header Authorization si un token existe
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Intercepter la réponse pour gérer les erreurs d'authentification
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si l'erreur est 401 (Unauthorized), déconnecter l'utilisateur
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      
      // Si l'erreur est 403 (Forbidden), rediriger vers la page d'accueil
      if (error.status === 403) {
        router.navigate(['/']);
      }

      return throwError(() => error);
    })
  );
};







