import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { redirectUnauthorizedToGuard } from './auth-components/guards/redirect-unauthorized-to.guard';
import { redirectLoggedInToGuard } from './auth-components/guards/redirect-logged-in-to.guard';

const redirectUnauthorizedToGettingStarted =
  redirectUnauthorizedToGuard('/getting-started');
const redirectUnauthorizedToOnline = redirectUnauthorizedToGuard('/online');
const redirectLoggedInToApp = redirectLoggedInToGuard('/app');

const routes: Routes = [
  {
    path: 'app',
    loadChildren: () =>
      import('./app-view/app-view-routing.module').then(
        (m) => m.AppViewRoutingModule
      ),
    canActivate: [redirectUnauthorizedToGettingStarted],
  },
  {
    path: 'getting-started',
    loadChildren: () =>
      import('./getting-started/getting-started.module').then(
        (m) => m.GettingStartedModule
      ),
    canActivate: [redirectLoggedInToGuard('/app')],
  },
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
    title: 'Account management',
    path: 'auth-state',
    loadComponent: () =>
      import('./auth-components/auth-state/auth-state.component').then(
        (m) => m.AuthStateComponent
      ),
  },

  {
    title: 'Home - Memo-licious',
    path: '',
    component: LandingPageComponent,
    canActivate: [redirectLoggedInToApp],
  },

  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
