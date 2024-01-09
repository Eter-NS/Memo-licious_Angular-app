import {
  Component,
  AfterViewInit,
  Output,
  EventEmitter,
  Input,
  ChangeDetectionStrategy,
  inject,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { NgIf } from '@angular/common';
import { checkEmail } from 'src/app/custom-validations/custom-validations';
import { GoogleLogoComponent } from 'src/app/reusable/SVGs/google-logo/google-logo.component';
import { CustomMatRippleDirective } from 'src/app/reusable/ripples/ripple-color-checker.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSpinnerTogglerDirective } from 'src/app/reusable/mat-spinner-toggler/mat-spinner-toggler.directive';
import {
  AuthUserData,
  FormCommonFeaturesService,
} from '../services/form-common-features/form-common-features.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    GoogleLogoComponent,
    RouterLink,
    CustomMatRippleDirective,
    MatProgressSpinnerModule,
    MatSpinnerTogglerDirective,
    MatCheckboxModule,
  ],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements AfterViewInit, OnChanges {
  fb = inject(NonNullableFormBuilder);
  formCommonFeaturesService = inject(FormCommonFeaturesService);
  loginForm = this.fb.group({
    email: this.fb.control('', {
      validators: [Validators.required, checkEmail],
    }),
    password: this.fb.control('', {
      validators: [Validators.required],
    }),
    rememberMe: this.fb.control(false),
  });

  @Input({ required: true }) wrongEmailOrPassword = false;
  @Input({ required: true }) emailDoesNotExist = false;
  @Output() data = new EventEmitter<AuthUserData>();
  sending = false;
  @Output() rememberMe = new EventEmitter<boolean>();

  ngAfterViewInit(): void {
    this.formCommonFeaturesService.onInitAnimations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['wrongEmailOrPassword'] || changes['emailDoesNotExist']) {
      this.sending = false;
    }
  }

  getError = (element: string | string[], validation: string) =>
    this.formCommonFeaturesService.getError(
      this.loginForm,
      element,
      validation
    );

  onSubmit = () => {
    this.rememberMe.emit(this.loginForm.controls.rememberMe.getRawValue());
    this.formCommonFeaturesService.onSubmit(this.loginForm, this.data);
  };
}
