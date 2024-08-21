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
import { SubmitValidState } from '../../utils/models/unsuccessfulSubmit.type';
import { OnlineProfileFormI } from '../../utils/models/OnlineProfileForm.interface';

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
    '../../../reusable/utils/forms/form.scss',
    '../../../auth/feature/guest/guest-forms.scss',
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
      this.onlineProfileForm.reset();
      this._applyUserState();
    }
  }
  @Output() submittedChanges = new EventEmitter<UserProfileChangesI>();

  onlineProfileForm: FormGroup<OnlineProfileFormI> = this.#fb.group(
    {
      name: this.#fb.control('', [
        Validators.required,
        Validators.minLength(2),
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
          validators: [
            areInputsDifferent('currentEmail', 'email', 'sameEmail'),
          ],
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
    },
    {
      validators: [
        areInputsDifferent(
          ['changeEmail', 'currentPassword'],
          ['changePassword', 'currentPassword'],
          'mismatchedExistingPasswords'
        ),
      ],
    }
  );

  private readonly _unsuccessfulSubmitSubject =
    new BehaviorSubject<SubmitValidState>({ state: false });
  get unsuccessfulSubmit$() {
    return this._unsuccessfulSubmitSubject.asObservable();
  }

  private _isDataSendingSubject = new BehaviorSubject<boolean>(false);
  get isDataSending$() {
    return this._isDataSendingSubject.asObservable();
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

  enablePanel(group: 'changeEmail' | 'changePassword') {
    this.onlineProfileForm.controls[group].enable();
  }

  disablePanel(group: 'changeEmail' | 'changePassword') {
    this.onlineProfileForm.controls[group].disable();
  }

  onSubmit(): void {
    if (this.onlineProfileForm.invalid) {
      this._unsuccessfulSubmitSubject.next({
        state: true,
        cause: 'invalid-form',
      });
      return;
    }

    const { name, changeEmail, changePassword } = this.onlineProfileForm.value;

    const payload: UserProfileChangesI = {
      ...this.user,
      name: name as string,
      oldEmail: changeEmail?.currentEmail || undefined,
      email: changeEmail?.email || undefined,
      oldPassphrase:
        changeEmail?.currentPassword ||
        changePassword?.currentPassword ||
        undefined,
      passphrase: changePassword?.password || undefined,
    };

    this._updateSendingState(true);
    this.submittedChanges.emit(payload);
    this._unsuccessfulSubmitSubject.next({ state: false });
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
    this._isDataSendingSubject.next(state);
  }
}
