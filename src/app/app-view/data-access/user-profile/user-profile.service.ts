import { Injectable, inject } from '@angular/core';
import { AuthUserConnectorService } from '../auth-user-connector/auth-user-connector.service';
import {
  UserProfile,
  UserProfileChangesI,
} from '../../utils/models/user-profile.interface';
import {
  Observable,
  Subject,
  catchError,
  filter,
  from,
  map,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import { User } from '@angular/fire/auth';
import { LocalUserAccount } from 'src/app/auth/utils/Models/LocalAuthModels.interface';

export interface UserProfileUpdateResultI {
  state: 'pending' | 'success' | 'failure' | 'idle';
  cause?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  #authUserConnectorService = inject(AuthUserConnectorService);

  get userProfile$(): Observable<UserProfile> {
    return this.#authUserConnectorService.activeUser$.pipe(
      filter((user): user is LocalUserAccount | User => !!user),
      map((user): UserProfile => this._createUserProfile(user))
    );
  }

  #userProfileUpdateSubject = new Subject<UserProfileChangesI>();
  get userProfileUpdateAction$() {
    return this.#userProfileUpdateSubject.asObservable().pipe(
      switchMap((value) =>
        from(this.#authUserConnectorService.updateUser(value))
      ),
      shareReplay({ refCount: false, bufferSize: 1, windowTime: 1000 })
    );
  }

  get userProfileUpdateResult$(): Observable<UserProfileUpdateResultI> {
    return this.userProfileUpdateAction$.pipe(
      map(
        (result): UserProfileUpdateResultI => ({
          state: result ? 'success' : 'failure',
        })
      ),
      catchError((err) => {
        return of<UserProfileUpdateResultI>({
          state: 'failure',
          cause: 'message' in err ? err.message : err,
        });
      })
    );
  }

  uploadProfileChanges(changes: UserProfileChangesI) {
    this.#userProfileUpdateSubject.next(changes);
  }

  private _createUserProfile(user: LocalUserAccount | User): UserProfile {
    if (this.#authUserConnectorService.activeUserTypeSig() === 'local') {
      const {
        auth: { name, authOption },
        profilePictureUrl: photoUrl,
        profileColor,
      } = user as LocalUserAccount;

      return {
        name,
        photoUrl,
        authOption,
        profileColor,
      };
    }

    const { photoURL: photoUrl, displayName } = user as User;

    return {
      name: displayName as string,
      photoUrl,
      authOption: 'password',
    };
  }
}
