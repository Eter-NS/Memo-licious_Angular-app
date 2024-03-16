import { Injectable, inject, signal } from '@angular/core';
import {
  EMPTY,
  Observable,
  catchError,
  combineLatest,
  map,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { LocalUserAccount } from 'src/app/auth/services/Models/LocalAuthModels.interface';
import { AuthAccountService } from 'src/app/auth/services/account/auth-account.service';
import { AuthLocalUserService } from 'src/app/auth/services/local-user/auth-local-user.service';
import { AuthStateService } from 'src/app/auth/services/state/auth-state.service';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { User } from '@angular/fire/auth';
import { UserProfile } from '../../utils/models/user-profile.interface';
import { UpdateUserInterface } from '../../utils/models/update-user.interface';

export type UserType = 'online' | 'local' | null;

@Injectable({
  providedIn: 'root',
})
export class AuthUserConnectorService {
  #authLocalUserService = inject(AuthLocalUserService);
  #authAccountService = inject(AuthAccountService);
  #authStateService = inject(AuthStateService);
  #errorHandlerService = inject(ErrorHandlerService);

  #previousUserType = signal<UserType>(null);
  #activeUserType = signal<UserType>(null);

  get activeUserTypeSig() {
    return this.#activeUserType.asReadonly();
  }

  get activeUser$() {
    return combineLatest([
      this.#authLocalUserService.localUser$,
      this.#authStateService.user$,
    ]).pipe(
      switchMap(([localUser, onlineUser]) => {
        if (localUser) {
          this._updateUserType('local');
          return of(localUser);
        }

        if (onlineUser) {
          this._updateUserType('online');
          return of(onlineUser);
        }

        this._updateUserType(null);
        if (this.#previousUserType()) {
          // Ends the stream when user logs out
          return EMPTY;
        }

        // Throws the error when no user was logged in ever before
        throw new Error('No user logged in');
      }),
      catchError((err: Error) => {
        console.error(err);
        this.#errorHandlerService.onError(err.message);
        return throwError(() => err);
      })
    );
  }

  get userProfile$(): Observable<UserProfile> {
    return this.activeUser$.pipe(
      map((user) => {
        if (this.activeUserTypeSig() === 'local') {
          const {
            auth,
            profileColor,
            profilePictureUrl: photoUrl,
          } = user as LocalUserAccount;

          return {
            name: auth.name,
            authOption: auth.authOption,
            profileColor,
            photoUrl,
          } satisfies UserProfile;
        }

        const { photoURL: photoUrl, displayName, email } = user as User;

        return {
          name: displayName as string,
          photoUrl,
          authOption: 'password',
          email: email as string,
        } satisfies UserProfile;
      })
    );
  }

  private _updateUserType(value: UserType, period?: 'last' | 'current') {
    switch (period) {
      case 'current':
        this.#activeUserType.set(value);
        break;

      case 'last':
        this.#previousUserType.set(value);
        break;

      default:
        this.#previousUserType.set(this.#activeUserType());
        this.#activeUserType.set(value);
        break;
    }
  }

  updateUser(changes: UpdateUserInterface) {
    switch (this.activeUserTypeSig()) {
      case 'local':
        this.#authLocalUserService.modifyCurrentUser({ auth: changes.local });
        break;

      case 'online':
        this.#authAccountService.changeUserProfileData(changes.online);
        break;
    }
  }

  logOutUser() {
    if (!this.activeUserTypeSig()) {
      return;
    }

    switch (this.activeUserTypeSig()) {
      case 'local':
        this.#authLocalUserService.logOut();
        break;
      case 'online':
        this.#authAccountService.signOutUser();
        break;
      default:
        throw new Error('Unknown value of activeUserTypeSig');
    }

    this._updateUserType(null);
  }
}
