import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestComponent } from './guest.component';
import { By } from '@angular/platform-browser';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { AuthLocalUserService } from '../services/local-user/auth-local-user.service';
import { LocalUserData } from '../services/Models/UserDataModels';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DebugElement } from '@angular/core';
import { CustomMatRippleDirective } from 'src/app/reusable/ripples/ripple-color-checker.directive';

describe('GuestComponent', () => {
  let component: GuestComponent;
  let fixture: ComponentFixture<GuestComponent>;
  let viewTransitionServiceMock: ViewTransitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, GuestComponent],
      providers: [
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
          useValue: {
            rememberMe: false,
            createUser: (userData: LocalUserData): void => {
              userData;
            },
          },
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
    it('should create', () => {
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

    it('should call onSubmit when emitting "ngSubmit" event', () => {
      const spy = spyOn(component, 'onSubmit');
      const formElement = fixture.debugElement.query(By.css('form'));
      formElement.triggerEventHandler('ngSubmit');

      expect(spy).toHaveBeenCalled();
    });

    it('should render pin group as a default security method', () => {
      const pinGroup = fixture.debugElement.query(
        By.css('[data-test="pin-group"]')
      );

      expect(pinGroup.nativeElement).toBeTruthy();
    });

    it('should allow to switch from pin to password and back to pin', () => {
      const passwordRadioInput = fixture.debugElement.query(
        By.css('[data-test="radio-password"]')
      );
      const pinRadioInput = fixture.debugElement.query(
        By.css('[data-test="radio-pin"]')
      );

      passwordRadioInput.triggerEventHandler('input');
      fixture.detectChanges();
      const passwordGroup = fixture.debugElement.query(
        By.css('[data-test="password-group"]')
      );
      expect(passwordGroup.nativeElement).toBeTruthy();

      pinRadioInput.triggerEventHandler('input');
      fixture.detectChanges();
      const pinGroup = fixture.debugElement.query(
        By.css('[data-test="pin-group"]')
      );
      expect(pinGroup.nativeElement).toBeTruthy();
    });

    it('should apply appCustomMatRipple to the submit button', () => {
      const submitButton = fixture.debugElement.query(
        By.directive(CustomMatRippleDirective)
      );

      expect(submitButton.nativeElement).toBeTruthy();
    });
  });

  describe('toggleAuthMethod()', () => {
    it('should not change existing controls when the formGroup was not found', () => {
      const formGroupSpy = spyOn(
        component.localUserForm,
        'get'
      ).and.returnValue(null);
      component.toggleAuthMethod();

      expect(formGroupSpy).toHaveBeenCalled();
      expect(
        component.localUserForm.controls.pinGroup.get('pin')?.disabled
      ).toBeFalse();
    });
  });

  describe('onSubmit()', () => {
    it('should call onFailure when name control is empty', () => {
      component.localUserForm.controls.name.setValue('');
      component.onSubmit();

      expect(component.localUserForm.errors).toEqual({
        invalidForm: true,
      });
    });

    it('should call onFailure when the pin group and password group are invalid', () => {
      component.localUserForm.get(['passwordGroup', 'password'])?.setValue('');
      component.localUserForm.get(['pinGroup', 'pin'])?.setValue('');
      component.onSubmit();

      expect(component.localUserForm.errors).toEqual({
        invalidForm: true,
      });
    });

    it('should call onFailure when the pin group and password group are disabled (somehow)', () => {
      component.localUserForm.get(['passwordGroup', 'password'])?.disable();
      component.localUserForm.get(['pinGroup', 'pin'])?.disable();
      component.onSubmit();

      expect(component.localUserForm.errors).toEqual({
        invalidForm: true,
      });
    });

    it('should set rememberMe in authLocalUserService and call createUser when form is valid (pin branch)', () => {
      const randomNumber = () => Math.floor(Math.random() * 1000);
      const randomPin = Array.from({ length: 4 }, randomNumber).join('');
      spyOn(component.authLocalUserService, 'createUser');
      component.localUserForm.controls.name.setValue('test');
      component.localUserForm.get(['pinGroup', 'pin'])?.setValue(randomPin);
      component.localUserForm
        .get(['pinGroup', 'confirmPin'])
        ?.setValue(randomPin);
      component.localUserForm
        .get(['pinGroup', 'confirmPin'])
        ?.setValue(randomPin);
      component.localUserForm.controls.rememberMe.setValue(true);

      component.onSubmit();

      expect(component.authLocalUserService.rememberMe).toBe(true);
      expect(component.authLocalUserService.createUser).toHaveBeenCalled();
    });

    it('should set rememberMe in authLocalUserService and call createUser when form is valid (password branch)', () => {
      const password = 'zaq1@WSX';
      spyOn(component.authLocalUserService, 'createUser');
      component.isPasswordSelected = true;
      component.localUserForm.controls.name.setValue('test');
      component.localUserForm
        .get(['passwordGroup', 'password'])
        ?.setValue(password);
      component.localUserForm
        .get(['passwordGroup', 'confirmPassword'])
        ?.setValue(password);
      component.localUserForm
        .get(['pinGroup', 'confirmPin'])
        ?.setValue([password]);
      component.localUserForm.controls.rememberMe.setValue(true);

      component.onSubmit();

      expect(component.authLocalUserService.rememberMe).toBe(true);
      expect(component.authLocalUserService.createUser).toHaveBeenCalled();
    });
  });
});
