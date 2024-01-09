import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import {
  checkConfirmPassword,
  checkConfirmPin,
  checkEmail,
  checkPassword,
  checkPin,
  includesNumbers,
  includesSpecialCharacter,
} from './custom-validations';

describe('CustomValidations - checkConfirmPassword', () => {
  let output: ValidationErrors | null;

  it('should return null if passwords match', () => {
    output = checkConfirmPassword(
      new FormGroup({
        password: new FormControl('zaq1@WSX2023'),
        confirmPassword: new FormControl('zaq1@WSX2023'),
      })
    );

    expect(output).toBeNull();
  });

  it('should return InvalidPasswordConfig if there is no password control', () => {
    output = checkConfirmPassword(
      new FormGroup({
        confirmPassword: new FormControl('zaq1@WSX2023'),
      })
    );

    expect(output).toEqual({ InvalidPasswordConfig: true });
  });

  it('should return InvalidPasswordConfig if there is no confirmPassword control', () => {
    output = checkConfirmPassword(
      new FormGroup({
        password: new FormControl('zaq1@WSX2023'),
      })
    );

    expect(output).toEqual({ InvalidPasswordConfig: true });
  });

  it('should return passwordMatch if the password does not match', () => {
    output = checkConfirmPassword(
      new FormGroup({
        password: new FormControl('zaq1@WSX2022'),
        confirmPassword: new FormControl('zaq1@WSX2023'),
      })
    );

    expect(output).toEqual({ passwordMatch: true });
  });
});

describe('CustomValidations - checkEmail', () => {
  let output: ValidationErrors | null;

  it('should return null if email is valid (input as string)', () => {
    output = checkEmail('example@example.com');

    expect(output).toBeNull();
  });

  it('should return null if email is valid (input as FormControl)', () => {
    let formControl = new FormControl('');

    formControl.setValue('example@example.com');
    formControl = Object.assign(formControl, { pristine: false });
    output = checkEmail(formControl);

    expect(output).toBeNull();
  });

  it('should return emailError if email is invalid (input as string)', () => {
    output = checkEmail('example@example');

    expect(output).toEqual({ emailError: true });
  });

  it('should return emailError if email is invalid (input as FormControl)', () => {
    let formControl = new FormControl('');

    formControl.setValue('example@example');
    formControl = Object.assign(formControl, { pristine: false });
    output = checkEmail(formControl);

    expect(output).toEqual({ emailError: true });
  });
});

describe('CustomValidations - includesSpecialCharacter', () => {
  let output: ValidationErrors | null;

  it('should return null if input does not include special characters (input as string)', () => {
    output = includesSpecialCharacter('Peter');

    expect(output).toBeNull();
  });

  it('should return null if input does not include special characters (input as FormControl)', () => {
    let formControl = new FormControl('');

    formControl.setValue('Peter');
    formControl = Object.assign(formControl, { pristine: false });
    output = includesSpecialCharacter(formControl);

    expect(output).toBeNull();
  });

  it('should return includesSpecialChars if input includes special characters (input as string)', () => {
    output = includesSpecialCharacter('Peter ');

    expect(output).toEqual({ includesSpecialChars: true });
  });

  it('should return includesSpecialChars if input includes special characters (input as FormControl)', () => {
    let formControl = new FormControl('');

    formControl.setValue('Peter ');
    formControl = Object.assign(formControl, { pristine: false });
    output = includesSpecialCharacter(formControl);

    expect(output).toEqual({ includesSpecialChars: true });
  });
});

describe('CustomValidations - includesNumbers', () => {
  let output: ValidationErrors | null;

  it('should return null if input does not include numbers (input as string)', () => {
    output = includesNumbers('Peter');

    expect(output).toBeNull();
  });

  it('should return null if input does not include numbers (input as FormControl)', () => {
    let formControl = new FormControl('');

    formControl.setValue('Peter');
    formControl = Object.assign(formControl, { pristine: false });
    output = includesNumbers(formControl);

    expect(output).toBeNull();
  });

  it('should return includesNumbers if input includes numbers (input as string)', () => {
    output = includesNumbers('Peter 123');

    expect(output).toEqual({ includesNumbers: true });
  });

  it('should return includesNumbers if input includes numbers (input as FormControl)', () => {
    let formControl = new FormControl('');

    formControl.setValue('Peter 123');
    formControl = Object.assign(formControl, { pristine: false });
    output = includesNumbers(formControl);

    expect(output).toEqual({ includesNumbers: true });
  });
});

describe('CustomValidations - checkPassword', () => {
  let output: ValidationErrors | null;

  it('should return null if password matches the requisites (input as string)', () => {
    output = checkPassword('zaq1@WSX2023');

    expect(output).toBeNull();
  });

  it('should return null if password matches the requisites (input as FormControl)', () => {
    let formControl = new FormControl('');

    formControl.setValue('zaq1@WSX2023');
    formControl = Object.assign(formControl, { pristine: false });
    output = checkPassword(formControl);

    expect(output).toBeNull();
  });

  it('should return passwordError if password does not match the requisites (input as string)', () => {
    output = checkPassword('zaq');

    expect(output).toEqual({ passwordError: true });
  });

  it('should return passwordError if password does not match the requisites (input as FormControl)', () => {
    let formControl = new FormControl('');

    formControl.setValue('zaq');
    formControl = Object.assign(formControl, { pristine: false });
    output = checkPassword(formControl);

    expect(output).toEqual({ passwordError: true });
  });
});

describe('CustomValidations - checkPin', () => {
  let output: ValidationErrors | null;

  it('should return null if pin matches the requisites (input as string)', () => {
    output = checkPin('1234');

    expect(output).toBeNull();
  });

  it('should return null if pin matches the requisites (input as FormControl)', () => {
    output = checkPin(new FormControl('1234'));

    expect(output).toBeNull();
  });

  it('should return pinError if pin does not match the requisites (input as string)', () => {
    output = checkPin('123');

    expect(output).toEqual({ pinError: true });
  });

  it('should return pinError if pin does not match the requisites (input as FormControl)', () => {
    let formControl = new FormControl('');

    formControl.setValue('123');
    formControl = Object.assign(formControl, { pristine: false });
    output = checkPin(formControl);

    expect(output).toEqual({ pinError: true });
  });
});

describe('CustomValidations - checkConfirmPin', () => {
  let output: ValidationErrors | null;

  it('should return null if pins match', () => {
    output = checkConfirmPin(
      new FormGroup({
        pin: new FormControl('1234'),
        confirmPin: new FormControl('1234'),
      })
    );

    expect(output).toBeNull();
  });

  it('should return invalidSetup if pin does not exist', () => {
    output = checkConfirmPin(
      new FormGroup({ confirmPin: new FormControl('1234') })
    );

    expect(output).toEqual({ invalidSetup: true });
  });

  it('should return invalidSetup if confirmPin does not exist', () => {
    output = checkConfirmPin(new FormGroup({ pin: new FormControl('1234') }));

    expect(output).toEqual({ invalidSetup: true });
  });

  it('should return unmatchedPins if pins do not match', () => {
    output = checkConfirmPin(
      new FormGroup({
        pin: new FormControl('1234'),
        confirmPin: new FormControl('123'),
      })
    );

    expect(output).toEqual({ unmatchedPins: true });
  });
});
