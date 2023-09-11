import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  checkEmail,
  checkName,
  checkPassport,
  checkRetypedPassport,
} from './register-custom-validations/register-custom-validations';
import { RouterLink } from '@angular/router';
import { CustomMatRippleDirective } from 'src/reusable/ripples/ripple-color-checker.directive';
import { GoogleLogoComponent } from 'src/reusable/SVGs/google-logo/google-logo.component';
import {
  AuthUserData,
  LoginRegisterCommonFeatures,
} from '../login&register-shared-code/LoginRegisterCommonFeatures';

@Component({
  standalone: true,
  selector: 'app-register-component',
  templateUrl: './register-component.component.html',
  styleUrls: ['../login&register-shared-code/styles.scss'],
  imports: [
    ReactiveFormsModule,
    GoogleLogoComponent,
    RouterLink,
    CustomMatRippleDirective,
  ],
})
export class RegisterComponentComponent implements AfterViewInit {
  registerForm = new FormGroup(
    {
      name: new FormControl('', {
        validators: [Validators.required, checkName],
      }),
      email: new FormControl('', {
        validators: [Validators.required, checkEmail],
      }),
      password: new FormControl('', {
        validators: [Validators.required, checkPassport],
      }),
      retypedPassword: new FormControl('', {
        validators: [Validators.required],
      }),
    },
    {
      validators: [checkRetypedPassport],
    }
  );

  @Input({ required: true }) emailAlreadyInUse = false;
  @Output() data = new EventEmitter<AuthUserData>();

  getError: (element: string, validation: string) => boolean | undefined;
  onSubmit: () => Promise<void>;

  constructor() {
    this.getError = LoginRegisterCommonFeatures.applyGetError(
      this.registerForm
    );
    this.onSubmit = LoginRegisterCommonFeatures.applyOnSubmit(
      this.registerForm,
      this.data
    );
  }

  ngAfterViewInit(): void {
    LoginRegisterCommonFeatures.onInitAnimations();
  }
}
