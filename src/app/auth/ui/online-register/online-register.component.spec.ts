import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnlineRegisterComponent } from './online-register.component';
import { FormCommonFeaturesService } from '../../../reusable/data-access/form-common-features/form-common-features.service';
import { By } from '@angular/platform-browser';
import { DebugElement, SimpleChange } from '@angular/core';

describe('OnlineRegisterComponent', () => {
  let component: OnlineRegisterComponent;
  let fixture: ComponentFixture<OnlineRegisterComponent>;
  let formCommonFeaturesServiceMock: FormCommonFeaturesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OnlineRegisterComponent],
      providers: [FormCommonFeaturesService],
    });
    fixture = TestBed.createComponent(OnlineRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    formCommonFeaturesServiceMock = TestBed.inject(FormCommonFeaturesService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template', () => {
    let form: DebugElement;

    beforeEach(() => {
      form = fixture.debugElement.query(By.css('form'));
    });
    it('should call onSubmit() if the submit button has been clicked', () => {
      spyOn(component, 'onSubmit');

      form.triggerEventHandler('ngSubmit');

      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should assign "sending" property to true if the form is valid and submitted', () => {
      component.registerForm.controls.name.setValue('XYZ');
      component.registerForm.controls.email.setValue('example@example.com');
      component.registerForm.controls.password.setValue('zaq1@WSX');
      component.registerForm.controls.confirmPassword.setValue('zaq1@WSX');

      form.triggerEventHandler('ngSubmit');

      expect(component.sending).toBeTrue();
    });

    it('should render mat-spinner if the "sending" property is true', () => {
      component.registerForm.controls.name.setValue('XYZ');
      component.registerForm.controls.email.setValue('example@example.com');
      component.registerForm.controls.password.setValue('zaq1@WSX');
      component.registerForm.controls.confirmPassword.setValue('zaq1@WSX');

      form.triggerEventHandler('ngSubmit');
      fixture.detectChanges();

      const matSpinner = fixture.debugElement.query(By.css('mat-spinner'));

      expect(matSpinner).toBeTruthy();
    });

    it('should hide the mat-spinner if  is true', () => {
      component.emailAlreadyInUse = true;
      component.ngOnChanges({
        emailAlreadyInUse: new SimpleChange(
          false,
          component.emailAlreadyInUse,
          true
        ),
      });
      fixture.detectChanges();

      const matSpinner = fixture.debugElement.query(By.css('mat-spinner'));

      expect(matSpinner).toBeNull();
    });

    it('should show the emailAlreadyInUse error message if the @Input is true', () => {
      component.emailAlreadyInUse = true;
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(
        By.css('[data-test="checkInputs||emailAlreadyInUse"]')
      );

      expect(errorMessage).toBeTruthy();
    });
  });

  describe('onSubmit()', () => {
    it('should call the formCommonFeaturesService.onSubmit method with registerForm and data', () => {
      const spy = spyOn(formCommonFeaturesServiceMock, 'submitForm');

      component.onSubmit();

      expect(spy).toHaveBeenCalledWith(component.registerForm, component.data);
    });
  });

  describe('ngOnChanges()', () => {
    it('should set "sending" property to false if emailAlreadyInUse is true', () => {
      component.emailAlreadyInUse = true;

      component.ngOnChanges({
        emailAlreadyInUse: new SimpleChange(
          false,
          component.emailAlreadyInUse,
          true
        ),
      });
      fixture.detectChanges();

      expect(component.sending).toBeFalse();
    });
  });
});
