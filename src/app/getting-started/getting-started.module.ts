import { NgModule } from '@angular/core';

import { GettingStartedRoutingModule } from './getting-started-routing.module';
import { FirstViewComponent } from './first-view/first-view.component';
import { RouterModule } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { ShoppingThreeComponent } from '../reusable/SVGs/shopping-three/shopping-three.component';
import { CustomMatRippleDirective } from '../reusable/ripples/ripple-color-checker.directive';
import { NgOptimizedImage } from '@angular/common';
import { ChoosePathComponent } from './choose-path/choose-path.component';

@NgModule({
  declarations: [FirstViewComponent, ChoosePathComponent],
  imports: [
    NgOptimizedImage,
    GettingStartedRoutingModule,
    RouterModule,
    MatRippleModule,
    ShoppingThreeComponent,
    CustomMatRippleDirective,
  ],
})
export class GettingStartedModule {}
