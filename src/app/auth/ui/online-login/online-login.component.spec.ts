import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnlineLoginComponent } from './online-login.component';
import { By } from '@angular/platform-browser';
import { FormCommonFeaturesService } from '../../../reusable/data-access/form-common-features/form-common-features.service';
import { SimpleChange } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';

describe('OnlineLoginComponent', () => {
  let component: OnlineLoginComponent;
  let fixture: ComponentFixture<OnlineLoginComponent>;
  let formCommonFeaturesServiceMock: FormCommonFeaturesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OnlineLoginComponent],
      providers: [
        {
          provide: FormCommonFeaturesService,
          useValue: jasmine.createSpyObj('FormCommonFeaturesService', [
            'onInitAnimations',
            'getError',
            'onSubmit',
          ]),
        },
      ],
    });
    fixture = TestBed.createComponent(OnlineLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    formCommonFeaturesServiceMock = TestBed.inject(FormCommonFeaturesService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template', () => {
    beforeEach(() => {
      component.loginForm.controls.email.setValue('example@exmaple.com');
      component.loginForm.controls.password.setValue('test');
      fixture.detectChanges();

      const formElement = fixture.debugElement.query(By.css('form'));
      formElement.triggerEventHandler('ngSubmit');
    });

    it('should assign "sending" property to true if the form is valid', () => {
      expect(component.loginForm.valid).toBe(true);
      expect(component.sending).toBe(true);
    });

    it('should render the mat-spinner component if "sending" is true', () => {
      fixture.detectChanges();
      const matSpinner = fixture.debugElement.query(By.css('mat-spinner'));

      expect(matSpinner.nativeElement).not.toBeNull();
    });

    it('should hide mat-spinner if there is an error from the @Input', () => {
      component.emailDoesNotExist = true;
      component.ngOnChanges({
        emailDoesNotExist: new SimpleChange(
          false,
          component.emailDoesNotExist,
          true
        ),
      });
      fixture.detectChanges();

      const matSpinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(matSpinner).toBeNull();
    });

    it('should show error message if emailDoesNotExist is true', () => {
      component.emailDoesNotExist = true;
      component.ngOnChanges({
        emailDoesNotExist: new SimpleChange(
          false,
          component.emailDoesNotExist,
          true
        ),
      });
      fixture.detectChanges();

      const errorNode = fixture.debugElement.query(
        By.css('[data-test="error-emailDoesNotExist"]')
      );
      expect(errorNode).not.toBeNull();
    });

    it('should show error message if wrongEmailOrPassword is true', () => {
      component.wrongEmailOrPassword = true;
      component.ngOnChanges({
        wrongEmailOrPassword: new SimpleChange(
          false,
          component.wrongEmailOrPassword,
          true
        ),
      });
      fixture.detectChanges();

      const errorNode = fixture.debugElement.query(
        By.css('[data-test="error-wrongEmailOrPassword"]')
      );
      expect(errorNode).not.toBeNull();
    });
  });

  describe('onSubmit()', () => {
    it('should be called when the submit button is clicked', () => {
      spyOn(component, 'onSubmit');
      const form = fixture.debugElement.query(By.css('form'));

      form.triggerEventHandler('ngSubmit');
      fixture.detectChanges();

      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should call the "onSubmit" method of the "FormCommonFeaturesService" if the method is called', () => {
      component.onSubmit();

      expect(formCommonFeaturesServiceMock.submitForm).toHaveBeenCalledWith(
        component.loginForm,
        component.data
      );
    });
  });

  describe(`onRememberMeChange()`, () => {
    it(`should emit the new value of the "rememberMe" control`, () => {
      spyOn(component.rememberMe, 'emit');
      const emittedValue = true;

      component.onRememberMeChange({
        checked: emittedValue,
        source: {} as MatCheckbox,
      });

      expect(component.rememberMe.emit).toHaveBeenCalledWith(emittedValue);
    });
  });
});
