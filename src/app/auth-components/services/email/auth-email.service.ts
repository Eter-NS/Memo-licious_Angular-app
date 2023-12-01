import { Injectable, inject } from '@angular/core';
import {
  UserCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { checkEmail } from 'src/app/custom-validations/custom-validations';
import { AuthStateService } from '../state/auth-state.service';

@Injectable({
  providedIn: 'root',
})
export class AuthEmailService {
  #authState = inject(AuthStateService);

  sendVerificationEmail() {
    if (!this.#authState.session()) return null;
    return sendEmailVerification(
      (this.#authState.session() as UserCredential).user
    );
  }

  async sendResetEmail(email: string) {
    if (checkEmail(email) === null) {
      try {
        await sendPasswordResetEmail(this.#authState.auth, email, {
          url: 'http://127.0.0.1:4200/online/force=login',
        });
        return true;
      } catch (err) {
        return false;
      }
    }
    return false;
  }
}
