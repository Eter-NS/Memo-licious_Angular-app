import { AbstractControl, ValidationErrors } from '@angular/forms';

export const checkConfirmPassword = (
  control: AbstractControl
): ValidationErrors | null => {
  // After clicking the confirm password and blur action is triggered the error passwordMatch occurs
  const firstPassword = control.get('password');
  const secondPassword = control.get('confirmPassword');

  if (!firstPassword || !secondPassword) {
    return { InvalidPasswordConfig: true };
  }
  const firstValue = firstPassword.value as string | null | undefined;
  if (firstPassword.valid && firstValue === secondPassword.value) {
    secondPassword.setErrors(null);
    return null;
  } else {
    secondPassword.setErrors({ passwordMatch: true });
    return { passwordMatch: true };
  }
};

export const checkEmail = (
  control: AbstractControl | string
): ValidationErrors | null => {
  const pattern = /^[a-zA-Z0-9,+.]+@[a-z0-9]+\.[a-z]{2,3}$/;

  function checkInput(input: string) {
    return pattern.test(input) ? null : { emailError: true };
  }

  if (control instanceof AbstractControl) {
    if (control.pristine) return null;
    return checkInput(control.value);
  }
  return checkInput(control);
};

export const includesSpecialCharacter = (
  control: AbstractControl | string
): ValidationErrors | null => {
  const pattern = /\W+/;

  function checkInput(input: string) {
    return pattern.test(input) ? { includesSpecialChars: true } : null;
  }

  if (control instanceof AbstractControl) {
    if (control.pristine) return null;
    return checkInput(control.value);
  }
  return checkInput(control);
};

export const includesNumbers = (
  control: AbstractControl | string
): ValidationErrors | null => {
  const pattern = /\d+/;

  function checkInput(input: string) {
    return pattern.test(input) ? { includesNumbers: true } : null;
  }

  if (control instanceof AbstractControl) {
    if (control.pristine) return null;
    return checkInput(control.value);
  }
  return checkInput(control);
};

export const checkPassword = (
  control: AbstractControl | string
): ValidationErrors | null => {
  const pattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  function checkInput(input: string) {
    return !pattern.test(input) ? { passwordError: true } : null;
  }

  if (control instanceof AbstractControl) {
    if (control.pristine) return null;
    return checkInput(control.value);
  }
  return checkInput(control);
};

export const checkPin = (
  control: AbstractControl | string
): ValidationErrors | null => {
  const pattern = /^[0-9]{4,8}$/;

  function checkInput(input: string) {
    return pattern.test(input) ? null : { pinError: true };
  }

  if (control instanceof AbstractControl) {
    if (control.pristine) return null;
    return checkInput(control.value);
  }
  return checkInput(control);
};

export const checkConfirmPin = (
  control: AbstractControl
): ValidationErrors | null => {
  const pin1 = control.get('pin'),
    pin2 = control.get('confirmPin');

  if (!pin1 || !pin2) return { invalidSetup: true };

  if (pin1.valid && pin1.value === pin2.value) {
    pin1.setErrors(null);
    pin2.setErrors(null);
    return null;
  }

  pin2.setErrors({ unmatchedPins: true });
  return { unmatchedPins: true };
};
