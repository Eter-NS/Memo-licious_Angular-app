import { Component } from '@angular/core';
import { MatSpinnerTogglerDirective } from './mat-spinner-toggler.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  template: `<button type="button" [appMatSpinnerToggler]="spinner">
    An example button
  </button>`,
  imports: [MatSpinnerTogglerDirective],
})
class TestComponent {
  spinner = false;
}

describe('MatSpinnerTogglerDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the sending class in the element after emitting the "click" event and checking the input value', () => {
    component.spinner = true;
    fixture.detectChanges();

    const button = fixture.debugElement.query(
      By.directive(MatSpinnerTogglerDirective)
    );
    button.triggerEventHandler('click');
    fixture.detectChanges();

    expect(button.nativeElement.classList.contains('sending')).toBe(true);
  });

  it('should toggle the sending class in the element to off after setting the flag to false and emitting a click event', () => {
    component.spinner = true;
    fixture.detectChanges();

    const button = fixture.debugElement.query(
      By.directive(MatSpinnerTogglerDirective)
    );
    button.triggerEventHandler('click');
    fixture.detectChanges();

    expect(button.nativeElement.classList.contains('sending')).toBe(true);

    component.spinner = false;
    fixture.detectChanges();
    button.triggerEventHandler('click');
    fixture.detectChanges();

    expect(button.nativeElement.classList.contains('sending')).toBe(false);
  });
});
