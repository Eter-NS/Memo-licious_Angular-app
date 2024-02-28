import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';

import { FormCommonFeaturesService } from './form-common-features.service';
import { Component, EventEmitter, inject } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone: true,
  template: `
    <h1>Testing header</h1>
    <form>
      <fieldset>
        <label class="form-element">
          <p>Input 1</p>
          <input type="text" />
        </label>

        <label class="form-element">
          <p>Input 2</p>
          <input type="number" />
        </label>

        <label class="form-element">
          <p>Input 3</p>
          <input type="email" />
        </label>

        <button type="submit" class="submit-button">Send me</button>
      </fieldset>
    </form>
  `,
})
class TestComponent {
  formElements = inject(FormCommonFeaturesService);
}

describe('RegisterLoginCommonFeaturesService', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let service: FormCommonFeaturesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestComponent] });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    service = TestBed.inject(FormCommonFeaturesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('onInitAnimations()', () => {
    it('should call addAnimations() three times', () => {
      spyOn(service, 'addAnimations');

      service.onInitAnimations();

      expect(service.addAnimations).toHaveBeenCalledTimes(3);
    });

    it('should call runWithDelay() once', fakeAsync(() => {
      spyOn(service, 'runWithDelay').and.returnValue(Promise.resolve());

      service.onInitAnimations();
      flush();

      expect(service.runWithDelay).toHaveBeenCalledTimes(1);
    }));

    it('should call removeAnimations() three times', fakeAsync(() => {
      spyOn(service, 'runWithDelay').and.returnValue(Promise.resolve());
      spyOn(service, 'removeAnimations');

      component.formElements.onInitAnimations();
      flush();

      const h1Element = fixture.debugElement.query(By.css('h1')).nativeElement;
      const formInputs: Array<HTMLElement> = [];
      fixture.debugElement
        .queryAll(By.css('.form-element'))
        .forEach((el) => formInputs.push(el.nativeElement));
      const submitButton = fixture.debugElement.query(
        By.css('.submit-button')
      ).nativeElement;

      expect(service.removeAnimations).toHaveBeenCalledWith(h1Element, [
        'fadeIn-from-top-animation',
      ]);
      expect(service.removeAnimations).toHaveBeenCalledWith(formInputs, [
        'fadeIn-from-left-animation',
      ]);
      expect(service.removeAnimations).toHaveBeenCalledWith(submitButton, [
        'fadeIn-from-right-animation',
      ]);
    }));

    it('should call console.error in case of catch block', fakeAsync(() => {
      spyOn(service, 'runWithDelay').and.returnValue(
        Promise.reject(new Error('Example error message'))
      );
      spyOn(console, 'error');

      component.formElements.onInitAnimations();
      flush();

      expect(console.error).toHaveBeenCalled();
    }));
  });

  describe('getError()', () => {
    it('should return true if error exists', () => {
      const element = 'email';
      const errorType = 'required';
      const formGroup = new FormGroup({
        [element]: new FormControl('', [
          Validators.required,
          Validators.email,
        ]) as FormControl<string>,
      });

      const result = service.getError(formGroup, element, errorType);

      expect(result).toBeTrue();
    });

    it('should return false if error does not exist', () => {
      const element = 'email';
      const errorType = 'required';
      const formGroup = new FormGroup({
        [element]: new FormControl('example@example.com', [
          Validators.required,
          Validators.email,
        ]) as FormControl<string>,
      });

      const result = service.getError(formGroup, element, errorType);

      expect(result).toBeFalse();
    });

    it('should return undefined when the searched FormControl does not exist in the FormGroup', () => {
      const element = 'email';
      const errorType = 'required';
      const formGroup = new FormGroup({
        [element]: new FormControl('example@example.com', [
          Validators.required,
          Validators.email,
        ]) as FormControl<string>,
      });

      const result = service.getError(formGroup, 'email2', errorType);

      expect(result).toBe(undefined);
    });
  });

  describe('onSubmit()', () => {
    it('should set the FormGroup error if it is invalid and end the method execution', () => {
      const formGroup = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/\d+/),
          Validators.pattern(/[!@#$%^&*()_:"]+/),
        ]),
      });
      const emiter = new EventEmitter<{ email: string; password: string }>();

      service.submitForm(formGroup, emiter);

      expect(formGroup.errors).toEqual({ checkInputs: true });
    });

    it('should emit the value to the emitter attribute', () => {
      const formGroup = new FormGroup({
        email: new FormControl('example@example.com', [
          Validators.required,
          Validators.email,
        ]) as FormControl<string>,
        password: new FormControl('zaq1@WSX', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/\d+/),
          Validators.pattern(/[!@#$%^&*()_:"]+/),
        ]) as FormControl<string>,
      });
      const emiter = new EventEmitter<{ email: string; password: string }>();
      spyOn(emiter, 'emit');

      service.submitForm(formGroup, emiter);

      expect(emiter.emit).toHaveBeenCalled();
    });
  });
});
