import { AfterViewChecked, Directive, ElementRef, inject } from '@angular/core';
import { MatRipple } from '@angular/material/core';

@Directive({
  selector: '[appCustomMatRipple]',
  standalone: true,
  providers: [MatRipple],
})
export class CustomMatRippleDirective
  extends MatRipple
  implements AfterViewChecked
{
  #el = inject(ElementRef);

  ngAfterViewChecked(): void {
    this.setColorBrightness();
  }

  setColorBrightness(): void {
    const darkShadow = 'hsl(0, 0%, 0%, 0.15)';
    const lightShadow = 'hsl(0, 0%, 100%, 0.15)';
    const brightnessMiddlePoint = 170;
    const colorString = window
      .getComputedStyle(this.#el.nativeElement)
      .getPropertyValue('background-color');
    let isLowerThanMiddle = false;

    colorString
      .match(/\d+/g)
      ?.forEach(
        (colorChannel) =>
          (isLowerThanMiddle = brightnessMiddlePoint >= Number(colorChannel))
      );

    this.color = isLowerThanMiddle ? lightShadow : darkShadow;
  }
}
