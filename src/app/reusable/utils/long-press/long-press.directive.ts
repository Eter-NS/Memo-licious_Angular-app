import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appLongPress]',
  standalone: true,
})
export class LongPressDirective {
  @Input() duration = 500;
  @Output() longPress = new EventEmitter<void>();

  private _timeout: unknown | undefined;

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this._timeout = setTimeout(() => {
      this.longPress.emit();
    }, this.duration);
  }

  @HostListener('pointerup')
  onPointerUp(): void {
    if (this._timeout) {
      clearTimeout(this._timeout as number);
    }
  }
}
