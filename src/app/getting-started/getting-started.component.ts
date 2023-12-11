import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/compiler';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { ShoppingThreeComponent } from '../reusable/SVGs/shopping-three/shopping-three.component';
import { CustomMatRippleDirective } from '../reusable/ripples/ripple-color-checker.directive';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    RouterModule,
    MatRippleModule,
    ShoppingThreeComponent,
    CustomMatRippleDirective,
  ],
})
class GettingStartedComponent {}
