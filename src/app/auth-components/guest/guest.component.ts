import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  checkConfirmPassword,
  checkConfirmPin,
  checkPassword,
  checkPin,
  includesNumbers,
  includesSpecialCharacter,
} from '../../custom-validations/custom-validations';
import { NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { AuthLocalUserService } from '../services/local-user/auth-local-user.service';
import { LocalUserData } from '../services/Models/UserDataModels';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { CustomMatRippleDirective } from 'src/app/reusable/ripples/ripple-color-checker.directive';
import { PreviousPageButtonComponent } from '../../ui/previous-page-button/previous-page-button.component';
import { runAnimationOnce } from 'src/app/reusable/animations/animation-triggers';
import { FormCommonFeaturesService } from '../services/form-common-features/form-common-features.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './guest.component.html',
  styleUrls: ['../form.scss', './guest.component.scss'],
  imports: [
    ReactiveFormsModule,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    PreviousPageButtonComponent,
    CustomMatRippleDirective,
    MatCheckboxModule,
  ],
})
export class GuestComponent implements AfterViewInit {
  viewTransitionService = inject(ViewTransitionService);
  authLocalUserService = inject(AuthLocalUserService);
  fb = inject(NonNullableFormBuilder);
  formCommonFeaturesService = inject(FormCommonFeaturesService);
  @ViewChild('mainTagRef') mainTagRef!: ElementRef<HTMLDivElement>;
  isPasswordSelected = false;

  localUserForm = this.fb.group({
    name: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(15),
        includesSpecialCharacter,
        includesNumbers,
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
    rememberMe: this.fb.control(false),
  });

  ngAfterViewInit(): void {
    this.formCommonFeaturesService.onInitAnimations();
    this.checkTransitionDirection();
    this.toggleAuthMethod();
  }

  getError = (element: string | string[], validation: string) =>
    this.formCommonFeaturesService.getError(
      this.localUserForm,
      element,
      validation
    );

  private checkTransitionDirection() {
    if (!this.viewTransitionService.goBackClicked)
      runAnimationOnce(this.mainTagRef.nativeElement, 'color-transition');
  }

  toggleAuthMethod() {
    const toggleFormGroup = (groupName: string, state: boolean) => {
      const formGroup = this.localUserForm.get([groupName]) as FormGroup;
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
    const onFailure = () => {
      this.localUserForm.setErrors({ invalidForm: true });
      return;
    };

    const hasNotValidControls = (group: FormGroup) => {
      return Object.keys(group.controls).some((key) => {
        const control = group.get(key) as FormControl | null;

        return control && (control.disabled || control.errors);
      });
    };

    if (!this.localUserForm.controls.name.value) return onFailure();
    if (
      hasNotValidControls(this.localUserForm.controls.pinGroup) &&
      hasNotValidControls(this.localUserForm.controls.passwordGroup)
    ) {
      onFailure();
    }

    const payload: LocalUserData = {
      auth: {
        name: this.localUserForm.controls.name.value,
        authOption: this.isPasswordSelected ? 'password' : 'pin',
        value: this.isPasswordSelected
          ? this.localUserForm.get(['passwordGroup', 'password'])?.value
          : this.localUserForm.get(['pinGroup', 'pin'])?.value,
      },
      groups: {},
    };
    this.localUserForm.setErrors(null);
    this.authLocalUserService.rememberMe =
      this.localUserForm.controls.rememberMe.getRawValue();

    this.authLocalUserService.createUser(payload);

    this.viewTransitionService.goForward(this.mainTagRef.nativeElement, '/app');
  }
}

/*
Change this component into a page component and move the register logic to guest-register component.
Also create a login component which will contain registered users saved into the localStorage, after clicking the username, it will expand and ask user to provide password/PIN depending on user preference from registration.
*/
