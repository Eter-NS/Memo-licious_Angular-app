import { Injectable, inject } from '@angular/core';
import { Database, get, ref, set } from '@angular/fire/database';
import { AuthStateService } from '../state/auth-state.service';
import { UserCredential } from '@angular/fire/auth';
import { AuthReturnCredits, DbInitialPayload } from '../Models/authModels';
import { isAuthError } from 'src/app/reusable/Models/isAuthError';

@Injectable({
  providedIn: 'root',
})
export class AuthDatabaseService {
  #authState = inject(AuthStateService);
  #db = inject(Database);

  private ref = ref;
  private set = set;
  private get = get;

  async databaseRegisterHandler({
    user: { email, uid, providerId, photoURL },
  }: UserCredential): Promise<AuthReturnCredits> {
    if (!email) return { errors: { noEmailProvided: true } };

    if (await this.isUserInDatabase(uid)) {
      return {
        passed: true,
        registered: false,
      };
    } else {
      let returnPayload: AuthReturnCredits;

      if (await this.registerInDatabase(providerId, email, photoURL)) {
        returnPayload = {
          passed: true,
          registered: true,
        };
      } else {
        returnPayload = {
          errors: {
            sendingPostToDB: true,
          },
        };
      }

      return returnPayload;
    }
  }

  async isUserInDatabase(uid: string): Promise<boolean | undefined> {
    try {
      const userRef = this.ref(this.#db, `users/${uid}`);
      const userSnapshot = await this.get(userRef);

      return userSnapshot.exists();
    } catch (err) {
      if (isAuthError(err)) {
        console.error(`Error when checking if user exists: ${err.message}`);
      }
      return undefined;
    }
  }

  async registerInDatabase(
    providerId: string | null,
    email: string,
    photoURL: string | null
  ): Promise<boolean> {
    const payload: DbInitialPayload = {
      email,
      photoURL,
      providerId: providerId ?? 'login',
    };

    const userRef = this.ref(
      this.#db,
      `users/${this.#authState.auth.currentUser?.uid}`
    );

    try {
      await this.set(userRef, payload);
      return true;
    } catch (error: unknown) {
      console.error(
        'Error when saving user data: ',
        (error as { message: string }).message
      );
      return false;
    }
  }
}
