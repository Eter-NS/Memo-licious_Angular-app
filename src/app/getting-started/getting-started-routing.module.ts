import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GettingStartedComponent } from './getting-started.component';
import { FirstViewComponent } from './first-view/first-view.component';
import { LoginOrGuestViewComponent } from './login-or-guest-view/login-or-guest-view.component';

const routes: Routes = [
  {
    path: '',
    component: GettingStartedComponent,
    children: [
      {
        /* 1. */
        path: 'getting-started/hello',
        component: FirstViewComponent,
      },
      {
        /* 2. */
        path: 'getting-started/choose-path',
        component: LoginOrGuestViewComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'getting-started/hello',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GettingStartedRoutingModule {}
