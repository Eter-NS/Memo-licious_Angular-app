import { Injectable, inject } from '@angular/core';
import { Database } from '@angular/fire/database';
import { AuthStateService } from '../state/auth-state.service';
import { UserCredential } from '@angular/fire/auth';
import {
  AuthReturnCredits,
  DbInitialPayload,
} from '../Models/OnlineAuthModels.interface';
import { isAuthError } from 'src/app/reusable/Models/isAuthError';
import { NoteGroupModel } from '../Models/UserDataModels.interface';
import { Observable } from 'rxjs';
import { FirebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service';
import { environment } from 'src/environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class AuthDatabaseService {
  #authState = inject(AuthStateService);
  #db = inject(Database);
  #fireDBController = inject(FirebaseDatabaseControllerService);

  async databaseRegisterHandler({
    user: { email, uid, photoURL },
  }: UserCredential): Promise<AuthReturnCredits> {
    if (!email) return { errors: { noEmailProvided: true } };

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
      const userRef = this.#fireDBController.ref(this.#db, `users/${uid}`);
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
      this.#db,
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
      this.#db,
      `users/${uid}/groups`
    );

    return this.#fireDBController.listVal<NoteGroupModel>(notesRef);
  }

  async updateGroups(payload: NoteGroupModel[]) {
    const uid = this.#authState.sessionSig()?.uid;
    const path = `users/${uid}`;

    try {
      await this.#fireDBController.update(
        this.#fireDBController.ref(this.#db, path),
        { groups: payload }
      );
      return true;
    } catch (err) {
      if (!environment.production) {
        console.error(err);
      }
      return false;
    }
  }

  async deleteGroup(payload: NoteGroupModel[]) {
    try {
      return await this.updateGroups(payload);
    } catch (err) {
      if (!environment.production) {
        console.error(err);
      }
      return false;
    }
  }
}
