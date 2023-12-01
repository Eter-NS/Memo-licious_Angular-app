import { Injectable, inject } from '@angular/core';
import { Database, get, ref, set } from '@angular/fire/database';
import { AuthStateService } from '../state/auth-state.service';
import { UserCredential } from '@angular/fire/auth';
import { AuthReturnCredits, DbInitialPayload } from '../Models/authModels';

@Injectable({
  providedIn: 'root',
})
export class AuthDatabaseService {
  #authState = inject(AuthStateService);
  #db = inject(Database);

  async databaseRegisterHandler(
    result: UserCredential
  ): Promise<AuthReturnCredits> {
    if (!result.user.email) return { errors: { noEmailProvided: true } };

    if (await this.isUserInDatabase()) {
      return {
        passed: true,
        registered: false,
      };
    } else {
      const dbResult = await this.registerInDatabase(result);
      const returnPayload: AuthReturnCredits = {
        passed: true,
        registered: dbResult,
      };
      if (!dbResult)
        returnPayload.errors = {
          sendingPostToDB: true,
        };
      return returnPayload;
    }
  }

  async isUserInDatabase(): Promise<boolean | undefined> {
    /* Takes the user collection and searches if there's already an account with this email */
    try {
      const userRef = ref(
        this.#db,
        `users/${this.#authState.auth.currentUser?.uid}`
      );
      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        const user = userSnapshot.val();
        return user.email === this.#authState.auth.currentUser?.email;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Error when checking if user exists: ', err);
      return undefined;
    }
  }

  async registerInDatabase({
    providerId,
    user: { email, photoURL },
  }: UserCredential): Promise<boolean> {
    if (!email) {
      console.error('No email provided');
      return false;
    }
    const payload: DbInitialPayload = {
      email,
      photoURL,
      providerId: providerId ?? 'login',
    };
    const userRef = ref(
      this.#db,
      `users/${this.#authState.auth.currentUser?.uid}`
    );
    try {
      await set(userRef, payload);
      return true;
    } catch (error) {
      console.error('Error when saving user data: ', error);
      return false;
    }
  }
}
