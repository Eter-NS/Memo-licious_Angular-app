import { Routes } from '@angular/router';
import { redirectLoggedInToGuard } from './auth/guards/redirect-logged-in-to.guard';
import { redirectUnauthorizedToGuard } from './auth/guards/redirect-unauthorized-to.guard';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { redirectUnverifiedToGuard } from './auth/guards/online-only/redirect-unverified-to.guard';

export const redirectUnauthorizedToGettingStartedChoosePath =
  redirectUnauthorizedToGuard('/getting-started/choose-path');
export const redirectUnauthorizedToOnline =
  redirectUnauthorizedToGuard('/online');
export const redirectUnverifiedToVerifyEmail =
  redirectUnverifiedToGuard('/verify-email');
export const redirectLoggedInToApp = redirectLoggedInToGuard('/app');

export const routes: Routes = [
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
      import('./getting-started/getting-started.routes').then(
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
        forward=path to redirect user to specific path after confirmed login
        */
        path: ':siteAction',
        loadComponent: () =>
          import('./auth/guest/guest.component').then((m) => m.GuestComponent),
      },
      {
        path: '',
        loadComponent: () =>
          import('./auth/guest/guest.component').then((m) => m.GuestComponent),
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
        forward=path to redirect user to specific path after confirmed login
        */
        path: ':siteAction',
        loadComponent: () =>
          import('./auth/online/online.component').then(
            (m) => m.OnlineComponent
          ),
      },
      {
        path: '',
        loadComponent: () =>
          import('./auth/online/online.component').then(
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
      import('./auth/verify/verify.component').then((m) => m.VerifyComponent),
  },
  {
    title: 'Forgot password',
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    title: 'Home - Memo-licious',
    path: '',
    component: LandingPageComponent,
    canActivate: [redirectLoggedInToApp],
  },

  { path: 'home', redirectTo: '', pathMatch: 'full' },

  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
