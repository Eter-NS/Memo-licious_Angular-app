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
  selector: 'app-first-view',
  templateUrl: './first-view.component.html',
  styleUrls: ['./first-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FirstViewComponent implements OnInit {
  #router = inject(Router);
  #localStorageService = inject(LocalStorageService);

  @ViewChild('container') sectionContainer!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this.#localStorageService.saveToStorage('finishedTutorial', false);
  }

  fillView() {
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
      this.fillView();
    }, 300);
    setTimeout(() => {
      this.#router.navigateByUrl('/getting-started/choose-path');
    }, 1500);
  }
}
