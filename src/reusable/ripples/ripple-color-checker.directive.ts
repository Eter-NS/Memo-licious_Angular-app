import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appRippleColorChecker]',
  standalone: true,
})
export class RippleColorCheckerDirective {
  // Assign the emitted value to the state var. and then assign to matRippleColor
  @Output() rippleColor = new EventEmitter<string>();

  constructor(private el: ElementRef) {}

  @HostListener('touchstart')
  @HostListener('touchmove')
  @HostListener('mouseenter')
  setColorBrightness(): void {
    const darkShadow = '';
    const lightShadow = 'hsl(0, 0%, 100%, 0.15)';
    const brightnessMiddle = 170;
    const colorString = window
      .getComputedStyle(this.el.nativeElement)
      .getPropertyValue('background-color');
    let isLowerThanMiddle = false;

    colorString.match(/\d+/g)!.forEach((colorChannel) => {
      if (!isLowerThanMiddle)
        isLowerThanMiddle = brightnessMiddle >= Number(colorChannel);
    });

    this.rippleColor.emit(isLowerThanMiddle ? lightShadow : darkShadow);
  }
}
