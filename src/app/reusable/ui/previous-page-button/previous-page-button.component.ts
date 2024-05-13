import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  NgZone,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { runAnimationOnce } from 'src/app/reusable/utils/animations/animation-triggers';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
      @use 'src/scss/utils.scss' as *;
      :host {
        display: block;
        width: min-content;
        animation: var(--fade-in-on-load);
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
export class PreviousPageButtonComponent implements OnInit {
  @Output() clicked = new EventEmitter<void>(true);
  @ViewChild('anchor', { static: true }) anchor!: ElementRef<HTMLAnchorElement>;
  viewTransitionService = inject(ViewTransitionService);
  #zone = inject(NgZone);
  #destroy = inject(DestroyRef);
  subscription!: Subscription;
  runAnimationOnce = runAnimationOnce;

  ngOnInit(): void {
    this.viewTransitionService.pageState$
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((value) => value === 'start' && this.fadeOut());
  }

  goBackEmitter() {
    this.clicked.emit();
  }

  fadeIn() {
    this.#zone.runOutsideAngular(() => {
      this.runAnimationOnce(this.anchor.nativeElement, '', {
        removeClassOnFinish: true,
      });
    });
  }

  fadeOut() {
    this.#zone.runOutsideAngular(() => {
      this.runAnimationOnce(
        this.anchor.nativeElement,
        'fade-out-vol-2-animation',
        {
          removeClassOnFinish: false,
        }
      );
    });
  }
}
