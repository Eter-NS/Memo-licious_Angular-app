import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import {
  areInputsDifferent,
  checkConfirmPassword,
  checkConfirmPin,
  checkEmail,
  checkPassword,
  checkPin,
  includesNumbers,
  includesSpecialCharacter,
} from './custom-validations';

describe(`custom validations`, () => {
  let output: ValidationErrors | null;

  describe('checkConfirmPassword', () => {
    it('should return null if passwords match', () => {
      output = checkConfirmPassword(
        new FormGroup({
          password: new FormControl('zaq1@WSX2023'),
          confirmPassword: new FormControl('zaq1@WSX2023'),
        })
      );

      expect(output).toBeNull();
    });

    it('should return null if there is no password control', () => {
      const spy = spyOn(console, 'warn').and.stub();
      output = checkConfirmPassword(
        new FormGroup({
          confirmPassword: new FormControl('zaq1@WSX2023'),
        })
      );

      expect(spy).toHaveBeenCalled();
      expect(output).toBe(null);
    });

    it('should return null if there is no confirmPassword control', () => {
      const spy = spyOn(console, 'warn').and.stub();
      output = checkConfirmPassword(
        new FormGroup({
          password: new FormControl('zaq1@WSX2023'),
        })
      );

      expect(spy).toHaveBeenCalled();
      expect(output).toBe(null);
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

  describe('checkEmail', () => {
    it('should return null if email is valid (input as string)', () => {
      output = checkEmail('example@example.com');

      expect(output).toBeNull();
    });

    it('should return null if email is valid (input as FormControl)', () => {
      const formControl = new FormControl('');

      formControl.setValue('example@example.com');
      formControl.markAsDirty();
      output = checkEmail(formControl);

      expect(output).toBeNull();
    });

    it('should return emailError if email is invalid (input as string)', () => {
      output = checkEmail('example@example');

      expect(output).toEqual({ emailError: true });
    });

    it('should return emailError if email is invalid (input as FormControl)', () => {
      const formControl = new FormControl('');

      formControl.setValue('example@example');
      formControl.markAsDirty();
      output = checkEmail(formControl);

      expect(output).toEqual({ emailError: true });
    });

    it(`should return null if the email is pristine.`, () => {
      // Arrange
      const formControl = new FormControl('');

      // Act
      output = checkEmail(formControl);

      // Assert
      expect(output).toBeNull();
    });
  });

  describe('includesSpecialCharacter', () => {
    it('should return null if input does not include special characters (input as string)', () => {
      output = includesSpecialCharacter('Peter');

      expect(output).toBeNull();
    });

    it('should return null if input does not include special characters (input as FormControl)', () => {
      const formControl = new FormControl('');

      formControl.setValue('Peter');
      formControl.markAsDirty();
      output = includesSpecialCharacter(formControl);

      expect(output).toBeNull();
    });

    it('should return includesSpecialChars if input includes special characters (input as string)', () => {
      output = includesSpecialCharacter('Peter ');

      expect(output).toEqual({ includesSpecialChars: true });
    });

    it('should return includesSpecialChars if input includes special characters (input as FormControl)', () => {
      const formControl = new FormControl('');

      formControl.setValue('Peter ');
      formControl.markAsDirty();
      output = includesSpecialCharacter(formControl);

      expect(output).toEqual({ includesSpecialChars: true });
    });

    it(`should return null if the input is pristine.`, () => {
      // Arrange
      const formControl = new FormControl('');

      // Act
      output = includesSpecialCharacter(formControl);

      // Assert
      expect(output).toBeNull();
    });
  });

  describe('includesNumbers', () => {
    it('should return null if input does not include numbers (input as string)', () => {
      output = includesNumbers('Peter');

      expect(output).toBeNull();
    });

    it('should return null if input does not include numbers (input as FormControl)', () => {
      const formControl = new FormControl('');

      formControl.setValue('Peter');
      formControl.markAsDirty();
      output = includesNumbers(formControl);

      expect(output).toBeNull();
    });

    it('should return includesNumbers if input includes numbers (input as string)', () => {
      output = includesNumbers('Peter 123');

      expect(output).toEqual({ includesNumbers: true });
    });

    it('should return includesNumbers if input includes numbers (input as FormControl)', () => {
      const formControl = new FormControl('');

      formControl.setValue('Peter 123');
      formControl.markAsDirty();
      output = includesNumbers(formControl);

      expect(output).toEqual({ includesNumbers: true });
    });

    it(`should return null if the input is pristine.`, () => {
      // Arrange
      const formControl = new FormControl('');

      // Act
      output = includesNumbers(formControl);

      // Assert
      expect(output).toBeNull();
    });
  });

  describe('checkPassword', () => {
    it('should return null if password matches the requisites (input as string)', () => {
      output = checkPassword('zaq1@WSX2023');

      expect(output).toBeNull();
    });

    it('should return null if password matches the requisites (input as FormControl)', () => {
      const formControl = new FormControl('');

      formControl.setValue('zaq1@WSX2023');
      formControl.markAsDirty();
      output = checkPassword(formControl);

      expect(output).toBeNull();
    });

    it('should return passwordError if password does not match the requisites (input as string)', () => {
      output = checkPassword('zaq');

      expect(output).toEqual({ passwordError: true });
    });

    it('should return passwordError if password does not match the requisites (input as FormControl)', () => {
      const formControl = new FormControl('');

      formControl.setValue('zaq');
      formControl.markAsDirty();
      output = checkPassword(formControl);

      expect(output).toEqual({ passwordError: true });
    });

    it(`should return null if the input is pristine.`, () => {
      // Arrange
      const formControl = new FormControl('');

      // Act
      output = checkPassword(formControl);

      // Assert
      expect(output).toBeNull();
    });
  });

  describe('checkPin', () => {
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
      const formControl = new FormControl('');

      formControl.setValue('123');
      formControl.markAsDirty();
      output = checkPin(formControl);

      expect(output).toEqual({ pinError: true });
    });
  });

  describe('checkConfirmPin', () => {
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

    it('should return pinMatch if pins do not match', () => {
      output = checkConfirmPin(
        new FormGroup({
          pin: new FormControl('1234'),
          confirmPin: new FormControl('123'),
        })
      );

      expect(output).toEqual({ pinMatch: true });
    });
  });

  describe(`areInputsDifferent()`, () => {
    it(`should return a validator function.`, () => {
      // Arrange
      const input1 = 'input1';
      const input2 = 'input2';
      const errorName = 'example-error';

      // Act
      const validator = areInputsDifferent(input1, input2, errorName);

      // Assert
      expect(typeof validator).toBe('function');
    });

    it(`should log an error and return null if the first input is not defined.`, () => {
      // Arrange
      const input1 = 'input1';
      const input2 = 'input2';
      const formGroup = new FormGroup({
        [input2]: new FormControl('input2-value'),
      });
      const errorName = 'example-error';
      const spy = spyOn(console, 'error').and.stub();

      // Act
      const validator = areInputsDifferent(input1, input2, errorName);
      const result = validator(formGroup);

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it(`should log an error and return null if the second input is not defined.`, () => {
      // Arrange
      const input1 = 'input1';
      const input2 = 'input2';
      const formGroup = new FormGroup({
        [input1]: new FormControl('input1-value'),
      });
      const errorName = 'example-error';
      const spy = spyOn(console, 'error').and.stub();

      // Act
      const validator = areInputsDifferent(input1, input2, errorName);
      const result = validator(formGroup);

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it(`should log an error and return null if the nested input is not defined.`, () => {
      // Arrange
      const input1 = ['input1', 'nestedInput'];
      const input2 = 'input2';
      const formGroup = new FormGroup({
        [input1[0]]: new FormControl('input1-value'),
        [input2]: new FormControl('input2-value'),
      });
      const errorName = 'example-error';
      const spy = spyOn(console, 'error').and.stub();

      // Act
      const validator = areInputsDifferent(input1, input2, errorName);
      const result = validator(formGroup);

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it(`should return null if both inputs are disabled.`, () => {
      // Arrange
      const input1 = 'input1';
      const input2 = 'input2';
      const formGroup = new FormGroup({
        [input1]: new FormControl({ value: 'input1-value', disabled: true }),
        [input2]: new FormControl({ value: 'input2-value', disabled: true }),
      });
      const errorName = 'example-error';

      // Act
      const validator = areInputsDifferent(input1, input2, errorName);
      const result = validator(formGroup);

      // Assert
      expect(result).toBeNull();
    });

    it(`should return null if both inputs are pristine.`, () => {
      // Arrange
      const input1 = 'input1';
      const input2 = 'input2';
      const formGroup = new FormGroup({
        [input1]: new FormControl(''),
        [input2]: new FormControl(''),
      });
      const errorName = 'example-error';

      // Act
      const validator = areInputsDifferent(input1, input2, errorName);
      const result = validator(formGroup);

      // Assert
      expect(result).toBeNull();
    });

    it(`should return an object with specified error key with true as a value when two inputs values are equal.`, () => {
      // Arrange
      const input1 = 'input1';
      const input2 = 'input2';
      const formGroup = new FormGroup({
        [input1]: new FormControl('example-value'),
        [input2]: new FormControl('example-value'),
      });
      const errorName = 'example-error';

      // Act
      formGroup.controls[input1].markAsDirty();
      formGroup.controls[input2].markAsDirty();
      const validator = areInputsDifferent(input1, input2, errorName);
      const result = validator(formGroup);

      // Assert
      expect(result).toEqual({ [errorName]: true });
    });

    it(`should return null when two inputs values are different.`, () => {
      // Arrange
      const input1 = 'input1';
      const input2 = 'input2';
      const formGroup = new FormGroup({
        [input1]: new FormControl('example-value'),
        [input2]: new FormControl('example-value2'),
      });
      const errorName = 'example-error';

      // Act
      formGroup.controls[input1].markAsDirty();
      formGroup.controls[input2].markAsDirty();
      const validator = areInputsDifferent(input1, input2, errorName);
      const result = validator(formGroup);

      // Assert
      expect(result).toBe(null);
    });
  });
});
