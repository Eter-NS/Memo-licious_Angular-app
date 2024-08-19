/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettingsLocalComponent } from './account-settings-local.component';
import { Component, Provider, ViewChild } from '@angular/core';
import { FormCommonFeaturesService } from 'src/app/reusable/data-access/form-common-features/form-common-features.service';
import {
  UserProfile,
  UserProfileChangesI,
} from '../../utils/models/user-profile.interface';
import { UserProfileUpdateResultI } from '../../data-access/user-profile/user-profile.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatExpansionPanelHarness } from '@angular/material/expansion/testing';
import {
  MatRadioButtonHarness,
  MatRadioGroupHarness,
} from '@angular/material/radio/testing';
import { By } from '@angular/platform-browser';
import { randomId } from 'src/app/reusable/utils/data-tools/objectTools';
import { getElement } from 'src/app/reusable/utils/testing/utils/getElement';
import { setFormInputValue } from 'src/app/reusable/utils/testing/utils/setFormInputValue';
import { touchFormInput } from 'src/app/reusable/utils/testing/utils/touchFormInput';

@Component({
  standalone: true,
  selector: 'app-test',
  imports: [AccountSettingsLocalComponent],
  template: `
    <app-account-settings-local
      [user]="user"
      [result]="result"
    ></app-account-settings-local>
  `,
})
class TestComponent {
  user: UserProfile = {
    authOption: 'pin',
    name: 'Nick',
  };
  result: UserProfileUpdateResultI['state'] = 'idle';

  @ViewChild(AccountSettingsLocalComponent)
  testedComponent!: AccountSettingsLocalComponent;
}

describe('AccountSettingsLocalComponent - template', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let loader: HarnessLoader;
  let panel: MatExpansionPanelHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TestComponent],
      providers: [FormCommonFeaturesService] satisfies Provider[],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
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
    expect(component).toBeTruthy();
  });

  describe(`inputs`, () => {
    it(`should should receive UserProfile as Input.`, () => {
      expect(component.testedComponent.user).toBeTruthy();
    });

    it(`should not call _updateSendingState() when the result value is 'pending'.`, () => {
      // Arrange
      const spy = spyOn(
        component.testedComponent as any,
        '_updateSendingState'
      );
      component.result = 'pending';

      // Act
      fixture.detectChanges();

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });

    it(`should should call _updateSendingState() when result value is 'idle'.`, () => {
      // Arrange
      const spy = spyOn(
        component.testedComponent as any,
        '_updateSendingState'
      );
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
      const spy = spyOn(
        component.testedComponent as any,
        '_updateSendingState'
      );
      component.result = 'failure';

      // Act
      fixture.detectChanges();

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    it(`should should call _updateSendingState() when result value is 'success' and reset form controls.`, () => {
      // Arrange
      const updateSendingStateSpy = spyOn(
        component.testedComponent as any,
        '_updateSendingState'
      );
      const resetSpy = spyOn(
        component.testedComponent.localProfileForm,
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

  describe(`input group toggling and its state management.`, () => {
    it(`should find one expansion panel.`, async () => {
      const panels = await loader.getAllHarnesses(MatExpansionPanelHarness);
      expect(panels.length).toBe(1);
    });

    it(`should enable group inputs when user click the mat-accordion expansion panel (pinGroup).`, async () => {
      // Arrange
      const enablePassphrasePanelSpy = spyOn(
        component.testedComponent,
        'enablePassphrasePanel'
      ).and.callThrough();

      // Act
      await panel.expand();

      // Assert
      expect(enablePassphrasePanelSpy).toHaveBeenCalled();
      const controls = component.testedComponent.localProfileForm.controls;
      expect(controls.currentPassphrase.enabled).toBeTruthy();
      expect(controls.pinGroup.enabled).toBeTruthy();
    });

    it(`should enable group inputs when user click the mat-accordion expansion panel (pinGroup).`, async () => {
      // Arrange
      const enablePassphrasePanelSpy = spyOn(
        component.testedComponent,
        'enablePassphrasePanel'
      ).and.callThrough();

      // Act
      await panel.expand();
      const radioButton = await panel.getHarness(
        MatRadioButtonHarness.with({
          selector: `[data-test="radio-password"]`,
        })
      );
      await radioButton.check();

      // Assert
      expect(enablePassphrasePanelSpy).toHaveBeenCalled();
      const controls = component.testedComponent.localProfileForm.controls;
      expect(controls.currentPassphrase.enabled).toBeTruthy();
      expect(controls.passwordGroup.enabled).toBeTruthy();
    });
  });

  describe(`forms inputs`, () => {
    describe(`name`, () => {
      it(`should contain user's name`, () => {
        // Arrange
        // Act
        const userNameInput = fixture.debugElement.query(
          By.css(`[data-test="username"] input`)
        );

        // Assert
        expect(userNameInput.nativeElement.value).toBe('Nick');
      });

      it(`should show error message flag 'required' when user touched the input.`, async () => {
        // Arrange
        const newValue = '';
        const userNameInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="username"] input`
        );
        setFormInputValue(userNameInput, newValue);
        fixture.detectChanges();

        // Act
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="username"] .input-error`
        );

        // Assert
        const nameControl =
          component.testedComponent.localProfileForm.controls.name;
        expect(nameControl.errors?.['required']).toBe(true);
        expect(errorParagraph.textContent?.includes('required')).toBeTruthy();
      });

      it(`should show error message flag 'minlength' when user touched the input and set to short username`, async () => {
        // Arrange
        const newInputValue = 'X';
        const userNameInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="username"] input`
        );

        setFormInputValue(userNameInput, newInputValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();

        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="username"] .input-error`
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.controls.name.value
        ).toBe(newInputValue);
        expect(errorParagraph.textContent?.includes('too short')).toBeTruthy();
      });

      it(`should show error message flag 'maxlength' when user touched the input and set to long username`, async () => {
        // Arrange
        const newInputValue = randomId(16);
        const userNameInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="username"] input`
        );
        setFormInputValue(userNameInput, newInputValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();

        const errorParagraph = fixture.debugElement.query(
          By.css(`[data-test="username"] .input-error`)
        ).nativeElement as HTMLParagraphElement;

        // Assert
        expect(
          component.testedComponent.localProfileForm.controls.name.value
        ).toBe(newInputValue);
        expect(errorParagraph.textContent?.includes('too long')).toBeTruthy();
      });
    });

    describe(`currentPassphrase`, () => {
      beforeEach(async () => {
        await panel.expand();
      });

      it(`should show error message flag 'required' when user touched the input.`, async () => {
        // Arrange
        const userNameInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="current-passphrase"] input`
        );
        touchFormInput(userNameInput);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="current-passphrase"] .input-error`
        );

        // Assert
        const currentPassphraseControl =
          component.testedComponent.localProfileForm.controls.currentPassphrase;
        expect(currentPassphraseControl.errors?.['required']).toBe(true);
        expect(errorParagraph.textContent?.includes('required')).toBeTruthy();
      });

      it(`should show error message flag 'invalidCurrentPassphrase' when user wrote a new pin without filling currentPassphrase and clicked "Save changes".`, async () => {
        // Arrange
        const pinInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="pinGroup-pin"] input`
        );
        const newPin = '2537';
        setFormInputValue(pinInput, newPin);

        const confirmPinInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="pinGroup-confirmPin"] input`
        );
        setFormInputValue(confirmPinInput, newPin);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="current-passphrase"] .input-error`
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.hasError(
            'invalidCurrentPassphrase'
          )
        ).toBeTrue();
        expect(
          errorParagraph.textContent?.includes(`Please provide the current`)
        ).toBeTruthy();
      });
    });

    describe(`password`, () => {
      beforeEach(async () => {
        await panel.expand();

        const radioGroupHarness = await loader.getHarness(
          MatRadioGroupHarness.with({
            selector: `[data-test="auth-option-toggle"]`,
          })
        );

        const radioButton = await radioGroupHarness.getRadioButtons({
          selector: `[data-test="radio-password"]`,
        });
        await radioButton[0].check();
        fixture.detectChanges();
      });

      it(`should show error message flag 'required' when user touched the input.`, async () => {
        // Arrange
        const passwordInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="passwordGroup-password"] input`
        );
        touchFormInput(passwordInput);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="passwordGroup-password"] .input-error`
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.controls.passwordGroup
            .controls.password.errors?.['required']
        ).toBe(true);
        expect(errorParagraph.textContent?.includes('required')).toBeTruthy();
      });

      it(`should show error message flag 'passwordError' when user typed a password not meeting requirements.`, async () => {
        // Arrange
        const newValue = 'zaqwer';
        const passwordInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="passwordGroup-password"] input`
        );
        setFormInputValue(passwordInput, newValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="passwordGroup-password"] .input-error`
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.controls.passwordGroup
            .controls.password.errors?.['passwordError']
        ).toBe(true);
        expect(
          errorParagraph.textContent?.includes(
            'Invalid password. It must have 8 characters, numbers, and special characters.'
          )
        ).toBeTruthy();
      });

      it(`should not show any errors to the input if it meets the requirements.`, async () => {
        // Arrange
        const newValue = 'zzpoASE2019*';
        const passwordInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="passwordGroup-password"] input`
        );
        setFormInputValue(passwordInput, newValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = fixture.debugElement.query(
          By.css(`[data-test="passwordGroup-password"] .input-error`)
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.controls.passwordGroup
            .controls.password.errors
        ).toBe(null);
        expect(errorParagraph).toBeFalsy();
      });

      it(`should show error message 'samePassphrase' in case if currentPassphrase and ['passwordGroup', 'password] are the same.`, async () => {
        // Arrange
        component.user = { ...component.user, authOption: 'password' };
        await panel.expand();

        const radioButton = await panel.getHarness(
          MatRadioButtonHarness.with({
            selector: `[data-test="radio-password"]`,
          })
        );
        await radioButton.check();

        const currentPassphraseInput = getElement<
          TestComponent,
          HTMLInputElement
        >(fixture, `[data-test="current-passphrase"] input`);
        const passwordInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="passwordGroup-password"] input`
        );
        const newValue = 'asassaA@2DW';

        // Act
        currentPassphraseInput;
        setFormInputValue(currentPassphraseInput, newValue);
        setFormInputValue(passwordInput, newValue);
        fixture.detectChanges();

        await fixture.whenStable();
        const errorParagraph = getElement(
          fixture,
          `[data-test="same-passphrase-error"]`
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.hasError('samePassphrase')
        ).toBeTrue();
        expect(
          errorParagraph?.textContent?.includes(
            'Please provide a different new password'
          )
        ).toBeTrue();
      });
    });

    describe(`confirmPassword`, () => {
      beforeEach(async () => {
        await panel.expand();

        const radioGroupHarness = await loader.getHarness(
          MatRadioGroupHarness.with({
            selector: `[data-test="auth-option-toggle"]`,
          })
        );

        const radioButton = await radioGroupHarness.getRadioButtons({
          selector: `[data-test="radio-password"]`,
        });
        await radioButton[0].check();
        fixture.detectChanges();
      });

      it(`should show error message flag 'required' when user touched the input.`, async () => {
        // Arrange
        const confirmPasswordInput = getElement<
          TestComponent,
          HTMLInputElement
        >(fixture, `[data-test="passwordGroup-confirmPassword"] input`);
        touchFormInput(confirmPasswordInput);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="passwordGroup-confirmPassword"] .input-error`
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.controls.passwordGroup
            .controls.confirmPassword.errors?.['required']
        ).toBe(true);
        expect(errorParagraph.textContent?.includes('required')).toBeTruthy();
      });

      it(`should show error message flag 'passwordMatch' when user typed a password not meeting requirements.`, async () => {
        // Arrange
        const newValue = 'zaqwer';
        const passwordInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="passwordGroup-password"] input`
        );
        setFormInputValue(passwordInput, newValue);

        const differentNewValue = 'zaqwsde';
        const confirmPasswordInput = getElement<
          TestComponent,
          HTMLInputElement
        >(fixture, `[data-test="passwordGroup-confirmPassword"] input`);
        setFormInputValue(confirmPasswordInput, differentNewValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="passwordGroup-confirmPassword"] .input-error`
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.controls.passwordGroup
            .errors?.['passwordMatch']
        ).toBe(true);
        expect(
          errorParagraph.textContent?.includes('The passwords are not the same')
        ).toBeTruthy();
      });

      it(`should not show any errors to the input if it meets the requirements.`, async () => {
        // Arrange
        const newValue = 'zzpoASE2019*';
        const passwordInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="passwordGroup-password"] input`
        );
        setFormInputValue(passwordInput, newValue);
        const confirmPasswordInput = getElement<
          TestComponent,
          HTMLInputElement
        >(fixture, `[data-test="passwordGroup-confirmPassword"] input`);
        setFormInputValue(confirmPasswordInput, newValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = fixture.debugElement.query(
          By.css(`[data-test="passwordGroup-confirmPassword"] .input-error`)
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.controls.passwordGroup
            .controls.confirmPassword.errors
        ).toBe(null);
        expect(errorParagraph).toBeFalsy();
      });
    });

    describe(`pin`, () => {
      beforeEach(async () => {
        await panel.expand();
      });

      it(`should show error message flag 'required' when user touched the input.`, async () => {
        // Arrange
        const passwordInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="pinGroup-pin"] input`
        );
        touchFormInput(passwordInput);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="pinGroup-pin"] .input-error`
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.controls.pinGroup.controls
            .pin.errors?.['required']
        ).toBe(true);
        expect(errorParagraph.textContent?.includes('required')).toBeTruthy();
      });

      it(`should show error message flag 'pinError' when user typed a pin not meeting requirements.`, async () => {
        // Arrange
        const newValue = '1a2';
        const pinInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="pinGroup-pin"] input`
        );
        setFormInputValue(pinInput, newValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="pinGroup-pin"] .input-error`
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.controls.pinGroup.controls
            .pin.errors?.['pinError']
        ).toBe(true);
        expect(
          errorParagraph.textContent?.includes(
            'Invalid PIN. Use from 4 to 8 digits.'
          )
        ).toBeTruthy();
      });

      it(`should not show any errors to the input if it meets the requirements.`, async () => {
        // Arrange
        const newValue = '145623';
        const passwordInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="pinGroup-pin"] input`
        );
        setFormInputValue(passwordInput, newValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = fixture.debugElement.query(
          By.css(`[data-test="pinGroup-pin"] .input-error`)
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.controls.pinGroup.controls
            .pin.errors
        ).toBe(null);
        expect(errorParagraph).toBeFalsy();
      });

      it(`should show error message 'samePassphrase' in case if currentPassphrase and ['pinGroup', 'pin] are the same.`, async () => {
        // Arrange
        await panel.expand();

        const currentPassphraseInput = getElement<
          TestComponent,
          HTMLInputElement
        >(fixture, `[data-test="current-passphrase"] input`);
        const pinInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="pinGroup-pin"] input`
        );
        const newValue = '2137';

        // Act
        setFormInputValue(currentPassphraseInput, newValue);
        setFormInputValue(pinInput, newValue);
        fixture.detectChanges();

        await fixture.whenStable();
        const errorParagraph = getElement(
          fixture,
          `[data-test="same-passphrase-error"]`
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.hasError('samePassphrase')
        ).toBeTrue();
        expect(
          errorParagraph?.textContent?.includes(
            'Please provide a different new pin'
          )
        ).toBeTrue();
      });
    });

    describe(`confirmPin`, () => {
      beforeEach(async () => {
        await panel.expand();
      });

      it(`should show error message flag 'required' when user touched the input.`, async () => {
        // Arrange
        const confirmPinInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="pinGroup-confirmPin"] input`
        );
        touchFormInput(confirmPinInput);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="pinGroup-confirmPin"] .input-error`
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.controls.pinGroup.controls
            .confirmPin.errors?.['required']
        ).toBe(true);
        expect(errorParagraph.textContent?.includes('required')).toBeTruthy();
      });

      it(`should show error message flag 'pinMatch' when user typed a pin not meeting requirements.`, async () => {
        // Arrange
        const newValue = '1643';
        const pinInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="pinGroup-pin"] input`
        );
        setFormInputValue(pinInput, newValue);

        const differentNewValue = '1724';
        const confirmPinInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="pinGroup-confirmPin"] input`
        );
        setFormInputValue(confirmPinInput, differentNewValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="pinGroup-confirmPin"] .input-error`
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.controls.pinGroup.errors?.[
            'pinMatch'
          ]
        ).toBe(true);
        expect(
          errorParagraph.textContent?.includes('The PINs are not the same')
        ).toBeTruthy();
      });

      it(`should not show any errors to the input if it meets the requirements.`, async () => {
        // Arrange
        const newValue = '1836572';
        const pinInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="pinGroup-pin"] input`
        );
        setFormInputValue(pinInput, newValue);
        const confirmPinInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="pinGroup-confirmPin"] input`
        );
        setFormInputValue(confirmPinInput, newValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = fixture.debugElement.query(
          By.css(`[data-test="pinGroup-confirmPin"] .input-error`)
        );

        // Assert
        expect(
          component.testedComponent.localProfileForm.controls.pinGroup.controls
            .confirmPin.errors
        ).toBe(null);
        expect(errorParagraph).toBeFalsy();
      });
    });
  });

  describe(`ngSubmit`, () => {
    let submitButton: HTMLButtonElement;

    beforeEach(() => {
      submitButton = getElement<TestComponent, HTMLButtonElement>(
        fixture,
        `[data-test="submit-button"]`
      );
    });

    it(`should call onSubmit().`, async () => {
      // Arrange
      const spy = spyOn(component.testedComponent, 'onSubmit');

      // Act
      submitButton.click();
      await fixture.whenStable();

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    it(`should emit submittedChanges event when user did not open the expansion panel.`, async () => {
      // Arrange
      const observableSpy = spyOn(
        component.testedComponent['_unsuccessfulSubmitSubject'],
        'next'
      ).and.callThrough();
      const submitEmitterSpy = spyOn(
        component.testedComponent.submittedChanges,
        'emit'
      ).and.callThrough();

      const nameInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="username"] input`
      );

      // Act
      setFormInputValue(nameInput, 'Pablo_$2024');
      submitButton.click();
      await fixture.whenStable();

      // Assert
      expect(observableSpy).not.toHaveBeenCalledWith({
        state: true,
        cause: 'invalid-form',
      });
      expect(submitEmitterSpy).toHaveBeenCalledWith({
        authOption: component.user.authOption,
        name: 'Pablo_$2024',
        oldPassphrase: undefined,
        passphrase: undefined,
      } as UserProfileChangesI);
    });

    it(`should NOT emit submittedChanges event when user opened the expansion panel and not filled the inputs within.`, async () => {
      // Arrange
      const observableSpy = spyOn(
        component.testedComponent['_unsuccessfulSubmitSubject'],
        'next'
      ).and.callThrough();
      const submitEmitterSpy = spyOn(
        component.testedComponent.submittedChanges,
        'emit'
      ).and.callThrough();

      const nameInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="username"] input`
      );

      // Act
      await panel.expand();
      setFormInputValue(nameInput, 'Pablo_$2024');
      submitButton.click();
      await fixture.whenStable();

      // Assert
      expect(observableSpy).toHaveBeenCalledWith({
        state: true,
        cause: 'invalid-form',
      });
      expect(submitEmitterSpy).not.toHaveBeenCalled();
    });

    it(`should set _unsuccessfulSubmitSubject to true when form is invalid (incorrect name).`, async () => {
      // Arrange
      const observableSpy = spyOn(
        component.testedComponent['_unsuccessfulSubmitSubject'],
        'next'
      ).and.callThrough();
      const submitEmitterSpy = spyOn(
        component.testedComponent.submittedChanges,
        'emit'
      ).and.callThrough();
      const nameInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="username"] input`
      );

      // Act
      setFormInputValue(nameInput, 'X');
      submitButton.click();

      // Assert
      expect(observableSpy).toHaveBeenCalledWith({
        state: true,
        cause: 'invalid-form',
      });
      expect(submitEmitterSpy).not.toHaveBeenCalled();
    });

    it(`should set _unsuccessfulSubmitSubject to true when form is invalid (incorrect currentPassphrase).`, async () => {
      // Arrange
      await panel.expand();

      const radioButton = await panel.getHarness(
        MatRadioButtonHarness.with({
          selector: `[data-test="radio-password"]`,
        })
      );
      await radioButton.check();

      const observableSpy = spyOn(
        component.testedComponent['_unsuccessfulSubmitSubject'],
        'next'
      ).and.callThrough();
      const submitEmitterSpy = spyOn(
        component.testedComponent.submittedChanges,
        'emit'
      ).and.callThrough();

      const passwordInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="passwordGroup-password"] input`
      );
      const confirmPasswordInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="passwordGroup-confirmPassword"] input`
      );
      const newValue = 'azhahasAS54@#';

      // Act
      setFormInputValue(passwordInput, newValue);
      setFormInputValue(confirmPasswordInput, newValue);
      submitButton.click();
      await fixture.whenStable();

      // Assert
      expect(observableSpy).toHaveBeenCalledWith({
        state: true,
        cause: 'invalid-form',
      });
      expect(submitEmitterSpy).not.toHaveBeenCalled();
      expect(
        component.testedComponent.localProfileForm.hasError(
          'invalidCurrentPassphrase'
        )
      ).toBeTrue();
    });

    it(`should set _unsuccessfulSubmitSubject to true when form is invalid (incorrect password).`, async () => {
      // Arrange
      await panel.expand();
      const radioButton = await panel.getHarness(
        MatRadioButtonHarness.with({
          selector: `[data-test="radio-password"]`,
        })
      );
      await radioButton.check();

      const observableSpy = spyOn(
        component.testedComponent['_unsuccessfulSubmitSubject'],
        'next'
      ).and.callThrough();
      const submitEmitterSpy = spyOn(
        component.testedComponent.submittedChanges,
        'emit'
      ).and.callThrough();

      const passwordInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="passwordGroup-password"] input`
      );
      const newValue = 'azhahasAS';

      // Act
      setFormInputValue(passwordInput, newValue);
      submitButton.click();
      await fixture.whenStable();

      // Assert
      expect(observableSpy).toHaveBeenCalledWith({
        state: true,
        cause: 'invalid-form',
      });
      expect(submitEmitterSpy).not.toHaveBeenCalled();
      expect(
        component.testedComponent.localProfileForm.controls.passwordGroup
          .controls.password.errors?.['passwordError']
      ).toBeTrue();
    });

    it(`should set _unsuccessfulSubmitSubject to true when form is invalid (incorrect confirmPassword).`, async () => {
      // Arrange
      await panel.expand();
      const radioButton = await panel.getHarness(
        MatRadioButtonHarness.with({
          selector: `[data-test="radio-password"]`,
        })
      );
      await radioButton.check();

      const observableSpy = spyOn(
        component.testedComponent['_unsuccessfulSubmitSubject'],
        'next'
      ).and.callThrough();
      const submitEmitterSpy = spyOn(
        component.testedComponent.submittedChanges,
        'emit'
      ).and.callThrough();

      const currentPasswordInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="current-passphrase"] input`
      );
      const passwordInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="passwordGroup-password"] input`
      );
      const confirmPasswordInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="passwordGroup-confirmPassword"] input`
      );

      // Act
      setFormInputValue(currentPasswordInput, 'a1zhahasAS23!@');
      setFormInputValue(passwordInput, 'azhahasAS2323!@');
      setFormInputValue(confirmPasswordInput, 'azhahas');
      fixture.detectChanges();
      submitButton.click();

      const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
        fixture,
        `[data-test="passwordGroup-confirmPassword"] .input-error`
      );

      // Assert
      expect(observableSpy).toHaveBeenCalledWith({
        state: true,
        cause: 'invalid-form',
      });
      expect(submitEmitterSpy).not.toHaveBeenCalled();
      expect(
        component.testedComponent.localProfileForm.controls.passwordGroup
          .errors?.['passwordMatch']
      ).toBeTrue();
      expect(
        errorParagraph?.textContent?.includes('The passwords are')
      ).toBeTrue();
    });

    it(`should set _unsuccessfulSubmitSubject to true when form is invalid (current passphrase without new password).`, async () => {
      // Arrange
      await panel.expand();
      const radioButton = await panel.getHarness(
        MatRadioButtonHarness.with({
          selector: `[data-test="radio-password"]`,
        })
      );
      await radioButton.check();

      const observableSpy = spyOn(
        component.testedComponent['_unsuccessfulSubmitSubject'],
        'next'
      ).and.callThrough();
      const submitEmitterSpy = spyOn(
        component.testedComponent.submittedChanges,
        'emit'
      ).and.callThrough();

      const currentPasswordInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="current-passphrase"] input`
      );

      // Act
      setFormInputValue(currentPasswordInput, 'sasasASAsasas#$2');
      submitButton.click();
      fixture.detectChanges();

      const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
        fixture,
        `[data-test="invalid-new-passphrase-password"]`
      );

      // Assert
      expect(observableSpy).toHaveBeenCalledWith({
        state: true,
        cause: 'invalid-form',
      });
      expect(submitEmitterSpy).not.toHaveBeenCalled();
      expect(
        component.testedComponent.localProfileForm.errors?.[
          'invalidNewPassphrase'
        ]
      ).toBeTrue();
      expect(
        errorParagraph.textContent?.includes('Please provide a new password')
      ).toBeTruthy();
    });

    it(`should set _unsuccessfulSubmitSubject to true when form is invalid (current passphrase without new pin).`, async () => {
      // Arrange
      await panel.expand();
      const observableSpy = spyOn(
        component.testedComponent['_unsuccessfulSubmitSubject'],
        'next'
      ).and.callThrough();
      const submitEmitterSpy = spyOn(
        component.testedComponent.submittedChanges,
        'emit'
      ).and.callThrough();

      const currentPinInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="current-passphrase"] input`
      );

      // Act
      setFormInputValue(currentPinInput, '2845');
      submitButton.click();
      fixture.detectChanges();

      const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
        fixture,
        `[data-test="invalid-new-passphrase-pin"]`
      );

      // Assert
      expect(observableSpy).toHaveBeenCalledWith({
        state: true,
        cause: 'invalid-form',
      });
      expect(submitEmitterSpy).not.toHaveBeenCalled();
      expect(
        component.testedComponent.localProfileForm.errors?.[
          'invalidNewPassphrase'
        ]
      ).toBeTrue();
      expect(
        errorParagraph.textContent?.includes('Please provide a new pin')
      ).toBeTruthy();
    });

    it(`should set _unsuccessfulSubmitSubject to true when form is invalid (disabled authOption).`, async () => {
      // Arrange
      await panel.expand();
      const observableSpy = spyOn(
        component.testedComponent['_unsuccessfulSubmitSubject'],
        'next'
      ).and.callThrough();
      const submitEmitterSpy = spyOn(
        component.testedComponent.submittedChanges,
        'emit'
      ).and.callThrough();

      const currentPinInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="current-passphrase"] input`
      );
      const pinInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="pinGroup-pin"] input`
      );
      const confirmPinInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="pinGroup-confirmPin"] input`
      );
      spyOnProperty(
        component.testedComponent.localProfileForm,
        'invalid',
        'get'
      ).and.returnValue(false);

      // Act
      setFormInputValue(currentPinInput, '2845');
      setFormInputValue(pinInput, '853787');
      setFormInputValue(confirmPinInput, '853787');
      component.testedComponent.localProfileForm.controls.authOption.disable();
      submitButton.click();
      fixture.detectChanges();

      const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
        fixture,
        `[data-test="no-authOption"]`
      );

      // Assert
      expect(observableSpy).toHaveBeenCalledWith({
        state: true,
        cause: 'no-authOption',
      });
      expect(submitEmitterSpy).not.toHaveBeenCalled();
      expect(
        errorParagraph.textContent?.includes(
          'Something went wrong with setting new'
        )
      ).toBeTruthy();
    });
  });
});
