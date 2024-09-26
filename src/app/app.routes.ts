import { Routes } from '@angular/router';
import { redirectLoggedInToGuard } from './auth/utils/guards/redirect-logged-in-to.guard';
import { redirectUnauthorizedToGuard } from './auth/utils/guards/redirect-unauthorized-to.guard';
import { redirectUnverifiedToGuard } from './auth/utils/guards/online-only/redirect-unverified-to.guard';

export const redirectUnauthorizedToGettingStartedChoosePath =
  redirectUnauthorizedToGuard('/getting-started/choose-path');
export const redirectUnauthorizedToOnline =
  redirectUnauthorizedToGuard('/online');
export const redirectUnverifiedToVerifyEmail =
  redirectUnverifiedToGuard('/verify-email');
export const redirectLoggedInToApp = redirectLoggedInToGuard('/app');

export const appRoutes: Routes = [
  {
    path: 'app',
    loadChildren: () =>
      import('./app-view/feature/app-view-shell/app-view.routes').then(
        (r) => r.appViewRoutes
      ),
  },
  {
    path: 'getting-started',
    loadChildren: () =>
      import('./getting-started/feature/getting-started.routes').then(
        (r) => r.gettingStartedRoutes
      ),
  },
  {
    title: 'Create a local account',
    path: 'guest',
    canActivate: [redirectLoggedInToApp],
    children: [
      {
        /*
        force=login to force login form before register
        forward=path (e.g. path = _app_notes) to redirect user to specific path after confirmed login
        */
        path: ':siteAction',
        loadComponent: () =>
          import('./auth/feature/guest/guest.component').then(
            (m) => m.GuestComponent
          ),
      },
      {
        path: '',
        loadComponent: () =>
          import('./auth/feature/guest/guest.component').then(
            (m) => m.GuestComponent
          ),
      },
    ],
  },
  {
    title: 'Create an online account',
    path: 'online',
    canActivate: [redirectLoggedInToApp],
    children: [
      {
        /*
        force=login to force login form before register
        forward=path (e.g. path = _app_notes) to redirect user to specific path after confirmed login
        */
        path: ':siteAction',
        loadComponent: () =>
          import('./auth/feature/online/online.component').then(
            (m) => m.OnlineComponent
          ),
      },
      {
        path: '',
        loadComponent: () =>
          import('./auth/feature/online/online.component').then(
            (m) => m.OnlineComponent
          ),
      },
    ],
  },
  {
    title: 'Verify your email',
    path: 'verify-email',
    canActivate: [redirectUnauthorizedToOnline],
    loadComponent: () =>
      import('./auth/feature/verify/verify.component').then(
        (m) => m.VerifyComponent
      ),
  },
  {
    title: 'Forgot password',
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/feature/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'home',
    redirectTo: 'getting-started',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'getting-started',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'getting-started',
    pathMatch: 'full',
  },
];
