/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  AccountSettingsLocalComponent,
  UnsuccessfulSubmitI,
} from './account-settings-local.component';
import { Provider } from '@angular/core';
import { FormCommonFeaturesService } from 'src/app/reusable/data-access/form-common-features/form-common-features.service';
import { AuthOptions } from 'src/app/auth/utils/Models/LocalAuthModels.interface';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { getElement } from 'src/app/reusable/utils/testing/utils/getElement';
import { setFormInputValue } from 'src/app/reusable/utils/testing/utils/setFormInputValue';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatExpansionPanelHarness } from '@angular/material/expansion/testing';
import { UserProfile } from '../../utils/models/user-profile.interface';

const makeFormValid = (
  component: AccountSettingsLocalComponent,
  newPassphrase: AuthOptions
) => {
  const pin = '194683';
  const password = 'wd.)8Y!0%2kges1dHERZ';

  component.enablePassphrasePanel();
  component['_authOptionSubject'].next(newPassphrase);
  component.toggleAuthMethod();

  const newPassphraseObject =
    newPassphrase === 'password'
      ? {
          pinGroup: { pin: '', confirmPin: '' },
          passwordGroup: {
            password: password,
            confirmPassword: password,
          },
        }
      : {
          pinGroup: { pin: pin, confirmPin: pin },
          passwordGroup: {
            password: '',
            confirmPassword: '',
          },
        };

  component.localProfileForm.setValue({
    name: 'Star_Maximus',
    currentPassphrase: 'asasas@@#221DS',
    authOption: newPassphrase,

    ...newPassphraseObject,
  });
};

describe(`AccountSettingsLocalComponent`, () => {
  // Mocks
  let formCommonFeaturesServiceMock: FormCommonFeaturesService;

  // Component
  let fixture: ComponentFixture<AccountSettingsLocalComponent>;
  let loader: HarnessLoader;
  let component: AccountSettingsLocalComponent;
  let panel: MatExpansionPanelHarness;
  const userProp: UserProfile = { authOption: 'password', name: 'Nick' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, AccountSettingsLocalComponent],
      providers: [] satisfies Provider[],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSettingsLocalComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    formCommonFeaturesServiceMock = TestBed.inject(FormCommonFeaturesService);
    component.user = userProp;
  });

  beforeEach(async () => {
    panel = await loader.getHarness<MatExpansionPanelHarness>(
      MatExpansionPanelHarness.with({
        selector: `[data-test="expansion-panel1"]`,
      })
    );
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe(`inputs`, () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it(`should not call _updateSendingState() when the result value is 'pending'.`, () => {
      // Arrange
      const spy = spyOn(component as any, '_updateSendingState');
      component.result = 'pending';

      // Act
      fixture.detectChanges();

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });

    it(`should should call _updateSendingState() when result value is 'idle'.`, () => {
      // Arrange
      const spy = spyOn(component as any, '_updateSendingState');
      component.result = 'success';
      fixture.detectChanges();
      component.result = 'idle';

      // Act
      fixture.detectChanges();

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    it(`should should call _updateSendingState() when result value is 'failure'.`, () => {
      // Arrange
      const spy = spyOn(component as any, '_updateSendingState');
      component.result = 'failure';

      // Act
      fixture.detectChanges();

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    it(`should should call _updateSendingState() when result value is 'success' and reset form controls.`, () => {
      // Arrange
      const updateSendingStateSpy = spyOn(
        component as any,
        '_updateSendingState'
      );
      const resetSpy = spyOn(
        component.localProfileForm,
        'reset'
      ).and.callThrough();
      component.result = 'success';

      // Act
      fixture.detectChanges();

      // Assert
      expect(updateSendingStateSpy).toHaveBeenCalled();
      expect(resetSpy).toHaveBeenCalled();
    });
  });

  describe(`Observables`, () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    describe(`authOptions$`, () => {
      it(`should emit 'user.authOption' as the initial value.`, fakeAsync(() => {
        // Arrange
        let result: AuthOptions | undefined;

        // Act
        const subscription = component.authOption$.subscribe((value) => {
          result = value;
        });

        tick();
        subscription.unsubscribe();

        // Assert
        expect(result).toEqual(component.user.authOption);
      }));

      it(`should emit new value when _authOptionSubject.next has been called.`, fakeAsync(() => {
        // Arrange
        let result: AuthOptions | undefined;
        const subscription = component.authOption$.subscribe((value) => {
          result = value;
        });

        // Act
        component['_authOptionSubject'].next('password');

        tick();
        subscription.unsubscribe();

        // Assert
        expect(result).toEqual('password');
      }));
    });

    describe(`unsuccessfulSubmit$`, () => {
      it(`should emit false as the initial value.`, fakeAsync(() => {
        // Arrange
        let result: UnsuccessfulSubmitI | undefined;

        // Act
        const subscription = component.unsuccessfulSubmit$.subscribe(
          (value) => {
            result = value;
          }
        );

        tick();
        subscription.unsubscribe();

        // Assert
        expect(result?.state).toBeFalse();
      }));

      it(`should emit new value when _unsuccessfulSubmitSubject.next has been called.`, fakeAsync(() => {
        // Arrange
        let result: UnsuccessfulSubmitI | undefined;
        const subscription = component.unsuccessfulSubmit$.subscribe(
          (value) => {
            result = value;
          }
        );

        // Act
        component['_unsuccessfulSubmitSubject'].next({
          state: true,
          cause: 'example',
        });

        tick();
        subscription.unsubscribe();

        // Assert
        expect(result?.state).toBeTrue();
        expect(result?.state && result.cause).toBe('example');
      }));
    });

    describe(`isDataSending$`, () => {
      it(`should emit false as the initial value.`, fakeAsync(() => {
        // Arrange
        let result: boolean | undefined;

        // Act
        const subscription = component.isDataSending$.subscribe((value) => {
          result = value;
        });

        tick();
        subscription.unsubscribe();

        // Assert
        expect(result).toBeFalse();
      }));

      it(`should emit new value when _isDataSendingSubject.next has been called.`, fakeAsync(() => {
        // Arrange
        let result: boolean | undefined;
        const subscription = component.isDataSending$.subscribe((value) => {
          result = value;
        });

        // Act
        component['_isDataSendingSubject'].next(true);

        tick();
        subscription.unsubscribe();

        // Assert
        expect(result).toBeTrue();
      }));
    });
  });

  describe(`Lifecycle hooks`, () => {
    describe(`ngOnInit()`, () => {
      it(`should call _setInitialAuthOption, _applyUserState, _listenForAuthChanges, and disablePassphrasePanel at component creation.`, () => {
        // Arrange
        const setInitialAuthOptionSpy = spyOn(
          component as any,
          '_setInitialAuthOption'
        );
        const applyUserStateSpy = spyOn(component as any, '_applyUserState');
        const listenForAuthChangesSpy = spyOn(
          component as any,
          '_listenForAuthChanges'
        );
        const disablePassphrasePanelSpy = spyOn(
          component,
          'disablePassphrasePanel'
        );

        // Act
        component.ngOnInit();

        // Assert
        expect(setInitialAuthOptionSpy).toHaveBeenCalled();
        expect(applyUserStateSpy).toHaveBeenCalled();
        expect(listenForAuthChangesSpy).toHaveBeenCalled();
        expect(disablePassphrasePanelSpy).toHaveBeenCalled();
      });
    });

    describe(`ngAfterViewInit()`, () => {
      it(`should call formCommonFeaturesService.onInitAnimations at component's first view initialization.`, () => {
        // Arrange
        const onInitAnimationsSpy = spyOn(
          formCommonFeaturesServiceMock,
          'onInitAnimations'
        );

        // Act
        component.ngAfterViewInit();

        // Assert
        expect(onInitAnimationsSpy).toHaveBeenCalled();
      });
    });
  });

  describe(`methods`, () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    describe(`getError()`, () => {
      it(`should call formCommonFeaturesService.getError.`, () => {
        // Arrange
        const spy = spyOn(formCommonFeaturesServiceMock, 'getError');

        // Act
        component.getError('name', 'required');

        // Assert
        expect(spy).toHaveBeenCalled();
      });

      it(`should return undefined if form control does not exist.`, () => {
        // Arrange
        const spy = spyOn(
          formCommonFeaturesServiceMock,
          'getError'
        ).and.callThrough();

        // Act
        const result = component.getError('xyz', 'required');

        // Assert
        expect(spy).toHaveBeenCalled();
        expect(result).toBeUndefined();
      });

      it(`should return false if form control does not have the error specified in the argument.`, () => {
        // Arrange
        const spy = spyOn(
          formCommonFeaturesServiceMock,
          'getError'
        ).and.callThrough();

        // Act
        const result = component.getError(['pinGroup', 'pin'], 'xyz');

        // Assert
        expect(spy).toHaveBeenCalled();
        expect(result).toBeFalse();
      });

      it(`should return true if the validation error specified in parameter exists.`, () => {
        // Arrange
        const spy = spyOn(
          formCommonFeaturesServiceMock,
          'getError'
        ).and.callThrough();
        component.enablePassphrasePanel();

        // Act
        const result = component.getError('currentPassphrase', 'required');
        // Assert

        expect(spy).toHaveBeenCalled();
        expect(result).toBeTrue();
      });
    });

    describe(`isErrorAndTouched()`, () => {
      it(`should call formCommonFeaturesService.isErrorAndTouched.`, () => {
        // Arrange
        const spy = spyOn(formCommonFeaturesServiceMock, 'isErrorAndTouched');

        // Act
        component.isErrorAndTouched('name', 'required');

        // Assert
        expect(spy).toHaveBeenCalled();
      });

      it(`should return undefined if form control does not exist.`, () => {
        // Arrange
        const spy = spyOn(
          formCommonFeaturesServiceMock,
          'isErrorAndTouched'
        ).and.callThrough();

        // Act
        const result = component.isErrorAndTouched('xyz', 'required');

        // Assert
        expect(spy).toHaveBeenCalled();
        expect(result).toBeUndefined();
      });

      it(`should return false if form control does not have the error specified in the argument.`, () => {
        // Arrange
        const spy = spyOn(
          formCommonFeaturesServiceMock,
          'isErrorAndTouched'
        ).and.callThrough();

        // Act
        const result = component.isErrorAndTouched(['pinGroup', 'pin'], 'xyz');

        // Assert
        expect(spy).toHaveBeenCalled();
        expect(result).toBeFalse();
      });

      it(`should return false if form control has the error specified in the argument, but hasn't been touched yet.`, async () => {
        // Arrange
        const spy = spyOn(
          formCommonFeaturesServiceMock,
          'isErrorAndTouched'
        ).and.callThrough();

        await panel.expand();
        component.enablePassphrasePanel();
        fixture.detectChanges();

        // Act
        const result = component.isErrorAndTouched(
          ['passwordGroup', 'password'],
          'required'
        );

        // Assert
        expect(spy).toHaveBeenCalled();
        expect(result).toBeFalse();
      });

      it(`should return true if the control has been touched and has the error specified in the argument.`, async () => {
        // Arrange
        const spy = spyOn(
          formCommonFeaturesServiceMock,
          'isErrorAndTouched'
        ).and.callThrough();

        await panel.expand();
        component.enablePassphrasePanel();

        const currentPassphraseInput = getElement<
          AccountSettingsLocalComponent,
          HTMLInputElement
        >(fixture, `[data-test="current-passphrase"] input`);

        setFormInputValue(currentPassphraseInput, '');
        fixture.detectChanges();

        // Act
        const result = component.isErrorAndTouched(
          'currentPassphrase',
          'required'
        );

        // Assert
        expect(spy).toHaveBeenCalled();
        expect(result).toBeTrue();
      });
    });

    describe(`isErrorAndDirty()`, () => {
      it(`should call formCommonFeaturesService.isErrorAndDirty.`, () => {
        // Arrange
        const spy = spyOn(formCommonFeaturesServiceMock, 'isErrorAndDirty');

        // Act
        component.isErrorAndDirty('name', 'required');

        // Assert
        expect(spy).toHaveBeenCalled();
      });

      it(`should return undefined if form control does not exist.`, () => {
        // Arrange
        const spy = spyOn(
          formCommonFeaturesServiceMock,
          'isErrorAndDirty'
        ).and.callThrough();

        // Act
        const result = component.isErrorAndDirty('xyz', 'required');

        // Assert
        expect(spy).toHaveBeenCalled();
        expect(result).toBeUndefined();
      });

      it(`should return false if form control does not have the error specified in the argument.`, () => {
        // Arrange
        const spy = spyOn(
          formCommonFeaturesServiceMock,
          'isErrorAndDirty'
        ).and.callThrough();

        // Act
        const result = component.isErrorAndDirty(['pinGroup', 'pin'], 'xyz');

        // Assert
        expect(spy).toHaveBeenCalled();
        expect(result).toBeFalse();
      });

      it(`should return true if the control has been dirty and has the error specified in the argument.`, async () => {
        // Arrange
        const spy = spyOn(
          formCommonFeaturesServiceMock,
          'isErrorAndDirty'
        ).and.callThrough();

        await panel.expand();
        component.enablePassphrasePanel();

        const passwordInput = getElement<
          AccountSettingsLocalComponent,
          HTMLInputElement
        >(fixture, `[data-test="passwordGroup-password"] input`);
        const confirmPasswordInput = getElement<
          AccountSettingsLocalComponent,
          HTMLInputElement
        >(fixture, `[data-test="passwordGroup-confirmPassword"] input`);

        setFormInputValue(passwordInput, 'aasasaaASa23%#');
        setFormInputValue(confirmPasswordInput, 'asasasa');
        fixture.detectChanges();

        // Act
        const result = component.isErrorAndDirty(
          'passwordGroup',
          'passwordMatch'
        );

        // Assert
        expect(spy).toHaveBeenCalled();
        expect(result).toBeTrue();
      });
    });

    describe(`toggleAuthMethod()`, () => {
      it(`should enable pinGroup if user has selected 'pin' as auth method earlier.`, () => {
        // Arrange
        component.enablePassphrasePanel();
        component['_authOptionSubject'].next('pin');

        // Act
        component.toggleAuthMethod();

        // Assert
        expect(component.localProfileForm.controls.pinGroup.enabled).toBeTrue();
        expect(
          component.localProfileForm.controls.passwordGroup.enabled
        ).toBeFalse();
      });

      it(`should enable pinGroup if user has selected 'pin' as auth method earlier.`, () => {
        // Arrange
        component.enablePassphrasePanel();
        component['_authOptionSubject'].next('password');

        // Act
        component.toggleAuthMethod();

        // Assert
        expect(
          component.localProfileForm.controls.pinGroup.enabled
        ).toBeFalse();
        expect(
          component.localProfileForm.controls.passwordGroup.enabled
        ).toBeTrue();
      });
    });

    describe(`enablePassphrasePanel()`, () => {
      it(`should enable currentPassphrase control and call _setInitialAuthOption.`, () => {
        // Arrange
        const setInitialAuthOptionSpy = spyOn(
          component as any,
          '_setInitialAuthOption'
        );

        // Act
        component.enablePassphrasePanel();

        // Assert
        expect(
          component.localProfileForm.controls.currentPassphrase.enabled
        ).toBeTrue();
        expect(setInitialAuthOptionSpy).toHaveBeenCalled();
      });
    });

    describe(`disablePassphrasePanel()`, () => {
      it(`should disable currentPassphrase control as well as pin and password groups.`, () => {
        // Arrange
        // Act
        component.disablePassphrasePanel();

        // Assert
        const controls = component.localProfileForm.controls;
        expect(controls.currentPassphrase.enabled).toBeFalse();
        expect(controls.pinGroup.enabled).toBeFalse();
        expect(controls.passwordGroup.enabled).toBeFalse();
      });
    });

    describe(`onSubmit()`, () => {
      it(`should call _unsuccessfulSubmitSubject.next if the form is invalid and stop method execution.`, async () => {
        // Arrange
        await panel.expand();
        const spy = spyOn(component['_unsuccessfulSubmitSubject'], 'next');

        // Act
        component.onSubmit();

        // Assert
        expect(spy).toHaveBeenCalledWith({
          state: true,
          cause: 'invalid-form',
        });
      });

      it(`should call _unsuccessfulSubmitSubject.next if the authOption control is disabled.`, async () => {
        // Arrange
        const spy = spyOn(component['_unsuccessfulSubmitSubject'], 'next');
        component.localProfileForm.controls.authOption.disable();
        spyOnProperty(
          component.localProfileForm,
          'invalid',
          'get'
        ).and.returnValue(false);

        // Act
        await fixture.whenStable();
        console.log(component.localProfileForm.invalid);
        component.onSubmit();

        // Assert
        expect(spy).toHaveBeenCalledWith({
          state: true,
          cause: 'no-authOption',
        });
      });

      it(`should emit form without new authentication section when expansion panel is not opened.`, () => {
        // Arrange
        const spy = spyOn(component as any, '_updateSendingState');
        component.localProfileForm.patchValue({
          name: 'Napoleon',
        });
        component.localProfileForm.markAsDirty();

        // Act
        component.onSubmit();

        // Assert
        expect(spy).toHaveBeenCalled();
      });

      it(`should emit form with all fields and correct new auth (password).`, async () => {
        // Arrange
        const spy = spyOn(component as any, '_updateSendingState');
        await panel.expand();
        makeFormValid(component, 'password');
        component.localProfileForm.markAsDirty();
        fixture.detectChanges();

        // Act
        component.onSubmit();

        // Assert
        expect(spy).toHaveBeenCalled();
      });

      it(`should emit form with all fields and correct new auth (pin).`, async () => {
        // Arrange
        const spy = spyOn(component as any, '_updateSendingState');
        await panel.expand();
        makeFormValid(component, 'pin');
        component.localProfileForm.markAsDirty();
        fixture.detectChanges();

        // Act
        component.onSubmit();

        // Assert
        expect(spy).toHaveBeenCalled();
      });
    });

    describe(`_setInitialAuthOption()`, () => {
      it(`should set the authOption value, call _authOptionSubject.next and disable the pin group if user prop authOption is 'password'.`, () => {
        // Arrange
        const controls = component.localProfileForm.controls;
        const expectedValue: AuthOptions = 'password';
        userProp.authOption = expectedValue;

        const authOptionSetValueSpy = spyOn(controls.authOption, 'setValue');
        const nextSpy = spyOn(component['_authOptionSubject'], 'next');
        const pinGroupDisableSpy = spyOn(controls.pinGroup, 'disable');

        // Act
        component['_setInitialAuthOption']();

        // Assert
        expect(authOptionSetValueSpy).toHaveBeenCalledWith(expectedValue);
        expect(nextSpy).toHaveBeenCalledWith(expectedValue);
        expect(pinGroupDisableSpy).toHaveBeenCalled();
      });

      it(`should set the authOption value, call _authOptionSubject.next and disable the password group if user prop authOption is 'pin'.`, () => {
        // Arrange
        const controls = component.localProfileForm.controls;
        const expectedValue: AuthOptions = 'pin';
        userProp.authOption = expectedValue;

        const authOptionSetValueSpy = spyOn(controls.authOption, 'setValue');
        const nextSpy = spyOn(component['_authOptionSubject'], 'next');
        const passwordGroupDisableSpy = spyOn(
          controls.passwordGroup,
          'disable'
        );

        // Act
        component['_setInitialAuthOption']();

        // Assert
        expect(authOptionSetValueSpy).toHaveBeenCalledWith(expectedValue);
        expect(nextSpy).toHaveBeenCalledWith(expectedValue);
        expect(passwordGroupDisableSpy).toHaveBeenCalled();
      });
    });

    describe(`_applyUserState()`, () => {
      it(`should update nam control's value with user prop name property.`, () => {
        // Arrange
        const expectedName = 'Napoleon';
        userProp.name = expectedName;

        // Act
        component['_applyUserState']();

        // Assert
        expect(component.localProfileForm.controls.name.value).toBe(
          expectedName
        );
      });
    });

    describe(`_listenForAuthChanges()`, () => {
      it(`should call _authOptionSubject.next and toggleAuthMethod for every value emitted by authOption form control.`, () => {
        // Arrange
        const nextSpy = spyOn(component['_authOptionSubject'], 'next');
        const toggleAuthMethodSpy = spyOn(component, 'toggleAuthMethod');

        // Act
        component['_listenForAuthChanges']();
        component.localProfileForm.controls.authOption.setValue('pin');

        // Assert
        expect(nextSpy).toHaveBeenCalled();
        expect(toggleAuthMethodSpy).toHaveBeenCalled();
      });
    });

    describe(`_updateSendingState()`, () => {
      it(`should call _isDataSendingSubject.next with received parameter.`, () => {
        // Arrange
        const spy = spyOn(component['_isDataSendingSubject'], 'next');
        const expectedValue = true;

        // Act
        component['_updateSendingState'](expectedValue);

        // Assert
        expect(spy).toHaveBeenCalledWith(expectedValue);
      });
    });
  });
});
