import { Injectable, inject } from '@angular/core';
import {
  Database,
  get,
  listVal,
  ref,
  set,
  update,
} from '@angular/fire/database';
import { AuthStateService } from '../state/auth-state.service';
import { UserCredential } from '@angular/fire/auth';
import {
  AuthReturnCredits,
  DbInitialPayload,
} from '../Models/OnlineAuthModels.interface';
import { isAuthError } from 'src/app/reusable/Models/isAuthError';
import { NoteGroupModel } from '../Models/UserDataModels.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthDatabaseService {
  #authState = inject(AuthStateService);
  #db = inject(Database);

  private _ref = ref;
  private _set = set;
  private _get = get;
  private _listVal = listVal;
  private _update = update;

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
      const userRef = this._ref(this.#db, `users/${uid}`);
      const userSnapshot = await this._get(userRef);

      return userSnapshot.exists();
    } catch (err) {
      if (isAuthError(err)) {
        console.error(`Error when checking if user exists: ${err.message}`);
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

    const userRef = this._ref(
      this.#db,
      `users/${this.#authState.auth.currentUser?.uid}`
    );

    try {
      await this._set(userRef, payload);
      return true;
    } catch (error: unknown) {
      console.error(
        'Error when saving user data: ',
        (error as { message: string }).message
      );
      return false;
    }
  }

  getGroups(uid: string): Observable<NoteGroupModel[]> {
    const notesRef = this._ref(this.#db, `users/${uid}/groups`);

    return this._listVal<NoteGroupModel>(notesRef);
  }

  async updateGroups(payload: NoteGroupModel[]) {
    const uid = this.#authState.session()?.uid;
    const path = `users/${uid}`;

    try {
      await this._update(this._ref(this.#db, path), { groups: payload });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async deleteGroup(payload: NoteGroupModel[]) {
    try {
      return await this.updateGroups(payload);
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
