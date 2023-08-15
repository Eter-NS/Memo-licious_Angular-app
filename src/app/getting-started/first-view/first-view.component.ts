import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  addAnimations,
  startAnimation,
} from 'src/app/animations/animation-tools';
import { runAnimations } from 'src/app/animations/animation-triggers';

@Component({
  selector: 'app-first-view',
  templateUrl: './first-view.component.html',
  styleUrls: ['./first-view.component.scss'],
})
export class FirstViewComponent {
  router = inject(Router);

  @ViewChild('container') sectionContainer!: ElementRef<HTMLDivElement>;

  fillTheViewWithElement() {
    addAnimations(
      this.sectionContainer.nativeElement,
      'fill-the-view-animation'
    );

    startAnimation(this.sectionContainer.nativeElement);
  }

  runTransition() {
    runAnimations(
      this.sectionContainer.nativeElement,
      '.fade-out-animation',
      true
    );

    setTimeout(() => {
      this.fillTheViewWithElement();
    }, 300);
    setTimeout(() => {
      this.router.navigateByUrl('/getting-started/choose-path');
    }, 1500);
  }
}
