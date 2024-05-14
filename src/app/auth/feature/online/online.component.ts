import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
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
import { environment } from 'src/environments/environment.dev';
import { AuthCommonFeaturesService } from '../../data-access/auth-common-features/auth-common-features.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

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
  ],
})
export class OnlineComponent implements OnInit {
  #authAccountService = inject(AuthAccountService);
  #authStateService = inject(AuthStateService);
  #authCommonFeaturesService = inject(AuthCommonFeaturesService);
  #route = inject(ActivatedRoute);
  #snackBar = inject(MatSnackBar);
  #cd = inject(ChangeDetectorRef);
  viewTransitionService = inject(ViewTransitionService);

  @ViewChild('mainTagRef', { static: true })
  mainTagRef!: ElementRef<HTMLDivElement>;
  @ViewChild('viewContainer', { static: true })
  viewContainer!: ElementRef<HTMLDivElement>;

  redirect?: string;

  private _registerSubject = new BehaviorSubject<boolean>(true);
  protected register$ = this._registerSubject.asObservable();

  alreadyInUseError = false;
  wrongEmailOrPassword = false;
  emailDoesNotExist = false;

  ngOnInit(): void {
    this._checkParams();
    this.checkTransitionDirection();
    this.googleAuth('getDataFromRedirect');
  }

  private checkTransitionDirection() {
    if (!this.viewTransitionService.goBackClicked) {
      runAnimationOnce(this.mainTagRef.nativeElement, 'color-transition');
    }
  }

  public async googleAuth(
    method: 'continueWithGoogle' | 'getDataFromRedirect'
  ) {
    const response = await this.#authAccountService[method]();
    if (!response) return;
    this._authErrorGuard(response);
  }

  public async handleSubmit({
    name: displayName,
    email,
    password,
  }: AuthUserData): Promise<void> {
    if (!email || !password) return;

    const response = displayName
      ? await this.#authAccountService.signupWithEmail(email, password, {
          displayName,
        })
      : await this.#authAccountService.signInWithEmail(email, password);

    this._authErrorGuard(response);
  }

  toggleRegister(): void {
    this._registerSubject.next(!this._registerSubject.value);
  }

  updateRememberMe(action: boolean) {
    this.#authStateService.rememberMe(action);
  }

  private _authErrorGuard(response: AuthReturnCredits): void {
    if (response.errors) {
      this._handleAuthErrors(response.errors);
      return;
    }

    this.viewTransitionService.goForward(
      this.viewContainer.nativeElement,
      this._redirectUser(response)
    );
  }

  private _handleAuthErrors(errors: Errors) {
    // Flags reset
    this.alreadyInUseError = false;
    this.wrongEmailOrPassword = false;
    this.emailDoesNotExist = false;
    this.#cd.detectChanges();

    const duration = 5000;
    for (const key of objectKeys(errors)) {
      switch (key) {
        case 'alreadyInUseError':
          this.alreadyInUseError = true;
          this.#cd.markForCheck();
          break;

        case 'wrongEmailOrPassword':
          this.wrongEmailOrPassword = true;
          this.#cd.markForCheck();
          break;

        case 'emailDoesNotExist':
          this.emailDoesNotExist = true;
          this.#cd.markForCheck();
          break;

        case 'sendingPostToDB':
          this.#snackBar.open(
            'Something went wrong when creating your account, try again',
            'close',
            { duration }
          );
          break;

        case 'unverifiedEmail':
          this.viewTransitionService.goForward(
            this.viewContainer.nativeElement,
            '/verify-email'
          );
          break;

        case 'noEmailProvided':
          this.#snackBar.open(
            'It looks like someone has forgotten to write an email 😉',
            'close',
            { duration }
          );
          break;

        case 'unknownError': {
          if (errors.unknownError?.code === 'auth/popup-closed-by-user') {
            return;
          }

          this.#snackBar.open(
            `${errors.unknownError?.code}, ${errors.unknownError?.message}`,
            'close',
            { duration }
          );
          break;
        }

        default:
          if (!environment.production) {
            throw new Error('Unhandled error property');
          }
      }
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

    return `/${this.redirect || 'app'}`;
  }

  private _checkParams() {
    const { register, redirect } =
      this.#authCommonFeaturesService.checkParamMap(this.#route, 'siteAction');
    this._registerSubject.next(register);
    this.redirect = redirect;
  }
}
