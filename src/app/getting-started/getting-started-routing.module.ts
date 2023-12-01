import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FirstViewComponent } from './first-view/first-view.component';
import { ChoosePathComponent } from './choose-path/choose-path.component';

const routes: Routes = [
  {
    title: 'Getting started',
    path: '',
    children: [
      {
        /* 1. */
        title: 'Hello 👋',
        path: 'hello',
        component: FirstViewComponent,
      },
      {
        /* 2. */
        title: 'Choose account type',
        path: 'choose-path',
        component: ChoosePathComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'hello',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GettingStartedRoutingModule {}
