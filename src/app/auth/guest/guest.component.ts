import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { AuthLocalUserService } from '../services/local-user/auth-local-user.service';
import { LocalUserFormData } from '../services/Models/UserDataModels';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { CustomMatRippleDirective } from 'src/app/reusable/ripples/ripple-color-checker.directive';
import { PreviousPageButtonComponent } from '../../ui/previous-page-button/previous-page-button.component';
import { runAnimationOnce } from 'src/app/reusable/animations/animation-triggers';
import { LocalAuthUserData } from '../services/form-common-features/form-common-features.service';
import { GuestRegisterComponent } from './guest-register/guest-register.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GuestLoginComponent } from './guest-login/guest-login.component';
import { AuthCommonFeaturesService } from '../services/auth-common-features/auth-common-features.service';
import { ActivatedRoute } from '@angular/router';

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
  ],
})
export class GuestComponent implements OnInit, AfterViewInit {
  viewTransitionService = inject(ViewTransitionService);
  authLocalUserService = inject(AuthLocalUserService);
  authCommonFeaturesService = inject(AuthCommonFeaturesService);
  #route = inject(ActivatedRoute);
  #snackBar = inject(MatSnackBar);

  @ViewChild('mainTagRef') mainTagRef!: ElementRef<HTMLDivElement>;
  register!: boolean;
  redirect?: string;
  rememberMe = false;

  alreadyInUseError = false;
  wrongCredentials = false;

  ngOnInit(): void {
    this._checkParams();
  }

  ngAfterViewInit(): void {
    this.checkTransitionDirection();
  }

  private checkTransitionDirection() {
    if (!this.viewTransitionService.goBackClicked)
      runAnimationOnce(this.mainTagRef.nativeElement, 'color-transition');
  }

  private _checkParams() {
    const { register, redirect } = this.authCommonFeaturesService.checkParamMap(
      this.#route,
      'siteAction'
    );
    this.register = register;
    this.redirect = redirect;
  }

  toggleRegister() {
    this.register = !this.register;
  }

  handleRegister({ name, passwordGroup, pinGroup }: LocalAuthUserData): void {
    const isPasswordSelected = passwordGroup;

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
      this.#snackBar.open(result.message, 'close', { duration: 5000 });

      if (result.code === 'user-exists') {
        this.alreadyInUseError = true;
      }

      return;
    }

    this.viewTransitionService.goForward(this.mainTagRef.nativeElement, '/app');
  }

  handleLogin({ name, passphrase }: LocalAuthUserData): void {
    if (!passphrase) {
      this.wrongCredentials = true;
      return;
    }

    const result = this.authLocalUserService.logIn(
      name,
      passphrase,
      this.rememberMe
    );

    if (result?.message) {
      this.#snackBar.open(result.message, 'close', { duration: 5000 });

      if (result.code === 'invalid-passkey') {
        this.wrongCredentials = true;
      }

      return;
    }

    this.viewTransitionService.goForward(this.mainTagRef.nativeElement, '/app');
  }
}
