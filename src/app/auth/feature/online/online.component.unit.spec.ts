/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OnlineComponent } from './online.component';
import { Provider } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { AuthAccountService } from '../../data-access/account/auth-account.service';
import { AuthStateService } from '../../data-access/state/auth-state.service';
import { AuthUserData } from 'src/app/reusable/data-access/form-common-features/form-common-features.service';
import { Errors } from '../../utils/Models/OnlineAuthModels.interface';
import { User } from '@angular/fire/auth';

describe(`OnlineComponent`, () => {
  // Mocks
  const authAccountServiceMock = jasmine.createSpyObj<AuthAccountService>([
    'continueWithGoogle',
    'getDataFromRedirect',
    'signupWithEmail',
    'signInWithEmail',
  ]);
  const authStateServiceMock = jasmine.createSpyObj<AuthStateService>([
    'rememberMe',
    'sessionSig',
  ]);

  let paramMapValue: string | null = null;
  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: (name) => {
          name;
          return paramMapValue;
        },
      },
    },
  } as ActivatedRoute;

  let viewTransitionService: ViewTransitionService;
  let router: Router;

  // Component
  let fixture: ComponentFixture<OnlineComponent>;
  let component: OnlineComponent;

  beforeEach(() => {
    paramMapValue = null;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, OnlineComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock,
        },
        {
          provide: AuthAccountService,
          useValue: authAccountServiceMock,
        },
        {
          provide: AuthStateService,
          useValue: authStateServiceMock,
        },
        MatSnackBar,
      ] as Provider[],
    });

    fixture = TestBed.createComponent(OnlineComponent);
    component = fixture.componentInstance;
    viewTransitionService = TestBed.inject(ViewTransitionService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  beforeEach(() => {
    spyOn(viewTransitionService as any, '_runTransition');
    spyOn(router, 'navigateByUrl');
  });

  it(`should create`, () => {
    expect(component).toBeTruthy();
  });

  describe(`ViewChildren`, () => {
    it(`should contain a reference to the mainTagRef element.`, () => {
      expect(component['_mainTagRef']).toBeTruthy();
    });
  });

  describe(`Lifecycle hooks`, () => {
    describe(`ngOnInit()`, () => {
      it(`should call _checkParams, _checkTransitionDirection, and googleAuth.`, () => {
        // Arrange
        const checkParamsSpy = spyOn(component as any, '_checkParams');
        const checkTransitionDirectionSpy = spyOn(
          component as any,
          '_checkTransitionDirection'
        );
        const googleAuthSpy = spyOn(component as any, 'googleAuth');

        // Act
        component.ngOnInit();

        // Assert
        expect(checkParamsSpy).toHaveBeenCalled();
        expect(checkTransitionDirectionSpy).toHaveBeenCalled();
        expect(googleAuthSpy).toHaveBeenCalledWith('getDataFromRedirect');
      });
    });
  });

  describe(`methods`, () => {
    describe(`toggleForm()`, () => {
      it(`should emit a negative value to existing inside _registerSubject.`, () => {
        // Arrange
        const registerSubjectNextSpy = spyOn(
          component['_registerSubject'],
          'next'
        );

        // Act
        component.toggleForm();

        // Assert
        expect(registerSubjectNextSpy).toHaveBeenCalledWith(false);
      });
    });

    describe(`googleAuth()`, () => {
      it(`should call continueWithGoogle if the parameter has this method as a value and do nothing if the returned value is undefined.`, async () => {
        // Arrange
        const authErrorGuardSpy = spyOn(component as any, '_authErrorGuard');
        authAccountServiceMock.continueWithGoogle.and.resolveTo(undefined);

        // Act
        await component['googleAuth']('continueWithGoogle');

        // Assert
        expect(authErrorGuardSpy).not.toHaveBeenCalled();
      });

      it(`should call getDataFromRedirect if the parameter has this method as a value and do nothing if the returned value is null.`, async () => {
        // Arrange
        const authErrorGuardSpy = spyOn(component as any, '_authErrorGuard');
        authAccountServiceMock.getDataFromRedirect.and.resolveTo(null);

        // Act
        await component['googleAuth']('continueWithGoogle');

        // Assert
        expect(authErrorGuardSpy).not.toHaveBeenCalled();
      });

      it(`should call _authErrorGuard if the response from one of methods is truthy.`, async () => {
        // Arrange
        const authErrorGuardSpy = spyOn(component as any, '_authErrorGuard');
        authAccountServiceMock.continueWithGoogle.and.resolveTo({});

        // Act
        await component['googleAuth']('continueWithGoogle');

        // Assert
        expect(authErrorGuardSpy).toHaveBeenCalled();
      });
    });

    describe(`handleSubmit()`, () => {
      it(`should call authAccountService.signupWithEmail if displayName parameter is defined.`, async () => {
        // Arrange
        const signupWithEmailSpy =
          authAccountServiceMock.signupWithEmail.and.resolveTo({
            errors: {
              alreadyInUseError: true,
            },
          });
        const payload: AuthUserData = {
          name: 'xyz',
          email: 'example@domain.com',
          password: 'aa4#@R#23r23r',
        };

        // Act
        await component['handleSubmit'](payload);

        // Assert
        expect(signupWithEmailSpy).toHaveBeenCalledWith(
          payload.email,
          payload.password,
          { displayName: payload.name }
        );
      });

      it(`should call authAccountService.signInWithEmail if displayName parameter is defined.`, async () => {
        // Arrange
        const signInWithEmailSpy =
          authAccountServiceMock.signInWithEmail.and.resolveTo({
            errors: {
              emailDoesNotExist: true,
            },
          });
        const payload: AuthUserData = {
          email: 'example@domain.com',
          password: 'aa4#@R#23r23r',
        };

        // Act
        await component['handleSubmit'](payload);

        // Assert
        expect(signInWithEmailSpy).toHaveBeenCalledWith(
          payload.email,
          payload.password
        );
      });
    });

    describe(`updateRememberMe()`, () => {
      it(`should call authStateService.rememberMe with parameter's value`, () => {
        // Arrange
        const rememberMeSpy = authStateServiceMock.rememberMe;

        // Act
        component['updateRememberMe'](true);

        // Assert
        expect(rememberMeSpy).toHaveBeenCalledWith(true);
      });
    });

    describe(`_authErrorGuard()`, () => {
      it(`should call _handleAuthErrors if response parameter has 'errors' property and stop further method execution.`, async () => {
        // Arrange
        const handleAuthErrorsSpy = spyOn(
          component as any,
          '_handleAuthErrors'
        );
        const goForwardSpy = spyOn(viewTransitionService, 'goForward');

        // Act
        await component['_authErrorGuard']({
          errors: { alreadyInUseError: true },
        });

        // Assert
        expect(handleAuthErrorsSpy).toHaveBeenCalled();
        expect(goForwardSpy).not.toHaveBeenCalled();
      });

      it(`should NOT call _handleAuthErrors if response parameter does NOT have 'errors' property.`, async () => {
        // Arrange
        const handleAuthErrorsSpy = spyOn(
          component as any,
          '_handleAuthErrors'
        );
        const goForwardSpy = spyOn(viewTransitionService, 'goForward');

        // Act
        await component['_authErrorGuard']({ registered: true, passed: true });

        // Assert
        expect(handleAuthErrorsSpy).not.toHaveBeenCalled();
        expect(goForwardSpy).toHaveBeenCalled();
      });
    });

    describe(`_handleAuthErrors()`, () => {
      it(`should call one or more methods received from _getErrorMap based on how many errors are present in errors parameter.`, async () => {
        // Arrange
        const formErrorsSubjectNextSpy = spyOn(
          component['_formErrorsSubject'],
          'next'
        ).and.callThrough();
        const errorSpy = spyOn(console, 'error');

        // Act
        component['_handleAuthErrors']({
          alreadyInUseError: true,
        });

        // Assert
        expect(errorSpy).not.toHaveBeenCalled();
        expect(formErrorsSubjectNextSpy).toHaveBeenCalledWith({
          wrongEmailOrPassword: false,
          emailDoesNotExist: false,
          alreadyInUseError: true,
        });
      });

      it(`should log an error if the errors parameter has keys not in the _getErrorMap.`, async () => {
        // Arrange
        const formErrorsSubjectNextSpy = spyOn(
          component['_formErrorsSubject'],
          'next'
        ).and.callThrough();
        const openSpy = spyOn(TestBed.inject(MatSnackBar), 'open');
        const errorSpy = spyOn(console, 'error');

        // Act
        component['_handleAuthErrors']({
          alreadyInUseError: true,
          sendingPostToDB: true,
          unknownError: {
            code: 'example code',
            message: 'Example unknownError message',
          },
          xyz: true,
        } as Errors);

        // Assert
        expect(errorSpy).toHaveBeenCalledWith(
          'Unhandled error property: ',
          'xyz'
        );
        expect(openSpy).not.toHaveBeenCalled();
        expect(formErrorsSubjectNextSpy).toHaveBeenCalledTimes(2);
        expect(formErrorsSubjectNextSpy).toHaveBeenCalledWith({
          wrongEmailOrPassword: false,
          emailDoesNotExist: false,
          alreadyInUseError: true,
        });
      });
    });

    describe(`_getErrorMap()`, () => {
      it(`should return an object with methods handling different auth errors.`, () => {
        // Arrange

        // Act
        const errorMap = component['_getErrorMap']({
          unknownError: {
            code: 'example-error-code',
            message: 'Example error message',
          },
        });

        // Assert
        expect(
          Object.values(errorMap).every((value) => typeof value === 'function')
        ).toBeTrue();
      });

      it(`should emit values to the BehaviorSubject managing error flags.`, () => {
        // Arrange
        const formErrorsSubjectNextSpy = spyOn(
          component['_formErrorsSubject'],
          'next'
        ).and.callThrough();

        // Act
        const errorMap = component['_getErrorMap']({
          unknownError: {
            code: 'example-error-code',
            message: 'Example error message',
          },
        });

        errorMap.alreadyInUseError();
        errorMap.wrongEmailOrPassword();
        errorMap.emailDoesNotExist();

        // Assert
        expect(formErrorsSubjectNextSpy).toHaveBeenCalledTimes(3);
        expect(component['_formErrorsSubject'].value).toEqual({
          alreadyInUseError: true,
          wrongEmailOrPassword: true,
          emailDoesNotExist: true,
        });
      });

      it(`should open a new snackbar with an error message.`, () => {
        // Arrange
        const openSpy = spyOn(MatSnackBar.prototype, 'open');

        // Act
        const errorMap = component['_getErrorMap']({
          unknownError: {
            code: 'example-error-code',
            message: 'Example error message',
          },
        });

        errorMap.sendingPostToDB();
        errorMap.noEmailProvided();
        errorMap.unknownError();

        // Assert
        expect(openSpy).toHaveBeenCalledTimes(3);
      });

      it(`should NOT open a new snackbar if unknownError code equals 'auth/popup-closed-by-user'.`, () => {
        // Arrange
        const openSpy = spyOn(TestBed.inject(MatSnackBar), 'open');

        // Act
        const errorMap = component['_getErrorMap']({
          unknownError: {
            code: 'auth/popup-closed-by-user',
            message: 'Example error message',
          },
        });

        errorMap.unknownError();

        // Assert
        expect(openSpy).not.toHaveBeenCalled();
      });

      it(`should call viewTransitionService.goForward to redirect user to '/verify-email' path if unverifiedEmail gets called.`, () => {
        // Arrange
        const goForwardSpy = spyOn(viewTransitionService, 'goForward');

        // Act
        const errorMap = component['_getErrorMap']({
          unknownError: {
            code: 'auth/popup-closed-by-user',
            message: 'Example error message',
          },
        });

        errorMap.unverifiedEmail();

        // Assert
        expect(goForwardSpy).toHaveBeenCalledWith(
          component['_mainTagRef'].nativeElement,
          '/verify-email'
        );
      });
    });

    describe(`_checkTransitionDirection()`, () => {
      it(`should call _runAnimationOnce if viewTransitionService.goBackClicked is false.`, () => {
        // Arrange
        const runAnimationOnceSpy = spyOn(
          component as any,
          '_runAnimationOnce'
        );

        // Act
        component['_checkTransitionDirection']();

        // Assert
        expect(runAnimationOnceSpy).toHaveBeenCalled();
      });

      it(`should NOT call _runAnimationOnce if viewTransitionService.goBackClicked is true.`, () => {
        // Arrange
        const runAnimationOnceSpy = spyOn(
          component as any,
          '_runAnimationOnce'
        );
        viewTransitionService.goBackClicked = true;

        // Act
        component['_checkTransitionDirection']();

        // Assert
        expect(runAnimationOnceSpy).not.toHaveBeenCalled();
      });
    });

    describe(`_redirectUser()`, () => {
      it(`should return '/verify-email' if registered property inside the parameter is truthy.`, () => {
        // Arrange

        // Act
        const path = component['_redirectUser']({ registered: true });

        // Assert
        expect(path).toEqual('/verify-email');
      });

      it(`should return '/verify-email' if authStateService.sessionSig signal's property emailVerified is falsy.`, () => {
        // Arrange
        authStateServiceMock.sessionSig.and.returnValue({
          emailVerified: false,
        } as User);

        // Act
        const path = component['_redirectUser']({ registered: false });

        // Assert
        expect(path).toEqual('/verify-email');
      });

      it(`should return _redirect value if the user's email is verified.`, () => {
        // Arrange
        const redirectValue = 'settings';
        component['_redirect'] = redirectValue;
        authStateServiceMock.sessionSig.and.returnValue({
          emailVerified: true,
        } as User);

        // Act
        const path = component['_redirectUser']({ registered: false });

        // Assert
        expect(path).toEqual('/' + redirectValue);
      });

      it(`should return '/app' value if the user's email is verified AND _redirect is falsy.`, () => {
        // Arrange
        authStateServiceMock.sessionSig.and.returnValue({
          emailVerified: true,
        } as User);

        // Act
        const path = component['_redirectUser']({ registered: false });

        // Assert
        expect(path).toEqual('/app');
      });
    });

    describe(`_checkParams()`, () => {
      it(`should emit default new data to _registerSubject and _redirect if no dynamic params have been passed.`, () => {
        // Arrange
        const registerSubjectNextSpy = spyOn(
          component['_registerSubject'],
          'next'
        );

        // Act
        component['_checkParams']();

        // Assert
        expect(registerSubjectNextSpy).toHaveBeenCalledWith(true);
        expect(component['_redirect']).toBe(undefined);
      });

      it(`should emit custom new data to _registerSubject and _redirect if proper actionParams have been passed.`, () => {
        // Arrange
        const registerSubjectNextSpy = spyOn(
          component['_registerSubject'],
          'next'
        );
        paramMapValue = 'forward=_app_settings';

        // Act
        component['_checkParams']();

        // Assert
        expect(registerSubjectNextSpy).toHaveBeenCalledWith(true);
        expect(component['_redirect']).toBe('/app/settings');
      });
    });
  });
});
