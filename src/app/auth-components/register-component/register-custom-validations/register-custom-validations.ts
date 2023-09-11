// Create the angular validation that checks the first passport input and retype passport input to be the same, otherwise return {retypeError: true}

import { AbstractControl } from '@angular/forms';

export const checkRetypedPassport = (control: AbstractControl) => {
  const firstPassport = control.get('password');
  const secondPassport = control.get('retypedPassword');

  if (!firstPassport || !secondPassport) return null;

  if (
    firstPassport.value &&
    secondPassport.value &&
    firstPassport.value !== secondPassport.value
  )
    secondPassport.setErrors({ retypeError: true });
  else secondPassport.setErrors(null);

  return null;
};

export const checkEmail = (control: AbstractControl | string) => {
  const pattern = /^[a-zA-Z0-9\.\_\%\-]+@[a-z0-9\-]+\.[a-z]{2,3}$/;

  function checkInput(input: string) {
    return pattern.test(input) ? null : { emailError: true };
  }

  if (control instanceof AbstractControl) {
    if (!control.value) return null;
    return checkInput(control.value);
  }
  return checkInput(control);
};

export const checkName = (control: AbstractControl | string) => {
  const hasTwoCharsMinimum = /^[a-zA-Z\s]{2,}$/;
  const includesSpecialCharacter = /\s+/;

  function checkInput(input: string) {
    return hasTwoCharsMinimum.test(input)
      ? includesSpecialCharacter.test(input)
        ? { includesSpecialChars: true }
        : null
      : { shortName: true };
  }

  if (control instanceof AbstractControl) {
    if (!control.value) return null;
    return checkInput(control.value);
  }
  return checkInput(control);
};

export const checkPassport = (control: AbstractControl | string) => {
  const pattern =
    /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,20}$/;

  function checkInput(input: string) {
    return pattern.test(input) ? null : { passportError: true };
  }

  if (control instanceof AbstractControl) {
    if (!control.value) return null;
    return checkInput(control.value);
  }
  return checkInput(control);
};
