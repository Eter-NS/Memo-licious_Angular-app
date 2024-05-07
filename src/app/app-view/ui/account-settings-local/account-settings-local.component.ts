import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
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
  areInputsDifferent,
} from 'src/app/reusable/utils/custom-validations/custom-validations';
import { FormCommonFeaturesService } from 'src/app/reusable/data-access/form-common-features/form-common-features.service';
import {
  UserProfile,
  UserProfileChangesI,
} from '../../utils/models/user-profile.interface';
import { BehaviorSubject } from 'rxjs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSpinnerTogglerDirective } from 'src/app/reusable/utils/mat-spinner-toggler/mat-spinner-toggler.directive';
import { CustomMatRippleDirective } from 'src/app/reusable/utils/ripples/ripple-color-checker.directive';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthOptions } from 'src/app/auth/utils/Models/LocalAuthModels.interface';
import { UserProfileUpdateResultI } from '../../data-access/user-profile/user-profile.service';

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

@Component({
  selector: 'app-account-settings-local',
  standalone: true,
  imports: [
    AsyncPipe,
    MatExpansionModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatSpinnerTogglerDirective,
    CustomMatRippleDirective,
  ],
  templateUrl: './account-settings-local.component.html',
  styleUrls: [
    '/src/app/reusable/utils/forms/form.scss',
    '/src/app/auth/feature/guest/guest-forms.scss',
    './account-settings-local.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsLocalComponent implements OnInit, AfterViewInit {
  #formCommonFeaturesService = inject(FormCommonFeaturesService);
  #fb = inject(NonNullableFormBuilder);
  #destroyRef = inject(DestroyRef);

  @Input({ required: true }) user!: UserProfile;
  @Input({ required: true }) set result(
    result: UserProfileUpdateResultI['state']
  ) {
    if (result === 'pending') {
      return;
    }

    this._updateSendingState(false);

    if (result === 'success') {
      const { currentPassphrase, passwordGroup, pinGroup } =
        this.localProfileForm.controls;

      currentPassphrase.reset();
      pinGroup.reset();
      passwordGroup.reset();
    }
  }
  @Output() submittedChanges = new EventEmitter<UserProfileChangesI>();

  localProfileForm: FormGroup<LocalProfileFormI> = this.#fb.group(
    {
      name: this.#fb.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(15),
      ]),
      currentPassphrase: this.#fb.control('', [Validators.required]),
      authOption: this.#fb.control<AuthOptions>('password'),
      pinGroup: this.#fb.group(
        {
          pin: this.#fb.control<string | null>('', [
            Validators.required,
            checkPin,
          ]),
          confirmPin: this.#fb.control<string | null>('', [
            Validators.required,
          ]),
        },
        { validators: [checkConfirmPin] }
      ),
      passwordGroup: this.#fb.group(
        {
          password: this.#fb.control<string | null>('', [
            Validators.required,
            checkPassword,
          ]),
          confirmPassword: this.#fb.control<string | null>('', [
            Validators.required,
          ]),
        },
        {
          validators: [checkConfirmPassword],
        }
      ),
    },
    {
      validators: [
        areInputsDifferent(
          'currentPassphrase',
          ['pinGroup', 'pin'],
          'samePassphrase'
        ),
        areInputsDifferent(
          'currentPassphrase',
          ['passwordGroup', 'password'],
          'samePassphrase'
        ),
      ],
    }
  );

  #authOptionSubject: BehaviorSubject<AuthOptions> =
    new BehaviorSubject<AuthOptions>('pin');
  get authOption$() {
    return this.#authOptionSubject.asObservable();
  }

  #isDataSendingSubject = new BehaviorSubject<boolean>(false);
  get isDataSending$() {
    return this.#isDataSendingSubject.asObservable();
  }

  ngOnInit(): void {
    this._setInitialAuthOption();
    this._applyUserState();
    this._listenForAuthChanges();
    this.disablePassphrasePanel();
  }

  ngAfterViewInit(): void {
    this.#formCommonFeaturesService.onInitAnimations();
  }

  getError = (element: string | string[], validation: string) =>
    this.#formCommonFeaturesService.getError(
      this.localProfileForm,
      element,
      validation
    );

  isErrorAndTouched = (element: string | string[], validation: string) =>
    this.#formCommonFeaturesService.isErrorAndTouched(
      this.localProfileForm,
      element,
      validation
    );

  isErrorAndDirty = (element: string | string[], validation: string) =>
    this.#formCommonFeaturesService.isErrorAndDirty(
      this.localProfileForm,
      element,
      validation
    );

  toggleAuthMethod() {
    const toggleFormGroup = (groupName: string, state: boolean) => {
      const formGroup = this.localProfileForm?.get([groupName]) as FormGroup;

      if (!formGroup) {
        console.warn('No formGroup detected');

        return;
      }

      if (state) {
        formGroup.enable();
      } else {
        formGroup.disable();
        formGroup.reset();
      }
    };

    const currentAuth = this.#authOptionSubject.value;
    toggleFormGroup('pinGroup', currentAuth === 'pin');
    toggleFormGroup('passwordGroup', currentAuth === 'password');
  }

  enablePassphrasePanel() {
    this.localProfileForm.controls.currentPassphrase.enable();
    this._setInitialAuthOption();
  }

  disablePassphrasePanel() {
    this.localProfileForm.controls.currentPassphrase.disable();
    this.localProfileForm.controls.pinGroup.disable();
    this.localProfileForm.controls.passwordGroup.disable();
  }

  onSubmit(): void {
    if (this.localProfileForm.invalid || this._isFormInvalid()) {
      return;
    }

    const {
      name,
      currentPassphrase: passphrase,
      passwordGroup,
      pinGroup,
    } = this.localProfileForm.value;

    const payload: UserProfileChangesI = {
      ...this.user,
      name: name as string,
      oldPassphrase: passphrase || undefined,
      authOption: this._checkAuthGroups() || this.user.authOption,
      passphrase: passwordGroup?.password || pinGroup?.pin || undefined,
    };

    this._updateSendingState(true);
    this.submittedChanges.emit(payload);

    this.localProfileForm.markAsPristine();
    this.localProfileForm.markAsUntouched();
  }

  private _isFormInvalid(): boolean {
    const { /* name, */ currentPassphrase: passphrase } =
      this.localProfileForm.value;
    let isInvalid = false;

    const passphraseControl = this.localProfileForm.controls.currentPassphrase;
    // If new passphrase is okay and there is no current passphrase
    if (this._checkAuthGroups() && !passphrase) {
      passphraseControl.setErrors({
        invalidCurrentPassphrase: true,
      });
      isInvalid = true;
    } else {
      delete passphraseControl.errors?.['invalidCurrentPassphrase'];
    }

    // If there is no new passphrase and current passphrase is okay
    if (passphrase && !this._checkAuthGroups()) {
      this.localProfileForm.setErrors({
        invalidNewPassphrase: true,
      });
      isInvalid = true;
    } else {
      delete this.localProfileForm.errors?.['invalidNewPassphrase'];
    }

    // No changes made
    // if (this.user.name === name && !passphrase) {
    //   isInvalid = true;
    // }
    return isInvalid;
  }

  private _setInitialAuthOption() {
    this.localProfileForm.controls.authOption.setValue(this.user.authOption);

    this.#authOptionSubject.next(this.user.authOption);

    this.user.authOption === 'password'
      ? this.localProfileForm.controls.pinGroup.disable()
      : this.localProfileForm.controls.passwordGroup.disable();
  }

  private _applyUserState() {
    this.localProfileForm.patchValue({
      name: this.user.name,
    });
  }

  private _listenForAuthChanges() {
    this.localProfileForm.controls.authOption.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((value) => {
        this.#authOptionSubject.next(value);
        this.toggleAuthMethod();
      });
  }

  private _checkAuthGroups(): AuthOptions | undefined {
    const {
      pinGroup: {
        controls: { pin, confirmPin },
      },
      passwordGroup: {
        controls: { password, confirmPassword },
      },
    } = this.localProfileForm.controls;

    if (areInputsCorrect(pin, confirmPin)) {
      return 'pin';
    }
    if (areInputsCorrect(password, confirmPassword)) {
      return 'password';
    }

    return undefined;

    function areInputsCorrect(
      input1: AbstractControl,
      input2: AbstractControl
    ) {
      const result1 = input1.enabled && input1.valid;
      const result2 = input2.enabled && input2.valid;
      return result1 && result2;
    }
  }

  private _updateSendingState(state: boolean) {
    this.#isDataSendingSubject.next(state);
  }
}
