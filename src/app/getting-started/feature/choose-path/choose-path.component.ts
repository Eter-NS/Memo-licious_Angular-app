import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { ShoppingThreeComponent } from 'src/app/reusable/ui/SVGs/shopping-three/shopping-three.component';
import { SvgElementsDirective } from 'src/app/reusable/ui/SVGs/svg-elements.directive';
import {
  addAnimations,
  removeAnimations,
} from 'src/app/reusable/utils/animations/animation-tools';
import {
  runAnimationOnce,
  runWithDelay,
} from 'src/app/reusable/utils/animations/animation-triggers';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { CustomMatRippleDirective } from 'src/app/reusable/utils/ripples/ripple-color-checker.directive';
import { environment } from 'src/environments/environment.dev';

@Component({
  standalone: true,
  imports: [
    ShoppingThreeComponent,
    SvgElementsDirective,
    CustomMatRippleDirective,
  ],
  selector: 'app-choose-path',
  templateUrl: './choose-path.component.html',
  styleUrls: ['./choose-path.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoosePathComponent implements AfterViewInit {
  #router = inject(Router);
  viewTransitionService = inject(ViewTransitionService);
  @ViewChild('container') hostElement!: ElementRef<HTMLElement>;
  removeAnimations = removeAnimations;
  addAnimations = addAnimations;
  runWithDelay = runWithDelay;

  ngAfterViewInit(): void {
    for (const child of Object.values(
      this.hostElement.nativeElement.children
    )) {
      runAnimationOnce(child as HTMLElement, 'fadeIn-vol-2-animation', {
        removeClassOnFinish: true,
      });
    }
  }

  runTransition(suffix: string) {
    const element = this.hostElement.nativeElement;

    this.removeAnimations(element, 'fadeIn-vol-2-animation', true);
    this.addAnimations(element, 'fade-out-animation', true);

    this.runWithDelay(element.children, {
      reverse: true,
      timeout: 800,
    })
      .then(() => {
        this.viewTransitionService.goBackClicked = false;
        this.#router.navigateByUrl(suffix);
      })
      .catch((err) => {
        if (!environment.production) {
          console.error(err);
        }
      });
  }
}
