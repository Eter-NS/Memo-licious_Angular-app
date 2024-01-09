import { NgIf } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import {
  AuthReturnCredits,
  Errors,
} from 'src/app/auth-components/services/Models/authModels';
import { GoogleLogoComponent } from 'src/app/reusable/SVGs/google-logo/google-logo.component';
import { objectKeys } from 'src/app/reusable/data-tools/objectTools';
import { CustomMatRippleDirective } from 'src/app/reusable/ripples/ripple-color-checker.directive';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { PreviousPageButtonComponent } from 'src/app/ui/previous-page-button/previous-page-button.component';
import { runAnimationOnce } from 'src/app/reusable/animations/animation-triggers';
import { AuthAccountService } from '../services/account/auth-account.service';
import { AuthUserData } from '../services/form-common-features/form-common-features.service';
import { AuthStateService } from '../services/state/auth-state.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from 'src/environments/environment.dev';

@Component({
  standalone: true,
  templateUrl: './online.component.html',
  styleUrls: ['./online.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    RegisterComponent,
    LoginComponent,
    GoogleLogoComponent,
    CustomMatRippleDirective,
    MatSnackBarModule,
    PreviousPageButtonComponent,
    MatProgressSpinnerModule,
  ],
})
export class OnlineComponent implements OnInit, AfterViewInit {
  #authAccountService = inject(AuthAccountService);
  authStateService = inject(AuthStateService);
  #route = inject(ActivatedRoute);
  #snackBar = inject(MatSnackBar);
  viewTransitionService = inject(ViewTransitionService);
  private cd = inject(ChangeDetectorRef);
  @ViewChild('mainTagRef') mainTagRef!: ElementRef<HTMLDivElement>;
  @ViewChild('viewContainer') viewContainer!: ElementRef<HTMLDivElement>;

  register!: boolean;
  redirect?: string;

  alreadyInUseError = false;
  wrongEmailOrPassword = false;
  emailDoesNotExist = false;

  ngOnInit(): void {
    this._checkParamMap();
  }

  ngAfterViewInit(): void {
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

  private _authErrorGuard(response: AuthReturnCredits) {
    response.errors
      ? this._handleAuthErrors(response.errors)
      : this.viewTransitionService.goForward(
          this.viewContainer.nativeElement,
          this._redirectUser(response)
        );
  }

  private _handleAuthErrors(errors: Errors) {
    const duration = 5000;
    for (const key of objectKeys(errors)) {
      switch (key) {
        case 'alreadyInUseError':
          this.alreadyInUseError = true;
          this.cd.markForCheck();
          break;
        case 'wrongEmailOrPassword':
          this.wrongEmailOrPassword = true;
          this.cd.markForCheck();
          break;
        case 'emailDoesNotExist':
          this.emailDoesNotExist = true;
          this.cd.markForCheck();
          break;
        case 'sendingPostToDB':
          this.#snackBar.open(
            'Something went wrong when creating your account, try again',
            'close',
            { duration: duration }
          );
          break;
        case 'unverifiedEmail':
          this.#snackBar.open(
            'Sorry, but you have not verified your email 😥 Do it first, and then try again',
            'close',
            { duration: duration }
          );
          break;
        case 'noEmailProvided':
          this.#snackBar.open(
            'It looks like someone has forgotten to write an email 😉',
            'close',
            { duration: duration }
          );
          break;
        case 'unknownError':
          this.#snackBar.open(
            `${errors.unknownError?.code}, ${errors.unknownError?.message}`,
            'close',
            { duration: duration }
          );
          break;
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
    const sessionValue = this.authStateService.session();
    if (registered || (sessionValue && !sessionValue.user.emailVerified)) {
      return '/verify-email';
    }

    return `/${this.redirect || 'app'}`;
  }

  private _checkParamMap(): void {
    const pathElement = this.#route.snapshot.paramMap.get('siteAction');
    const setDefaultValues = () => {
      this.register = true;
      this.redirect = undefined;
    };
    if (!pathElement) {
      setDefaultValues();
      return;
    }
    const [action, parameter] = pathElement.split('=');
    switch (action) {
      case 'force':
        this.register = !(parameter === 'login');
        break;
      case 'forward':
        if (!parameter) return;
        this.redirect = parameter;
        break;
      default:
        setDefaultValues();
        break;
    }
  }

  toggleRegister(): void {
    this.register = !this.register;
  }
}
