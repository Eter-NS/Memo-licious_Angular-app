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
import { LocalProfileFormI } from '../../utils/models/LocalProfileForm.interface';
import { hasInvalidCurrentPassphrase } from '../../utils/validators/hasInvalidCurrentPassphrase';
import { hasInvalidNewPassphrase } from '../../utils/validators/hasInvalidNewPassphrase';

export type UnsuccessfulSubmitI =
  | { state: false }
  | { state: true; cause: string };

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
    '../../../reusable/utils/forms/form.scss',
    '../../../auth/feature/guest/guest-forms.scss',
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
      this.localProfileForm.reset();
      this._applyUserState();
    }
  }
  @Output() submittedChanges = new EventEmitter<UserProfileChangesI>();

  localProfileForm: FormGroup<LocalProfileFormI> = this.#fb.group(
    {
      name: this.#fb.control('', [
        Validators.required,
        Validators.minLength(2),
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
        hasInvalidCurrentPassphrase,
        hasInvalidNewPassphrase,
      ],
    }
  );

  private _authOptionSubject = new BehaviorSubject<AuthOptions>('pin');
  get authOption$() {
    return this._authOptionSubject.asObservable();
  }

  private readonly _unsuccessfulSubmitSubject =
    new BehaviorSubject<UnsuccessfulSubmitI>({ state: false });
  get unsuccessfulSubmit$() {
    return this._unsuccessfulSubmitSubject.asObservable();
  }

  private _isDataSendingSubject = new BehaviorSubject<boolean>(false);
  get isDataSending$() {
    return this._isDataSendingSubject.asObservable();
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
      const formGroup = this.localProfileForm.get([groupName]) as FormGroup;

      if (state) {
        formGroup.enable();
      } else {
        formGroup.disable();
        formGroup.reset();
      }
    };

    const currentAuth = this._authOptionSubject.value;
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
    const { invalid, value } = this.localProfileForm;

    if (invalid) {
      this._unsuccessfulSubmitSubject.next({
        state: true,
        cause: 'invalid-form',
      });
      return;
    }
    const { name, currentPassphrase, authOption, passwordGroup, pinGroup } =
      value;

    if (typeof authOption === 'undefined') {
      this._unsuccessfulSubmitSubject.next({
        state: true,
        cause: 'no-authOption',
      });
      return;
    }

    const payload: UserProfileChangesI = {
      ...this.user,
      name: name as string,
      oldPassphrase: currentPassphrase || undefined,
      authOption,
      passphrase:
        (authOption === 'password' ? passwordGroup?.password : pinGroup?.pin) ||
        undefined,
    };

    this._updateSendingState(true);
    this.submittedChanges.emit(payload);
    this._unsuccessfulSubmitSubject.next({ state: false });
  }

  private _setInitialAuthOption() {
    const { authOption, pinGroup, passwordGroup } =
      this.localProfileForm.controls;

    authOption.setValue(this.user.authOption);

    this._authOptionSubject.next(this.user.authOption);

    this.user.authOption === 'password'
      ? pinGroup.disable()
      : passwordGroup.disable();
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
        this._authOptionSubject.next(value);
        this.toggleAuthMethod();
      });
  }

  private _updateSendingState(state: boolean) {
    this._isDataSendingSubject.next(state);
  }
}
