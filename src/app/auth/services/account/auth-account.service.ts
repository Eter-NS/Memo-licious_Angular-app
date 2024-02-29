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
  UserCredential,
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

  private _createUserWithEmailAndPassword = createUserWithEmailAndPassword;
  private _signInWithEmailAndPassword = signInWithEmailAndPassword;
  private _signInWithRedirect = signInWithRedirect;
  private _signInWithPopup = signInWithPopup;
  private _getRedirectResult = getRedirectResult;
  private _signOut = signOut;
  private _updateProfile = updateProfile;

  async signupWithEmail(
    email: string,
    password: string,
    options: RegisterCustomOptions
  ): Promise<AuthReturnCredits> {
    try {
      if (!options.displayName) {
        const noProfileNameError: UnknownError = {
          code: 'noDisplayNameProvided',
          message: 'options parameter is defined without displayName property',
        };
        return {
          errors: {
            unknownError: noProfileNameError,
          },
        };
      }

      const result = await this._createUserWithEmailAndPassword(
        this.#authState.auth,
        email,
        password
      );

      this.#authState.session.set(result.user);
      const returnObj = await this.#authDatabase.databaseRegisterHandler(
        result
      );
      await this.changeUserProfileData(options);
      return returnObj;
    } catch (error) {
      if (isAuthError(error)) {
        if (error.code === 'auth/email-already-in-use') {
          return { errors: { alreadyInUseError: true } };
        }
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
      const result = await this._signInWithEmailAndPassword(
        this.#authState.auth,
        email,
        password
      );
      this.#authState.session.set(result.user);
      return this.#authState.session()?.emailVerified
        ? { passed: true }
        : { errors: { unverifiedEmail: true } };
    } catch (error) {
      if (isAuthError(error)) {
        if (error.code === 'auth/user-not-found') {
          return { errors: { emailDoesNotExist: true } };
        }
        if (error.code === 'auth/wrong-password') {
          return { errors: { wrongEmailOrPassword: true } };
        }
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
  async continueWithGoogle(): Promise<AuthReturnCredits> {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    let result: UserCredential;
    try {
      if (this.isTheDeviceMobile()) {
        await this._signInWithRedirect(this.#authState.auth, provider);
      } else {
        result = await this._signInWithPopup(this.#authState.auth, provider);
        this.#authState.session.set(result.user);
      }

      return await this.#authDatabase.databaseRegisterHandler(result!);
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
      const result = await this._getRedirectResult(this.#authState.auth);
      if (result) {
        this.#authState.session.set(result.user);
        return await this.#authDatabase.databaseRegisterHandler(result);
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
    if (!this.#authState.session()) return;

    await this._signOut(this.#authState.auth);
    await this.#router.navigateByUrl('/online/force=login');
  }

  async changeUserProfileData(options: RegisterCustomOptions): Promise<void> {
    if (!this.#authState.auth.currentUser) {
      console.error('No user registered/logged in');
      return;
    }

    if (!Object.keys(options).length) {
      console.error('No options provided');
      return;
    }

    await this._updateProfile(this.#authState.auth.currentUser, options);
  }

  private isTheDeviceMobile(): boolean {
    let hasTouchScreen = false;

    if ('maxTouchPoints' in navigator) {
      hasTouchScreen = navigator.maxTouchPoints > 0;
    } else if ('msMaxTouchPoints' in navigator) {
      hasTouchScreen = (navigator as CustomNavigator).msMaxTouchPoints > 0;
    } else if (
      screen.orientation.type !== 'landscape-primary' ||
      screen.orientation.angle !== 0
    ) {
      hasTouchScreen = true;
    } else if ('orientation' in window) {
      hasTouchScreen = true;
    } else {
      const userAgent = (navigator as Navigator).userAgent;
      hasTouchScreen =
        /\b(BlackBerry|webOS|iPhone|IEMobile|Android|Windows Phone|iPad|iPod)\b/i.test(
          userAgent
        );
    }

    return hasTouchScreen;
  }
}
