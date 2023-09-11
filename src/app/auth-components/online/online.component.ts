import { NgIf } from '@angular/common';
import {
  Component,
  AfterViewChecked,
  ViewChild,
  ElementRef,
  inject,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import {
  AuthReturnCredits,
  AuthService,
  Errors,
} from 'src/redirect/auth.service';
import { GoogleLogoComponent } from 'src/reusable/SVGs/google-logo/google-logo.component';
import { CustomMatRippleDirective } from 'src/reusable/ripples/ripple-color-checker.directive';
import {
  LoginRegisterCommonFeatures,
  AuthUserData,
} from '../login&register-shared-code/LoginRegisterCommonFeatures';
import { LoginComponentComponent } from '../login-component/login-component.component';
import { RegisterComponentComponent } from '../register-component/register-component.component';

@Component({
  standalone: true,
  templateUrl: './online.component.html',
  styleUrls: ['./online.component.scss'],
  imports: [
    NgIf,
    RegisterComponentComponent,
    LoginComponentComponent,
    GoogleLogoComponent,
    CustomMatRippleDirective,
  ],
})
export class OnlineComponent implements OnInit, AfterViewChecked {
  register = true;
  svgHeight = '25';
  svgWidth = '25';

  alreadyInUseError = false;
  wrongEmailOrPassword = false;
  emailDoesNotExist = false;

  @ViewChild('container') container!: ElementRef<HTMLDivElement>;
  @ViewChild('googleButton') googleButton!: ElementRef<HTMLSpanElement>;

  private cd = inject(ChangeDetectorRef);
  public authService = inject(AuthService);

  ngOnInit(): void {
    this.handleGoogleRedirect();
  }

  ngAfterViewChecked(): void {
    LoginRegisterCommonFeatures.googleButtonLogic(
      this.googleButton.nativeElement
    );
    this.cd.detectChanges();
  }

  async handleGoogleRedirect() {
    let response = await this.authService.getDataFromRedirect();
    if (!response) return;
    if (response.errors) this._handleAuthErrors(response.errors);
    else this.authService.redirectUser(response.registered);
  }

  async handleSubmit({
    name: displayName,
    email,
    password,
  }: AuthUserData): Promise<void> {
    let response: AuthReturnCredits;
    if (displayName) {
      response = await this.authService.signupWithEmail(email, password, {
        displayName,
      });
      if (!response.passed) return;
      if (await this.authService.checkIfUserExistsInDatabase(email))
        await this.authService.registerInDatabase();
    } else {
      response = await this.authService.signInWithEmail(email, password);
    }

    response.errors
      ? this._handleAuthErrors(response.errors)
      : this.authService.redirectUser(displayName);
  }

  private _handleAuthErrors(errors: Errors) {
    for (let key of objectKeys(errors)) {
      switch (key) {
        case 'alreadyInUseError':
          this.alreadyInUseError = true;
          break;
        case 'wrongEmailOrPassword':
          this.wrongEmailOrPassword = true;
          break;
        case 'emailDoesNotExist':
          this.emailDoesNotExist = true;
          break;
        default:
          throw new Error(errors[key]?.message);
      }
    }
  }
}

function objectKeys<T extends {}>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}
