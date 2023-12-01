import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  checkEmail,
  checkPassword,
  checkConfirmPassword,
  includesSpecialCharacter,
} from '../../custom-validations/custom-validations';
import { RouterLink } from '@angular/router';

import { GoogleLogoComponent } from 'src/app/reusable/SVGs/google-logo/google-logo.component';
import { CustomMatRippleDirective } from 'src/app/reusable/ripples/ripple-color-checker.directive';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSpinnerTogglerDirective } from 'src/app/reusable/mat-spinner-toggler.directive';
import {
  AuthUserData,
  FormCommonFeaturesService,
} from '../services/form-common-features/form-common-features.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../form.scss'],
  imports: [
    ReactiveFormsModule,
    GoogleLogoComponent,
    RouterLink,
    CustomMatRippleDirective,
    NgIf,
    MatProgressSpinnerModule,
    MatSpinnerTogglerDirective,
    MatCheckboxModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements AfterViewInit {
  fb = inject(NonNullableFormBuilder);
  formCommonFeaturesService = inject(FormCommonFeaturesService);
  registerForm = this.fb.group(
    {
      name: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(15),
          includesSpecialCharacter,
        ],
      }),
      email: this.fb.control('', {
        validators: [Validators.required, checkEmail],
      }),
      password: this.fb.control('', {
        validators: [Validators.required, checkPassword],
      }),
      confirmPassword: this.fb.control('', {
        validators: [Validators.required],
      }),
      rememberMe: this.fb.control(false),
    },
    {
      validators: [Validators.required, checkConfirmPassword],
    }
  );

  @Input({ required: true }) emailAlreadyInUse = false;
  @Output() data = new EventEmitter<AuthUserData>();
  sending = false;
  @Output() rememberMe = new EventEmitter<boolean>();

  ngAfterViewInit(): void {
    this.formCommonFeaturesService.onInitAnimations();
  }

  getError = (element: string | string[], validation: string) =>
    this.formCommonFeaturesService.getError(
      this.registerForm,
      element,
      validation
    );

  onSubmit = () => {
    this.rememberMe.emit(this.registerForm.controls.rememberMe.getRawValue());
    return this.formCommonFeaturesService.onSubmit(
      this.registerForm,
      this.data
    );
  };
}
