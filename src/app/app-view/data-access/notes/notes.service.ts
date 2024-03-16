import { Injectable, OnDestroy, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  of,
  retry,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/services/Models/UserDataModels.interface';
import { AuthLocalUserService } from 'src/app/auth/services/local-user/auth-local-user.service';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import {
  getUTCTimestamp,
  randomId,
} from 'src/app/reusable/data-tools/objectTools';
import { AuthUserConnectorService } from '../auth-user-connector/auth-user-connector.service';
import { AuthDatabaseService } from 'src/app/auth/services/database/auth-database.service';
import { GroupRemovingStrategy } from '../../utils/models/app-settings.interface';
import { AppConfigService } from '../app-config/app-config.service';
import { LocalUserAccount } from 'src/app/auth/services/Models/LocalAuthModels.interface';
import { User } from '@angular/fire/auth';

@Injectable()
export class NotesService implements OnDestroy {
  #authLocalUserService = inject(AuthLocalUserService);
  #authDatabaseService = inject(AuthDatabaseService);
  #authUserConnectorService = inject(AuthUserConnectorService);
  #appConfigService = inject(AppConfigService);
  #errorHandlerService = inject(ErrorHandlerService);

  private _randomId = randomId;

  errorCounter = 0;
  MAX_ERROR_COUNT = 3;

  #removingSpeed = new BehaviorSubject<GroupRemovingStrategy>(
    this.#appConfigService.appConfigState.deletingMode
  );

  #notesBufferSubject = new BehaviorSubject<NoteModel[]>([]);

  get notesBuffer$() {
    return this.#notesBufferSubject.asObservable();
  }
  get userType() {
    return this.#authUserConnectorService.activeUserTypeSig();
  }

  get notes$(): Observable<NoteGroupModel[]> {
    return this.#authUserConnectorService.activeUser$.pipe(
      switchMap((user) => {
        if (this.userType === 'local') {
          return of((user as LocalUserAccount).groups);
        }

        return this.#authDatabaseService.getGroups((user as User).uid);
      }),
      catchError((err) => {
        // Online user error handling
        console.error(err);
        this.errorCounter++;
        // return EMPTY;
        return throwError(() => err);
      }),
      retry({
        count: this.MAX_ERROR_COUNT,
        delay: 2500,
        resetOnSuccess: true,
      })
    );

    // return this.#authLocalUserService.localUser$.pipe(
    //   switchMap((localUser) => {
    //     if (localUser) {
    //       this.#authUserConnectorService.updateUserType('local');
    //       return of(localUser.groups);
    //     }

    //     return this.#authStateService.user$.pipe(
    //       switchMap((onlineUser) => {
    //         if (onlineUser) {
    //           this.#authUserConnectorService.updateUserType('online');
    //           return this.#authDatabaseService.getGroups(onlineUser.uid);
    //         }

    //         throw new Error('No user logged in');
    //       }),
    //       catchError((err) => {
    //         console.error(err);
    //         this.errorCounter++;
    //         // throw err;
    //         return EMPTY;
    //       }),
    //       retry({
    //         count: this.MAX_ERROR_COUNT,
    //         delay: 2500,
    //         resetOnSuccess: true,
    //       })
    //     );
    //   })
    // );
  }

  constructor() {
    this.clearNoteGroups();
  }

  ngOnDestroy(): void {
    this.fillNotesBuffer([]);
    this.#notesBufferSubject.complete();
  }

  fillNotesBuffer(notes: NoteModel[]) {
    this.#notesBufferSubject.next(notes);
  }

  changeRemovingStrategy(value: GroupRemovingStrategy) {
    this.#removingSpeed.next(value);

    this.#appConfigService.updateConfig({ deletingMode: value });
  }

  clearNoteGroups() {
    this.notes$.pipe(take(1)).subscribe(async (groups) => {
      if (!groups) return;

      const now = await this._createTimestamp();
      const existingGroups = groups.filter(
        (group) =>
          typeof group.deleteAt === 'undefined' || group.deleteAt >= now
      );

      this.modifyGroups(existingGroups);
    });
  }

  /* NoteGroupModel methods */

  createGroup(title: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.notes$.pipe(take(1)).subscribe(async (groups) => {
        try {
          const createdAt = await this._createTimestamp();
          const payload: NoteGroupModel = {
            id: this._randomId(27),
            title,
            notes: this.#notesBufferSubject.value,
            createdAt,
          };

          const result = await this.modifyGroups(
            groups ? [...groups, payload] : [payload]
          );

          if (result) {
            this.#notesBufferSubject.next([]);
          }

          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  async modifyGroups(payload: NoteGroupModel[]): Promise<boolean> {
    if (!this.userType) return false;

    switch (this.userType) {
      case 'local':
        return this.#authLocalUserService.modifyCurrentUser({
          groups: payload,
        });
      case 'online':
        return this.#authDatabaseService.updateGroups(payload);
      default:
        throw new Error('Unknown user state 😥');
    }
  }

  deleteGroup(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.userType) {
        reject(new Error('No user logged in'));
        return;
      }

      this.notes$.pipe(take(1)).subscribe(async (groups) => {
        if (!groups) {
          reject(new Error('There are no groups to remove'));
          return;
        }

        switch (this.userType) {
          case 'local': {
            resolve(this.#authLocalUserService.deleteGroup(id));
            return;
          }
          case 'online': {
            const payload: NoteGroupModel[] = groups.filter(
              (group) => group.id !== id
            );
            try {
              resolve(await this.#authDatabaseService.deleteGroup(payload));
            } catch (err) {
              reject(err);
            }
            return;
          }
          default:
            reject(new Error('Unknown user state 😥'));
            return;
        }
      });
    });
  }

  markGroupToDelete(id: string, toDelete: boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.notes$.pipe(take(1)).subscribe(async (groups) => {
        if (!groups) {
          reject(
            new Error(
              'Tried to remove a noteGroup when there are no noteGroups'
            )
          );
          return;
        }

        const updatedGroupIndex = groups.findIndex((group) => group.id === id);
        if (updatedGroupIndex == -1) {
          reject(new Error(`No noteGroup with ID ${id} has been found`));
          return;
        }

        let updatedGroups: NoteGroupModel[];

        if (toDelete) {
          const threeDays = 3 * 24 * 60 * 60 * 1000;
          const threeMinutes = 3 * 60 * 1000;
          const deleteAt =
            (await this._createTimestamp()) +
            (this.#removingSpeed.value === 'slow' ? threeDays : threeMinutes);

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

  /* NoteModel methods */

  async createNote(value: string) {
    if (!value) {
      console.warn('No value in noteService.createNote');
      return;
    }

    const createdAt = await this._createTimestamp();
    const note: NoteModel = {
      createdAt,
      id: this._randomId(27),
      value,
    };

    this.#notesBufferSubject.next([...this.#notesBufferSubject.value, note]);
  }

  editNote(noteId: string, changes: Partial<NoteModel>): boolean {
    let isEdited = false;

    const updatedNotes = this.#notesBufferSubject.value.map((note) => {
      if (note.id === noteId) {
        isEdited = true;
        return { ...note, ...changes };
      }

      return note;
    });

    this.#notesBufferSubject.next(updatedNotes);

    return isEdited;
  }

  deleteNote(id: string): boolean {
    const initialLength = this.#notesBufferSubject.value.length;

    const leftNotes = this.#notesBufferSubject.value.filter(
      (note) => note.id !== id
    );
    if (leftNotes.length !== initialLength) {
      this.#notesBufferSubject.next(leftNotes);
    }

    return leftNotes.length !== initialLength;
  }

  isNewGroupValid(name: string) {
    if (!name) {
      this.#errorHandlerService.onError('The group title is required!');
      return false;
    }

    if (!this.#notesBufferSubject.value.length) {
      this.#errorHandlerService.onError('There are no notes to save 😥');
      return false;
    }

    return true;
  }

  private async _createTimestamp(): Promise<number> {
    let timestamp: number;

    try {
      timestamp = (await getUTCTimestamp()).unixtime * 1000;
    } catch (err) {
      timestamp = Date.now();
    }

    return timestamp;
  }
}
