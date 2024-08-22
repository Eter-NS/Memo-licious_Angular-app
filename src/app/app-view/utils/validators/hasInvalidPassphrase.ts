import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { LocalProfileFormI } from '../models/LocalProfileForm.interface';
import { getPassphrases } from './validation-tools';

export const hasInvalidPassphrase = (type: 'current' | 'new') => {
  return (form: AbstractControl): ValidationErrors | null => {
    const formGroup = form as unknown as FormGroup<LocalProfileFormI>;
    const { hasCurrentPassphrase, hasNewPassphrase } =
      getPassphrases(formGroup);

    switch (type) {
      case 'current':
        return !hasCurrentPassphrase && hasNewPassphrase
          ? { invalidCurrentPassphrase: true }
          : null;

      case 'new':
        return hasCurrentPassphrase && !hasNewPassphrase
          ? { invalidNewPassphrase: true }
          : null;
    }
  };
};
