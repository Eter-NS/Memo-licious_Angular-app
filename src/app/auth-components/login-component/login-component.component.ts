import {
  Component,
  AfterViewInit,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GoogleLogoComponent } from 'src/reusable/SVGs/google-logo/google-logo.component';
import { CustomMatRippleDirective } from 'src/reusable/ripples/ripple-color-checker.directive';
import {
  AuthUserData,
  LoginRegisterCommonFeatures,
} from '../login&register-shared-code/LoginRegisterCommonFeatures';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    GoogleLogoComponent,
    RouterLink,
    CustomMatRippleDirective,
  ],
  selector: 'app-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: [
    '../login&register-shared-code/styles.scss',
    './login-component.component.scss',
  ],
})
export class LoginComponentComponent implements AfterViewInit {
  loginForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      validators: [Validators.required],
    }),
  });

  @Input({ required: true }) wrongEmailOrPassword = false;
  @Input({ required: true }) emailDoesNotExist = false;
  @Output() data = new EventEmitter<AuthUserData>();

  getError: (element: string, validation: string) => boolean | undefined;
  onSubmit: () => Promise<void>;

  constructor() {
    this.getError = LoginRegisterCommonFeatures.applyGetError(this.loginForm);
    this.onSubmit = LoginRegisterCommonFeatures.applyOnSubmit(
      this.loginForm,
      this.data
    );
  }

  ngAfterViewInit(): void {
    LoginRegisterCommonFeatures.onInitAnimations();
  }
}
