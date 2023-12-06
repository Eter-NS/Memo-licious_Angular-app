import { Routes } from '@angular/router';
import { AppViewComponent } from './app-view.component';
import { redirectUnauthorizedToGettingStarted } from '../app.routes';

export const appViewRoutes: Routes = [
  {
    title: 'App',
    path: '',
    component: AppViewComponent,
    canActivate: [redirectUnauthorizedToGettingStarted],
    children: [
      { path: 'home' /* component: */ },
      { path: ':noteGroupId' /* component: */ },
      { path: 'trash' /* component: */ },
      { path: 'settings' /* component: */ },

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'app/home',
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'app/home',
      },
    ],
  },
];
