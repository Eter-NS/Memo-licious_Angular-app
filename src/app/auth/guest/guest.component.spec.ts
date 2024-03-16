import {
  ComponentFixture,
  DeferBlockBehavior,
  DeferBlockState,
  TestBed,
} from '@angular/core/testing';

import { GuestComponent } from './guest.component';
import { By } from '@angular/platform-browser';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { AuthLocalUserService } from '../services/local-user/auth-local-user.service';
import { LocalUserFormData } from '../services/Models/LocalAuthModels.interface';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DebugElement } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('GuestComponent', () => {
  let component: GuestComponent;
  let fixture: ComponentFixture<GuestComponent>;
  let viewTransitionServiceMock: ViewTransitionService;
  const authLocalUserServiceMock = {
    rememberMe: false,
    createUser: jasmine.createSpy(
      'createUser',
      AuthLocalUserService.prototype.createUser
    ),
    logIn: jasmine.createSpy('logIn', AuthLocalUserService.prototype.logIn),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Playthrough,
      imports: [BrowserAnimationsModule, ReactiveFormsModule, GuestComponent],
      providers: [
        MatSnackBar,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jasmine.createSpy('get').and.returnValue('mockValue'),
              },
            },
          },
        },
        {
          provide: ViewTransitionService,
          useValue: {
            page$: new BehaviorSubject<'start' | 'end' | 'idle'>(
              'idle'
            ).asObservable(),
            goBackClicked: false,
            goBack: async (
              element: HTMLElement | Event,
              fallback?: string
            ): Promise<void> => {
              element;
              fallback;
            },
            goForward: jasmine.createSpy(
              'goForward',
              ViewTransitionService.prototype.goForward
            ),
          },
        },
        {
          provide: AuthLocalUserService,
          useValue: authLocalUserServiceMock,
        },
      ],
    });
    fixture = TestBed.createComponent(GuestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    viewTransitionServiceMock = fixture.debugElement.injector.get(
      ViewTransitionService
    );
  });

  describe('component', () => {
    it('should be created', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('component template', () => {
    let buttonComponent: DebugElement;

    beforeEach(() => {
      buttonComponent = fixture.debugElement.query(
        By.css('app-previous-page-button')
      );
    });

    it('should render app-previous-page-button component', () => {
      expect(buttonComponent.nativeElement).toBeTruthy();
    });

    it('should call viewTransitionService.goBack when emitting "clicked" event', () => {
      const viewContainer = fixture.debugElement.query(By.css('.content'));
      const spy = spyOn(viewTransitionServiceMock, 'goBack');
      buttonComponent.triggerEventHandler('clicked');

      expect(spy).toHaveBeenCalledWith(
        viewContainer.nativeElement,
        '/getting-started/choose-path'
      );
    });

    it('should call the toggleRegister() when "to-login-button" has had an interaction with user', () => {
      const spy = spyOn(component, 'toggleRegister');
      const button = fixture.debugElement.query(
        By.css('[data-test="to-login-button"]')
      );

      button.triggerEventHandler('click', null);
      button.triggerEventHandler('keyup.enter', null);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    xit('should call the toggleRegister() when "to-register-button" has had an interaction with user', () => {
      component.register = false;
      fixture.detectChanges();
      const spy = spyOn(component, 'toggleRegister');
      const button = fixture.debugElement.query(
        By.css('[data-test="to-register-button"]')
      );

      button.triggerEventHandler('click', null);
      button.triggerEventHandler('keyup.enter', null);

      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe(`toggleRegister()`, () => {
    it(`should toggle register`, () => {
      component.register = false;
      fixture.detectChanges();

      component.toggleRegister();

      expect(component.register).toBeTrue();
    });
  });

  describe(`handleRegister()`, () => {
    it(`should call handleRegister() when data event was emitted`, async () => {
      const spy = spyOn(component, 'handleRegister');
      const deferBlockFixture = (await fixture.getDeferBlocks())[0];
      await deferBlockFixture.render(DeferBlockState.Complete);
      const registerComponent = fixture.debugElement.query(
        By.css('app-guest-register')
      );

      registerComponent.triggerEventHandler('data', null);

      expect(spy).toHaveBeenCalled();
    });

    it(`should call authLocalUserService.createUser() with authOption set to 'password and password form group data'`, () => {
      const password = 'zaq1@WSX';
      component.handleRegister({
        name: `test`,
        passwordGroup: { password: password, confirmPassword: password },
      });

      expect(authLocalUserServiceMock.createUser).toHaveBeenCalledWith({
        auth: {
          name: `test`,
          authOption: 'password',
          value: password,
        },
      } satisfies LocalUserFormData);
    });

    it(`should call authLocalUserService.createUser() with authOption set to 'pin and pin form group data'`, () => {
      const pin = `1914`;
      component.handleRegister({
        name: `test`,
        pinGroup: { pin: pin, confirmPin: pin },
      });

      expect(authLocalUserServiceMock.createUser).toHaveBeenCalledWith({
        auth: {
          name: `test`,
          authOption: 'pin',
          value: pin,
        },
      } satisfies LocalUserFormData);
    });

    it(`should open the snackbar if an error occurred during authLocalUserService.createUser() execution`, () => {
      const pin = `1914`;
      authLocalUserServiceMock.createUser.and.returnValue({
        code: 'user-exists',
        message: 'Account already exists',
      });

      component.handleRegister({
        name: `test`,
        pinGroup: { pin: pin, confirmPin: pin },
      });

      expect(component.alreadyInUseError).toBeTrue();
    });
  });

  describe(`handleLogin()`, () => {
    beforeEach(() => {
      component.register = false;
      fixture.detectChanges();
    });

    xit(`should call handleLogin() when data event was emitted`, async () => {
      const spy = spyOn(component, 'handleLogin');

      const deferBlockFixture = await fixture.getDeferBlocks();
      deferBlockFixture.forEach(async (fixture) => {
        await fixture.render(DeferBlockState.Complete);
      });

      const loginComponent = fixture.debugElement.query(
        By.css('app-guest-login')
      );

      loginComponent.triggerEventHandler('data', null);

      expect(spy).toHaveBeenCalled();
    });

    it(`should call authLocalUserService.logIn() with authOption set to 'password and password form group data'`, () => {
      const password = 'zaq1@WSX';
      component.handleLogin({
        name: `test`,
        passphrase: password,
      });

      expect(authLocalUserServiceMock.logIn).toHaveBeenCalledWith(
        `test`,
        password
      );
    });

    it(`should set the wrongCredentials flag to true when there is no passphrase passed`, () => {
      component.handleLogin({
        name: `test`,
      });

      expect(component.wrongCredentials).toBeTrue();
    });

    it(`should open the snackbar if an error occurred during authLocalUserService.logIn() execution`, () => {
      const password = 'zaq1@WSX';
      authLocalUserServiceMock.logIn.and.returnValue({
        code: 'invalid-passkey',
        message: 'Invalid passkey',
      });

      component.handleLogin({
        name: `test`,
        passphrase: password,
      });

      expect(component.wrongCredentials).toBeTrue();
    });
  });
});
