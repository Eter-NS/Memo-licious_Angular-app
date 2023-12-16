import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomMatRippleDirective } from './ripple-color-checker.directive';
import { By } from '@angular/platform-browser';
import { Component, DebugElement } from '@angular/core';

@Component({
  standalone: true,
  imports: [CustomMatRippleDirective],
  template: `<div appCustomMatRipple></div>`,
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TestButtonComponent {}

describe('CustomMatRippleDirective', () => {
  let fixture: ComponentFixture<TestButtonComponent>;
  let directiveEl: DebugElement;
  let component: HTMLElement;
  const darkShadow = 'hsl(0, 0%, 0%, 0.15)';
  const lightShadow = 'hsl(0, 0%, 100%, 0.15)';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CustomMatRippleDirective, TestButtonComponent],
    });
    fixture = TestBed.createComponent(TestButtonComponent);
    fixture.detectChanges();
    directiveEl = fixture.debugElement.query(
      By.directive(CustomMatRippleDirective)
    );
  });

  beforeEach(() => {
    component = directiveEl.nativeElement;
  });

  it('should create an instance', () => {
    expect(directiveEl).toBeTruthy();
  });

  it('should override the default color to the dark in case of bright background', () => {
    component.style.backgroundColor = 'rgba(200, 200, 200, 1)';
    fixture.detectChanges();

    expect(directiveEl.componentInstance.color).toEqual(darkShadow);
  });

  it('should override the default color to the bright in case of dark background', () => {
    component.style.backgroundColor = 'rgba(25, 25, 25, 1)';
    fixture.detectChanges();

    expect(directiveEl.componentInstance.color).toEqual(lightShadow);
  });
});
