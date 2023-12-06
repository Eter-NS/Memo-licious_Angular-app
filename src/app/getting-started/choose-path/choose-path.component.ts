import { NgOptimizedImage } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { ShoppingThreeComponent } from 'src/app/reusable/SVGs/shopping-three/shopping-three.component';
import { SvgElementsDirective } from 'src/app/reusable/SVGs/svg-elements.directive';
import {
  addAnimations,
  removeAnimations,
} from 'src/app/reusable/animations/animation-tools';
import {
  runAnimationOnce,
  runWithDelay,
} from 'src/app/reusable/animations/animation-triggers';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { CustomMatRippleDirective } from 'src/app/reusable/ripples/ripple-color-checker.directive';

@Component({
  standalone: true,
  imports: [
    ShoppingThreeComponent,
    SvgElementsDirective,
    NgOptimizedImage,
    CustomMatRippleDirective,
  ],
  selector: 'app-login-or-guest-view',
  templateUrl: './choose-path.component.html',
  styleUrls: ['./choose-path.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoosePathComponent implements AfterViewInit {
  #router = inject(Router);
  viewTransitionService = inject(ViewTransitionService);
  @ViewChild('container') hostElement!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    for (const child of Object.values(
      this.hostElement.nativeElement.children
    )) {
      runAnimationOnce(child as HTMLElement, 'fadeIn-vol-2-animation', {
        removeAnimationClassOnFinish: true,
      });
    }
  }

  runTransition(suffix: string) {
    removeAnimations(
      this.hostElement.nativeElement,
      'fadeIn-vol-2-animation',
      true
    );
    addAnimations(this.hostElement.nativeElement, 'fade-out-animation', true);

    runWithDelay(this.hostElement.nativeElement.children, {
      reverse: true,
      timeoutTime: 1000,
    })
      .then(() => {
        this.viewTransitionService.goBackClicked = false;
        this.#router.navigateByUrl(suffix);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
