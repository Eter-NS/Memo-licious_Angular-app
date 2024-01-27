import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthEmailService } from '../services/email/auth-email.service';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { of } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormControlDirective } from '@angular/forms';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  let authEmailServiceMock: AuthEmailService;
  let viewTransitionService: ViewTransitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        {
          provide: AuthEmailService,
          useValue: {
            sendResetEmail: jasmine
              .createSpy('sendResetEmail')
              .and.returnValue(Promise.resolve(false)),
          },
        },
        {
          provide: ViewTransitionService,
          useValue: {
            viewFadeIn: jasmine
              .createSpy('viewFadeIn')
              .and.returnValue(Promise.resolve()),
            goBackClicked: false,
            page$: of<'start' | 'end' | 'idle'>('idle'),
            goBack: jasmine.createSpy('goBack'),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    authEmailServiceMock = TestBed.inject(AuthEmailService);
    viewTransitionService = TestBed.inject(ViewTransitionService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template', () => {
    describe('app-previous-page-button component', () => {
      let goBackButton: DebugElement;
      beforeEach(() => {
        goBackButton = fixture.debugElement.query(By.css('.go-back-button'));
      });

      it('should be rendered ', () => {
        expect(goBackButton).toBeTruthy();
      });

      it('should call viewTransitionService.goBack() when event "clicked" was emitted', () => {
        goBackButton.triggerEventHandler('clicked');

        expect(viewTransitionService.goBack).toHaveBeenCalled();
      });
    });

    describe('forgot-password-form', () => {
      it('should render a simple form if emailSent is false', () => {
        const form = fixture.debugElement.query(By.css('.form'));

        expect(component.emailSent).toBeFalse();
        expect(form).toBeTruthy();
      });

      it('should render the "emailError" when it appears in the emailAddress control and its dirty', () => {
        const value = 'example@example';
        const input = fixture.debugElement.query(
          By.directive(FormControlDirective)
        );
        component.emailAddress.patchValue('value');
        input.triggerEventHandler('input', { target: { value } });
        input.triggerEventHandler('blur');
        component.emailAddress.markAsDirty();
        fixture.detectChanges();

        const errorElement = fixture.debugElement.query(
          By.css('[data-test="emailError"]')
        );

        expect(errorElement).toBeTruthy();
      });

      it('should call checkEmail() when event "click" or "keyup.enter" was emitted', () => {
        const spy = spyOn(component, 'checkEmail');
        const submitButton = fixture.debugElement.query(
          By.css('[data-test="forgot-password-submit-button"]')
        );

        submitButton.triggerEventHandler('click');
        submitButton.triggerEventHandler('keyup.enter');

        expect(spy).toHaveBeenCalledTimes(2);
      });
    });

    describe('success block', () => {
      // BUGGED
      xit('should render success block with the email if emailSent is true', () => {
        component.emailAddress$ = of('example@example.com');
        component.emailSent = true;
        fixture.detectChanges();

        const successBlock = fixture.debugElement.query(
          By.css('[data-test="forgot-password-success"]')
        );

        expect(successBlock).toBeTruthy();
      });
    });
  });

  describe('checkEmail()', () => {
    let inputElement: DebugElement;

    beforeEach(() => {
      inputElement = fixture.debugElement.query(
        By.directive(FormControlDirective)
      );
    });

    it('should call authEmailService.sendResetEmail() with correct email', async () => {
      component.emailAddress.patchValue('example@example.com');
      fixture.detectChanges();

      await component.checkEmail(new Event('click'));

      expect(authEmailServiceMock.sendResetEmail).toHaveBeenCalledWith(
        component.emailAddress.value
      );
    });

    it('should terminate the method execution if emailAddress is invalid', async () => {
      inputElement.triggerEventHandler('input', {
        target: { value: 'example@example.com' },
      });
      fixture.detectChanges();

      await component.checkEmail(new Event('click'));

      expect(authEmailServiceMock.sendResetEmail).not.toHaveBeenCalled();
    });

    it('should terminate the method execution if emailAddress is empty', async () => {
      inputElement.triggerEventHandler('input', {
        target: { value: '' },
      });
      fixture.detectChanges();

      await component.checkEmail(new Event('click'));

      expect(component.authEmailService.sendResetEmail).not.toHaveBeenCalled();
    });
  });
});
