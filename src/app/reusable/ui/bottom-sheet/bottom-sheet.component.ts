import { AsyncPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  Renderer2,
  TemplateRef,
  ViewChild,
  booleanAttribute,
  inject,
} from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [NgTemplateOutlet, NgClass, AsyncPipe],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetComponent implements AfterViewInit, OnDestroy {
  #renderer = inject(Renderer2);
  #zone = inject(NgZone);

  @Input({ required: true }) set open(value: boolean) {
    this._isOpenedSubject.next(value);
  }
  @Input({ transform: booleanAttribute }) set noAnimation(value: boolean) {
    this._noAnimationSubject.next(value);
  }

  @Output() closed = new EventEmitter<boolean>();

  @ContentChild('content') content!: TemplateRef<unknown>;
  @ViewChild('sheet') element!: ElementRef<HTMLDivElement>;

  private readonly _isOpenedSubject = new BehaviorSubject<boolean>(false);
  private readonly _noAnimationSubject = new BehaviorSubject<boolean>(false);
  private readonly _isDraggingSubject = new BehaviorSubject<boolean>(false);

  protected readonly data$ = combineLatest({
    isOpened: this._isOpenedSubject.asObservable(),
    noAnimation: this._noAnimationSubject.asObservable(),
    isDragging: this._isDraggingSubject.asObservable(),
  });

  #escapeButtonListener!: () => void;
  #startY!: number;
  #startHeight!: number;
  #initialHeight!: number;

  ngAfterViewInit(): void {
    const element = this.element.nativeElement;
    this.#initialHeight = element.offsetHeight;

    this.#zone.runOutsideAngular(() => {
      element.addEventListener('pointermove', this.dragTo.bind(this));
      element.addEventListener('pointerup', this.stopDragging.bind(this));
      document.addEventListener('pointerup', this.stopDragging.bind(this));
      this.#escapeButtonListener = this.#renderer.listen(
        document,
        'keyup.Escape',
        this.close.bind(this)
      );
    });
  }

  ngOnDestroy(): void {
    const element = this.element.nativeElement;

    element.removeEventListener('pointermove', this.dragTo.bind(this));
    element.removeEventListener('pointerup', this.stopDragging.bind(this));
    document.removeEventListener('pointerup', this.stopDragging.bind(this));
    this.#escapeButtonListener();
  }

  close() {
    this._isOpenedSubject.next(false);
    let hasEmitted = false;

    const effect = () => {
      if (!hasEmitted) {
        this.closed.emit(false);
        hasEmitted = true;
      }

      this.setNewHeight(this.#initialHeight);
    };
    const element = this.element.nativeElement;

    element.addEventListener('transitionend', effect, { once: true });
    element.addEventListener('animationend', effect, { once: true });
  }

  startDragging(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!e.isPrimary) {
      return;
    }

    this._isDraggingSubject.next(true);
    this.#startY = e.pageY;
    this.#startHeight = this.element.nativeElement.offsetHeight;
  }

  dragTo(e: PointerEvent) {
    if (!this._isDraggingSubject.value || !e.isPrimary) {
      return;
    }
    const element = this.element.nativeElement;

    if (!element.hasPointerCapture(e.pointerId)) {
      element.setPointerCapture(e.pointerId);
    }

    const effect = () => {
      e.preventDefault();
      const delta = this.#startY - e.pageY;

      const newHeight = this.#startHeight + delta;
      this.setNewHeight(newHeight);
    };

    requestAnimationFrame(effect);
  }

  stopDragging(e: PointerEvent) {
    if (!this._isDraggingSubject.value || !e.isPrimary) {
      return;
    }

    const element = this.element.nativeElement;

    if (element.hasPointerCapture(e.pointerId)) {
      element.releasePointerCapture(e.pointerId);
    }
    this._isDraggingSubject.next(false);

    const height = element.offsetHeight;
    const minHeight = 50;

    if (height < minHeight) {
      this.close();
    }
  }

  /**
   * Sets the new height of the bottom sheet.
   *
   * @param value - The new height in pixels.
   */
  setNewHeight(value: number) {
    this.#renderer.setStyle(this.element.nativeElement, 'height', `${value}px`);
  }
}
