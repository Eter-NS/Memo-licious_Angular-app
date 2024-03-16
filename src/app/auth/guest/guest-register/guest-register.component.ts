import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  checkPin,
  checkConfirmPin,
  checkPassword,
  checkConfirmPassword,
} from 'src/app/custom-validations/custom-validations';
import {
  FormCommonFeaturesService,
  LocalAuthUserData,
} from '../../../reusable/data-access/form-common-features/form-common-features.service';
import { MatRadioModule } from '@angular/material/radio';
import { MatSpinnerTogglerDirective } from 'src/app/reusable/mat-spinner-toggler/mat-spinner-toggler.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomMatRippleDirective } from 'src/app/reusable/ripples/ripple-color-checker.directive';

@Component({
  selector: 'app-guest-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatSpinnerTogglerDirective,
    CustomMatRippleDirective,
  ],
  templateUrl: './guest-register.component.html',
  styleUrls: ['/src/app/reusable/forms/form.scss', '../guest-forms.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestRegisterComponent implements AfterViewInit, OnChanges {
  formCommonFeaturesService = inject(FormCommonFeaturesService);
  fb = inject(NonNullableFormBuilder);

  @Output() data = new EventEmitter<LocalAuthUserData>();
  sending = false;
  isPasswordSelected = false;

  localRegisterForm = this.fb.group({
    name: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(15),
      ],
    }),
    pinGroup: this.fb.group(
      {
        pin: this.fb.control('', [Validators.required, checkPin]),
        confirmPin: this.fb.control('', [Validators.required]),
      },
      { validators: [checkConfirmPin] }
    ),
    passwordGroup: this.fb.group(
      {
        password: this.fb.control('', [Validators.required, checkPassword]),
        confirmPassword: this.fb.control('', [Validators.required]),
      },
      { validators: [checkConfirmPassword] }
    ),
  });

  ngAfterViewInit(): void {
    this.formCommonFeaturesService.onInitAnimations();
    this.toggleAuthMethod();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['emailAlreadyInUse'].currentValue === true) {
      this.sending = false;
    }
  }

  getError = (element: string | string[], validation: string) =>
    this.formCommonFeaturesService.getError(
      this.localRegisterForm,
      element,
      validation
    );

  toggleAuthMethod() {
    const toggleFormGroup = (groupName: string, state: boolean) => {
      const formGroup = this.localRegisterForm.get([groupName]) as FormGroup;
      if (!formGroup) return;
      Object.keys(formGroup.controls).forEach((key) => {
        if (state) formGroup.get(key)?.enable();
        else {
          formGroup.get(key)?.disable();
          formGroup.get(key)?.reset();
        }
      });
    };

    toggleFormGroup('pinGroup', !this.isPasswordSelected);
    toggleFormGroup('passwordGroup', this.isPasswordSelected);
  }

  onSubmit() {
    const isTheFormInvalid = () => {
      const { name, pinGroup, passwordGroup } = this.localRegisterForm.controls;
      return (
        !name.value ||
        this.formCommonFeaturesService.hasInvalidControls(pinGroup) ||
        this.formCommonFeaturesService.hasInvalidControls(passwordGroup)
      );
    };

    if (isTheFormInvalid()) {
      return this.formCommonFeaturesService.onFailure(this.localRegisterForm);
    }

    this.sending = this.formCommonFeaturesService.submitForm(
      this.localRegisterForm,
      this.data
    );
  }
}
