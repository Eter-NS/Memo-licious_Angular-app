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
import { LocalStorageService } from 'src/app/reusable/localStorage/local-storage.service';
import { CustomMatRippleDirective } from 'src/app/reusable/ripples/ripple-color-checker.directive';

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
  #localStorageService = inject(LocalStorageService);
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
    this.#localStorageService.saveToStorage('finishedTutorial', true);
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
        console.error(err);
      });
  }
}
