import { AsyncPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
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

  private readonly _isOpenedSubject = new BehaviorSubject<boolean>(false);
  private readonly _noAnimationSubject = new BehaviorSubject<boolean>(false);
  private readonly _isDraggingSubject = new BehaviorSubject<boolean>(false);

  protected readonly data$ = combineLatest({
    isOpened: this._isOpenedSubject.asObservable(),
    noAnimation: this._noAnimationSubject.asObservable(),
    isDragging: this._isDraggingSubject.asObservable(),
  });

  @Input({ required: true }) set open(value: boolean) {
    this._isOpenedSubject.next(value);
  }
  @Input({ transform: booleanAttribute }) set 'no-animation'(value: boolean) {
    this._noAnimationSubject.next(value);
  }

  @Output() openChange = new EventEmitter<boolean>();

  @ContentChild('content') content!: TemplateRef<unknown>;
  @ViewChild('sheet') element!: ElementRef<HTMLDivElement>;

  startY!: number;
  startHeight!: number;
  initialHeight!: number;

  ngAfterViewInit(): void {
    this.initialHeight = this.element.nativeElement.offsetHeight;

    this.#zone.runOutsideAngular(() => {
      document.addEventListener('mousemove', this.dragTo.bind(this));
      document.addEventListener('touchmove', this.dragTo.bind(this));
      document.addEventListener('mouseup', this.stopDragging.bind(this));
      document.addEventListener('touchend', this.stopDragging.bind(this));
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.dragTo);
    document.removeEventListener('touchmove', this.dragTo);
    document.removeEventListener('mouseup', this.stopDragging);
    document.removeEventListener('touchend', this.stopDragging);
  }

  close() {
    this._isOpenedSubject.next(false);
    const element = this.element.nativeElement;

    const effectWrapper = (eventName: 'transitionend' | 'animationend') => {
      const effect = () => {
        this.openChange.emit(false);
        this.setNewHeight(this.initialHeight);
        element.removeEventListener(eventName, effect);
      };

      return effect;
    };

    element.addEventListener('transitionend', effectWrapper('transitionend'));
    element.addEventListener('animationend', effectWrapper('animationend'));
  }

  startDragging(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    this._isDraggingSubject.next(true);

    if (e instanceof MouseEvent) {
      this.startY = e.pageY;
    } else {
      this.startY = e.touches[0].pageY;
    }

    this.startHeight = this.element.nativeElement.offsetHeight;
  }

  dragTo(e: MouseEvent | TouchEvent) {
    if (!this._isDraggingSubject.value) return;

    const effect = () => {
      let delta = 0;
      if (e instanceof MouseEvent) {
        delta = this.startY - e.pageY;
      } else {
        delta = this.startY - e.touches[0].pageY;
      }
      e.preventDefault();

      const newHeight = this.startHeight + delta;
      this.setNewHeight(newHeight);
    };

    requestAnimationFrame(effect);
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  stopDragging() {
    this._isDraggingSubject.next(false);

    const height = this.element.nativeElement.offsetHeight;
    const minHeight = 50;
    if (height < minHeight) {
      this.close();
    }
  }

  setNewHeight(value: number) {
    this.#renderer.setStyle(this.element.nativeElement, 'height', `${value}px`);
  }
}
