import { Routes } from '@angular/router';
import { redirectLoggedInToGuard } from './auth-components/guards/redirect-logged-in-to.guard';
import { redirectUnauthorizedToGuard } from './auth-components/guards/redirect-unauthorized-to.guard';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const redirectUnauthorizedToGettingStarted =
  redirectUnauthorizedToGuard('/getting-started');
export const redirectUnauthorizedToOnline =
  redirectUnauthorizedToGuard('/online');
export const redirectLoggedInToApp = redirectLoggedInToGuard('/app');

export const appRoutes: Routes = [
  {
    title: 'Create a local account',
    path: 'guest',
    loadComponent: () =>
      import('./auth-components/guest/guest.component').then(
        (m) => m.GuestComponent
      ),
  },
  {
    title: 'Create an online account',
    path: 'online',
    children: [
      {
        /*
        force=login to force login form before register
        forward=path to redirect user to specific path after confirmed login
        */
        path: ':siteAction',
        loadComponent: () =>
          import('./auth-components/online/online.component').then(
            (m) => m.OnlineComponent
          ),
      },
      {
        path: '',
        loadComponent: () =>
          import('./auth-components/online/online.component').then(
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
      import('./auth-components/verify/verify.component').then(
        (m) => m.VerifyComponent
      ),
  },
  {
    title: 'Forgot password',
    path: 'forgot-password',
    loadComponent: () =>
      import(
        './auth-components/forgot-password/forgot-password.component'
      ).then((m) => m.ForgotPasswordComponent),
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
