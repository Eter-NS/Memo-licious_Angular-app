import { NgModule } from '@angular/core';

import { GettingStartedRoutingModule } from './getting-started-routing.module';
import { GettingStartedComponent } from './getting-started.component';
import { FirstViewComponent } from './first-view/first-view.component';
import { AboutViewComponent } from './about-view/about-view.component';
import { LoginOrGuestViewComponent } from './login-or-guest-view/login-or-guest-view.component';
import { GuestFormComponent } from './guest-form/guest-form.component';
import { RouterModule } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { ShoppingThreeComponent } from '../../reusable/SVGs/shopping-three/shopping-three.component';
import { CustomMatRippleDirective } from 'src/reusable/ripples/ripple-color-checker.directive';

@NgModule({
  declarations: [
    GettingStartedComponent,
    FirstViewComponent,
    AboutViewComponent,
    LoginOrGuestViewComponent,
    GuestFormComponent,
  ],
  imports: [
    GettingStartedRoutingModule,
    RouterModule,
    MatRippleModule,
    ShoppingThreeComponent,
    CustomMatRippleDirective,
  ],
})
export class GettingStartedModule {}
