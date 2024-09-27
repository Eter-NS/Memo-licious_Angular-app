/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DeferBlockBehavior,
  DeferBlockFixture,
  DeferBlockState,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';
import { OnlineComponent } from './online.component';
import { Component, DebugElement, Provider } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { redirectLoggedInToApp } from 'src/app/app.routes';
import { provideLocationMocks } from '@angular/common/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { of } from 'rxjs';
import {
  Auth,
  UserCredential,
  browserLocalPersistence,
} from '@angular/fire/auth';
import {
  DataSnapshot,
  Database,
  DatabaseReference,
} from '@angular/fire/database';
import { Storage } from '@angular/fire/storage';
import { firebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service.mock';
import { firebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service.mock';
import { firebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service.mock';
import { FirebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service';
import { FirebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service';
import { FirebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service';
import { By } from '@angular/platform-browser';
import { OnlineLoginComponent } from '../../ui/online-login/online-login.component';
import { OnlineRegisterComponent } from '../../ui/online-register/online-register.component';
import { PreviousPageButtonComponent } from 'src/app/reusable/ui/previous-page-button/previous-page-button.component';
import { AuthUserData } from 'src/app/reusable/data-access/form-common-features/form-common-features.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthAccountService } from '../../data-access/account/auth-account.service';

@Component({
  standalone: true,
  selector: 'app-test',
  template: `Test component works!`,
})
class TestComponent {}

const correctRegisterPayload: AuthUserData = {
  name: 'Nick',
  email: 'exampleEmail@example.com',
  password: 'sadasd&37343#43fE1qefef',
};

const correctLoginPayload: AuthUserData = {
  email: 'exampleEmail@example.com',
  password: 'sadasd&37343#43fE1qefef',
};

describe('OnlineComponent - integration', () => {
  // Mocks
  const authMock = jasmine.createSpyObj<Auth>(['setPersistence']);
  const firebaseAuthControllerServiceMock = firebaseAuthControllerService;
  const firebaseDatabaseControllerServiceMock = {
    ...firebaseDatabaseControllerService,
    db: {} as Database,
  };
  const firebaseStorageControllerServiceMock = {
    ...firebaseStorageControllerService,
    storage: {} as Storage,
  };

  function onlineDatabaseUserCheck(exists = false) {
    firebaseDatabaseControllerServiceMock.ref.and.returnValue(
      {} as DatabaseReference
    );
    firebaseDatabaseControllerServiceMock.get.and.resolveTo({
      exists: () => exists,
    } as DataSnapshot);
    firebaseDatabaseControllerServiceMock.set.and.resolveTo();
  }

  // Component
  let harness: RouterTestingHarness;
  let component: OnlineComponent;

  let authAccountService: AuthAccountService;
  let viewTransitionService: ViewTransitionService;
  let router: Router;

  beforeEach(() => {
    firebaseAuthControllerServiceMock.user.and.returnValue(of(null));
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      imports: [NoopAnimationsModule, OnlineComponent],
      providers: [
        provideRouter([
          {
            path: 'app',
            component: TestComponent,
          },
          {
            path: 'verify-email',
            component: TestComponent,
          },
          {
            path: 'getting-started/choose-path',
            component: TestComponent,
          },
          {
            path: 'online',
            canActivate: [redirectLoggedInToApp],
            children: [
              {
                path: ':siteAction',
                loadComponent: () =>
                  import('./online.component').then((m) => m.OnlineComponent),
              },
              {
                path: '',
                loadComponent: () =>
                  import('./online.component').then((m) => m.OnlineComponent),
              },
            ],
          },
        ]),
        provideLocationMocks(),
        {
          provide: Auth,
          useValue: authMock,
        },
        {
          provide: FirebaseAuthControllerService,
          useValue: firebaseAuthControllerServiceMock,
        },
        {
          provide: FirebaseDatabaseControllerService,
          useValue: firebaseDatabaseControllerServiceMock,
        },
        {
          provide: FirebaseStorageControllerService,
          useValue: firebaseStorageControllerServiceMock,
        },
        ViewTransitionService,
      ] as Provider[],
    });
    harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl('/online', OnlineComponent);
    authAccountService = TestBed.inject(AuthAccountService);
    viewTransitionService = TestBed.inject(ViewTransitionService);
    router = TestBed.inject(Router);
    harness.detectChanges();
  });

  beforeEach(() => {
    spyOn(viewTransitionService as any, '_runTransition').and.resolveTo();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('render', () => {
    let buttonComponent: DebugElement;

    beforeEach(() => {
      buttonComponent = harness.routeDebugElement!.query(
        By.directive(PreviousPageButtonComponent)
      );
    });

    it('should render PreviousPageButton component.', () => {
      expect(buttonComponent.nativeElement).toBeTruthy();
    });

    it('should call viewTransitionService.goBack and move user to /getting-started/choose-path.', async () => {
      // Arrange
      const spy = spyOn(viewTransitionService, 'goBack').and.callThrough();
      const viewContainer = harness.routeDebugElement!.query(
        By.css('.content')
      );
      const expectedPath = '/getting-started/choose-path';

      // Act
      buttonComponent.triggerEventHandler('clicked');
      await harness.fixture.whenStable();

      // Assert
      expect(spy).toHaveBeenCalledWith(
        viewContainer.nativeElement,
        expectedPath
      );
      expect(router.url).toEqual(expectedPath);
    });

    describe(`defer blocks`, () => {
      describe(`register`, () => {
        let deferBlock: DeferBlockFixture;

        beforeEach(async () => {
          deferBlock = (await harness.fixture.getDeferBlocks())[0];
        });

        it(`should display span element if loading wasn't started yet.`, async () => {
          // Arrange
          // Act
          await deferBlock.render(DeferBlockState.Placeholder);
          const element = harness.routeDebugElement!.query(
            By.css('[data-test="loading-state-register"]')
          ).nativeElement;

          // Assert
          expect(component['_registerSubject'].value).toBeTrue();
          expect(element).toBeTruthy();
        });

        it(`should display material spinner if loading was started.`, async () => {
          // Arrange
          // Act
          await deferBlock.render(DeferBlockState.Loading);
          const element = harness.routeDebugElement!.query(
            By.css('[data-test="loading-register-component"]')
          ).nativeElement;

          // Assert
          expect(component['_registerSubject'].value).toBeTrue();
          expect(element).toBeTruthy();
        });

        it(`should display FetchError Component if error occurred.`, async () => {
          // Arrange
          // Act
          await deferBlock.render(DeferBlockState.Error);
          const element = harness.routeDebugElement!.query(
            By.css('[data-test="register-component-error"]')
          ).nativeElement;

          // Assert
          expect(component['_registerSubject'].value).toBeTrue();
          expect(element).toBeTruthy();
        });

        it(`should display GuestRegister Component if loading completed successfully.`, async () => {
          // Arrange
          // Act
          await deferBlock.render(DeferBlockState.Complete);
          const element = harness.routeDebugElement!.query(
            By.css('[data-test="register-form"]')
          );

          // Assert
          expect(component['_registerSubject'].value).toBeTrue();
          expect(
            element.componentInstance instanceof OnlineRegisterComponent
          ).toBeTruthy();
        });
      });

      describe(`login`, () => {
        let deferBlock: DeferBlockFixture;

        beforeEach(async () => {
          harness.routeDebugElement
            ?.query(By.css(`[data-test="to-login-button"]`))
            .triggerEventHandler('click', null);
          harness.detectChanges();

          deferBlock = (await harness.fixture.getDeferBlocks())[0];
        });

        it(`should display span element if loading wasn't started yet.`, async () => {
          // Arrange
          // Act
          await deferBlock.render(DeferBlockState.Placeholder);
          const element = harness.routeDebugElement!.query(
            By.css('[data-test="loading-state-login"]')
          ).nativeElement;

          // Assert
          expect(component['_registerSubject'].value).toBeFalse();
          expect(element).toBeTruthy();
        });

        it(`should display material spinner if loading was started.`, async () => {
          // Arrange
          // Act
          await deferBlock.render(DeferBlockState.Loading);
          const element = harness.routeDebugElement!.query(
            By.css('[data-test="loading-login-component"]')
          ).nativeElement;

          // Assert
          expect(component['_registerSubject'].value).toBeFalse();
          expect(element).toBeTruthy();
        });

        it(`should display FetchError Component if error occurred.`, async () => {
          // Arrange
          // Act
          await deferBlock.render(DeferBlockState.Error);
          const element = harness.routeDebugElement!.query(
            By.css('[data-test="login-component-error"]')
          ).nativeElement;

          // Assert
          expect(component['_registerSubject'].value).toBeFalse();
          expect(element).toBeTruthy();
        });

        it(`should display GuestLogin Component if loading completed successfully.`, async () => {
          // Arrange
          // Act
          await deferBlock.render(DeferBlockState.Complete);
          const element = harness.routeDebugElement!.query(
            By.css('[data-test="login-form"]')
          );

          // Assert
          expect(component['_registerSubject'].value).toBeFalse();
          expect(
            element.componentInstance instanceof OnlineLoginComponent
          ).toBeTruthy();
        });
      });
    });

    describe(`component's content`, () => {
      it('should call the toggleForm() if "to-login-button" has had an interaction with user.', () => {
        // Arrange
        const spy = spyOn(component, 'toggleForm');
        const button = harness.routeDebugElement!.query(
          By.css('[data-test="to-login-button"]')
        );

        // Act
        button.triggerEventHandler('click', null);
        button.triggerEventHandler('keyup.enter', null);

        // Assert
        expect(spy).toHaveBeenCalledTimes(2);
      });

      it('should call the toggleForm() if "to-register-button" has had an interaction with user.', () => {
        component['_registerSubject'].next(false);
        harness.detectChanges();
        const spy = spyOn(component, 'toggleForm');
        const button = harness.routeDebugElement!.query(
          By.css('[data-test="to-register-button"]')
        );

        button.triggerEventHandler('click', null);
        button.triggerEventHandler('keyup.enter', null);

        expect(spy).toHaveBeenCalledTimes(2);
      });

      it(`should show a button allowing user to switch to logging in by default.`, async () => {
        // Arrange

        // Act
        const loginButton = harness.routeDebugElement!.query(
          By.css('[data-test="to-login-button"]')
        ).nativeElement;

        // Assert
        expect(loginButton).toBeTruthy();
      });

      it(`should show a button allowing user to switch to registering after clicking the log in button.`, async () => {
        // Arrange
        const loginButton = harness.routeDebugElement!.query(
          By.css('[data-test="to-login-button"]')
        ).nativeElement;

        // Act
        loginButton.click();
        harness.detectChanges();

        const registerButton = harness.routeDebugElement!.query(
          By.css('[data-test="to-register-button"]')
        ).nativeElement;

        // Assert
        expect(registerButton).toBeTruthy();
      });

      it(`should show a button allowing user to reset password after clicking the log in button.`, async () => {
        // Arrange
        const loginButton = harness.routeDebugElement!.query(
          By.css('[data-test="to-login-button"]')
        ).nativeElement;

        // Act
        loginButton.click();
        harness.detectChanges();

        const forgotPasswordButton = harness.routeDebugElement!.query(
          By.css('[data-test="forgot-password-button"]')
        ).nativeElement;

        // Assert
        expect(forgotPasswordButton).toBeTruthy();
      });
    });
  });

  describe(`registering`, () => {
    let registerFormComponent: DebugElement;

    beforeEach(async () => {
      await (
        await harness.fixture.getDeferBlocks()
      )[0].render(DeferBlockState.Complete);

      registerFormComponent = harness.routeDebugElement!.query(
        By.directive(OnlineRegisterComponent)
      );
    });

    it(`should open a snackbar message if fireAuthController.createUserWithEmailAndPassword promise rejects.`, fakeAsync(() => {
      // Arrange
      const setSpy =
        firebaseAuthControllerServiceMock.createUserWithEmailAndPassword.and.rejectWith(
          {
            code: 'auth/email-already-in-use',
            message: 'The account already exists with the given email address.',
          }
        );
      const formErrorsSubjectNextSpy = spyOn(
        component['_formErrorsSubject'],
        'next'
      ).and.callThrough();

      // Act
      registerFormComponent.triggerEventHandler('data', correctRegisterPayload);
      flush();

      // Assert
      expect(setSpy).toHaveBeenCalled();
      expect(formErrorsSubjectNextSpy).toHaveBeenCalledWith({
        ...component['_formErrorsSubject'].value,
        alreadyInUseError: true,
      });
    }));

    it(`should go to /verify-email route if the user was created successfully.`, fakeAsync(() => {
      // Arrange
      firebaseAuthControllerServiceMock.createUserWithEmailAndPassword.and.resolveTo(
        {
          user: {
            email: correctRegisterPayload.email,
            emailVerified: false,
          },
        } as UserCredential
      );
      onlineDatabaseUserCheck();

      const goForwardSpy = spyOn(
        viewTransitionService,
        'goForward'
      ).and.callThrough();

      // Act
      registerFormComponent.triggerEventHandler('data', correctRegisterPayload);

      flush();

      // Assert
      expect(goForwardSpy).toHaveBeenCalled();
      expect(router.url).toEqual('/verify-email');
    }));
  });

  describe(`logging in`, () => {
    let loginFormComponent: DebugElement;

    beforeEach(async () => {
      harness
        .routeDebugElement!.query(By.css('[data-test="to-login-button"]'))
        .triggerEventHandler('click', null);
      harness.detectChanges();

      await (
        await harness.fixture.getDeferBlocks()
      )[0].render(DeferBlockState.Complete);

      loginFormComponent = harness.routeDebugElement!.query(
        By.directive(OnlineLoginComponent)
      );
    });

    it(`should change user persistance to local if OnlineLogin component emits rememberMe event with value true.`, fakeAsync(() => {
      // Arrange
      const setPersistenceSpy = authMock.setPersistence;

      // Act
      loginFormComponent.triggerEventHandler('rememberMe', true);

      // Assert
      expect(setPersistenceSpy).toHaveBeenCalledWith(browserLocalPersistence);
    }));

    it(`should set wrongCredentials to true if user gave wrong login credentials.`, fakeAsync(() => {
      // Arrange
      const signInWithEmailAndPasswordSpy =
        firebaseAuthControllerServiceMock.signInWithEmailAndPassword.and.rejectWith(
          {
            code: 'auth/user-not-found',
            message: 'example error message',
          }
        );
      const formErrorsSubjectNextSpy = spyOn(
        component['_formErrorsSubject'],
        'next'
      ).and.callThrough();

      // Act
      loginFormComponent.triggerEventHandler('data', correctLoginPayload);

      flush();

      // Assert
      expect(signInWithEmailAndPasswordSpy).toHaveBeenCalled();
      expect(formErrorsSubjectNextSpy).toHaveBeenCalledWith({
        ...component['_formErrorsSubject'].value,
        emailDoesNotExist: true,
      });
    }));

    it(`should open an error message in snackbar if something went wrong.`, fakeAsync(() => {
      // Arrange
      const signInWithEmailAndPasswordSpy =
        firebaseAuthControllerServiceMock.signInWithEmailAndPassword.and.rejectWith(
          { code: 'xyz', message: 'An example unknown error' }
        );
      const openSpy = spyOn(MatSnackBar.prototype, 'open');

      // Act
      loginFormComponent.triggerEventHandler('data', correctLoginPayload);

      flush();

      // Assert
      expect(signInWithEmailAndPasswordSpy).toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledWith(
        'An example unknown error',
        'close',
        { duration: 5000 }
      );
    }));

    it(`should go to /verify-email route if the user was logged in successfully but emailVerified is false.`, fakeAsync(() => {
      // Arrange
      firebaseAuthControllerServiceMock.signInWithEmailAndPassword.and.resolveTo(
        {
          user: {
            emailVerified: false,
            displayName: correctLoginPayload.name,
          },
        } as UserCredential
      );
      const goForwardSpy = spyOn(
        viewTransitionService,
        'goForward'
      ).and.callThrough();

      // Act
      loginFormComponent.triggerEventHandler('data', correctLoginPayload);

      flush();

      // Assert
      expect(goForwardSpy).toHaveBeenCalled();
      expect(router.url).toEqual('/verify-email');
    }));

    it(`should go to /app route if the user was logged in successfully.`, fakeAsync(() => {
      // Arrange
      firebaseAuthControllerServiceMock.signInWithEmailAndPassword.and.resolveTo(
        {
          user: {
            emailVerified: true,
            displayName: correctLoginPayload.name,
          },
        } as UserCredential
      );
      const goForwardSpy = spyOn(
        viewTransitionService,
        'goForward'
      ).and.callThrough();

      // Act
      loginFormComponent.triggerEventHandler('data', correctLoginPayload);

      flush();

      // Assert
      expect(goForwardSpy).toHaveBeenCalled();
      expect(router.url).toEqual('/app');
    }));
  });

  describe(`google auth`, () => {
    let googleAuthButton: DebugElement;

    beforeEach(() => {
      googleAuthButton = harness.routeDebugElement!.query(
        By.css('[data-test="google-auth-button"]')
      );
    });

    describe(`redirect`, () => {
      it(`should load the Online component if authAccountService.getDataFromRedirect returns null.`, fakeAsync(() => {
        // Arrange
        const authErrorGuardSpy = spyOn(component as any, '_authErrorGuard');
        firebaseAuthControllerServiceMock.getRedirectResult.and.resolveTo(null);

        // Act
        component['googleAuth']('getDataFromRedirect');

        flush();

        // Assert
        expect(authErrorGuardSpy).not.toHaveBeenCalled();
      }));

      it(`should call fireAuthController.signInWithRedirect if user's device is mobile/tablet (Step 1).`, fakeAsync(() => {
        // Arrange
        spyOn(authAccountService, '_isMobileDevice').and.returnValue(true);
        const signInWithRedirectSpy =
          firebaseAuthControllerServiceMock.signInWithRedirect.and.resolveTo(
            undefined
          );

        // Act
        googleAuthButton.triggerEventHandler('click');

        flush();

        // Assert
        expect(signInWithRedirectSpy).toHaveBeenCalled();
      }));

      it(`should redirect user to /verify-email if email is not verified.`, fakeAsync(() => {
        // Arrange
        firebaseAuthControllerServiceMock.getRedirectResult.and.resolveTo({
          user: {
            email: 'example@example.com',
            emailVerified: false,
          },
        } as UserCredential);
        onlineDatabaseUserCheck();

        // Act
        component['googleAuth']('getDataFromRedirect');

        flush();

        // Assert
        expect(router.url).toEqual('/verify-email');
      }));

      it(`should redirect user to /app if email is verified.`, fakeAsync(() => {
        // Arrange
        firebaseAuthControllerServiceMock.getRedirectResult.and.resolveTo({
          user: {
            email: 'example@example.com',
            emailVerified: true,
          },
        } as UserCredential);
        onlineDatabaseUserCheck(true);

        // Act
        component['googleAuth']('getDataFromRedirect');

        flush();

        // Assert
        expect(router.url).toEqual('/app');
      }));
    });

    describe(`popup`, () => {
      it(`should do nothing when fireAuthController.signInWithPopup rejects with the 'auth/popup-closed-by-user' error.`, fakeAsync(() => {
        // Arrange
        const openSpy = spyOn(MatSnackBar.prototype, 'open');
        const formErrorsSubjectNextSpy = spyOn(
          component['_formErrorsSubject'],
          'next'
        ).and.callThrough();
        firebaseAuthControllerServiceMock.signInWithPopup.and.rejectWith({
          code: 'auth/popup-closed-by-user',
          message: 'Example error message',
        });

        // Act
        googleAuthButton.triggerEventHandler('click');

        flush();

        // Assert
        expect(openSpy).not.toHaveBeenCalled();
        expect(formErrorsSubjectNextSpy).toHaveBeenCalledOnceWith({
          alreadyInUseError: false,
          wrongEmailOrPassword: false,
          emailDoesNotExist: false,
        });
      }));

      it(`should call fireAuthController.signInWithPopup if user's device is a laptop/PC etc. and redirect to /verify-email if email is not verified.`, fakeAsync(() => {
        // Arrange
        spyOn(authAccountService, '_isMobileDevice').and.returnValue(false);
        const signInWithPopupSpy =
          firebaseAuthControllerServiceMock.signInWithPopup.and.resolveTo({
            user: {
              email: 'example@email.com',
              emailVerified: false,
              displayName: 'Example name',
            },
          } as UserCredential);
        onlineDatabaseUserCheck();

        // Act
        googleAuthButton.triggerEventHandler('click');

        flush();

        // Assert
        expect(signInWithPopupSpy).toHaveBeenCalled();
        expect(router.url).toEqual('/verify-email');
      }));

      it(`should call fireAuthController.signInWithPopup if user's device is a laptop/PC etc. and redirect to /app if email is verified.`, fakeAsync(() => {
        // Arrange
        spyOn(authAccountService, '_isMobileDevice').and.returnValue(false);
        const signInWithPopupSpy =
          firebaseAuthControllerServiceMock.signInWithPopup.and.resolveTo({
            user: {
              email: 'example@email.com',
              emailVerified: true,
              displayName: 'Example name',
            },
          } as UserCredential);
        onlineDatabaseUserCheck(true);

        // Act
        googleAuthButton.triggerEventHandler('click');

        flush();

        // Assert
        expect(signInWithPopupSpy).toHaveBeenCalled();
        expect(router.url).toEqual('/app');
      }));
    });
  });
});
