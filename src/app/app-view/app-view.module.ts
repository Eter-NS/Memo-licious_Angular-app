import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { CustomMatRippleDirective } from '../reusable/ripples/ripple-color-checker.directive';
import { NgOptimizedImage } from '@angular/common';
import { AppViewComponent } from './app-view.component';
import { AppViewRoutingModule } from './app-view-routing.module';

@NgModule({
  declarations: [AppViewComponent],
  imports: [
    NgOptimizedImage,
    AppViewRoutingModule,
    RouterModule,
    MatRippleModule,
    CustomMatRippleDirective,
  ],
})
export class GettingStartedModule {}
