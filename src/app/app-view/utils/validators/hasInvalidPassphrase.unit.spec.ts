import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LocalProfileFormI } from '../models/LocalProfileForm.interface';
import { AuthOptions } from 'src/app/auth/utils/Models/LocalAuthModels.interface';
import {
  checkConfirmPassword,
  checkConfirmPin,
  checkPassword,
  checkPin,
} from 'src/app/reusable/utils/custom-validations/custom-validations';
import { hasInvalidPassphrase } from './hasInvalidPassphrase';

const pin = '194683';
const password = 'wd.)8Y!0%2kges1dHERZ';

const makeFormValid = (
  form: FormGroup<LocalProfileFormI>,
  newPassphrase: AuthOptions
) => {
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

  form.setValue({
    name: 'Sam',
    currentPassphrase: 'asasas@@#221DS',
    authOption: newPassphrase,

    ...newPassphraseObject,
  });
};

describe(`hasInvalidPassphrase`, () => {
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

  it(`should return null if the form is valid (password).`, () => {
    // Arrange
    makeFormValid(form, 'password');

    // Act
    const result1 = hasInvalidPassphrase('current')(form);
    const result2 = hasInvalidPassphrase('new')(form);

    // Assert
    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it(`should return null if the form is valid (pin).`, () => {
    // Arrange
    makeFormValid(form, 'pin');

    // Act
    const result1 = hasInvalidPassphrase('current')(form);
    const result2 = hasInvalidPassphrase('new')(form);

    // Assert
    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it(`should return { invalidCurrentPassphrase: true } if the current passphrase is invalid.`, () => {
    // Arrange
    makeFormValid(form, 'pin');
    form.patchValue({ currentPassphrase: '' });

    // Act
    const result1 = hasInvalidPassphrase('current')(form);
    const result2 = hasInvalidPassphrase('new')(form);

    // Assert
    expect(result1).toEqual({ invalidCurrentPassphrase: true });
    expect(result2).toBeNull();
  });

  it(`should return { invalidNewPassphrase: true } if the new passphrase is invalid.`, () => {
    // Arrange
    makeFormValid(form, 'pin');
    form.patchValue({ pinGroup: { pin: '' } });

    // Act
    const result1 = hasInvalidPassphrase('current')(form);
    const result2 = hasInvalidPassphrase('new')(form);

    // Assert
    expect(result1).toBeNull();
    expect(result2).toEqual({ invalidNewPassphrase: true });
  });
});
