import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  addAnimations,
  startAnimation,
} from 'src/app/reusable/animations/animation-tools';
import { runAnimations } from 'src/app/reusable/animations/animation-triggers';
import { LocalStorageService } from 'src/app/reusable/localStorage/local-storage.service';

@Component({
  standalone: true,
  imports: [NgOptimizedImage],
  selector: 'app-first-view',
  templateUrl: './first-view.component.html',
  styleUrls: ['./first-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FirstViewComponent implements OnInit {
  #router = inject(Router);
  localStorageService = inject(LocalStorageService);
  @ViewChild('container') sectionContainer!: ElementRef<HTMLDivElement>;
  startAnimation = startAnimation;
  runAnimations = runAnimations;
  addAnimations = addAnimations;

  ngOnInit(): void {
    this.localStorageService.saveToStorage('finishedTutorial', false);
  }

  fillView() {
    const element = this.sectionContainer.nativeElement;
    this.addAnimations(element, 'fill-the-view-animation');
    this.startAnimation(element);
  }

  runTransition() {
    const element = this.sectionContainer.nativeElement;
    this.runAnimations(element, '.fade-out-animation', true);

    setTimeout(() => {
      this.fillView();
    }, 300);
    setTimeout(() => {
      this.#router.navigateByUrl('/getting-started/choose-path');
    }, 1500);
  }
}
