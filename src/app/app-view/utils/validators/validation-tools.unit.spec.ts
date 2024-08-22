import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LocalProfileFormI } from '../models/LocalProfileForm.interface';
import { AuthOptions } from 'src/app/auth/utils/Models/LocalAuthModels.interface';
import { checkAuthGroups, getPassphrases } from './validation-tools';
import {
  checkConfirmPassword,
  checkConfirmPin,
  checkPassword,
  checkPin,
} from 'src/app/reusable/utils/custom-validations/custom-validations';

const pin = '194683';
const password = 'wd.)8Y!0%2kges1dHERZ';

describe(`app-view form-validation-tools`, () => {
  let form: FormGroup<LocalProfileFormI>;

  beforeEach(() => {
    form = new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(15),
        ],
      }),
      currentPassphrase: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      authOption: new FormControl<AuthOptions>('pin', { nonNullable: true }),
      pinGroup: new FormGroup(
        {
          pin: new FormControl('', {
            validators: [Validators.required, checkPin],
          }),
          confirmPin: new FormControl('', {
            validators: [Validators.required],
          }),
        },
        { validators: [checkConfirmPin] }
      ),
      passwordGroup: new FormGroup(
        {
          password: new FormControl('', {
            validators: [Validators.required, checkPassword],
          }),
          confirmPassword: new FormControl('', {
            validators: [Validators.required],
          }),
        },
        {
          validators: [checkConfirmPassword],
        }
      ),
    });
  });

  describe(`checkAuthGroups()`, () => {
    it(`should return undefined if none of the groups is incorrect.`, () => {
      // Arrange
      form.get(['pinGroup', 'pin'])?.disable();
      form.get(['passwordGroup', 'confirmPassword'])?.disable();

      // Act
      const result = checkAuthGroups(form.controls);

      // Assert
      expect(result).toBeUndefined();
    });

    it(`should return undefined when input controls are valid but the group isn't.`, () => {
      // Arrange
      form.controls.pinGroup.setValue({
        pin: '1234',
        confirmPin: '12345',
      });

      // Act
      const result = checkAuthGroups(form.controls);

      // Assert
      expect(result).toBeUndefined();
    });

    it(`should return 'pin' when pinGroup, pin, and confirmPin are valid.`, () => {
      // Arrange
      form.controls.pinGroup.setValue({
        pin: pin,
        confirmPin: pin,
      });

      // Act
      const result = checkAuthGroups(form.controls);

      // Assert
      expect(result).toBe('pin');
    });

    it(`should return 'password' when passwordGroup, password, and confirmPassword are valid.`, () => {
      // Arrange
      form.controls.passwordGroup.setValue({
        password: password,
        confirmPassword: password,
      });

      // Act
      const result = checkAuthGroups(form.controls);

      // Assert
      expect(result).toBe('password');
    });
  });

  describe(`getPassphrases()`, () => {
    it(`should return { hasCurrentPassphrase: true, hasNewPassphrase: true } with checked value of currentPassphrase and newPassphrase (password).`, () => {
      // Arrange
      form.patchValue({
        authOption: 'pin',
        currentPassphrase: '1234',
        passwordGroup: {
          password: password,
          confirmPassword: password,
        },
      });

      // Act
      const result = getPassphrases(form);

      // Assert
      expect(result).toEqual({
        hasCurrentPassphrase: true,
        hasNewPassphrase: true,
      });
    });

    it(`should return { hasCurrentPassphrase: true, hasNewPassphrase: true } with checked value of currentPassphrase and newPassphrase (pin).`, () => {
      // Arrange
      form.patchValue({
        authOption: 'pin',
        currentPassphrase: '1234',
        pinGroup: {
          pin: pin,
          confirmPin: pin,
        },
      });

      // Act
      const result = getPassphrases(form);

      // Assert
      expect(result).toEqual({
        hasCurrentPassphrase: true,
        hasNewPassphrase: true,
      });
    });

    it(`should return { hasCurrentPassphrase: true, hasNewPassphrase: false } with checked value of currentPassphrase and invalid new passphrase group.`, () => {
      // Arrange
      form.patchValue({
        authOption: 'pin',
        currentPassphrase: '1234',
      });

      // Act
      const result = getPassphrases(form);

      // Assert
      expect(result).toEqual({
        hasCurrentPassphrase: true,
        hasNewPassphrase: false,
      });
    });

    it(`should return { hasCurrentPassphrase: false, hasNewPassphrase: true } with invalid value of currentPassphrase and valid new passphrase group.`, () => {
      // Arrange
      form.patchValue({
        authOption: 'pin',
        pinGroup: {
          pin: pin,
          confirmPin: pin,
        },
      });

      // Act
      const result = getPassphrases(form);

      // Assert
      expect(result).toEqual({
        hasCurrentPassphrase: false,
        hasNewPassphrase: true,
      });
    });

    it(`should return { hasCurrentPassphrase: false, hasNewPassphrase: false } with both currentPassphrase and new passphrase group invalid.`, () => {
      // Arrange

      // Act
      const result = getPassphrases(form);

      // Assert
      expect(result).toEqual({
        hasCurrentPassphrase: false,
        hasNewPassphrase: false,
      });
    });
  });
});
