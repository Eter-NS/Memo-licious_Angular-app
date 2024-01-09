import {
  AfterViewChecked,
  Directive,
  ElementRef,
  Input,
  inject,
} from '@angular/core';
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
  @Input({ required: false }) darkShadow = 'hsl(0, 0%, 0%, 0.15)';
  @Input({ required: false }) lightShadow = 'hsl(0, 0%, 100%, 0.15)';

  ngAfterViewChecked(): void {
    this.setColorBrightness();
  }

  setColorBrightness(): void {
    const brightnessMiddlePoint = 150;
    const colorString = window
      .getComputedStyle(this.#el.nativeElement)
      .getPropertyValue('background-color');

    const colorChannels = colorString
      .match(/\d+/g)
      ?.map((colorString) => Number(colorString));

    if (!colorChannels) return;

    const colorAverage = colorChannels.reduce((a, b) => a + b) / 3;

    this.color =
      colorAverage < brightnessMiddlePoint ? this.lightShadow : this.darkShadow;
  }
}
