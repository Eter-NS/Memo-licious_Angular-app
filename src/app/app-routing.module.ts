import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';

const routes: Routes = [
  {
    path: 'app',
    loadChildren: () =>
      import('./app-view/app-view.module').then((m) => m.AppViewModule),
  },
  {
    path: 'getting-started',
    component: GettingStartedComponent,
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./register-component/register-component.component').then(
        (m) => m.RegisterComponentComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login-component/login-component.component').then(
        (m) => m.LoginComponentComponent
      ),
  },

  { path: '', redirectTo: 'getting-started', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
