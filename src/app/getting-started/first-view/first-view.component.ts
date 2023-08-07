import { animation } from '@angular/animations';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-first-view',
  templateUrl: './first-view.component.html',
  styleUrls: ['./first-view.component.scss'],
})
export class FirstViewComponent {
  router = inject(Router);

  @ViewChild('container') sectionContainer!: ElementRef<HTMLDivElement>;

  addAnimations(element: HTMLElement, animations: string | Array<string>) {
    if (typeof animations === 'string') element.classList.add(animations);
    else
      animations.forEach((animation) => {
        element.classList.add(animation);
      });
  }
  startAnimation(element: HTMLElement) {
    element.classList.add('play');
  }

  runFadeOutAnimation() {
    const animationElements =
      this.sectionContainer.nativeElement.querySelectorAll<HTMLElement>(
        '.fade-out-animation-element'
      );

    animationElements.forEach((element) => {
      this.startAnimation(element);
    });
  }

  fillTheViewWithElement() {
    this.addAnimations(
      this.sectionContainer.nativeElement,
      'fill-the-view-animation-element'
    );

    this.startAnimation(this.sectionContainer.nativeElement);
  }

  runTransition() {
    this.runFadeOutAnimation();

    setTimeout(() => {
      this.fillTheViewWithElement();
    }, 500);
    setTimeout(() => {
      this.router.navigateByUrl('/getting-started/choose-path');
    }, 1500);
  }
}
