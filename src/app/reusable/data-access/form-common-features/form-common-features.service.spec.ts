/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';

import { FormCommonFeaturesService } from './form-common-features.service';
import { Component, EventEmitter, inject, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone: true,
  template: `
    @if (showHeader()) {
    <h1>Testing header</h1>
    }
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

  showHeader = signal<boolean>(true);
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
    it(`should stop executing if an element has not been found.`, fakeAsync(() => {
      // Arrange
      const spy = spyOn(service, 'addAnimations');
      component.showHeader.set(false);
      fixture.detectChanges();
      tick();

      // Act
      component.formElements.onInitAnimations();
      flush();

      // Assert
      expect(spy).not.toHaveBeenCalled();
    }));

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

    it('should call removeAnimations() three times after runWithDelay resolution.', fakeAsync(() => {
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

      expect(service.removeAnimations).toHaveBeenCalledWith(
        h1Element,
        'fadeIn-from-top-animation'
      );
      expect(service.removeAnimations).toHaveBeenCalledWith(
        formInputs,
        'fadeIn-from-left-animation'
      );
      expect(service.removeAnimations).toHaveBeenCalledWith(
        submitButton,
        'fadeIn-from-right-animation'
      );
    }));

    it('should call console.error in case of catch block', fakeAsync(() => {
      spyOn(service, 'runWithDelay').and.returnValue(
        Promise.reject(new Error('Example error message'))
      );
      spyOn(console, 'error').and.stub();

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

  describe('submitForm()', () => {
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

  describe(`hasInvalidControls()`, () => {
    it(`should return false if the FormGroup has valid controls.`, () => {
      // Arrange
      const form = new FormGroup({
        name: new FormControl('', [Validators.required]),
        surname: new FormControl('', [Validators.required]),
      });
      form.patchValue({ name: 'example-name', surname: 'example-surname' });

      // Act
      const result = service.hasInvalidControls(form);

      // Assert
      expect(result).toBeFalsy();
    });

    it(`should return true if the FormGroup has invalid controls.`, () => {
      // Arrange
      const form = new FormGroup({
        name: new FormControl('', [Validators.required]),
        surname: new FormControl('', [Validators.required]),
      });

      // Act
      const result = service.hasInvalidControls(form);

      // Assert
      expect(result).toBeTruthy();
    });
  });

  describe(`onFailure()`, () => {
    it(`should set invalidForm flag to true.`, () => {
      // Arrange
      const form = new FormGroup({
        name: new FormControl('', [Validators.required]),
        surname: new FormControl('', [Validators.required]),
      });

      // Act
      service.onFailure(form);

      // Assert
      expect(form.errors?.['invalidForm']).toBeTruthy();
    });
  });

  describe(`isErrorAndTouched()`, () => {
    it(`should call and return the result of _formFieldConditionalCheck method.`, () => {
      // Arrange
      const spy = spyOn(
        service as any,
        '_formFieldConditionalCheck'
      ).and.returnValue(true);
      const form = new FormGroup({
        name: new FormControl('', [Validators.required]),
        surname: new FormControl('', [Validators.required]),
      });

      // Act
      const result = service.isErrorAndTouched(form, 'name', 'required');

      // Assert
      expect(spy).toHaveBeenCalledWith(form, 'name', 'required', 'touched');
      expect(result).toBeTruthy();
    });
  });

  describe(`isErrorAndDirty()`, () => {
    it(`should call and return the result of _formFieldConditionalCheck method.`, () => {
      // Arrange
      const spy = spyOn(
        service as any,
        '_formFieldConditionalCheck'
      ).and.returnValue(true);
      const form = new FormGroup({
        name: new FormControl('', [Validators.required]),
        surname: new FormControl('', [Validators.required]),
      });

      // Act
      const result = service.isErrorAndDirty(form, 'name', 'required');

      // Assert
      expect(spy).toHaveBeenCalledWith(form, 'name', 'required', 'dirty');
      expect(result).toBeTruthy();
    });
  });

  describe(`_formFieldConditionalCheck()`, () => {
    let form: FormGroup<{
      name: FormControl<string | null>;
      surname: FormControl<string | null>;
    }>;
    beforeEach(() => {
      form = new FormGroup({
        name: new FormControl('', [Validators.required]),
        surname: new FormControl('', [Validators.required]),
      });
    });

    it(`should call getError method and if the result is true then check the touched property.`, () => {
      // Arrange
      spyOn(service, 'getError').and.returnValue(true);
      form.controls.name.markAsTouched();

      // Act
      const result = service['_formFieldConditionalCheck'](
        form,
        'name',
        'required',
        'touched'
      );

      // Assert
      expect(result).toBeTruthy();
    });

    it(`should call getError method and if the result is true then check the dirty property.`, () => {
      // Arrange
      spyOn(service, 'getError').and.returnValue(true);
      form.controls.name.markAsDirty();

      // Act
      const result = service['_formFieldConditionalCheck'](
        form,
        'name',
        'required',
        'dirty'
      );

      // Assert
      expect(result).toBeTruthy();
    });

    it(`should call getError method and return false if the control is valid.`, () => {
      // Arrange
      spyOn(service, 'getError').and.returnValue(false);
      form.controls.name.markAsTouched();

      // Act
      const result = service['_formFieldConditionalCheck'](
        form,
        'name',
        'required',
        'touched'
      );

      // Assert
      expect(result).toBeFalsy();
    });

    it(`should not call getError method and return undefined if the control does not exist.`, () => {
      // Arrange
      const spy = spyOn(service, 'getError');
      form.controls.name.markAsTouched();

      // Act
      const result = service['_formFieldConditionalCheck'](
        form,
        'uid',
        'required',
        'touched'
      );

      // Assert
      expect(spy).not.toHaveBeenCalled();
      expect(result).toBe(undefined);
    });
  });
});
