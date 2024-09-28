import {
  Component,
  AfterViewInit,
  Output,
  EventEmitter,
  Input,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { checkEmail } from 'src/app/reusable/utils/custom-validations/custom-validations';
import { CustomMatRippleDirective } from 'src/app/reusable/utils/ripples/ripple-color-checker.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSpinnerTogglerDirective } from 'src/app/reusable/utils/mat-spinner-toggler/mat-spinner-toggler.directive';
import {
  AuthUserData,
  FormCommonFeaturesService,
} from '../../../reusable/data-access/form-common-features/form-common-features.service';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { AsyncPipe } from '@angular/common';

type OnlineLoginFormErrors = {
  wrongEmailOrPassword: boolean;
  emailDoesNotExist: boolean;
};

@Component({
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    CustomMatRippleDirective,
    MatProgressSpinnerModule,
    MatSpinnerTogglerDirective,
    MatCheckboxModule,
  ],
  selector: 'app-online-login',
  templateUrl: './online-login.component.html',
  styleUrls: ['../../../reusable/utils/forms/form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnlineLoginComponent implements AfterViewInit {
  #fb = inject(NonNullableFormBuilder);
  #formCommonFeaturesService = inject(FormCommonFeaturesService);

  @Input({ required: true }) set wrongEmailOrPassword(value: boolean) {
    this._stopSending(value);

    this._formErrorsSubject.next({
      ...this._formErrorsSubject.value,
      wrongEmailOrPassword: value,
    });
  }

  @Input({ required: true }) set emailDoesNotExist(value: boolean) {
    this._stopSending(value);

    this._formErrorsSubject.next({
      ...this._formErrorsSubject.value,
      emailDoesNotExist: value,
    });
  }

  @Output() data = new EventEmitter<AuthUserData>();
  @Output() rememberMe = new EventEmitter<boolean>();

  private readonly _formErrorsSubject =
    new BehaviorSubject<OnlineLoginFormErrors>({
      emailDoesNotExist: false,
      wrongEmailOrPassword: false,
    });
  private readonly _sendingSubject = new BehaviorSubject<boolean>(false);

  readonly data$ = combineLatest({
    sending: this._sendingSubject.asObservable(),
    errors: this._formErrorsSubject.asObservable(),
  });

  loginForm = this.#fb.group({
    email: this.#fb.control('', {
      validators: [Validators.required, checkEmail],
    }),
    password: this.#fb.control('', {
      validators: [Validators.required],
    }),
  });

  ngAfterViewInit(): void {
    this.#formCommonFeaturesService.onInitAnimations();
  }

  getError = (element: string | string[], validation: string) =>
    this.#formCommonFeaturesService.getError(
      this.loginForm,
      element,
      validation
    );

  onRememberMeChange(event: MatCheckboxChange) {
    this.rememberMe.emit(event.checked);
  }

  onSubmit = () => {
    this._sendingSubject.next(
      this.#formCommonFeaturesService.submitForm(this.loginForm, this.data)
    );
  };

  private _stopSending(value: boolean) {
    if (value) {
      this._sendingSubject.next(false);
    }
  }
}
