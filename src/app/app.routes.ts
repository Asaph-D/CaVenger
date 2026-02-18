import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'builder',
    loadComponent: () => import('./components/cv-builder/cv-builder.component').then(m => m.CVBuilderComponent),
    canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)]
  },
  {
    path: 'payment',
    loadComponent: () => import('./components/payment/payment.component').then(m => m.PaymentComponent),
    canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [() => import('./guards/auth.guard').then(m => m.guestGuard)]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [() => import('./guards/auth.guard').then(m => m.guestGuard)]
  },
  {
    path: 'settings',
    loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)]
  },
  {
    path: '**',
    redirectTo: ''
  }
];