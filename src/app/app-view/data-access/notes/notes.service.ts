import { Injectable, inject } from '@angular/core';
import {
  EMPTY,
  Observable,
  catchError,
  combineLatestWith,
  of,
  retry,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { NoteGroupModel } from 'src/app/auth/utils/Models/UserDataModels.interface';
import { AuthLocalUserService } from 'src/app/auth/data-access/local-user/auth-local-user.service';
import { randomId } from 'src/app/reusable/utils/data-tools/objectTools';
import { AuthUserConnectorService } from '../auth-user-connector/auth-user-connector.service';
import { AuthDatabaseService } from 'src/app/auth/data-access/database/auth-database.service';
import { GroupRemovingStrategy } from '../../utils/models/app-settings.interface';
import { AppConfigService } from '../app-config/app-config.service';
import { LocalUserAccount } from 'src/app/auth/utils/Models/LocalAuthModels.interface';
import { User } from '@angular/fire/auth';
import { environment } from 'src/environments/environment.dev';
import { NoteRestService } from '../note-REST/note-rest.service';
import { ErrorHandlerService } from 'src/app/reusable/data-access/error-handler/error-handler.service';
import { TIMESTAMP_TOKEN } from 'src/app/reusable/data-access/timestamp/timestamp.token';

@Injectable()
export class NotesService {
  #authLocalUserService = inject(AuthLocalUserService);
  #authDatabaseService = inject(AuthDatabaseService);
  #authUserConnectorService = inject(AuthUserConnectorService);
  #noteRestService = inject(NoteRestService);
  #appConfigService = inject(AppConfigService);
  #errorHandlerService = inject(ErrorHandlerService);
  #timestamp = inject(TIMESTAMP_TOKEN);

  readonly MAX_ERROR_COUNT = 3;
  readonly RECONNECT_DELAY = 2500;

  private get _removingSpeed(): GroupRemovingStrategy {
    return this.#appConfigService.appConfigState.deletingMode;
  }

  private _userType = this.#authUserConnectorService.activeUserTypeSig;

  notes$: Observable<NoteGroupModel[]> =
    this.#authUserConnectorService.activeUser$.pipe(
      switchMap((user) => {
        if (this._userType() === 'local') {
          return of((user as LocalUserAccount).groups);
        } else if (this._userType() === 'online') {
          return this.#authDatabaseService.getGroups((user as User).uid).pipe(
            catchError((err) => {
              if (!environment.production) {
                console.error(err);
              }
              return throwError(() => err);
            }),
            retry({
              count: this.MAX_ERROR_COUNT,
              delay: this.RECONNECT_DELAY,
              resetOnSuccess: true,
            })
          );
        } else {
          return EMPTY;
        }
      })
    );

  changeRemovingStrategy(value: GroupRemovingStrategy) {
    this.#appConfigService.updateConfig({ deletingMode: value });
  }

  clearNoteGroups(): Promise<void> {
    return new Promise((resolve) => {
      this.notes$.pipe(take(1)).subscribe(async (groups) => {
        if (!groups.length) {
          return;
        }

        const now = await this.#timestamp();
        const existingGroups = groups.filter(
          (group) =>
            typeof group.deleteAt === 'undefined' || group.deleteAt >= now
        );

        await this.modifyGroups(existingGroups);
        resolve();
      });
    });
  }

  /* NoteGroupModel methods */

  createGroup(title: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.notes$
        .pipe(combineLatestWith(this.#noteRestService.notesBuffer$), take(1))
        .subscribe(async ([groups, buffer]) => {
          try {
            const createdAt = await this.#timestamp();
            const payload: NoteGroupModel = {
              id: randomId(this.#noteRestService.ID_LENGTH),
              title,
              notes: buffer,
              createdAt,
            };

            const result = await this.modifyGroups(
              groups.length ? [...groups, payload] : [payload]
            );

            if (result) {
              this.#noteRestService.fillNotesBuffer([]);
            }

            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
    });
  }

  async modifyGroups(payload: NoteGroupModel[]): Promise<boolean> {
    if (!this._userType()) {
      return false;
    }

    switch (this._userType()) {
      case 'local':
        return this.#authLocalUserService.modifyCurrentUser({
          groups: payload,
        });
      case 'online':
        return this.#authDatabaseService.updateGroups(payload);
      default:
        throw new Error('Unknown user state');
    }
  }

  deleteGroup(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const userType = this._userType();

      if (!userType) {
        resolve(false);
      }

      this.notes$.pipe(take(1)).subscribe(async (groups) => {
        if (!groups.length) {
          reject(new Error('There are no groups to remove'));
        }

        switch (userType) {
          case 'local': {
            resolve(this.#authLocalUserService.deleteGroup(id));
            break;
          }
          case 'online': {
            const payload: NoteGroupModel[] = groups.filter(
              (group) => group.id !== id
            );

            resolve(await this.#authDatabaseService.deleteGroup(payload));
            break;
          }
        }
      });
    });
  }

  markGroupToDelete(id: string, toDelete: boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.notes$.pipe(take(1)).subscribe(async (groups) => {
        if (!groups.length) {
          reject(new Error('User has no groups!'));
        }

        const updatedGroupIndex = groups.findIndex((group) => group.id === id);

        if (updatedGroupIndex === -1) {
          reject(new Error(`No noteGroup with ID '${id}' has been found`));
        }

        let updatedGroups: NoteGroupModel[];

        if (toDelete) {
          const threeDays = 3 * 24 * 60 * 60 * 1000;
          const threeMinutes = 3 * 60 * 1000;
          const deleteAt =
            (await this.#timestamp()) +
            (this._removingSpeed === 'slow' ? threeDays : threeMinutes);

          updatedGroups = [
            ...groups.slice(0, updatedGroupIndex),
            { ...groups[updatedGroupIndex], deleteAt },
            ...groups.slice(updatedGroupIndex + 1),
          ];
        } else {
          updatedGroups = [...groups];
          delete updatedGroups[updatedGroupIndex].deleteAt;
        }

        try {
          resolve(await this.modifyGroups(updatedGroups));
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  isNewGroupValid(name: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.#noteRestService.notesBuffer$.pipe(take(1)).subscribe((groups) => {
        if (!name) {
          this.#errorHandlerService.onError('The group title is required');
          resolve(false);
        }

        if (!groups.length) {
          this.#errorHandlerService.onError('There are no notes to save');
          resolve(false);
        }

        resolve(true);
      });
    });
  }
}
