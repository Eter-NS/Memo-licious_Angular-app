import { Injectable, inject } from '@angular/core';
import { checkEmail } from 'src/app/reusable/utils/custom-validations/custom-validations';
import { AuthStateService } from '../state/auth-state.service';
import { isAuthError } from 'src/app/reusable/utils/Models/isAuthError';
import { environment } from 'src/environments/environment.dev';
import { FirebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service';

@Injectable({
  providedIn: 'root',
})
export class AuthEmailService {
  #authState = inject(AuthStateService);
  #fireAuthController = inject(FirebaseAuthControllerService);

  async sendVerificationEmail() {
    if (!this.#authState.sessionSig()) return null;

    try {
      return await this.#fireAuthController.sendEmailVerification(
        this.#authState.sessionSig()!
      );
    } catch (err) {
      if (!environment.production) {
        if (isAuthError(err)) {
          console.error(`Error when sending email message: ${err.message}`);
        } else {
          console.error(err);
        }
      }
    }
  }

  async sendResetEmail(email: string) {
    if (checkEmail(email) === null) {
      try {
        await this.#fireAuthController.sendPasswordResetEmail(
          this.#authState.auth,
          email,
          {
            url: `${location.host}/online/force=login`,
          }
        );
        return true;
      } catch (err) {
        if (!environment.production) {
          if (isAuthError(err)) {
            console.error(err.message);
          } else {
            console.error(err);
          }
        }
        return false;
      }
    }
    return false;
  }
}
