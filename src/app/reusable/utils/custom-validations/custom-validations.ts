import { AbstractControl, ValidationErrors } from '@angular/forms';

export const checkConfirmPassword = (
  control: AbstractControl
): ValidationErrors | null => {
  // After clicking the confirm password and blur action is triggered the error passwordMatch occurs
  const firstPassword = control.get('password');
  const secondPassword = control.get('confirmPassword');

  if (!firstPassword || !secondPassword) {
    console.warn("The input 'password' or 'confirmPassword' was not found");
    return null;
  }
  const firstValue = firstPassword.value as string | null | undefined;
  if (firstPassword.valid && firstValue === secondPassword.value) {
    return null;
  } else {
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
    if (control.pristine) {
      return null;
    }

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
    if (control.pristine) {
      return null;
    }

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
    if (control.pristine) {
      return null;
    }

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
    if (control.pristine) {
      return null;
    }

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
    if (control.pristine) {
      return null;
    }

    return checkInput(control.value);
  }
  return checkInput(control);
};

export const checkConfirmPin = (
  control: AbstractControl
): ValidationErrors | null => {
  const pin1 = control.get('pin'),
    pin2 = control.get('confirmPin');

  if (!pin1 || !pin2) {
    return { invalidSetup: true };
  }

  if (pin1.valid && pin1.value === pin2.value) {
    return null;
  }

  return { pinMatch: true };
};

export const areInputsDifferent = (
  input1: string | string[],
  input2: string | string[],
  errorName: string
) => {
  return (group: AbstractControl): ValidationErrors | null => {
    const firstInput = group.get(input1);
    const secondInput = group.get(input2);

    if (!firstInput) {
      showError(input1);
      return null;
    }
    if (!secondInput) {
      showError(input2);
      return null;
    }

    if (firstInput.disabled && secondInput.disabled) {
      return null;
    }
    if (firstInput.pristine && secondInput.pristine) {
      return null;
    }

    return firstInput.value === secondInput.value
      ? { [errorName]: true }
      : null;

    function showError(inputName: string | string[]) {
      console.error(
        `No input has been found with name ${
          Array.isArray(inputName) ? inputName.join(', ') : inputName
        }`
      );
    }
  };
};
