import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  FormGroup,
  Validators,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  includesSpecialCharacter,
  checkEmail,
  checkPassword,
  checkConfirmPassword,
  areInputsDifferent,
} from 'src/app/reusable/utils/custom-validations/custom-validations';
import { FormCommonFeaturesService } from 'src/app/reusable/data-access/form-common-features/form-common-features.service';
import {
  UserProfile,
  UserProfileChangesI,
} from '../../utils/models/user-profile.interface';
import { AsyncPipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSpinnerTogglerDirective } from 'src/app/reusable/utils/mat-spinner-toggler/mat-spinner-toggler.directive';
import { CustomMatRippleDirective } from 'src/app/reusable/utils/ripples/ripple-color-checker.directive';
import { BehaviorSubject } from 'rxjs';
import { UserProfileUpdateResultI } from '../../data-access/user-profile/user-profile.service';

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

@Component({
  selector: 'app-account-settings-online',
  standalone: true,
  imports: [
    AsyncPipe,
    MatExpansionModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatSpinnerTogglerDirective,
    CustomMatRippleDirective,
  ],
  templateUrl: './account-settings-online.component.html',
  styleUrls: [
    '/src/app/reusable/utils/forms/form.scss',
    '/src/app/auth/feature/guest/guest-forms.scss',
    './account-settings-online.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsOnlineComponent implements OnInit, AfterViewInit {
  #formCommonFeaturesService = inject(FormCommonFeaturesService);
  #fb = inject(NonNullableFormBuilder);

  @Input({ required: true }) user!: UserProfile;
  @Input({ required: true }) set result(
    result: UserProfileUpdateResultI['state']
  ) {
    if (result === 'pending') {
      return;
    }

    this._updateSendingState(false);

    if (result === 'success') {
      const { changeEmail, changePassword } = this.onlineProfileForm.controls;
      changeEmail.reset();
      changePassword.reset();
    }
  }
  @Output() submittedChanges = new EventEmitter<UserProfileChangesI>();

  onlineProfileForm: FormGroup<OnlineProfileFormI> = this.#fb.group({
    name: this.#fb.control('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(15),
      includesSpecialCharacter,
    ]),
    changeEmail: this.#fb.group(
      {
        currentEmail: this.#fb.control<string | null>('', [
          Validators.required,
          checkEmail,
        ]),
        email: this.#fb.control<string | null>('', [
          Validators.required,
          checkEmail,
        ]),
        currentPassword: this.#fb.control<string | null>('', [
          Validators.required,
        ]),
      },
      {
        validators: [areInputsDifferent('currentEmail', 'email', 'sameEmail')],
      }
    ),
    changePassword: this.#fb.group(
      {
        currentPassword: this.#fb.control<string | null>('', [
          Validators.required,
        ]),
        password: this.#fb.control<string | null>('', [
          Validators.required,
          checkPassword,
        ]),
        confirmPassword: this.#fb.control<string | null>('', [
          Validators.required,
        ]),
      },
      {
        validators: [
          checkConfirmPassword,
          areInputsDifferent('currentPassword', 'password', 'samePassword'),
        ],
      }
    ),
  });

  #isDataSendingSubject = new BehaviorSubject<boolean>(false);
  get isDataSending$() {
    return this.#isDataSendingSubject.asObservable();
  }

  ngOnInit(): void {
    this._applyUserState();
    this._disablePanels();
  }

  ngAfterViewInit(): void {
    this.#formCommonFeaturesService.onInitAnimations();
  }

  getError = (element: string | string[], validation: string) =>
    this.#formCommonFeaturesService.getError(
      this.onlineProfileForm,
      element,
      validation
    );

  isErrorAndTouched = (element: string | string[], validation: string) =>
    this.#formCommonFeaturesService.isErrorAndTouched(
      this.onlineProfileForm,
      element,
      validation
    );

  isErrorAndDirty = (element: string | string[], validation: string) =>
    this.#formCommonFeaturesService.isErrorAndDirty(
      this.onlineProfileForm,
      element,
      validation
    );

  enablePanel(group: keyof OnlineProfileFormI) {
    this.onlineProfileForm.controls[group].enable();
  }

  disablePanel(group: keyof OnlineProfileFormI) {
    this.onlineProfileForm.controls[group].disable();
  }

  onSubmit(): void {
    if (
      this.onlineProfileForm.invalid ||
      this._areExistingPasswordsDifferent()
    ) {
      return;
    }

    const { name, changeEmail, changePassword } =
      this.onlineProfileForm.getRawValue();

    const payload: UserProfileChangesI = {
      ...this.user,
      name,
      oldEmail: changeEmail.currentEmail || undefined,
      email: changeEmail.email || undefined,
      oldPassphrase:
        changeEmail.currentPassword ||
        changePassword.currentPassword ||
        undefined,
      passphrase: changePassword.password || undefined,
    };

    this._updateSendingState(true);
    this.submittedChanges.emit(payload);

    this.onlineProfileForm.markAsPristine();
    this.onlineProfileForm.markAsUntouched();
  }

  private _areExistingPasswordsDifferent(): boolean {
    const setError = (): true => {
      this.onlineProfileForm.setErrors({
        mismatchedExistingPasswords: true,
      });
      return true;
    };
    const removeError = (): false => {
      delete this.onlineProfileForm.errors?.['mismatchedExistingPasswords'];
      return false;
    };

    const { changeEmail, changePassword } = this.onlineProfileForm.value;

    const password1 = changeEmail?.currentPassword?.trim();
    const password2 = changePassword?.currentPassword?.trim();

    if (typeof password1 === 'undefined' || typeof password2 === 'undefined') {
      return removeError();
    } else if (password1 !== password2) {
      return setError();
    }

    return removeError();
  }

  private _applyUserState() {
    this.onlineProfileForm.patchValue({
      name: this.user.name,
    });
  }

  private _disablePanels() {
    this.disablePanel('changeEmail');
    this.disablePanel('changePassword');
  }

  private _updateSendingState(state: boolean) {
    this.#isDataSendingSubject.next(state);
  }
}
