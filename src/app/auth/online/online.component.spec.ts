/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentFixture,
  DeferBlockFixture,
  DeferBlockState,
  TestBed,
} from '@angular/core/testing';

import { OnlineComponent } from './online.component';
import { ChangeDetectorRef, DebugElement, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { AuthAccountService } from '../services/account/auth-account.service';
import { AuthStateService } from '../services/state/auth-state.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { AuthReturnCredits, Errors } from '../services/Models/authModels';
import { AuthUserData } from '../services/form-common-features/form-common-features.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserCredential } from '@angular/fire/auth';

describe('OnlineComponent', () => {
  const authAccountServiceMock = {
    continueWithGoogle: jasmine.createSpy('continueWithGoogle'),
    getDataFromRedirect: jasmine.createSpy('getDataFromRedirect'),
    signupWithEmail: jasmine.createSpy('signupWithEmail'),
    signInWithEmail: jasmine.createSpy('signInWithEmail'),
  };
  const authStateServiceMock = {
    rememberMe: jasmine.createSpy('rememberMe'),
    session: signal<UserCredential | null | undefined>(undefined),
  };
  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('mockValue'),
      },
    },
  };
  const viewTransitionServiceMock = {
    goBackClicked: false,
    page$: of<'start' | 'end' | 'idle'>('idle'),
    goBack: jasmine.createSpy('goBack'),
    goForward: jasmine.createSpy('goForward'),
  };
  const changeDetectorRefMock = {
    markForCheck: jasmine.createSpy('markForCheck'),
  };

  let component: OnlineComponent;
  let fixture: ComponentFixture<OnlineComponent>;
  let matSnackBarMock: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, OnlineComponent],
      providers: [
        { provide: AuthAccountService, useValue: authAccountServiceMock },
        { provide: AuthStateService, useValue: authStateServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        MatSnackBar,
        { provide: ViewTransitionService, useValue: viewTransitionServiceMock },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefMock },
      ],
    });
    fixture = TestBed.createComponent(OnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    matSnackBarMock = fixture.debugElement.injector.get(MatSnackBar);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template', () => {
    describe('app-online-register', () => {
      let registerDeferBlockFixture: DeferBlockFixture;
      let registerComponent: DebugElement;

      beforeEach(async () => {
        registerDeferBlockFixture = (await fixture.getDeferBlocks())[0];

        await registerDeferBlockFixture.render(DeferBlockState.Complete);

        registerComponent = fixture.debugElement.query(
          By.css('app-online-register')
        );
      });

      it('should be rendered when register flag is "true"', async () => {
        expect(component.register).toBeTrue();
        expect(registerComponent).toBeTruthy();
      });

      it('should call handleSubmit() when data event was emitted', () => {
        spyOn(component, 'handleSubmit').and.returnValue(Promise.resolve());

        registerComponent.triggerEventHandler('data', null);

        expect(component.handleSubmit).toHaveBeenCalled();
      });
    });

    describe('app-online-login', () => {
      let loginDeferBlockFixture: DeferBlockFixture;
      let loginComponent: DebugElement;

      beforeEach(async () => {
        component.register = false;
        fixture.detectChanges();

        loginDeferBlockFixture = (await fixture.getDeferBlocks())[1];
        await loginDeferBlockFixture.render(DeferBlockState.Complete);

        loginComponent = fixture.debugElement.query(By.css('app-online-login'));
      });

      it('should be rendered when register is "false"', () => {
        expect(component.register).toBeFalse();
        expect(loginComponent).toBeTruthy();
      });

      it('should call handleSubmit() when data event was emitted', () => {
        spyOn(component, 'handleSubmit').and.returnValue(Promise.resolve());

        loginComponent.triggerEventHandler('data', null);

        expect(component.handleSubmit).toHaveBeenCalled();
      });

      it('should call authStateService.rememberMe() when rememberMe event was emitted', () => {
        loginComponent.triggerEventHandler('rememberMe', true);

        expect(authStateServiceMock.rememberMe).toHaveBeenCalledWith(true);
      });
    });

    describe('Continue with Google button', () => {
      let button: DebugElement;

      beforeEach(() => {
        button = fixture.debugElement.query(By.css('.sign-in-with-google'));
      });

      it('should be rendered', () => {
        expect(button).toBeTruthy();
        expect(button.nativeElement.textContent).toContain(
          'Continue with Google'
        );
      });

      it('should call googleAuth() when event click or keyup.enter was emitted', () => {
        spyOn(component, 'googleAuth').and.returnValue(Promise.resolve());

        button.triggerEventHandler('click');
        button.triggerEventHandler('keyup.enter');

        expect(component.googleAuth).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('googleAuth()', () => {
    it('should call authAccountService.continueWithGoogle() and return a falsy value', async () => {
      authAccountServiceMock.continueWithGoogle.and.returnValue(
        Promise.resolve(null)
      );

      await component.googleAuth('continueWithGoogle');

      expect(authAccountServiceMock.continueWithGoogle).toHaveBeenCalled();
    });

    it('should call authAccountService.continueWithGoogle(), return AuthReturnCredits, and call _authErrorGuard()', async () => {
      const spy = spyOn(component as any, '_authErrorGuard');
      authAccountServiceMock.continueWithGoogle.and.returnValue(
        Promise.resolve({
          passed: true,
          registered: false,
        } satisfies AuthReturnCredits)
      );

      await component.googleAuth('continueWithGoogle');

      expect(spy).toHaveBeenCalled();
    });

    it('should call authAccountService.getDataFromRedirect() and return a falsy value', async () => {
      authAccountServiceMock.getDataFromRedirect.and.returnValue(
        Promise.resolve(null)
      );

      await component.googleAuth('getDataFromRedirect');

      expect(authAccountServiceMock.getDataFromRedirect).toHaveBeenCalled();
    });

    it('should call authAccountService.getDataFromRedirect(), return AuthReturnCredits, and call _authErrorGuard()', async () => {
      const spy = spyOn(component as any, '_authErrorGuard');
      authAccountServiceMock.getDataFromRedirect.and.returnValue(
        Promise.resolve({
          errors: { unknownError: { code: '123', message: 'Example error' } },
        } satisfies AuthReturnCredits)
      );

      await component.googleAuth('getDataFromRedirect');

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('handleSubmit()', () => {
    it('should stop executing the method in case there is no email or password provided', async () => {
      spyOn(component, 'handleSubmit');
      const payload = { email: '', password: 'xyz' };

      await component.handleSubmit(payload);

      expect(authAccountServiceMock.signupWithEmail).not.toHaveBeenCalled();
      expect(authAccountServiceMock.signInWithEmail).not.toHaveBeenCalled();

      const payload2 = { email: 'xyz', password: '' };

      await component.handleSubmit(payload2);

      expect(authAccountServiceMock.signupWithEmail).not.toHaveBeenCalled();
      expect(authAccountServiceMock.signInWithEmail).not.toHaveBeenCalled();
    });

    it('should call authAccountService.signupWithEmail() when the name property is provided', async () => {
      const payload: AuthUserData = {
        email: 'example@example.com',
        password: 'zaq1@WSX',
        name: 'Peter',
      };
      authAccountServiceMock.signupWithEmail.and.returnValue(
        Promise.resolve({
          errors: { alreadyInUseError: true },
        } satisfies AuthReturnCredits)
      );

      await component.handleSubmit(payload);

      expect(authAccountServiceMock.signupWithEmail).toHaveBeenCalled();
    });

    it('should call authAccountService.signInWithEmail() when the name property is provided', async () => {
      const payload: AuthUserData = {
        email: 'example@example.com',
        password: 'zaq1@WSX',
      };
      authAccountServiceMock.signInWithEmail.and.returnValue(
        Promise.resolve({
          errors: { emailDoesNotExist: true },
        } satisfies AuthReturnCredits)
      );

      await component.handleSubmit(payload);

      expect(authAccountServiceMock.signInWithEmail).toHaveBeenCalled();
    });

    it('should call _authErrorGuard() after collecting data from authAccountService method', async () => {
      const payload: AuthUserData = {
        email: 'example@example.com',
        password: 'zaq1@WSX',
      };

      const spy = spyOn(component as any, '_authErrorGuard');

      await component.handleSubmit(payload);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('_authErrorGuard()', () => {
    it('should call _handleAuthErrors() when the property errors exist in the response argument', () => {
      const spy = spyOn(component as any, '_handleAuthErrors');
      const payload: AuthReturnCredits = {
        errors: { unknownError: { code: '123', message: 'Example error' } },
      };

      (component as any)._authErrorGuard(payload);

      expect(spy).toHaveBeenCalled();
    });

    it('should call viewTransitionService.goForward() when there is not errors property in the response object', () => {
      const payload: AuthReturnCredits = {
        registered: true,
        passed: true,
      };

      (component as any)._authErrorGuard(payload);

      expect(viewTransitionServiceMock.goForward).toHaveBeenCalled();
    });
  });

  describe('_handleAuthErrors()', () => {
    describe('formFlags', () => {
      let markForCheckSpy: jasmine.Spy<any>;

      beforeEach(() => {
        markForCheckSpy = spyOn((component as any).cd, 'markForCheck');
      });

      it('should set "alreadyInUseError" property to true if such key exists in errors object', () => {
        const payload: Errors = { alreadyInUseError: true };

        (component as any)._handleAuthErrors(payload);

        expect(component.alreadyInUseError).toBeTrue();
        expect(markForCheckSpy).toHaveBeenCalled();
      });

      it('should set "wrongEmailOrPassword" property to true if such key exists in errors object', () => {
        const payload: Errors = { wrongEmailOrPassword: true };

        (component as any)._handleAuthErrors(payload);

        expect(component.wrongEmailOrPassword).toBeTrue();
        expect(markForCheckSpy).toHaveBeenCalled();
      });

      it('should set "emailDoesNotExist" property to true if such key exists in errors object', () => {
        const payload: Errors = { emailDoesNotExist: true };

        (component as any)._handleAuthErrors(payload);

        expect(component.emailDoesNotExist).toBeTrue();
        expect(markForCheckSpy).toHaveBeenCalled();
      });
    });

    describe('MatSnack calls', () => {
      let spy: jasmine.Spy<any>;

      beforeEach(() => {
        spy = spyOn(matSnackBarMock, 'open');
      });

      it('should open a snackBar for 5 seconds if sendingPostToDB property exists in errors object', () => {
        const payload: Errors = {
          sendingPostToDB: true,
        };

        (component as any)._handleAuthErrors(payload);

        expect(spy).toHaveBeenCalled();
      });

      it('should open a snackBar for 5 seconds if unverifiedEmail property exists in errors object', () => {
        const payload: Errors = { unverifiedEmail: true };
        const spy = viewTransitionServiceMock.goForward;

        (component as any)._handleAuthErrors(payload);

        expect(spy).toHaveBeenCalled();
      });

      it('should open a snackBar for 5 seconds if noEmailProvided property exists in errors object', () => {
        const payload: Errors = { noEmailProvided: true };

        (component as any)._handleAuthErrors(payload);

        expect(spy).toHaveBeenCalled();
      });

      it('should open a snackBar for 5 seconds if unknownError property exists in errors object', () => {
        const payload: Errors = {
          unknownError: { code: '000', message: 'Example error' },
        };

        (component as any)._handleAuthErrors(payload);

        expect(spy).toHaveBeenCalled();
      });

      it('should throw an error when there was passed unknown key to the switch check', () => {
        const payload = { xyz: 'Hello there' };

        expect(() => {
          (component as any)._handleAuthErrors(payload);
        }).toThrow();
      });
    });
  });

  describe('_redirectUser()', () => {
    it('should return "/verify-email" if registered is true', () => {
      const payload: AuthReturnCredits = {
        registered: true,
        passed: true,
      };

      const result = (component as any)._redirectUser(payload);

      expect(result).toBe('/verify-email');
    });

    it(`should return "/verify-email" if user's email is NOT verified`, () => {
      const payload: AuthReturnCredits = {
        registered: false,
        passed: true,
      };
      authStateServiceMock.session.set({
        user: { emailVerified: false },
      } as UserCredential);

      const result = (component as any)._redirectUser(payload);

      expect(result).toBe('/verify-email');
    });

    it('should return "/app" parameter whether component.redirect is falsy', () => {
      const payload: AuthReturnCredits = {
        registered: false,
        passed: true,
      };

      const result = (component as any)._redirectUser(payload);

      expect(result).toBe('/app');
    });

    afterEach(() => {
      authStateServiceMock.session.set(undefined);
    });
  });

  describe('checkParams()', () => {
    it('should set component.register to false if pathElement is "force=login"', () => {
      activatedRouteMock.snapshot.paramMap.get.and.returnValue('force=login');

      (component as any).checkParams();

      expect(component.register).toBe(false);
    });

    it('should set default values if pathElement is falsy', () => {
      activatedRouteMock.snapshot.paramMap.get.and.returnValue('');

      (component as any).checkParams();

      expect(component.register).toBe(true);
      expect(component.redirect).toBe(undefined);
    });

    it('should set component.redirect to "/app" if pathElement is "forward=/app"', () => {
      activatedRouteMock.snapshot.paramMap.get.and.returnValue('forward=/app');

      (component as any).checkParams();

      expect(component.redirect).toBe('/app');
    });

    it('should leave component.redirect to undefined if pathElement is "forward="', () => {
      activatedRouteMock.snapshot.paramMap.get.and.returnValue('forward=');

      (component as any).checkParams();

      expect(component.redirect).toBe(undefined);
    });
  });

  describe('toggleRegister()', () => {
    it('should toggle the component.register property to false if its current state is true', () => {
      component.register = true;

      component.toggleRegister();

      expect(component.register).toBe(false);
    });
  });
});
