import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';
import { MatRipple } from '@angular/material/core';

@Directive({
  selector: '[appCustomMatRipple]',
  standalone: true,
  providers: [MatRipple],
})
export class CustomMatRippleDirective
  extends MatRipple
  implements AfterViewInit
{
  // Assign the emitted value to the state var. and then assign to matRippleColor
  // @Input() rippleColor: string = '';

  private el = inject(ElementRef);

  ngAfterViewInit(): void {
    this.setColorBrightness();
  }

  setColorBrightness(): void {
    const darkShadow = 'hsl(0, 0%, 0%, 0.15)';
    const lightShadow = 'hsl(0, 0%, 100%, 0.15)';
    const brightnessMiddlePoint = 170;
    const colorString = window
      .getComputedStyle(this.el.nativeElement)
      .getPropertyValue('background-color');
    let isLowerThanMiddle = false;

    colorString.match(/\d+/g)!.forEach((colorChannel) => {
      if (!isLowerThanMiddle)
        isLowerThanMiddle = brightnessMiddlePoint >= Number(colorChannel);
    });

    this.color = isLowerThanMiddle ? lightShadow : darkShadow;
  }
}
