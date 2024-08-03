import { AbstractControl, FormGroup } from '@angular/forms';
import { LocalProfileFormI } from '../models/LocalProfileForm.interface';
import { AuthOptions } from 'src/app/auth/utils/Models/LocalAuthModels.interface';

export const _checkAuthGroups = (
  controls: FormGroup<LocalProfileFormI>['controls']
): AuthOptions | undefined => {
  function areInputsCorrect(input1: AbstractControl, input2: AbstractControl) {
    const result1 = input1.enabled && input1.valid;
    const result2 = input2.enabled && input2.valid;
    return result1 && result2;
  }

  const {
    pinGroup: {
      controls: { pin, confirmPin },
    },
    passwordGroup: {
      controls: { password, confirmPassword },
    },
  } = controls;

  if (areInputsCorrect(pin, confirmPin)) {
    return 'pin';
  }
  if (areInputsCorrect(password, confirmPassword)) {
    return 'password';
  }

  return undefined;
};

export const _getPassphrases = (form: FormGroup<LocalProfileFormI>) => {
  const { currentPassphrase } = form.value;
  const hasCurrentPassphrase = Boolean(currentPassphrase);
  const hasNewPassphrase = Boolean(_checkAuthGroups(form.controls));

  return {
    hasCurrentPassphrase,
    hasNewPassphrase,
  };
};
