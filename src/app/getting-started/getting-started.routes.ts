import { Routes } from '@angular/router';
import { redirectLoggedInToApp } from '../app.routes';

export const gettingStartedRoutes: Routes = [
  {
    title: 'Getting started',
    path: 'getting-started',
    canActivate: [redirectLoggedInToApp],
    children: [
      {
        /* 1. */
        title: 'Hello 👋',
        path: 'hello',
        loadComponent: () =>
          import('./first-view/first-view.component').then(
            (c) => c.FirstViewComponent
          ),
      },
      {
        /* 2. */
        title: 'Choose account type',
        path: 'choose-path',
        loadComponent: () =>
          import('./choose-path/choose-path.component').then(
            (c) => c.ChoosePathComponent
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'hello',
      },
    ],
  },
];
