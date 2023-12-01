import { Injectable, inject } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signOut,
  updateProfile,
  confirmPasswordReset,
  UserCredential,
  applyActionCode,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { isAuthError } from 'src/app/reusable/Models/isAuthError';
import {
  RegisterCustomOptions,
  AuthReturnCredits,
  UnknownError,
} from '../Models/authModels';
import { AuthDatabaseService } from '../database/auth-database.service';
import { AuthStateService } from '../state/auth-state.service';

type CustomNavigator = Navigator & {
  msMaxTouchPoints: number;
};

@Injectable({
  providedIn: 'root',
})
export class AuthAccountService {
  #router = inject(Router);
  #authState = inject(AuthStateService);
  #authDatabase = inject(AuthDatabaseService);

  checkUserSession = this.#authState.checkUserSession;

  async signupWithEmail(
    email: string,
    password: string,
    options: RegisterCustomOptions
  ): Promise<AuthReturnCredits> {
    try {
      if (!options) {
        // Error for implementation failure, not practical use case
        const noNameError: UnknownError = {
          code: 'noOptionsProvided',
          message: 'options parameter is not defined',
        };
        return {
          errors: {
            unknownError: noNameError,
          },
        };
      }

      this.#authState.session.set(
        await createUserWithEmailAndPassword(
          this.#authState.auth,
          email,
          password
        )
      );
      const returnObj = await this.#authDatabase.databaseRegisterHandler(
        this.#authState.session() as UserCredential
      );
      await this.changeUserProfileData(options);
      return returnObj;
    } catch (error) {
      if (isAuthError(error)) {
        if (error.code === 'auth/email-already-in-use')
          return { errors: { alreadyInUseError: true } };
      }
      return {
        errors: { unknownError: error as UnknownError },
      };
    }
  }

  async signInWithEmail(
    email: string,
    password: string
  ): Promise<AuthReturnCredits> {
    try {
      this.#authState.session.set(
        await signInWithEmailAndPassword(this.#authState.auth, email, password)
      );
      return this.#authState.session()?.user.emailVerified
        ? { passed: true }
        : { errors: { unverifiedEmail: true } };
    } catch (error) {
      if (isAuthError(error)) {
        if (error.code === 'auth/user-not-found')
          return { errors: { emailDoesNotExist: true } };
        if (error.code === 'auth/wrong-password')
          return { errors: { wrongEmailOrPassword: true } };
      }
      return {
        errors: { unknownError: error as UnknownError },
      };
    }
  }

  /**
   * Auth provider for redirect and popup depending on where user runs the app.
   * Beside this method you must apply getDataFromRedirect() in your component to get data from redirect.
   */
  async continueWithGoogle(): Promise<AuthReturnCredits | void> {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    try {
      if (this.isTheDeviceMobile())
        await signInWithRedirect(this.#authState.auth, provider);
      else {
        this.#authState.session.set(
          await signInWithPopup(this.#authState.auth, provider)
        );
      }

      if (!this.#authState.session())
        return { errors: { noEmailProvided: true } };

      return await this.#authDatabase.databaseRegisterHandler(
        this.#authState.session() as UserCredential
      );
    } catch (error) {
      console.error(error);
      return {
        errors: { unknownError: error as UnknownError },
      };
    }
  }

  /**
   * The second part of continueWithGoogle() for getting the redirect UserCredential.
   */
  async getDataFromRedirect(): Promise<AuthReturnCredits | null> {
    try {
      const result = await getRedirectResult(this.#authState.auth);
      if (result) {
        this.#authState.session.set(result);
        return await this.#authDatabase.databaseRegisterHandler(
          this.#authState.session() as UserCredential
        );
      } else {
        // Normal component etc. run
        return null;
      }
    } catch (error) {
      console.error(error);
      return {
        errors: { unknownError: error as UnknownError },
      };
    }
  }

  async signOutUser() {
    await signOut(this.#authState.auth);
    this.#router.navigateByUrl('/online');
  }

  setUserAsVerified() {
    applyActionCode;
  }

  async changeUserProfileData(options: RegisterCustomOptions): Promise<void> {
    if (!this.#authState.auth.currentUser) {
      console.error('No user registered/logged in');
      return;
    }
    if (!options) {
      console.error('No options provided');
      return;
    }
    await updateProfile(this.#authState.auth.currentUser, options);
  }

  newPasswordChecker(oobCode: string, newPassword: string) {
    //  const result= await verifyPasswordResetCode(this.authState.auth, oobCode);

    return confirmPasswordReset(this.#authState.auth, oobCode, newPassword);
  }

  private isTheDeviceMobile(): boolean {
    let hasTouchScreen = false;
    if ('maxTouchPoints' in navigator) {
      hasTouchScreen = navigator.maxTouchPoints > 0;
    } else if ('msMaxTouchPoints' in navigator) {
      hasTouchScreen = (navigator as CustomNavigator).msMaxTouchPoints > 0;
    } else {
      const mediaQuery = matchMedia('(pointer:coarse)');
      if (mediaQuery && mediaQuery.media === '(pointer:coarse)') {
        hasTouchScreen = !!mediaQuery.matches;
      } else if ('orientation' in window) {
        hasTouchScreen = true;
      } else {
        const userAgent = (navigator as Navigator).userAgent;
        hasTouchScreen =
          /\b(BlackBerry|webOS|iPhone|IEMobile|Android|Windows Phone|iPad|iPod)\b/i.test(
            userAgent
          );
      }
    }
    return hasTouchScreen;
  }
}
