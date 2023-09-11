import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  UserCredential,
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { Database, get, push, ref } from '@angular/fire/database';
import { ActivatedRoute, Router } from '@angular/router';
import { checkEmail } from 'src/app/auth-components/register-component/register-custom-validations/register-custom-validations';

export interface UnknownError {
  code: string;
  message: string;
}

export interface Errors {
  alreadyInUseError?: true;
  emailDoesNotExist?: true;
  wrongEmailOrPassword?: true;
  unknownError?: UnknownError;
}

interface RegisterCustomOptions {
  displayName?: string | null | undefined;
  photoURL?: string | null | undefined;
}

/**
 * registered property is used for 3rd party providers to check if the account was previously registered in DB or not.
 */
export interface AuthReturnCredits {
  passed?: true;
  registered?: boolean;
  errors?: Errors;
}

type CustomNavigator = Navigator & {
  msMaxTouchPoints: number;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  _response!: UserCredential;
  private router = inject(Router);
  private _auth = inject(Auth);
  private _db = inject(Database);

  private isAuthError(
    error: unknown
  ): error is { message: string; code: string } {
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      'code' in error
    )
      return true;

    return false;
  }

  async signupWithEmail(
    email: string,
    password: string,
    options?: RegisterCustomOptions
  ): Promise<AuthReturnCredits> {
    try {
      this._response = await createUserWithEmailAndPassword(
        this._auth,
        email,
        password
      );

      if (options && this._auth.currentUser)
        await this.changeUserProfileData(options);
      return { passed: true };
    } catch (error) {
      if (this.isAuthError(error)) {
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
      this._response = await signInWithEmailAndPassword(
        this._auth,
        email,
        password
      );
      return { passed: true };
    } catch (error) {
      if (this.isAuthError(error)) {
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
      if (this.isTheDeviceMobile()) {
        await signInWithRedirect(this._auth, provider);
      } else {
        this._response = await signInWithPopup(this._auth, provider);
        console.log(this._response);
        if (
          !(await this.checkIfUserExistsInDatabase(this._response.user.email!))
        )
          this.registerInDatabase();
        return { passed: true };
      }
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
      const result = await getRedirectResult(this._auth);
      if (result) {
        this._response = result;
        if (!(await this.checkIfUserExistsInDatabase(result.user.email!))) {
          await this.registerInDatabase();
          return { passed: true, registered: true };
        } else return { passed: true, registered: false };
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
    await signOut(this._auth);
    this.router.navigateByUrl('/online');
  }

  async registerInDatabase(): Promise<void> {
    const {
      providerId,
      user: { email, photoURL },
    } = this._response;
    const payload = {
      email,
      photoURL,
      provider: providerId,
      finishedTutorial: false,
    };
    const registerRef = ref(this._db, `users/${this._auth.currentUser?.uid}`);
    try {
      // await set(registerRef, payload);
      await push(registerRef, payload);
    } catch (error) {
      console.error('Error when saving user data: ', error);
    }
  }

  async changeUserProfileData(options: RegisterCustomOptions): Promise<void> {
    if (!this._auth.currentUser) {
      console.error('No user registered/logged in');
      return;
    }
    if (!options) console.error('No options provided');

    updateProfile(this._auth.currentUser, options);
  }

  async checkIfUserExistsInDatabase(
    email: string
  ): Promise<boolean | undefined> {
    /* Takes the user collection and searches if there's already an account with this email */
    try {
      const userRef = ref(this._db, `users/${this._auth.currentUser?.uid}`);
      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        const user = userSnapshot.val();
        return user.email === email;
      }
      return false;
    } catch (err) {
      console.error('Error when checking if user exists: ', err);
      return undefined;
    }
  }

  async sendVerificationEmail() {
    await sendEmailVerification(this._response.user);
  }

  async sendPasswordResetEmail(email: string) {
    if (checkEmail(email) === null) {
      await sendPasswordResetEmail(this._auth, email);
      return true;
    }
    return false;
  }

  isTheDeviceMobile(): boolean {
    let hasTouchScreen = false;
    if ('maxTouchPoints' in navigator) {
      hasTouchScreen = navigator.maxTouchPoints > 0;
    } else if ('msMaxTouchPoints' in navigator) {
      hasTouchScreen = (navigator as CustomNavigator).msMaxTouchPoints > 0;
    } else {
      const mediaQuery = window.matchMedia! && matchMedia('(pointer:coarse)');
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

  redirectUser(registered?: string | boolean | null) {
    const route = inject(ActivatedRoute);
    registered
      ? this.router.navigateByUrl('/verify-email')
      : this.router.navigateByUrl(
          `/${route.snapshot.paramMap.get('forward') ?? 'app'}`
        );
  }

  async rememberMe(action: boolean) {
    action
      ? await this._auth.setPersistence({ type: 'LOCAL' })
      : await this._auth.setPersistence({ type: 'SESSION' });
  }
}
