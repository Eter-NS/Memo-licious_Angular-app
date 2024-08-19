import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { LocalProfileFormI } from '../models/LocalProfileForm.interface';
import { _getPassphrases } from './validation-tools';

export const hasInvalidCurrentPassphrase = (
  form: AbstractControl
): ValidationErrors | null => {
  const formGroup = form as unknown as FormGroup<LocalProfileFormI>;
  const { hasCurrentPassphrase, hasNewPassphrase } = _getPassphrases(formGroup);

  if (!hasCurrentPassphrase && hasNewPassphrase) {
    return { invalidCurrentPassphrase: true };
  }

  return null;
};
