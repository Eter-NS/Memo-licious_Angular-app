import { FormControl, FormGroup } from '@angular/forms';
import { AuthOptions } from 'src/app/auth/utils/Models/LocalAuthModels.interface';

export interface LocalProfileFormI {
  name: FormControl<string>;
  currentPassphrase: FormControl<string>;
  authOption: FormControl<AuthOptions>;
  pinGroup: FormGroup<{
    pin: FormControl<string | null>;
    confirmPin: FormControl<string | null>;
  }>;
  passwordGroup: FormGroup<{
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
  }>;
}
