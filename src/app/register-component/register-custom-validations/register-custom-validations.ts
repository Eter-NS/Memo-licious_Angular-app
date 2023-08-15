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

export const checkEmail = (control: AbstractControl) => {
  const pattern = /^[a-zA-Z0-9\.\_\%\-]+@[a-z0-9\-]+\.[a-z]{2,3}$/;
  if (!control.value) return null;
  return pattern.test(control.value) ? null : { emailError: true };
};

export const checkName = (control: AbstractControl) => {
  const notShortNamePattern = /^[a-zA-Z\s]{2,}$/;
  const specialCharsPattern = /\s+/;
  if (!control.value) return null;
  return notShortNamePattern.test(control.value)
    ? specialCharsPattern.test(control.value)
      ? { includesSpecialChars: true }
      : null
    : { shortName: true };
};
