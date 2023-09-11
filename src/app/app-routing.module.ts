import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { NotFoundComponent } from './not-found/not-found.component';

import {
  redirectUnauthorizedTo,
  redirectLoggedInTo,
  canActivate,
} from '@angular/fire/auth-guard';

const redirectUnauthorizedToGettingStarted = () => redirectUnauthorizedTo(['']);
const redirectLoggedInToApp = () => redirectLoggedInTo(['app']);

const routes: Routes = [
  {
    path: 'app',
    ...canActivate(redirectLoggedInToApp),
    loadComponent: () =>
      import('./app-view/app-view.component').then((m) => m.AppViewComponent),
  },
  {
    path: 'getting-started',
    component: GettingStartedComponent,
  },

  {
    path: 'guest',
    loadComponent: () =>
      import('./auth-components/guest/guest.component').then(
        (m) => m.GuestComponent
      ),
  },
  {
    path: 'online/:redirect?',
    loadComponent: () =>
      import('./auth-components/online/online.component').then(
        (m) => m.OnlineComponent
      ),
  },
  {
    path: 'online',
    loadComponent: () =>
      import('./auth-components/online/online.component').then(
        (m) => m.OnlineComponent
      ),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./auth-components/verify/verify.component').then(
        (m) => m.VerifyComponent
      ),
  },

  {
    path: '',
    component: GettingStartedComponent,
    ...canActivate(redirectUnauthorizedToGettingStarted),
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
