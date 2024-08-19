import { FormControl, FormGroup } from '@angular/forms';

export interface OnlineProfileFormI {
  name: FormControl<string>;
  changeEmail: FormGroup<{
    currentEmail: FormControl<string | null>;
    currentPassword: FormControl<string | null>;
    email: FormControl<string | null>;
  }>;
  changePassword: FormGroup<{
    currentPassword: FormControl<string | null>;
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
  }>;
}
