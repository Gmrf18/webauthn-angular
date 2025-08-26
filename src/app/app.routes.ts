import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'signin',
    loadComponent: () => import('./signin/signin'),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login'),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
