/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { AccountSettingsOnlineComponent } from './account-settings-online.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatExpansionPanelHarness } from '@angular/material/expansion/testing';
import {
  UserProfile,
  UserProfileChangesI,
} from '../../utils/models/user-profile.interface';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormCommonFeaturesService } from 'src/app/reusable/data-access/form-common-features/form-common-features.service';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Provider } from '@angular/core';
import { getElement } from 'src/app/reusable/utils/testing/utils/getElement';
import { setFormInputValue } from 'src/app/reusable/utils/testing/utils/setFormInputValue';
import { FormGroup } from '@angular/forms';
import { SubmitValidState } from '../../utils/models/unsuccessfulSubmit.type';

const userProp: UserProfile = { authOption: 'password', name: 'Nick' };

const name = 'Sam';
const currentEmail = 'example@example.com';
const email = 'example2@example.com';
const currentPassword = 'ddaf1@#12QWC';
const password = 'ASas@2d3EW';

const makeFormValid = (
  component: AccountSettingsOnlineComponent,
  groups: 'email' | 'password' | 'all'
) => {
  switch (groups) {
    case 'all':
      component.enablePanel('changeEmail');
      component.enablePanel('changePassword');
      component.onlineProfileForm.setValue({
        name,
        changeEmail: {
          currentEmail,
          email,
          currentPassword,
        },
        changePassword: {
          currentPassword,
          password,
          confirmPassword: password,
        },
      });
      break;

    case 'email':
      component.enablePanel('changeEmail');
      component.onlineProfileForm.patchValue({
        name,
        changeEmail: {
          currentEmail,
          email,
          currentPassword,
        },
      });
      break;

    case 'password':
      component.enablePanel('changePassword');
      component.onlineProfileForm.patchValue({
        name,
        changePassword: {
          currentPassword,
          password,
          confirmPassword: password,
        },
      });
      break;

    default:
      throw new Error(`Unknown groups value: ${groups}`);
  }
};

describe('AccountSettingsOnlineComponent', () => {
  // Mocks
  let formCommonFeaturesServiceMock: FormCommonFeaturesService;

  // Component
  let fixture: ComponentFixture<AccountSettingsOnlineComponent>;
  let loader: HarnessLoader;
  let component: AccountSettingsOnlineComponent;
  let changeEmailPanel: MatExpansionPanelHarness;
  let changePasswordPanel: MatExpansionPanelHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, AccountSettingsOnlineComponent],
      providers: [] satisfies Provider[],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSettingsOnlineComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    formCommonFeaturesServiceMock = TestBed.inject(FormCommonFeaturesService);
    component.user = userProp;
  });

  beforeEach(async () => {
    changeEmailPanel = await loader.getHarness<MatExpansionPanelHarness>(
      MatExpansionPanelHarness.with({
        selector: `[data-test="expansion-panel1"]`,
      })
    );
    changePasswordPanel = await loader.getHarness<MatExpansionPanelHarness>(
      MatExpansionPanelHarness.with({
        selector: `[data-test="expansion-panel2"]`,
      })
    );
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe(`inputs`, () => {
    let updateSendingStateSpy: jasmine.Spy<any>;

    beforeEach(() => {
      fixture.detectChanges();
      updateSendingStateSpy = spyOn(component as any, '_updateSendingState');
    });

    it(`should not call _updateSendingState() when the result value is 'pending'.`, () => {
      // Arrange
      component.result = 'pending';

      // Act
      fixture.detectChanges();

      // Assert
      expect(updateSendingStateSpy).not.toHaveBeenCalled();
    });

    it(`should call _updateSendingState() when result value is 'idle'.`, () => {
      // Arrange
      component.result = 'idle';

      // Act
      fixture.detectChanges();

      // Assert
      expect(updateSendingStateSpy).toHaveBeenCalled();
    });

    it(`should call _updateSendingState() when result value is 'failure'.`, () => {
      // Arrange
      component.result = 'failure';

      // Act
      fixture.detectChanges();

      // Assert
      expect(updateSendingStateSpy).toHaveBeenCalled();
    });

    it(`should call _updateSendingState() when result value is 'success' and reset form controls.`, () => {
      // Arrange
      const resetSpy = spyOn(
        component.onlineProfileForm,
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

  describe(`observables`, () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    describe(`unsuccessfulSubmit$`, () => {
      it(`should emit false as the initial value.`, fakeAsync(() => {
        // Arrange
        let result: SubmitValidState | undefined;

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
        let result: SubmitValidState | undefined;
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
      it(`should call _applyUserState and _disablePanels at component creation.`, () => {
        // Arrange
        const applyUserStateSpy = spyOn(component as any, '_applyUserState');
        const disablePanelsSpy = spyOn(component as any, '_disablePanels');

        // Act
        component.ngOnInit();

        // Assert
        expect(applyUserStateSpy).toHaveBeenCalled();
        expect(disablePanelsSpy).toHaveBeenCalled();
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
      let getErrorSpy: jasmine.Spy<
        (
          formElement: FormGroup<any>,
          element: string | string[],
          validation: string
        ) => boolean | undefined
      >;

      beforeEach(() => {
        getErrorSpy = spyOn(
          formCommonFeaturesServiceMock,
          'getError'
        ).and.callThrough();
      });

      it(`should call formCommonFeaturesService.getError.`, () => {
        // Arrange

        // Act
        component.getError('name', 'required');

        // Assert
        expect(getErrorSpy).toHaveBeenCalled();
      });

      it(`should return undefined if form control does not exist.`, () => {
        // Arrange

        // Act
        const result = component.getError('xyz', 'required');

        // Assert
        expect(getErrorSpy).toHaveBeenCalled();
        expect(result).toBeUndefined();
      });

      it(`should return false if form control does not have the error specified in the argument.`, () => {
        // Arrange

        // Act
        const result = component.getError(
          ['changePassword', 'currentPassword'],
          'xyz'
        );

        // Assert
        expect(getErrorSpy).toHaveBeenCalled();
        expect(result).toBeFalse();
      });

      it(`should return true if the validation error specified in parameter exists.`, () => {
        // Arrange

        component.enablePanel('changePassword');

        // Act
        const result = component.getError(
          ['changePassword', 'currentPassword'],
          'required'
        );
        // Assert

        expect(getErrorSpy).toHaveBeenCalled();
        expect(result).toBeTrue();
      });
    });

    describe(`isErrorAndTouched()`, () => {
      let isErrorAndTouched: jasmine.Spy<
        <T extends FormGroup<any>>(
          formGroup: T,
          element: string | string[],
          validation: string
        ) => boolean | undefined
      >;

      beforeEach(() => {
        isErrorAndTouched = spyOn(
          formCommonFeaturesServiceMock,
          'isErrorAndTouched'
        ).and.callThrough();
      });

      it(`should call formCommonFeaturesService.isErrorAndTouched.`, () => {
        // Arrange

        // Act
        component.isErrorAndTouched('name', 'required');

        // Assert
        expect(isErrorAndTouched).toHaveBeenCalled();
      });

      it(`should return undefined if form control does not exist.`, () => {
        // Arrange

        // Act
        const result = component.isErrorAndTouched('xyz', 'required');

        // Assert
        expect(isErrorAndTouched).toHaveBeenCalled();
        expect(result).toBeUndefined();
      });

      it(`should return false if form control does not have the error specified in the argument.`, () => {
        // Arrange

        // Act
        const result = component.isErrorAndTouched(
          ['changeEmail', 'email'],
          'xyz'
        );

        // Assert
        expect(isErrorAndTouched).toHaveBeenCalled();
        expect(result).toBeFalse();
      });

      it(`should return false if form control has the error specified in the argument, but hasn't been touched yet.`, async () => {
        // Arrange

        await changeEmailPanel.expand();
        component.enablePanel('changeEmail');
        fixture.detectChanges();

        // Act
        const result = component.isErrorAndTouched(
          ['changeEmail', 'email'],
          'emailError'
        );

        // Assert
        expect(isErrorAndTouched).toHaveBeenCalled();
        expect(result).toBeFalse();
      });

      it(`should return true if the control has been touched and has the error specified in the argument.`, async () => {
        // Arrange

        await changeEmailPanel.expand();
        component.enablePanel('changeEmail');

        const emailInput = getElement<
          AccountSettingsOnlineComponent,
          HTMLInputElement
        >(fixture, `[data-test="emailGroup-email"] input`);

        setFormInputValue(emailInput, '');
        fixture.detectChanges();

        // Act
        const result = component.isErrorAndTouched(
          ['changeEmail', 'email'],
          'required'
        );

        // Assert
        expect(isErrorAndTouched).toHaveBeenCalled();
        expect(result).toBeTrue();
      });
    });

    describe(`isErrorAndDirty()`, () => {
      let isErrorAndDirtySpy: jasmine.Spy<
        <T extends FormGroup<any>>(
          formGroup: T,
          element: string | string[],
          validation: string
        ) => boolean | undefined
      >;

      beforeEach(() => {
        isErrorAndDirtySpy = spyOn(
          formCommonFeaturesServiceMock,
          'isErrorAndDirty'
        ).and.callThrough();
      });

      it(`should call formCommonFeaturesService.isErrorAndDirty.`, () => {
        // Arrange

        // Act
        component.isErrorAndDirty('name', 'required');

        // Assert
        expect(isErrorAndDirtySpy).toHaveBeenCalled();
      });

      it(`should return undefined if form control does not exist.`, () => {
        // Arrange

        // Act
        const result = component.isErrorAndDirty('xyz', 'required');

        // Assert
        expect(isErrorAndDirtySpy).toHaveBeenCalled();
        expect(result).toBeUndefined();
      });

      it(`should return false if form control does not have the error specified in the argument.`, () => {
        // Arrange

        // Act
        const result = component.isErrorAndDirty(
          ['changePassword', 'currentPassword'],
          'xyz'
        );

        // Assert
        expect(isErrorAndDirtySpy).toHaveBeenCalled();
        expect(result).toBeFalse();
      });

      it(`should return true if the control has been dirty and has the error specified in the argument.`, async () => {
        // Arrange

        await changePasswordPanel.expand();
        component.enablePanel('changePassword');

        const passwordInput = getElement<
          AccountSettingsOnlineComponent,
          HTMLInputElement
        >(fixture, `[data-test="passwordGroup-password"] input`);
        const confirmPasswordInput = getElement<
          AccountSettingsOnlineComponent,
          HTMLInputElement
        >(fixture, `[data-test="passwordGroup-confirmPassword"] input`);

        setFormInputValue(passwordInput, 'aasasaaASa23%#');
        setFormInputValue(confirmPasswordInput, 'asasasa');
        fixture.detectChanges();

        // Act
        const result = component.isErrorAndDirty(
          'changePassword',
          'passwordMatch'
        );

        // Assert
        expect(isErrorAndDirtySpy).toHaveBeenCalled();
        expect(result).toBeTrue();
      });
    });

    describe(`enablePanel()`, () => {
      it(`should have enabled a group narrowed by the parameter.`, () => {
        // Arrange
        const enableSpy = spyOn(
          component.onlineProfileForm.controls.changeEmail,
          'enable'
        ).and.callThrough();

        // Act
        component.enablePanel('changeEmail');

        // Assert
        expect(enableSpy).toHaveBeenCalled();
      });
    });

    describe(`disablePanel()`, () => {
      it(`should have disabled a group narrowed by the parameter.`, () => {
        // Arrange
        component.onlineProfileForm.controls.changePassword.enable();

        const disableSpy = spyOn(
          component.onlineProfileForm.controls.changePassword,
          'disable'
        ).and.callThrough();

        // Act
        component.disablePanel('changePassword');

        // Assert
        expect(disableSpy).toHaveBeenCalled();
      });
    });

    describe(`onSubmit()`, () => {
      let nextSpy: jasmine.Spy<(value: SubmitValidState) => void>;
      let emitSpy: jasmine.Spy<
        (value?: UserProfileChangesI | undefined) => void
      >;

      beforeEach(() => {
        nextSpy = spyOn(component['_unsuccessfulSubmitSubject'], 'next');
        emitSpy = spyOn(component.submittedChanges, 'emit');
      });

      it(`should call _unsuccessfulSubmitSubject.next if the form is invalid and stop method execution.`, async () => {
        // Arrange
        await changeEmailPanel.expand();

        // Act
        component.onSubmit();

        // Assert
        expect(nextSpy).toHaveBeenCalledWith({
          state: true,
          cause: 'invalid-form',
        });
        expect(emitSpy).not.toHaveBeenCalled();
      });

      it(`should emit form without new email or password when expansion panels are not opened.`, () => {
        // Arrange
        component.onlineProfileForm.patchValue({
          name: 'Napoleon',
        });
        component.onlineProfileForm.markAsDirty();

        // Act
        component.onSubmit();

        // Assert
        expect(emitSpy).toHaveBeenCalledWith({
          authOption: 'password',
          name: 'Napoleon',
          oldEmail: undefined,
          email: undefined,
          oldPassphrase: undefined,
          passphrase: undefined,
        } satisfies UserProfileChangesI);
      });

      it(`should emit form with all fields and correct new email.`, async () => {
        // Arrange
        await changeEmailPanel.expand();
        makeFormValid(component, 'email');
        component.onlineProfileForm.markAsDirty();
        fixture.detectChanges();

        // Act
        component.onSubmit();

        // Assert
        expect(emitSpy).toHaveBeenCalledWith({
          authOption: 'password',
          name: name,
          oldEmail: currentEmail,
          email: email,
          oldPassphrase: currentPassword,
          passphrase: undefined,
        } satisfies UserProfileChangesI);
      });

      it(`should emit form with all fields and correct new password.`, async () => {
        // Arrange
        await changePasswordPanel.expand();
        makeFormValid(component, 'password');
        component.onlineProfileForm.markAsDirty();
        fixture.detectChanges();

        // Act
        component.onSubmit();

        // Assert
        expect(emitSpy).toHaveBeenCalledWith({
          authOption: 'password',
          name: name,
          oldEmail: undefined,
          email: undefined,
          oldPassphrase: currentPassword,
          passphrase: password,
        } satisfies UserProfileChangesI);
      });

      it(`should emit form with all fields (all changes).`, async () => {
        // Arrange
        await changeEmailPanel.expand();
        await changePasswordPanel.expand();
        makeFormValid(component, 'all');
        component.onlineProfileForm.markAsDirty();
        fixture.detectChanges();

        // Act
        component.onSubmit();

        // Assert
        expect(emitSpy).toHaveBeenCalledWith({
          authOption: 'password',
          name: name,
          oldEmail: currentEmail,
          email: email,
          oldPassphrase: currentPassword,
          passphrase: password,
        } satisfies UserProfileChangesI);
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
        expect(component.onlineProfileForm.controls.name.value).toBe(
          expectedName
        );
      });
    });

    describe(`_updateSendingState()`, () => {
      it(`should call _isDataSendingSubject.next with received parameter.`, () => {
        // Arrange
        const nextSpy = spyOn(component['_isDataSendingSubject'], 'next');
        const expectedValue = true;

        // Act
        component['_updateSendingState'](expectedValue);

        // Assert
        expect(nextSpy).toHaveBeenCalledWith(expectedValue);
      });
    });
  });
});
