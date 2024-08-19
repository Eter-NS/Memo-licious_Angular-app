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
    const session = this.#authState.sessionSig();

    if (!session) {
      throw new Error('No active user');
    }

    try {
      await this.#fireAuthController.sendEmailVerification(session);
    } catch (err) {
      if (!environment.production) {
        console.error(
          isAuthError(err)
            ? `Error when sending email message: ${err.message}`
            : err
        );
      }

      throw err;
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
