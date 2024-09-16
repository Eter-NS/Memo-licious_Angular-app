/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DeferBlockBehavior,
  DeferBlockFixture,
  DeferBlockState,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';
import { GuestComponent } from './guest.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthLocalUserService } from '../../data-access/local-user/auth-local-user.service';
import { redirectLoggedInToApp } from 'src/app/app.routes';
import { randomId } from 'src/app/reusable/utils/data-tools/objectTools';
import { hsl } from 'random-color-creator';
import { Component, DebugElement, Provider } from '@angular/core';
import { LocalUserAccount } from '../../utils/Models/LocalAuthModels.interface';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { By } from '@angular/platform-browser';
import { PreviousPageButtonComponent } from 'src/app/reusable/ui/previous-page-button/previous-page-button.component';
import { RouterTestingHarness } from '@angular/router/testing';
import { Auth } from '@angular/fire/auth';
import { firebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service.mock';
import { FirebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service';
import { Database } from '@angular/fire/database';
import { firebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service.mock';
import { FirebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service';
import { firebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service.mock';
import { Storage } from '@angular/fire/storage';
import { FirebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service';
import { of } from 'rxjs';
import { GuestRegisterComponent } from '../../ui/guest-register/guest-register.component';
import { GuestLoginComponent } from '../../ui/guest-login/guest-login.component';
import { LocalAuthUserData } from 'src/app/reusable/data-access/form-common-features/form-common-features.service';

@Component({
  standalone: true,
  selector: 'app-test',
  template: `Test component works!`,
})
class TestComponent {}

const exampleLocalUser: LocalUserAccount = {
  auth: {
    authOption: 'pin',
    name: 'test',
    value: '8563',
  },
  profileColor: hsl({
    alphaChannel: 1,
    colorParts: ['', '', ''],
    optionsObj: {
      hsl: {
        saturation: { minValue: 25 },
        lightness: { minValue: 25, maxValue: 50 },
      },
    },
  }) as string,
  groups: [
    {
      id: randomId(27),
      createdAt: Date.now(),
      title: 'Hello World',
      notes: [
        {
          id: randomId(27),
          createdAt: Date.now(),
          value: 'XYZ',
        },
      ],
    },
  ],
};

describe('GuestComponent - integration', () => {
  // Mocks
  const authMock = jasmine.createSpyObj<Auth>(['setPersistence']);
  const firebaseAuthControllerServiceMock = firebaseAuthControllerService;
  firebaseAuthControllerServiceMock.user.and.returnValue(of(null));

  const firebaseDatabaseControllerServiceMock = {
    ...firebaseDatabaseControllerService,
    db: {} as Database,
  };
  const firebaseStorageControllerServiceMock = {
    ...firebaseStorageControllerService,
    storage: {} as Storage,
  };

  // Component
  let harness: RouterTestingHarness;
  let component: GuestComponent;

  beforeEach(() => {
    localStorage.setItem('userData', JSON.stringify([exampleLocalUser]));
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      imports: [NoopAnimationsModule, GuestComponent],
      providers: [
        provideRouter([
          {
            path: 'app',
            component: TestComponent,
          },
          {
            path: 'getting-started/choose-path',
            component: TestComponent,
          },
          {
            path: 'guest',
            canActivate: [redirectLoggedInToApp],
            children: [
              {
                path: ':siteAction',
                loadComponent: () =>
                  import('./guest.component').then((m) => m.GuestComponent),
              },
              {
                path: '',
                loadComponent: () =>
                  import('./guest.component').then((m) => m.GuestComponent),
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
      ] as Provider[],
    });
    harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl('/guest', GuestComponent);
    harness.detectChanges();
  });

  beforeEach(() => {
    spyOn(
      ViewTransitionService.prototype as any,
      '_runTransition'
    ).and.resolveTo();
  });

  it('should be created', () => {
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
      const spy = spyOn(
        ViewTransitionService.prototype,
        'goBack'
      ).and.callThrough();
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
      expect(TestBed.inject(Router).url).toEqual(expectedPath);
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
            element.componentInstance instanceof GuestRegisterComponent
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
            element.componentInstance instanceof GuestLoginComponent
          ).toBeTruthy();
        });
      });
    });

    describe(`component's content`, () => {
      it('should call the toggleForm() when "to-login-button" has had an interaction with user.', () => {
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

      it('should call the toggleForm() when "to-register-button" has had an interaction with user.', () => {
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
    });
  });

  describe(`registering`, () => {
    let registerFormComponent: DebugElement;

    beforeEach(async () => {
      await (
        await harness.fixture.getDeferBlocks()
      )[0].render(DeferBlockState.Complete);

      registerFormComponent = harness.routeDebugElement!.query(
        By.directive(GuestRegisterComponent)
      );
    });

    it(`should open a snackbar message when something went wrong.`, async () => {
      // Arrange
      const spy = spyOn(
        AuthLocalUserService.prototype,
        'createUser'
      ).and.callThrough();
      const openSpy = spyOn(MatSnackBar.prototype, 'open');

      // Act
      registerFormComponent.triggerEventHandler('data', {
        name: exampleLocalUser.auth.name,
        pinGroup: {
          pin: exampleLocalUser.auth.value,
          confirmPin: exampleLocalUser.auth.value,
        },
      } satisfies LocalAuthUserData);
      await harness.fixture.whenStable();

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalled();
    });

    it(`should go to /app route if the user was created successfully.`, fakeAsync(() => {
      // Arrange
      const goForwardSpy = spyOn(
        ViewTransitionService.prototype,
        'goForward'
      ).and.callThrough();

      // Act
      registerFormComponent.triggerEventHandler('data', {
        name: 'example1',
        pinGroup: {
          pin: '38564',
          confirmPin: '38564',
        },
      } satisfies LocalAuthUserData);

      flush();

      // Assert
      expect(goForwardSpy).toHaveBeenCalled();
      expect(TestBed.inject(Router).url).toEqual('/app');
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
        By.directive(GuestLoginComponent)
      );
    });

    it(`should set wrongCredentials to true if user gave wrong login credentials.`, async () => {
      // Arrange
      const nextSpy = spyOn(
        component['_wrongCredentialsSubject'],
        'next'
      ).and.callThrough();

      // Act
      loginFormComponent.triggerEventHandler('data', {
        name: 'example1',
        passphrase: 'swdsadas#@43fFAF',
      } satisfies LocalAuthUserData);

      harness.detectChanges();
      await harness.fixture.whenStable();

      // Assert
      expect(nextSpy).toHaveBeenCalledWith(true);
    });

    it(`should open a snackbar message when something went wrong.`, async () => {
      // Arrange
      const nextSpy = spyOn(MatSnackBar.prototype, 'open');
      localStorage.clear();

      // Act
      loginFormComponent.triggerEventHandler('data', {
        name: 'example1',
        passphrase: 'swdsadas#@43fFAF',
      } satisfies LocalAuthUserData);

      harness.detectChanges();
      await harness.fixture.whenStable();

      // Assert
      expect(nextSpy).toHaveBeenCalled();
    });

    it(`should go to /app route if the user was logged in successfully.`, fakeAsync(() => {
      // Arrange
      const goForwardSpy = spyOn(
        ViewTransitionService.prototype,
        'goForward'
      ).and.callThrough();

      // Act
      loginFormComponent.triggerEventHandler('data', {
        name: exampleLocalUser.auth.name,
        passphrase: exampleLocalUser.auth.value,
      } satisfies LocalAuthUserData);

      flush();

      // Assert
      expect(goForwardSpy).toHaveBeenCalled();
      expect(TestBed.inject(Router).url).toEqual('/app');
    }));
  });
});
