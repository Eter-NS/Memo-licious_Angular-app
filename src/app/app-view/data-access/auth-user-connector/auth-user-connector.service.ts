import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, combineLatest, map, throwError } from 'rxjs';
import { LocalUserAccount } from 'src/app/auth/services/Models/LocalAuthModels.interface';
import { AuthAccountService } from 'src/app/auth/services/account/auth-account.service';
import { AuthLocalUserService } from 'src/app/auth/services/local-user/auth-local-user.service';
import { AuthStateService } from 'src/app/auth/services/state/auth-state.service';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { User } from '@angular/fire/auth';
import { UserProfile } from '../../utils/models/user-profile.interface';
import { UpdateUserInterface } from '../../utils/models/update-user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthUserConnectorService {
  #authLocalUserService = inject(AuthLocalUserService);
  #authAccountService = inject(AuthAccountService);
  #authStateService = inject(AuthStateService);
  #errorHandlerService = inject(ErrorHandlerService);

  #activeUserType = signal<'online' | 'local' | null>(null);

  get activeUserTypeSig() {
    return this.#activeUserType.asReadonly();
  }

  get activeUser$() {
    return combineLatest([
      this.#authLocalUserService.localUser$,
      this.#authStateService.user$,
    ]).pipe(
      map(([localUser, onlineUser]) => {
        if (localUser) {
          this._updateUserType('local');
          return localUser;
        }

        if (onlineUser) {
          this._updateUserType('online');
          return onlineUser;
        }

        this._updateUserType(null);
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

  private _updateUserType(value: 'online' | 'local' | null) {
    this.#activeUserType.set(value);
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

    this._updateUserType(null);

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
  }
}
