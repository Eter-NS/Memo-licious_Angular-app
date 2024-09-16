/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuestComponent } from './guest.component';
import { Provider } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { AuthLocalUserService } from '../../data-access/local-user/auth-local-user.service';
import {
  LocalUserAccount,
  LocalUsers,
} from '../../utils/Models/LocalAuthModels.interface';
import { LocalAuthUserData } from 'src/app/reusable/data-access/form-common-features/form-common-features.service';
import { hsl } from 'random-color-creator';
import { randomId } from 'src/app/reusable/utils/data-tools/objectTools';

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

describe(`Guest Component`, () => {
  // Mocks
  let allUsers: LocalUsers[] = [];
  const authLocalUserServiceMock: Partial<AuthLocalUserService> = {
    allUsers,
    createUser: jasmine.createSpy(
      'createUser',
      AuthLocalUserService.prototype.createUser
    ),
    logIn: jasmine.createSpy('logInUser', AuthLocalUserService.prototype.logIn),
  };

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
  const matSnackBarMock = jasmine.createSpyObj<MatSnackBar>(['open']);

  let viewTransitionServiceSpy: ViewTransitionService;

  // Component
  let fixture: ComponentFixture<GuestComponent>;
  let component: GuestComponent;

  beforeEach(() => {
    allUsers = [];
    paramMapValue = null;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, GuestComponent],
      providers: [
        {
          provide: AuthLocalUserService,
          useValue: authLocalUserServiceMock,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock,
        },
        {
          provide: MatSnackBar,
          useValue: matSnackBarMock,
        },
      ] as Provider[],
    });

    fixture = TestBed.createComponent(GuestComponent);
    component = fixture.componentInstance;
    viewTransitionServiceSpy = TestBed.inject(ViewTransitionService);
    fixture.detectChanges();
  });

  beforeEach(() => {
    spyOn(TestBed.inject(Router), 'navigateByUrl');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe(`ViewChildren`, () => {
    it(`should contain a reference to the mainTagRef element.`, () => {
      // Arrange
      // Act
      // Assert
      expect(component['_mainTagRef']).toBeTruthy();
    });
  });

  describe(`Lifecycle hooks`, () => {
    describe(`ngOnInit()`, () => {
      it(`should call _checkParams and _checkTransitionDirection.`, () => {
        // Arrange
        const checkParamsSpy = spyOn(component as any, '_checkParams');
        const checkTransitionDirectionSpy = spyOn(
          component as any,
          '_checkTransitionDirection'
        );

        // Act
        component.ngOnInit();

        // Assert
        expect(checkParamsSpy).toHaveBeenCalled();
        expect(checkTransitionDirectionSpy).toHaveBeenCalled();
      });
    });
  });

  describe(`methods`, () => {
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

      it(`shouldn't call _runAnimationOnce if viewTransitionService.goBackClicked is true.`, () => {
        // Arrange
        const runAnimationOnceSpy = spyOn(
          component as any,
          '_runAnimationOnce'
        );
        viewTransitionServiceSpy.goBackClicked = true;

        // Act
        component['_checkTransitionDirection']();

        // Assert
        expect(runAnimationOnceSpy).not.toHaveBeenCalled();
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

    describe(`updateRememberMe()`, () => {
      it(`should assign a new boolean value to _rememberMe.`, () => {
        // Arrange
        component['_rememberMe'] = false;

        // Act
        component['updateRememberMe'](true);

        // Assert
        expect(component['_rememberMe']).toBe(true);
      });
    });

    describe(`handleRegister()`, () => {
      it(`should call snackBar.open if an error has been returned from authLocalUserService.createUser.`, async () => {
        // Arrange
        const openSpy = spyOn(MatSnackBar.prototype, 'open');
        const goForwardSpy = spyOn(
          viewTransitionServiceSpy,
          'goForward'
        ).and.resolveTo(undefined);

        (authLocalUserServiceMock.createUser as jasmine.Spy).and.returnValue({
          message: 'Example error',
        });

        // Act
        await component['handleRegister']({
          name: exampleLocalUser.auth.name,
          pinGroup: {
            pin: exampleLocalUser.auth.value,
            confirmPin: exampleLocalUser.auth.value,
          },
        } satisfies LocalAuthUserData);

        // Assert
        expect(openSpy).toHaveBeenCalled();
        expect(goForwardSpy).not.toHaveBeenCalled();
      });

      it(`should call viewTransitionService.goForward if a user was created successfully (pin).`, async () => {
        // Arrange
        const openSpy = spyOn(MatSnackBar.prototype, 'open');
        const goForwardSpy = spyOn(
          viewTransitionServiceSpy,
          'goForward'
        ).and.resolveTo(undefined);

        (authLocalUserServiceMock.createUser as jasmine.Spy).and.returnValue(
          undefined
        );

        // Act
        component['handleRegister']({
          name: 'example1',
          pinGroup: {
            pin: '38564',
            confirmPin: '38564',
          },
        } satisfies LocalAuthUserData);

        // Assert
        expect(openSpy).not.toHaveBeenCalled();
        expect(goForwardSpy).toHaveBeenCalled();
      });

      it(`should call viewTransitionService.goForward if a user was created successfully (password).`, async () => {
        // Arrange
        const openSpy = spyOn(MatSnackBar.prototype, 'open');
        const goForwardSpy = spyOn(
          viewTransitionServiceSpy,
          'goForward'
        ).and.resolveTo(undefined);

        (authLocalUserServiceMock.createUser as jasmine.Spy).and.returnValue(
          undefined
        );

        // Act
        component['handleRegister']({
          name: 'example1',
          passwordGroup: {
            password: 'dadsad$5425SA$%@aAS',
            confirmPassword: 'dadsad$5425SA$%@aAS',
          },
        } satisfies LocalAuthUserData);

        // Assert
        expect(openSpy).not.toHaveBeenCalled();
        expect(goForwardSpy).toHaveBeenCalled();
      });
    });

    describe(`handleLogin()`, () => {
      it(`should call wrongCredentialsSubject.next if passphrase argument is falsy.`, async () => {
        // Arrange
        const wrongCredentialsSubjectNextSpy = spyOn(
          component['_wrongCredentialsSubject'],
          'next'
        );
        const openSpy = spyOn(MatSnackBar.prototype, 'open');
        const goForwardSpy = spyOn(
          viewTransitionServiceSpy,
          'goForward'
        ).and.resolveTo(undefined);

        // Act
        await component['handleLogin']({
          name: 'example1',
        } satisfies LocalAuthUserData);

        // Assert
        expect(wrongCredentialsSubjectNextSpy).toHaveBeenCalled();
        expect(openSpy).not.toHaveBeenCalled();
        expect(goForwardSpy).not.toHaveBeenCalled();
      });

      it(`should call snackBar.open if an error has been returned from authLocalUserService.logIn.`, async () => {
        // Arrange
        const openSpy = spyOn(MatSnackBar.prototype, 'open');
        const goForwardSpy = spyOn(
          viewTransitionServiceSpy,
          'goForward'
        ).and.resolveTo(undefined);

        (authLocalUserServiceMock.logIn as jasmine.Spy).and.returnValue({
          message: 'Example error',
        });

        // Act
        await component['handleLogin']({
          name: 'example1',
          passphrase: 'swdsadas#@43fFAF',
        } satisfies LocalAuthUserData);

        // Assert
        expect(openSpy).toHaveBeenCalled();
        expect(goForwardSpy).not.toHaveBeenCalled();
      });

      it(`should call _wrongCredentialsSubject.next if login error code equals 'invalid-passkey'.`, async () => {
        // Arrange
        const openSpy = spyOn(MatSnackBar.prototype, 'open');
        const goForwardSpy = spyOn(
          viewTransitionServiceSpy,
          'goForward'
        ).and.resolveTo(undefined);
        const wrongCredentialsSubjectNextSpy = spyOn(
          component['_wrongCredentialsSubject'],
          'next'
        );

        (authLocalUserServiceMock.logIn as jasmine.Spy).and.returnValue({
          code: 'invalid-passkey',
          message: 'Example error',
        });

        // Act
        await component['handleLogin']({
          name: 'example1',
          passphrase: 'swdsadas#@43fFAF',
        } satisfies LocalAuthUserData);

        // Assert
        expect(openSpy).toHaveBeenCalled();
        expect(goForwardSpy).not.toHaveBeenCalled();
        expect(wrongCredentialsSubjectNextSpy).toHaveBeenCalledWith(true);
      });

      it(`should call viewTransitionService.goForward if a user was logged in successfully (session persistance).`, async () => {
        // Arrange
        const openSpy = spyOn(MatSnackBar.prototype, 'open');
        const goForwardSpy = spyOn(
          viewTransitionServiceSpy,
          'goForward'
        ).and.resolveTo(undefined);

        const logInSpy = (
          authLocalUserServiceMock.logIn as jasmine.Spy
        ).and.returnValue(undefined);

        // Act
        component['handleLogin']({
          name: exampleLocalUser.auth.name,
          passphrase: exampleLocalUser.auth.value,
        } satisfies LocalAuthUserData);

        // Assert
        expect(logInSpy).toHaveBeenCalledWith(
          exampleLocalUser.auth.name,
          exampleLocalUser.auth.value,
          'session'
        );
        expect(openSpy).not.toHaveBeenCalled();
        expect(goForwardSpy).toHaveBeenCalled();
      });

      it(`should call viewTransitionService.goForward if a user was logged in successfully (local persistance).`, async () => {
        // Arrange
        const openSpy = spyOn(MatSnackBar.prototype, 'open');
        const goForwardSpy = spyOn(
          viewTransitionServiceSpy,
          'goForward'
        ).and.resolveTo(undefined);
        component['_rememberMe'] = true;

        const logInSpy = (
          authLocalUserServiceMock.logIn as jasmine.Spy
        ).and.returnValue(undefined);

        // Act
        component['handleLogin']({
          name: exampleLocalUser.auth.name,
          passphrase: exampleLocalUser.auth.value,
        } satisfies LocalAuthUserData);

        // Assert
        expect(logInSpy).toHaveBeenCalledWith(
          exampleLocalUser.auth.name,
          exampleLocalUser.auth.value,
          'local'
        );
        expect(openSpy).not.toHaveBeenCalled();
        expect(goForwardSpy).toHaveBeenCalled();
      });
    });

    describe(`_redirectToApp()`, () => {
      it(`should call viewTransitionService.goForward and return its Promise (_redirect as undefined).`, () => {
        // Arrange
        const goForwardSpy = spyOn(
          viewTransitionServiceSpy,
          'goForward'
        ).and.callThrough();

        // Act
        const result = component['_redirectToApp']();

        // Assert
        expect(goForwardSpy).toHaveBeenCalledWith(
          component['_mainTagRef'].nativeElement,
          '/app'
        );
        expect(result instanceof Promise).toBe(true);
      });

      it(`should call viewTransitionService.goForward and return its Promise (_redirect as string).`, () => {
        // Arrange
        const goForwardSpy = spyOn(
          viewTransitionServiceSpy,
          'goForward'
        ).and.callThrough();
        const redirectValue = 'app/example';
        component['_redirect'] = redirectValue;

        // Act
        const result = component['_redirectToApp']();

        // Assert
        expect(goForwardSpy).toHaveBeenCalledWith(
          component['_mainTagRef'].nativeElement,
          redirectValue
        );
        expect(result instanceof Promise).toBe(true);
      });
    });
  });
});
