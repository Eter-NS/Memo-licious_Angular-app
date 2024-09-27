import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { OnlineLoginComponent } from '../../ui/online-login/online-login.component';
import { OnlineRegisterComponent } from '../../ui/online-register/online-register.component';
import {
  AuthReturnCredits,
  Errors,
} from 'src/app/auth/utils/Models/OnlineAuthModels.interface';
import { GoogleLogoComponent } from '../../../reusable/ui/SVGs/google-logo/google-logo.component';
import { objectKeys } from 'src/app/reusable/utils/data-tools/objectTools';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { PreviousPageButtonComponent } from 'src/app/reusable/ui/previous-page-button/previous-page-button.component';
import { runAnimationOnce } from 'src/app/reusable/utils/animations/animation-triggers';
import { AuthAccountService } from '../../data-access/account/auth-account.service';
import { AuthUserData } from '../../../reusable/data-access/form-common-features/form-common-features.service';
import { AuthStateService } from '../../data-access/state/auth-state.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthCommonFeaturesService } from '../../data-access/auth-common-features/auth-common-features.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { FetchErrorComponent } from '../../../reusable/ui/fetch-error/fetch-error.component';

type FormsErrors = {
  alreadyInUseError: boolean;
  wrongEmailOrPassword: boolean;
  emailDoesNotExist: boolean;
};

@Component({
  standalone: true,
  templateUrl: './online.component.html',
  styleUrls: ['./online.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnlineRegisterComponent,
    OnlineLoginComponent,
    GoogleLogoComponent,
    MatSnackBarModule,
    PreviousPageButtonComponent,
    MatProgressSpinnerModule,
    AsyncPipe,
    FetchErrorComponent,
  ],
})
export class OnlineComponent implements OnInit {
  #authAccountService = inject(AuthAccountService);
  #authStateService = inject(AuthStateService);
  #authCommonFeaturesService = inject(AuthCommonFeaturesService);
  #route = inject(ActivatedRoute);
  #snackBar = inject(MatSnackBar);
  viewTransitionService = inject(ViewTransitionService);
  private _runAnimationOnce = runAnimationOnce;

  @ViewChild('mainTagRef', { static: true })
  private _mainTagRef!: ElementRef<HTMLDivElement>;

  private _redirect: string | undefined = undefined;

  private _registerSubject = new BehaviorSubject<boolean>(true);
  protected register$ = this._registerSubject.asObservable();

  private _formErrorsSubject = new BehaviorSubject<FormsErrors>({
    alreadyInUseError: false,
    wrongEmailOrPassword: false,
    emailDoesNotExist: false,
  });

  protected data$ = combineLatest({
    formErrors: this._formErrorsSubject.asObservable(),
  });

  ngOnInit(): void {
    this._checkParams();
    this._checkTransitionDirection();
    this.googleAuth('getDataFromRedirect');
  }

  toggleForm(): void {
    this._registerSubject.next(!this._registerSubject.value);
  }

  protected async googleAuth(
    method: 'continueWithGoogle' | 'getDataFromRedirect'
  ) {
    const response = await this.#authAccountService[method]();

    if (!response) {
      return;
    }
    this._authErrorGuard(response);
  }

  protected async handleSubmit({
    name: displayName,
    email,
    password,
  }: AuthUserData): Promise<void> {
    const response = displayName
      ? await this.#authAccountService.signupWithEmail(email, password, {
          displayName,
        })
      : await this.#authAccountService.signInWithEmail(email, password);

    await this._authErrorGuard(response);
  }

  protected updateRememberMe(action: boolean) {
    this.#authStateService.rememberMe(action);
  }

  private async _authErrorGuard(response: AuthReturnCredits): Promise<void> {
    if (response.errors) {
      this._handleAuthErrors(response.errors);
      return;
    }
    await this.viewTransitionService.goForward(
      this._mainTagRef.nativeElement,
      this._redirectUser(response)
    );
  }

  private _handleAuthErrors(errors: Errors) {
    this._formErrorsSubject.next({
      alreadyInUseError: false,
      wrongEmailOrPassword: false,
      emailDoesNotExist: false,
    });

    const errorMap = this._getErrorMap(errors);

    for (const key of objectKeys(errors)) {
      try {
        errorMap[key]();
      } catch (err) {
        console.error('Unhandled error property: ', key);
      }
    }
  }

  private _getErrorMap(errors: Errors): Record<keyof Errors, () => void> {
    const duration = 5000;
    const actionText = 'close';

    return {
      alreadyInUseError: () => {
        this._formErrorsSubject.next({
          ...this._formErrorsSubject.value,
          alreadyInUseError: true,
        });
      },
      wrongEmailOrPassword: () => {
        this._formErrorsSubject.next({
          ...this._formErrorsSubject.value,
          wrongEmailOrPassword: true,
        });
      },
      emailDoesNotExist: () => {
        this._formErrorsSubject.next({
          ...this._formErrorsSubject.value,
          emailDoesNotExist: true,
        });
      },
      sendingPostToDB: () => {
        this.#snackBar.open(
          'Something went wrong when creating your account, try again',
          'close',
          { duration }
        );
      },
      noEmailProvided: () => {
        this.#snackBar.open(
          'It looks like someone has forgotten to write an email 😉',
          actionText,
          { duration }
        );
      },
      unverifiedEmail: () => {
        this.viewTransitionService.goForward(
          this._mainTagRef.nativeElement,
          '/verify-email'
        );
      },
      unknownError: () => {
        if (errors.unknownError?.code === 'auth/popup-closed-by-user') {
          return;
        }

        this.#snackBar.open(
          errors.unknownError?.message as string,
          actionText,
          {
            duration,
          }
        );
      },
    };
  }

  private _checkTransitionDirection() {
    if (!this.viewTransitionService.goBackClicked) {
      this._runAnimationOnce(
        this._mainTagRef.nativeElement,
        'color-transition'
      );
    }
  }

  /**
   * Returns a next user path based on the form action.
   * @return An url suffix based on the result registered flag and whether this.redirect is set or not. Only for navigateByUrl() usage.
   */
  private _redirectUser({ registered }: AuthReturnCredits): string {
    const sessionValue = this.#authStateService.sessionSig();

    if (registered || (sessionValue && !sessionValue.emailVerified)) {
      return '/verify-email';
    }

    return `/${this._redirect || 'app'}`;
  }

  private _checkParams() {
    const { register, redirect } =
      this.#authCommonFeaturesService.checkParamMap(this.#route, 'siteAction');
    this._registerSubject.next(register);
    this._redirect = redirect;
  }
}
