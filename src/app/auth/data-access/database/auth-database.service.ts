import { Injectable, inject } from '@angular/core';
import { AuthStateService } from '../state/auth-state.service';
import { UserCredential } from '@angular/fire/auth';
import {
  AuthReturnCredits,
  DbInitialPayload,
} from '../../utils/Models/OnlineAuthModels.interface';
import { isAuthError } from 'src/app/reusable/utils/Models/isAuthError';
import { NoteGroupModel } from '../../utils/Models/UserDataModels.interface';
import { Observable } from 'rxjs';
import { FirebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service';
import { environment } from 'src/environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class AuthDatabaseService {
  #authState = inject(AuthStateService);
  #fireDBController = inject(FirebaseDatabaseControllerService);

  async databaseRegisterHandler({
    user: { email, uid, photoURL },
  }: UserCredential): Promise<AuthReturnCredits> {
    if (!email) {
      return { errors: { noEmailProvided: true } };
    }

    if (await this.isUserInDatabase(uid)) {
      return {
        passed: true,
        registered: false,
      };
    } else {
      let returnPayload: AuthReturnCredits;

      if (await this.registerInDatabase(email, photoURL)) {
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
      const userRef = this.#fireDBController.ref(
        this.#fireDBController.db,
        `users/${uid}`
      );
      const userSnapshot = await this.#fireDBController.get(userRef);

      return userSnapshot.exists();
    } catch (err) {
      if (isAuthError(err)) {
        if (!environment.production) {
          console.error(`Error when checking if user exists: ${err.message}`);
        }
      }
      return undefined;
    }
  }

  async registerInDatabase(
    email: string,
    photoURL: string | null
  ): Promise<boolean> {
    const payload: DbInitialPayload = {
      email,
      photoURL,
      groups: [],
    };

    const userRef = this.#fireDBController.ref(
      this.#fireDBController.db,
      `users/${this.#authState.auth.currentUser?.uid}`
    );

    try {
      await this.#fireDBController.set(userRef, payload);
      return true;
    } catch (error: unknown) {
      if (!environment.production) {
        console.error(
          'Error when saving user data: ',
          (error as { message: string }).message
        );
      }
      return false;
    }
  }

  getGroups(uid: string): Observable<NoteGroupModel[]> {
    const notesRef = this.#fireDBController.ref(
      this.#fireDBController.db,
      `users/${uid}/groups`
    );

    return this.#fireDBController.listVal<NoteGroupModel>(notesRef);
  }

  async updateGroups(payload: NoteGroupModel[]) {
    const uid = this.#authState.sessionSig()?.uid;

    if (!uid) {
      if (!environment.production) {
        console.error('User not logged in');
      }

      return false;
    }

    const path = `users/${uid}`;

    try {
      const ref = this.#fireDBController.ref(this.#fireDBController.db, path);

      await this.#fireDBController.update(ref, { groups: payload });

      return true;
    } catch (err) {
      if (!environment.production) {
        console.error(isAuthError(err) ? err.message : err);
      }
      return false;
    }
  }

  async deleteGroup(payload: NoteGroupModel[]) {
    try {
      return await this.updateGroups(payload);
    } catch (err) {
      if (!environment.production) {
        console.error(isAuthError(err) ? err.message : err);
      }
      return false;
    }
  }
}
