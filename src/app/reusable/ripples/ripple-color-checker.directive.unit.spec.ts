import { ElementRef, NgZone } from '@angular/core';
import { CustomMatRippleDirective } from './ripple-color-checker.directive';
import { Platform } from '@angular/cdk/platform';

describe('CustomMatRippleDirective', () => {
  let directive: CustomMatRippleDirective;
  const mockElement: ElementRef<HTMLButtonElement> = {
    nativeElement: document.createElement('button'),
  };
  const darkShadow = 'hsl(0, 0%, 0%, 0.15)';
  const lightShadow = 'hsl(0, 0%, 100%, 0.15)';

  beforeEach(() => {
    directive = new CustomMatRippleDirective(
      mockElement,
      new NgZone({}),
      new Platform('Browser')
    );
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should set the color to darkShadow when the background color is light', () => {
    mockElement.nativeElement.style.backgroundColor = 'rgba(200, 200, 200, 1)';

    directive.ngAfterViewChecked();

    expect(directive.color).toEqual(darkShadow);
  });

  it('should set the color to lightShadow when the background color is dark', () => {
    mockElement.nativeElement.style.backgroundColor = 'rgba(25, 25, 25, 1)';

    directive.ngAfterViewChecked();

    expect(directive.color).toEqual(lightShadow);
  });
});
