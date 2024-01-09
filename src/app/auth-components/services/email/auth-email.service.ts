import { Injectable, inject } from '@angular/core';
import {
  UserCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { checkEmail } from 'src/app/custom-validations/custom-validations';
import { AuthStateService } from '../state/auth-state.service';
import { isAuthError } from 'src/app/reusable/Models/isAuthError';

@Injectable({
  providedIn: 'root',
})
export class AuthEmailService {
  #authState = inject(AuthStateService);

  private sendEmailVerification = sendEmailVerification;
  private sendPasswordResetEmail = sendPasswordResetEmail;

  async sendVerificationEmail() {
    if (!this.#authState.session()) return null;

    try {
      return await this.sendEmailVerification(
        (this.#authState.session() as UserCredential).user
      );
    } catch (err) {
      if (isAuthError(err)) {
        console.error(`Error when sending email message: ${err.message}`);
      } else {
        console.error(err);
      }
    }
  }

  async sendResetEmail(email: string) {
    if (checkEmail(email) === null) {
      try {
        await this.sendPasswordResetEmail(this.#authState.auth, email, {
          url: 'http://127.0.0.1:4200/online/force=login',
        });
        return true;
      } catch (err) {
        if (isAuthError(err)) {
          console.error(err.message);
        } else {
          console.error(err);
        }
        return false;
      }
    }
    return false;
  }
}
