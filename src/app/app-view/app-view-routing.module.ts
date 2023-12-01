import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppViewComponent } from './app-view.component';

const routes: Routes = [
  {
    title: 'App',
    path: '',
    component: AppViewComponent,
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppViewRoutingModule {}
