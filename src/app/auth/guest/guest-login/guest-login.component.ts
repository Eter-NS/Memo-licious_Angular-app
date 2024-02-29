import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  FormCommonFeaturesService,
  LocalAuthUserData,
} from '../../services/form-common-features/form-common-features.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSpinnerTogglerDirective } from 'src/app/reusable/mat-spinner-toggler/mat-spinner-toggler.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LocalUsers } from '../../services/Models/UserDataModels';
import { NgClass } from '@angular/common';
import { CustomMatRippleDirective } from 'src/app/reusable/ripples/ripple-color-checker.directive';

@Component({
  selector: 'app-guest-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCheckboxModule,
    MatSpinnerTogglerDirective,
    MatProgressSpinnerModule,
    NgClass,
    CustomMatRippleDirective,
  ],
  templateUrl: './guest-login.component.html',
  styleUrls: [
    '../../form.scss',
    '../guest-forms.scss',
    './guest-login.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestLoginComponent implements AfterViewInit, OnChanges {
  formCommonFeaturesService = inject(FormCommonFeaturesService);
  fb = inject(NonNullableFormBuilder);

  @Input({ required: true }) wrongCredentials = false;
  @Input({ required: true }) users!: LocalUsers[];
  @Output() data = new EventEmitter<LocalAuthUserData>();
  @Output() rememberMe = new EventEmitter<boolean>();
  sending = false;
  maxUsernameLength = 10;
  selectedAccount: number | null = null;

  localLoginForm = this.fb.group({
    name: this.fb.control('', { validators: [Validators.required] }),
    passphrase: this.fb.control('', { validators: [Validators.required] }),
  });
  rememberMeControl = this.fb.control(false);

  ngAfterViewInit(): void {
    this.formCommonFeaturesService.onInitAnimations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['wrongCredentials']?.currentValue === true) {
      this.sending = false;
    }
  }

  getError = (element: string | string[], validation: string) =>
    this.formCommonFeaturesService.getError(
      this.localLoginForm,
      element,
      validation
    );

  togglePassphraseInput(index: number) {
    if (this.selectedAccount === index) return;

    this.wrongCredentials = false;
    this.selectedAccount = index;
    this.pickUser(this.users[index].name);
  }

  private pickUser(user: string) {
    this.localLoginForm.get('passphrase')?.reset();
    this.localLoginForm.patchValue({ name: user });
    this.localLoginForm.setErrors(null);
    this.rememberMeControl.reset();
  }

  onSubmit() {
    const isTheFormInvalid = () => {
      const { name, passphrase } = this.localLoginForm.controls;
      return !(name || passphrase);
    };

    if (isTheFormInvalid()) {
      return this.formCommonFeaturesService.onFailure(this.localLoginForm);
    }

    this.rememberMe.emit(this.rememberMeControl.value);
    this.sending = this.formCommonFeaturesService.submitForm(
      this.localLoginForm,
      this.data
    );
  }
}
