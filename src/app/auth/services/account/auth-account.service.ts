import { Injectable, inject } from '@angular/core';
import {
  GoogleAuthProvider,
  UserCredential,
  User,
  EmailAuthProvider,
  AuthCredential,
  OAuthCredential,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { isAuthError } from 'src/app/reusable/Models/isAuthError';
import {
  RegisterCustomOptions,
  AuthReturnCredits,
  UnknownError,
  Errors,
} from '../Models/OnlineAuthModels.interface';
import { AuthDatabaseService } from '../database/auth-database.service';
import { AuthStateService } from '../state/auth-state.service';
import { isMobileDevice } from 'src/app/reusable/data-tools/isMobileDevice';
import { FirebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service';
import { environment } from 'src/environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class AuthAccountService {
  #router = inject(Router);
  #authState = inject(AuthStateService);
  #authDatabase = inject(AuthDatabaseService);
  #fireAuthController = inject(FirebaseAuthControllerService);

  readonly #authErrorDictionary: Record<string, Errors> = {
    'auth/email-already-in-use': { alreadyInUseError: true },
    'auth/user-not-found': { emailDoesNotExist: true },
    'auth/wrong-password': { wrongEmailOrPassword: true },
  };

  checkUserSession = this.#authState.checkUserSession;
  _isMobileDevice = isMobileDevice;

  async signupWithEmail(
    email: string,
    password: string,
    options: RegisterCustomOptions
  ): Promise<AuthReturnCredits> {
    try {
      if (!options.displayName) {
        const noProfileNameError: UnknownError = {
          code: 'noDisplayNameProvided',
          message: 'Options parameter is defined without displayName property.',
        };

        return {
          errors: {
            unknownError: noProfileNameError,
          },
        };
      }

      const result =
        await this.#fireAuthController.createUserWithEmailAndPassword(
          this.#authState.auth,
          email,
          password
        );

      this.#authState.updateSession(result.user);

      const returnObj = await this.#authDatabase.databaseRegisterHandler(
        result
      );

      await this.changeUserProfileData(options);

      return returnObj;
    } catch (error) {
      const errorOutput = this._handleAuthError(error);

      if (errorOutput) {
        return errorOutput;
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
      const result = await this.#fireAuthController.signInWithEmailAndPassword(
        this.#authState.auth,
        email,
        password
      );

      this.#authState.updateSession(result.user);

      if (this.#authState.sessionSig()?.emailVerified) {
        return { passed: true };
      }

      return { errors: { unverifiedEmail: true } };
    } catch (error) {
      const errorOutput = this._handleAuthError(error);

      if (errorOutput) {
        return errorOutput;
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
    const provider = this._createGoogleProvider();

    let result: UserCredential;
    try {
      if (this._isMobileDevice()) {
        await this.#fireAuthController.signInWithRedirect(
          this.#authState.auth,
          provider
        );
      } else {
        result = await this.#fireAuthController.signInWithPopup(
          this.#authState.auth,
          provider
        );
        this.#authState.updateSession(result.user);
      }

      return await this.#authDatabase.databaseRegisterHandler(result!);
    } catch (err) {
      this._devErrorLog(err);

      return {
        errors: { unknownError: err as UnknownError },
      };
    }
  }

  /**
   * The second part of continueWithGoogle() for getting the redirect UserCredential.
   */
  async getDataFromRedirect(): Promise<AuthReturnCredits | null> {
    try {
      const result = await this.#fireAuthController.getRedirectResult(
        this.#authState.auth
      );
      if (!result) {
        // Normal component etc. run
        return null;
      }

      this.#authState.updateSession(result.user);
      return await this.#authDatabase.databaseRegisterHandler(result);
    } catch (err) {
      this._devErrorLog(err);

      return {
        errors: { unknownError: err as UnknownError },
      };
    }
  }

  async signOutUser() {
    if (!this.#authState.sessionSig()) return;

    await this.#fireAuthController.signOut(this.#authState.auth);
    await this.#router.navigateByUrl('/online/force=login');
  }

  async changeUserProfileData(options: RegisterCustomOptions): Promise<void> {
    try {
      const user = this._getUser();
      if (!user) {
        this._devErrorLog('No user registered/logged in.');

        return;
      }

      if (!Object.keys(options).length) {
        this._devErrorLog('No options provided.');

        return;
      }

      await this.#fireAuthController.updateProfile(user, options);
    } catch (err) {
      console.error('changeUserProfileData', err);
      return;
    }
  }

  async updateEmail(
    existingPassword: string,
    existingEmail: string,
    newEmail: string
  ): Promise<AuthReturnCredits> {
    try {
      const user = this._getUser();

      try {
        await user.getIdToken();
        await this.#fireAuthController.updateEmail(user, newEmail);
      } catch (err) {
        if (isAuthError(err) && err.code === 'auth/requires-recent-login') {
          await this._reauthenticateUser(user, existingEmail, existingPassword);
          await this.#fireAuthController.updateEmail(user, newEmail);
        }
      }

      return { passed: true };
    } catch (err) {
      this._devErrorLog(err);

      return {
        errors: { unknownError: err as UnknownError },
      };
    }
  }

  async updatePassword(
    existingPassword: string,
    newPassword: string
  ): Promise<AuthReturnCredits> {
    try {
      const user = this._getUser();

      try {
        await user.getIdToken();
        await this.#fireAuthController.updatePassword(user, newPassword);
      } catch (err) {
        if (isAuthError(err) && err.code === 'auth/requires-recent-login') {
          await this._reauthenticateUser(
            user,
            existingPassword,
            this.#authState.sessionSig()?.email as string
          );

          await this.#fireAuthController.updatePassword(user, newPassword);
        }
      }

      return { passed: true };
    } catch (err) {
      this._devErrorLog(err);

      return {
        errors: { unknownError: err as UnknownError },
      };
    }
  }

  private _getUser() {
    const user = this.#authState.sessionSig();

    if (!user) {
      throw { code: 'noUser', message: 'No user logged in.' };
    }

    return user;
  }

  private async _reauthenticateUser(
    user: User,
    password: string,
    email?: string
  ): Promise<void> {
    let credentials: AuthCredential;

    if (user.providerId === 'google') {
      // Handle Google sign-in
      credentials = await this._googleReauthenticate();
    } else {
      // Handle email sign-in
      credentials = this._emailReauthenticate(email, password);
    }

    this.#fireAuthController.reauthenticateWithCredential(user, credentials);
  }

  private async _googleReauthenticate(): Promise<OAuthCredential> {
    const provider = this._createGoogleProvider();
    const result = await this.#fireAuthController.signInWithPopup(
      this.#authState.auth,
      provider
    );
    const googleCredential = GoogleAuthProvider.credentialFromResult(result);

    if (!googleCredential) {
      throw {
        code: 'noDataFromPopup',
        message:
          'The popup has been closed without authenticating, or an error occurred during validation.',
      };
    }

    return GoogleAuthProvider.credential(
      googleCredential.idToken,
      googleCredential.accessToken
    );
  }

  private _emailReauthenticate(
    existingEmail: string | undefined,
    existingPassword: string
  ) {
    if (!existingEmail) {
      throw { noEmailProvided: true };
    }

    if (!existingPassword) {
      throw {
        code: 'noPassword',
        message: 'No password provided.',
      };
    }

    return EmailAuthProvider.credential(existingEmail, existingPassword);
  }

  private _createGoogleProvider() {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    return provider;
  }

  private _handleAuthError(error: unknown): { errors: Errors } | null {
    return isAuthError(error)
      ? {
          errors: this.#authErrorDictionary[error.code] || error,
        }
      : null;
  }

  private _devErrorLog(message: string | unknown) {
    if (!environment.production) {
      console.error(message);
    }
  }
}
