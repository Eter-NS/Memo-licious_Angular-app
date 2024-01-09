import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { runAnimationOnce } from 'src/app/reusable/animations/animation-triggers';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';

@Component({
  selector: 'app-previous-page-button',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <a
      #anchor
      (click)="goBackEmitter()"
      (keyup.enter)="goBackEmitter()"
      tabindex="0"
    >
      <mat-icon aria-hidden="false" aria-label="Example home icon">
        arrow_back
      </mat-icon>
    </a>
  `,
  styles: [
    `
      @use '../../../scss/utils.scss' as *;
      :host {
        display: block;
        width: min-content;
      }

      a {
        display: inherit;
        cursor: pointer;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviousPageButtonComponent implements AfterViewInit, OnDestroy {
  @Output() clicked = new EventEmitter<void>(true);
  @ViewChild('anchor') anchor!: ElementRef<HTMLAnchorElement>;
  viewTransitionService = inject(ViewTransitionService);
  subscription!: Subscription;
  runAnimationOnce = runAnimationOnce;

  ngAfterViewInit(): void {
    this.subscription = this.viewTransitionService.page$.subscribe((value) => {
      if (value === 'start') {
        this.fadeOut();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  goBackEmitter() {
    this.clicked.emit();
  }

  fadeOut() {
    this.runAnimationOnce(
      this.anchor.nativeElement,
      'fade-out-vol-2-animation',
      {
        removeAnimationClassOnFinish: true,
      }
    );
  }
}
