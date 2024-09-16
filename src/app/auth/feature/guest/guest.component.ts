import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { AuthLocalUserService } from '../../data-access/local-user/auth-local-user.service';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { CustomMatRippleDirective } from 'src/app/reusable/utils/ripples/ripple-color-checker.directive';
import { PreviousPageButtonComponent } from '../../../reusable/ui/previous-page-button/previous-page-button.component';
import { runAnimationOnce } from 'src/app/reusable/utils/animations/animation-triggers';
import { LocalAuthUserData } from '../../../reusable/data-access/form-common-features/form-common-features.service';
import { GuestRegisterComponent } from '../../ui/guest-register/guest-register.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GuestLoginComponent } from '../../ui/guest-login/guest-login.component';
import { AuthCommonFeaturesService } from '../../data-access/auth-common-features/auth-common-features.service';
import { ActivatedRoute } from '@angular/router';
import { LocalUserFormData } from '../../utils/Models/LocalAuthModels.interface';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { FetchErrorComponent } from 'src/app/reusable/ui/fetch-error/fetch-error.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './guest.component.html',
  styleUrls: ['./guest.component.scss'],
  imports: [
    PreviousPageButtonComponent,
    CustomMatRippleDirective,
    GuestRegisterComponent,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    GuestLoginComponent,
    AsyncPipe,
    FetchErrorComponent,
  ],
})
export class GuestComponent implements OnInit {
  viewTransitionService = inject(ViewTransitionService);
  authLocalUserService = inject(AuthLocalUserService);
  #authCommonFeaturesService = inject(AuthCommonFeaturesService);
  #route = inject(ActivatedRoute);
  #snackBar = inject(MatSnackBar);
  _runAnimationOnce = runAnimationOnce;

  @ViewChild('mainTagRef', { static: true })
  private _mainTagRef!: ElementRef<HTMLDivElement>;

  private _rememberMe = false;
  private _redirect: string | undefined = undefined;

  private _registerSubject = new BehaviorSubject<boolean>(true);
  private _wrongCredentialsSubject = new BehaviorSubject<boolean>(false);

  protected data$ = combineLatest({
    register: this._registerSubject.asObservable(),
    wrongCredentials: this._wrongCredentialsSubject.asObservable(),
  });

  ngOnInit(): void {
    this._checkParams();
    this._checkTransitionDirection();
  }

  private _checkTransitionDirection() {
    if (!this.viewTransitionService.goBackClicked) {
      this._runAnimationOnce(
        this._mainTagRef.nativeElement,
        'color-transition'
      );
    }
  }

  private _checkParams() {
    const { register, redirect } =
      this.#authCommonFeaturesService.checkParamMap(this.#route, 'siteAction');
    this._registerSubject.next(register);
    this._redirect = redirect;
  }

  toggleForm() {
    this._registerSubject.next(!this._registerSubject.value);
  }

  protected updateRememberMe(value: boolean) {
    this._rememberMe = value;
  }

  protected async handleRegister({
    name,
    passwordGroup,
    pinGroup,
  }: LocalAuthUserData): Promise<void> {
    const isPasswordSelected = Boolean(passwordGroup);

    const payload: LocalUserFormData = {
      auth: {
        name,
        authOption: isPasswordSelected ? 'password' : 'pin',
        value: isPasswordSelected
          ? (passwordGroup?.password as string)
          : (pinGroup?.pin as string),
      },
    };

    const result = this.authLocalUserService.createUser(payload);

    if (result?.message) {
      this._openSnackBar(result.message);
      return;
    }

    await this._redirectToApp();
  }

  protected async handleLogin({
    name,
    passphrase,
  }: LocalAuthUserData): Promise<void> {
    if (!passphrase) {
      this._wrongCredentialsSubject.next(true);
      return;
    }

    const result = this.authLocalUserService.logIn(
      name,
      passphrase,
      this._rememberMe ? 'local' : 'session'
    );

    if (result?.message) {
      this._openSnackBar(result.message);

      if (result.code === 'invalid-passkey') {
        this._wrongCredentialsSubject.next(true);
      }

      return;
    }

    await this._redirectToApp();
  }

  private async _redirectToApp() {
    return this.viewTransitionService.goForward(
      this._mainTagRef.nativeElement,
      this._redirect || '/app'
    );
  }

  private _openSnackBar(message: string): void {
    this.#snackBar.open(message, 'close', { duration: 5000 });
  }
}
