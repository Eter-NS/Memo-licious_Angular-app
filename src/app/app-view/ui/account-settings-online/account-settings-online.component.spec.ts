/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettingsOnlineComponent } from './account-settings-online.component';
import { Component, Provider, ViewChild } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserProfile } from '../../utils/models/user-profile.interface';
import { UserProfileUpdateResultI } from '../../data-access/user-profile/user-profile.service';
import { FormCommonFeaturesService } from 'src/app/reusable/data-access/form-common-features/form-common-features.service';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatExpansionPanelHarness } from '@angular/material/expansion/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { By } from '@angular/platform-browser';
import { getElement } from 'src/app/reusable/utils/testing/utils/getElement';
import { setFormInputValue } from 'src/app/reusable/utils/testing/utils/setFormInputValue';
import { randomId } from 'src/app/reusable/utils/data-tools/objectTools';
import { touchFormInput } from 'src/app/reusable/utils/testing/utils/touchFormInput';

@Component({
  standalone: true,
  selector: 'app-test',
  imports: [AccountSettingsOnlineComponent],
  template: `
    <app-account-settings-online
      [user]="user"
      [result]="result"
      (submittedChanges)="onSubmittedChanges($event)"
    ></app-account-settings-online>
  `,
})
class TestComponent {
  user: UserProfile = {
    authOption: 'password',
    name: 'Nick',
  };
  result: UserProfileUpdateResultI['state'] = 'idle';

  // eslint-disable-next-line @typescript-eslint/ban-types
  onSubmittedChanges!: Function;

  @ViewChild(AccountSettingsOnlineComponent)
  testedComponent!: AccountSettingsOnlineComponent;
}

describe('AccountSettingsOnlineComponent - template', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let loader: HarnessLoader;
  let changeEmailPanel: MatExpansionPanelHarness;
  let changePasswordPanel: MatExpansionPanelHarness;

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
        component.testedComponent.onlineProfileForm,
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
    it(`should find two expansion panels.`, async () => {
      const panels = await loader.getAllHarnesses(MatExpansionPanelHarness);
      expect(panels.length).toBe(2);
    });

    it(`should enable group inputs when user click the mat-accordion expansion panel (changeEmail).`, async () => {
      // Arrange
      const enablePanelSpy = spyOn(
        component.testedComponent,
        'enablePanel'
      ).and.callThrough();

      // Act
      await changeEmailPanel.expand();

      // Assert
      expect(enablePanelSpy).toHaveBeenCalledWith('changeEmail');
      const controls = component.testedComponent.onlineProfileForm.controls;
      expect(controls.changeEmail.enabled).toBeTruthy();
      expect(controls.changeEmail.controls.currentEmail.enabled).toBeTruthy();
    });

    it(`should enable group inputs when user click the mat-accordion expansion panel (changePassword).`, async () => {
      // Arrange
      const enablePanelSpy = spyOn(
        component.testedComponent,
        'enablePanel'
      ).and.callThrough();

      // Act
      await changePasswordPanel.expand();

      // Assert
      expect(enablePanelSpy).toHaveBeenCalled();
      const controls = component.testedComponent.onlineProfileForm.controls;
      expect(controls.changePassword.enabled).toBeTruthy();
      expect(
        controls.changePassword.controls.currentPassword.enabled
      ).toBeTruthy();
    });
  });

  describe(`forms inputs`, () => {
    describe(`name`, () => {
      it(`should contain user's name`, () => {
        // Arrange
        // Act
        const nameInput = fixture.debugElement.query(
          By.css(`[data-test="name"] input`)
        );

        // Assert
        expect(nameInput.nativeElement.value).toBe('Nick');
      });

      it(`should show error message flag 'required' when user touched the input.`, async () => {
        // Arrange
        const newValue = '';
        const nameInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="name"] input`
        );
        setFormInputValue(nameInput, newValue);
        fixture.detectChanges();

        // Act
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="name"] .input-error`
        );

        // Assert
        const nameControl =
          component.testedComponent.onlineProfileForm.controls.name;
        expect(nameControl.errors?.['required']).toBe(true);
        expect(errorParagraph.textContent?.includes('required')).toBeTruthy();
      });

      it(`should show error message flag 'minlength' when user touched the input and set to short username`, async () => {
        // Arrange
        const newInputValue = 'X';
        const nameInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="name"] input`
        );

        setFormInputValue(nameInput, newInputValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();

        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="name"] .input-error`
        );

        // Assert
        expect(
          component.testedComponent.onlineProfileForm.controls.name.value
        ).toBe(newInputValue);
        expect(errorParagraph.textContent?.includes('too short')).toBeTruthy();
      });

      it(`should show error message flag 'maxlength' when user touched the input and set to long username`, async () => {
        // Arrange
        const newInputValue = randomId(16);
        const nameInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="name"] input`
        );
        setFormInputValue(nameInput, newInputValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();

        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="name"] .input-error`
        );

        // Assert
        expect(
          component.testedComponent.onlineProfileForm.controls.name.value
        ).toBe(newInputValue);
        expect(errorParagraph.textContent?.includes('too long')).toBeTruthy();
      });
    });

    describe(`currentEmail`, () => {
      beforeEach(async () => {
        await changeEmailPanel.expand();
      });

      it(`should show error message flag 'required' when user touched the input.`, async () => {
        // Arrange
        const currentEmailInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="emailGroup-currentEmail"] input`
        );
        touchFormInput(currentEmailInput);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="emailGroup-currentEmail"] .input-error`
        );

        // Assert
        const currentEmailControl =
          component.testedComponent.onlineProfileForm.controls.changeEmail
            .controls.currentEmail;
        expect(currentEmailControl.errors?.['required']).toBe(true);
        expect(errorParagraph.textContent?.includes('required')).toBeTruthy();
      });

      it(`should show error message flag 'emailError' when user wrote invalid email.`, async () => {
        // Arrange
        const currentEmailInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="emailGroup-currentEmail"] input`
        );
        const newEmail = 'example%@example.com';
        setFormInputValue(currentEmailInput, newEmail);

        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="emailGroup-currentEmail"] .input-error`
        );

        // Assert
        const currentEmailControl =
          component.testedComponent.onlineProfileForm.controls.changeEmail
            .controls.currentEmail;
        expect(currentEmailControl.hasError('emailError')).toBeTrue();
        expect(
          errorParagraph.textContent?.includes(`This is not an email`)
        ).toBeTruthy();
      });

      it(`should be valid when user fills the input.`, async () => {
        // Arrange
        const value = 'example.old@example.com';
        const currentEmailInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="emailGroup-currentEmail"] input`
        );
        setFormInputValue(currentEmailInput, value);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = fixture.debugElement.query(
          By.css(`[data-test="emailGroup-currentEmail"] .input-error`)
        );
        const errorParagraph2 = fixture.debugElement.query(
          By.css(`[data-test="sameEmail-error"] .input-error`)
        );

        // Assert
        expect(
          component.testedComponent.onlineProfileForm.controls.changeEmail
            .controls.currentEmail.valid
        ).toBe(true);
        expect(errorParagraph).toBeFalsy();
        expect(errorParagraph2).toBeFalsy();
      });
    });

    describe(`email`, () => {
      beforeEach(async () => {
        await changeEmailPanel.expand();
      });

      it(`should show error message flag 'required' when user touched the input.`, async () => {
        // Arrange
        const emailInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="emailGroup-email"] input`
        );
        touchFormInput(emailInput);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="emailGroup-email"] .input-error`
        );

        // Assert
        expect(
          component.testedComponent.onlineProfileForm.controls.changeEmail
            .controls.email.errors?.['required']
        ).toBe(true);
        expect(errorParagraph.textContent?.includes('required')).toBeTruthy();
      });

      it(`should show error message flag 'emailError' when user wrote invalid email.`, async () => {
        // Arrange
        const emailInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="emailGroup-email"] input`
        );
        const newEmail = 'example%@example.com';
        setFormInputValue(emailInput, newEmail);

        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="emailGroup-email"] .input-error`
        );

        // Assert
        const emailControl =
          component.testedComponent.onlineProfileForm.controls.changeEmail
            .controls.email;
        expect(emailControl.hasError('emailError')).toBeTrue();
        expect(
          errorParagraph.textContent?.includes(`This is not an email`)
        ).toBeTruthy();
      });

      it(`should show error message flag 'sameEmail' when user wrote two identical emails.`, async () => {
        // Arrange
        const newEmail = 'example%@example.com';
        const currentEmailInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="emailGroup-currentEmail"] input`
        );
        const emailInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="emailGroup-email"] input`
        );
        setFormInputValue(currentEmailInput, newEmail);
        setFormInputValue(emailInput, newEmail);

        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="sameEmail-error"]`
        );

        // Assert
        const changeEmailGroup =
          component.testedComponent.onlineProfileForm.controls.changeEmail;
        expect(changeEmailGroup.hasError('sameEmail')).toBeTrue();
        expect(
          errorParagraph.textContent?.includes(`The emails are the same`)
        ).toBeTruthy();
      });

      it(`should be valid when user fills the input.`, async () => {
        // Arrange
        const newValue = 'example.new@example2.com';
        const emailInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="emailGroup-email"] input`
        );
        setFormInputValue(emailInput, newValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = fixture.debugElement.query(
          By.css(`[data-test="emailGroup-email"] .input-error`)
        );
        const errorParagraph2 = fixture.debugElement.query(
          By.css(`[data-test="sameEmail-error"] .input-error`)
        );

        // Assert
        expect(
          component.testedComponent.onlineProfileForm.controls.changeEmail
            .controls.email.valid
        ).toBe(true);
        expect(errorParagraph).toBeFalsy();
        expect(errorParagraph2).toBeFalsy();
      });
    });

    describe(`currentPassword (changeEmail)`, () => {
      beforeEach(async () => {
        await changeEmailPanel.expand();
      });

      it(`should show error message flag 'required' when user touched the input.`, async () => {
        // Arrange
        const currentPasswordInput = getElement<
          TestComponent,
          HTMLInputElement
        >(fixture, `[data-test="emailGroup-currentPassword"] input`);
        touchFormInput(currentPasswordInput);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="emailGroup-currentPassword"] .input-error`
        );

        // Assert
        expect(
          component.testedComponent.onlineProfileForm.controls.changeEmail
            .controls.currentPassword.errors?.['required']
        ).toBe(true);
        expect(errorParagraph.textContent?.includes('required')).toBeTruthy();
      });

      it(`should be valid when user fills the input.`, async () => {
        // Arrange
        const newValue = 'eda$2rr2ff4FEF';
        const currentPasswordInput = getElement<
          TestComponent,
          HTMLInputElement
        >(fixture, `[data-test="emailGroup-currentPassword"] input`);
        setFormInputValue(currentPasswordInput, newValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = fixture.debugElement.query(
          By.css(`[data-test="emailGroup-currentPassword"] .input-error`)
        );

        // Assert
        expect(
          component.testedComponent.onlineProfileForm.controls.changeEmail
            .controls.currentPassword.valid
        ).toBe(true);
        expect(errorParagraph).toBeFalsy();
      });
    });

    describe(`currentPassword (changePassword)`, () => {
      beforeEach(async () => {
        await changePasswordPanel.expand();
      });

      it(`should show error message flag 'required' when user touched the input.`, async () => {
        // Arrange
        const currentPasswordInput = getElement<
          TestComponent,
          HTMLInputElement
        >(fixture, `[data-test="passwordGroup-currentPassword"] input`);
        touchFormInput(currentPasswordInput);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = getElement<TestComponent, HTMLParagraphElement>(
          fixture,
          `[data-test="passwordGroup-currentPassword"] .input-error`
        );

        // Assert
        const currentPasswordControl =
          component.testedComponent.onlineProfileForm.controls.changePassword
            .controls.currentPassword;
        expect(currentPasswordControl.errors?.['required']).toBe(true);
        expect(errorParagraph.textContent?.includes('required')).toBeTruthy();
      });

      it(`should be valid when user fills the input.`, async () => {
        // Arrange
        const newValue = 'eda$2rr2ff4F';
        const currentPasswordInput = getElement<
          TestComponent,
          HTMLInputElement
        >(fixture, `[data-test="passwordGroup-currentPassword"] input`);
        setFormInputValue(currentPasswordInput, newValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = fixture.debugElement.query(
          By.css(`[data-test="passwordGroup-currentPassword"] .input-error`)
        );

        // Assert
        expect(
          component.testedComponent.onlineProfileForm.controls.changePassword
            .controls.currentPassword.valid
        ).toBe(true);
        expect(errorParagraph).toBeFalsy();
      });
    });

    describe(`password`, () => {
      beforeEach(async () => {
        await changePasswordPanel.expand();
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
          component.testedComponent.onlineProfileForm.controls.changePassword
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
          component.testedComponent.onlineProfileForm.controls.changePassword
            .controls.password.errors?.['passwordError']
        ).toBe(true);
        expect(
          errorParagraph.textContent?.includes(
            'The password must have 8 characters, numbers, and special characters'
          )
        ).toBeTruthy();
      });

      it(`should be valid when user fills the input.`, async () => {
        // Arrange
        const newValue = 'eda$2rr2ff4F';
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
          component.testedComponent.onlineProfileForm.controls.changePassword
            .controls.password.valid
        ).toBe(true);
        expect(errorParagraph).toBeFalsy();
      });
    });

    describe(`confirmPassword`, () => {
      beforeEach(async () => {
        await changePasswordPanel.expand();
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
          component.testedComponent.onlineProfileForm.controls.changePassword
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
          component.testedComponent.onlineProfileForm.controls.changePassword
            .errors?.['passwordMatch']
        ).toBe(true);
        expect(
          errorParagraph.textContent?.includes('The passwords are not the same')
        ).toBeTruthy();
      });

      it(`should be valid when user fills the input.`, async () => {
        // Arrange
        const newValue = 'eda$2rr2ff4FEF';
        const passwordInput = getElement<TestComponent, HTMLInputElement>(
          fixture,
          `[data-test="passwordGroup-password"] input`
        );
        const confirmPasswordInput = getElement<
          TestComponent,
          HTMLInputElement
        >(fixture, `[data-test="passwordGroup-confirmPassword"] input`);

        setFormInputValue(passwordInput, newValue);
        setFormInputValue(confirmPasswordInput, newValue);
        fixture.detectChanges();

        // Act
        await fixture.whenStable();
        const errorParagraph = fixture.debugElement.query(
          By.css(`[data-test="passwordGroup-confirmPassword"] .input-error`)
        );

        // Assert
        expect(
          component.testedComponent.onlineProfileForm.controls.changePassword
            .controls.confirmPassword.valid
        ).toBe(true);
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
        `[data-test="name"] input`
      );

      // Act
      setFormInputValue(nameInput, 'Pablooo');
      submitButton.click();
      await fixture.whenStable();

      // Assert
      expect(observableSpy).not.toHaveBeenCalledWith({
        state: true,
        cause: 'invalid-form',
      });
      expect(submitEmitterSpy).toHaveBeenCalledWith({
        authOption: 'password',
        name: 'Pablooo',
        oldEmail: undefined,
        email: undefined,
        oldPassphrase: undefined,
        passphrase: undefined,
      });
    });

    it(`should NOT emit submittedChanges event when user opened the expansion panel and not filled the inputs within (changeEmail).`, async () => {
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
        `[data-test="name"] input`
      );

      // Act
      await changeEmailPanel.expand();
      setFormInputValue(nameInput, 'Pablooo');
      submitButton.click();
      await fixture.whenStable();

      // Assert
      expect(observableSpy).toHaveBeenCalledWith({
        state: true,
        cause: 'invalid-form',
      });
      expect(submitEmitterSpy).not.toHaveBeenCalled();
    });

    it(`should NOT emit submittedChanges event when user opened the expansion panel and not filled the inputs within (changePassword).`, async () => {
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
        `[data-test="name"] input`
      );

      // Act
      await changePasswordPanel.expand();
      setFormInputValue(nameInput, 'Pablooo');
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
        `[data-test="name"] input`
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

    it(`should set _unsuccessfulSubmitSubject to true when form is invalid (incorrect changeEmail).`, async () => {
      // Arrange
      await changeEmailPanel.expand();

      const observableSpy = spyOn(
        component.testedComponent['_unsuccessfulSubmitSubject'],
        'next'
      ).and.callThrough();
      const submitEmitterSpy = spyOn(
        component.testedComponent.submittedChanges,
        'emit'
      ).and.callThrough();

      const currentEmailInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="emailGroup-currentEmail"] input`
      );
      const emailInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="emailGroup-email"] input`
      );
      const currentPasswordInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="emailGroup-currentPassword"] input`
      );

      // Act
      setFormInputValue(currentEmailInput, 'example@example.com');
      setFormInputValue(emailInput, 'example@#asc.si');
      setFormInputValue(currentPasswordInput, 'azhahasAS54@#');

      submitButton.click();
      await fixture.whenStable();

      // Assert
      expect(observableSpy).toHaveBeenCalledWith({
        state: true,
        cause: 'invalid-form',
      });
      expect(submitEmitterSpy).not.toHaveBeenCalled();
    });

    it(`should set _unsuccessfulSubmitSubject to true when form is invalid (incorrect changePassword).`, async () => {
      // Arrange
      await changePasswordPanel.expand();

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
        `[data-test="passwordGroup-currentPassword"] input`
      );
      const passwordInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="passwordGroup-password"] input`
      );
      const confirmPasswordInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="passwordGroup-confirmPassword"] input`
      );
      const value = 'sajdhfdbedb2434';

      // Act
      setFormInputValue(currentPasswordInput, value + '23');
      setFormInputValue(passwordInput, value);
      setFormInputValue(confirmPasswordInput, value + 'dsds');

      submitButton.click();
      await fixture.whenStable();

      // Assert
      expect(observableSpy).toHaveBeenCalledWith({
        state: true,
        cause: 'invalid-form',
      });
      expect(submitEmitterSpy).not.toHaveBeenCalled();
    });

    it(`should emit submittedChanged event when user opened changeEmail group and filled correctly.`, async () => {
      // Arrange
      await changeEmailPanel.expand();

      const observableSpy = spyOn(
        component.testedComponent['_unsuccessfulSubmitSubject'],
        'next'
      ).and.callThrough();
      const submitEmitterSpy = spyOn(
        component.testedComponent.submittedChanges,
        'emit'
      ).and.callThrough();

      const currentEmailInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="emailGroup-currentEmail"] input`
      );
      const emailInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="emailGroup-email"] input`
      );
      const currentPasswordInput = getElement<TestComponent, HTMLInputElement>(
        fixture,
        `[data-test="emailGroup-currentPassword"] input`
      );

      // Act
      setFormInputValue(currentEmailInput, 'example@example.com');
      setFormInputValue(emailInput, 'example2.hello@o2.com');
      setFormInputValue(currentPasswordInput, 'azhahasAS54@#');

      submitButton.click();
      await fixture.whenStable();

      // Assert
      expect(observableSpy).toHaveBeenCalledWith({ state: false });
      expect(submitEmitterSpy).toHaveBeenCalledWith({
        name: component.user.name,
        authOption: component.user.authOption,
        oldEmail: 'example@example.com',
        email: 'example2.hello@o2.com',
        oldPassphrase: 'azhahasAS54@#',
        passphrase: undefined,
      });
    });
  });
});
