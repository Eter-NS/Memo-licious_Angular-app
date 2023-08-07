import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeViewComponent } from './home-view/home-view.component';
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
  { path: '', redirectTo: 'getting-started', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
