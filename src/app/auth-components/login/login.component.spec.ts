import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { By } from '@angular/platform-browser';
import { FormCommonFeaturesService } from '../services/form-common-features/form-common-features.service';
import { SimpleChange } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let formCommonFeaturesServiceMock: FormCommonFeaturesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
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
    fixture = TestBed.createComponent(LoginComponent);
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

    it('should emit a "rememberMe" event if the method is called', () => {
      spyOn(component.rememberMe, 'emit');

      component.onSubmit();

      expect(component.rememberMe.emit).toHaveBeenCalledWith(
        component.loginForm.controls.rememberMe.getRawValue()
      );
    });

    it('should call the "onSubmit" method of the "FormCommonFeaturesService" if the method is called', () => {
      component.onSubmit();

      expect(formCommonFeaturesServiceMock.onSubmit).toHaveBeenCalledWith(
        component.loginForm,
        component.data
      );
    });
  });
});
