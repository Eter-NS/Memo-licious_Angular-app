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
} from '../../../reusable/utils/custom-validations/custom-validations';
import { CustomMatRippleDirective } from 'src/app/reusable/utils/ripples/ripple-color-checker.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSpinnerTogglerDirective } from 'src/app/reusable/utils/mat-spinner-toggler/mat-spinner-toggler.directive';
import {
  AuthUserData,
  FormCommonFeaturesService,
} from '../../../reusable/data-access/form-common-features/form-common-features.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { AsyncPipe } from '@angular/common';

type OnlineRegisterFormErrors = {
  emailAlreadyInUse: boolean;
};

@Component({
  standalone: true,
  selector: 'app-online-register',
  templateUrl: './online-register.component.html',
  styleUrls: ['../../../reusable/utils/forms/form.scss'],
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatSpinnerTogglerDirective,
    CustomMatRippleDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnlineRegisterComponent implements AfterViewInit {
  #fb = inject(NonNullableFormBuilder);
  #formCommonFeaturesService = inject(FormCommonFeaturesService);

  @Input({ required: true }) set emailAlreadyInUse(value: boolean) {
    this._stopSending(value);

    this._formErrorsSubject.next({
      ...this._formErrorsSubject.value,
      emailAlreadyInUse: value,
    });
  }

  @Output() data = new EventEmitter<AuthUserData>();

  private readonly _formErrorsSubject =
    new BehaviorSubject<OnlineRegisterFormErrors>({ emailAlreadyInUse: false });
  private readonly _sendingSubject = new BehaviorSubject<boolean>(false);

  readonly data$ = combineLatest({
    sending: this._sendingSubject.asObservable(),
    errors: this._formErrorsSubject.asObservable(),
  });

  registerForm = this.#fb.group(
    {
      name: this.#fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(15),
          includesSpecialCharacter,
        ],
      }),
      email: this.#fb.control('', {
        validators: [Validators.required, checkEmail],
      }),
      password: this.#fb.control('', {
        validators: [Validators.required, checkPassword],
      }),
      confirmPassword: this.#fb.control('', {
        validators: [Validators.required],
      }),
    },
    {
      validators: [Validators.required, checkConfirmPassword],
    }
  );

  ngAfterViewInit(): void {
    this.#formCommonFeaturesService.onInitAnimations();
  }

  getError = (element: string | string[], validation: string) =>
    this.#formCommonFeaturesService.getError(
      this.registerForm,
      element,
      validation
    );

  onSubmit = () => {
    this._sendingSubject.next(
      this.#formCommonFeaturesService.submitForm(this.registerForm, this.data)
    );
  };

  private _stopSending(value: boolean) {
    if (value) {
      this._sendingSubject.next(false);
    }
  }
}
