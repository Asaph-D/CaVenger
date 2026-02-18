import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { getAuthUrl } from '../config/api.config';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  subscriptionTier?: 'free' | 'premium';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  public isAuthenticated = signal(false);
  public isLoading = signal(false);

  constructor() {
    // Vérifier si un token existe au démarrage
    this.checkAuthStatus();
  }

  /**
   * Vérifie le statut d'authentification au démarrage
   */
  private checkAuthStatus(): void {
    const token = this.getToken();
    if (token) {
      // Vérifier si le token est valide (optionnel : appeler une API de vérification)
      const user = this.getUserFromStorage();
      if (user) {
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
      } else {
        this.logout();
      }
    }
  }

  /**
   * Connexion de l'utilisateur
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>(getAuthUrl('/login'), credentials).pipe(
      tap(response => {
        if (response.success && response.token && response.user) {
          this.setToken(response.token);
          this.setUser(response.user);
          this.currentUserSubject.next(response.user);
          this.isAuthenticated.set(true);
        }
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Inscription de l'utilisateur
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>(getAuthUrl('/register'), data).pipe(
      tap(response => {
        if (response.success && response.token && response.user) {
          this.setToken(response.token);
          this.setUser(response.user);
          this.currentUserSubject.next(response.user);
          this.isAuthenticated.set(true);
        }
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Déconnexion de l'utilisateur
   */
  logout(): void {
    this.removeToken();
    this.removeUser();
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Vérifier si le token est expiré (optionnel)
    try {
      const payload = this.decodeToken(token);
      if (payload && payload.exp) {
        const expirationDate = new Date(payload.exp * 1000);
        if (expirationDate < new Date()) {
          this.logout();
          return false;
        }
      }
    } catch (error) {
      this.logout();
      return false;
    }
    
    return true;
  }

  /**
   * Récupère l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value || this.getUserFromStorage();
  }

  /**
   * Récupère le token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Décode le token JWT
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  /**
   * Stocke le token dans le localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Supprime le token du localStorage
   */
  private removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  /**
   * Stocke les informations utilisateur dans le localStorage
   */
  setUser(user: User): void {
    localStorage.setItem('auth_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Récupère les informations utilisateur du localStorage
   */
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  /**
   * Supprime les informations utilisateur du localStorage
   */
  private removeUser(): void {
    localStorage.removeItem('auth_user');
  }

  /**
   * Gère les erreurs HTTP
   */
  private handleError(error: any): string {
    if (error.error && error.error.message) {
      return error.error.message;
    }
    if (error.error && error.error.error) {
      return error.error.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'Une erreur est survenue. Veuillez réessayer.';
  }

  /**
   * Rafraîchit le token (si nécessaire)
   */
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(getAuthUrl('/refresh'), {}).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.setToken(response.token);
        }
      }),
      catchError(error => {
        this.logout();
        return throwError(() => this.handleError(error));
      })
    );
  }
}

