import { Injectable, inject, signal } from '@angular/core';
import {
  Observable,
  catchError,
  combineLatest,
  map,
  tap,
  throwError,
} from 'rxjs';
import { LocalUserAccount } from 'src/app/auth/utils/Models/LocalAuthModels.interface';
import { AuthAccountService } from 'src/app/auth/data-access/account/auth-account.service';
import { AuthLocalUserService } from 'src/app/auth/data-access/local-user/auth-local-user.service';
import { AuthStateService } from 'src/app/auth/data-access/state/auth-state.service';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { User } from '@angular/fire/auth';
import { UserProfileChangesI } from '../../utils/models/user-profile.interface';
import { environment } from 'src/environments/environment.dev';
import { RegisterCustomOptions } from 'src/app/auth/utils/Models/OnlineAuthModels.interface';
import { StorageService } from 'src/app/reusable/data-access/firebase-storage/storage.service';
import { FILE_TO_BASE64_TOKEN } from 'src/app/reusable/utils/file-to-base64/file-to-base64.pipe.injector';

export type UserType = 'online' | 'local' | null;

@Injectable({
  providedIn: 'root',
})
export class AuthUserConnectorService {
  #authLocalUserService = inject(AuthLocalUserService);
  #authAccountService = inject(AuthAccountService);
  #authStateService = inject(AuthStateService);
  #storageService = inject(StorageService);
  #errorHandlerService = inject(ErrorHandlerService);
  #fileToBase64Pipe = inject(FILE_TO_BASE64_TOKEN);

  private _previousUserType = signal<UserType>(null);
  private _activeUserType = signal<UserType>(null);

  get activeUserTypeSig() {
    return this._activeUserType.asReadonly();
  }

  activeUser$: Observable<LocalUserAccount | User | null> = combineLatest([
    this.#authLocalUserService.localUser$,
    this.#authStateService.user$,
  ]).pipe(
    map(([localUser, onlineUser]) => {
      if (localUser && onlineUser) {
        this.#authLocalUserService.logOut();
        this.#authAccountService.signOutUser();
        return null;
      }
      if (localUser) {
        return localUser;
      }
      if (onlineUser) {
        return onlineUser;
      }
      return null;
    }),
    tap((user) => {
      if (!user && this.activeUserTypeSig() !== null) {
        this._updateUserType(user);
        return;
      } else if (user) {
        const userType = 'groups' in user ? 'local' : 'online';

        if (this.activeUserTypeSig() !== userType) {
          this._updateUserType(userType);
        }
      }
    }),
    catchError((err) => {
      if (!environment.production) {
        console.error(err);
      }
      this.#errorHandlerService.onError('message' in err ? err.message : err);
      return throwError(() => err);
    })
  );

  updateUser(changes: UserProfileChangesI): Promise<boolean> {
    const userType = this.activeUserTypeSig();

    if (!userType) {
      return Promise.resolve(false);
    }

    const handleMethods = {
      online: () => this._handleOnlineUserUpdate(changes),
      local: () => this._handleLocalUserUpdate(changes),
    };

    return handleMethods[userType]();
  }

  logOutUser() {
    const activeUser = this.activeUserTypeSig();
    if (!activeUser) {
      return;
    }

    const logoutDictionary = {
      online: () => this.#authAccountService.signOutUser(),
      local: () => this.#authLocalUserService.logOut(),
    };

    logoutDictionary[activeUser]();

    this._updateUserType(null);
  }

  private _updateUserType(newState: UserType) {
    this._previousUserType.set(this.activeUserTypeSig());
    this._activeUserType.set(newState);
  }

  private async _handleLocalUserUpdate(
    changes: UserProfileChangesI
  ): Promise<boolean> {
    const { name, authOption, passphrase, photoBlob, profileColor } = changes;

    if (photoBlob) {
      const profilePictureUrl = await this.#fileToBase64Pipe.transform(
        photoBlob.blob
      );

      this.#authLocalUserService.modifyCurrentUser({ profilePictureUrl });
    }

    if (!passphrase) {
      return false;
    }

    return this.#authLocalUserService.modifyCurrentUser({
      auth: { name, authOption, value: passphrase },
      profileColor,
    });
  }

  private async _handleOnlineUserUpdate(
    changes: UserProfileChangesI
  ): Promise<boolean> {
    const {
      photoUrl,
      photoBlob,
      name,
      oldPassphrase,
      passphrase,
      oldEmail,
      email,
    } = changes;

    try {
      let photoURL = photoUrl;

      if (photoBlob) {
        const uid = this.#authStateService.sessionSig()?.uid;

        if (!uid) {
          return false;
        }

        const uploadResult = await this.#storageService.uploadFile(
          `/users/${uid}/profile_pic.${photoBlob.extension}`,
          photoBlob.blob
        );

        photoURL = await this.#storageService.getFileUrl(
          uploadResult.ref.fullPath
        );
      }

      const mainPayload: RegisterCustomOptions = {
        displayName: name,
        photoURL: photoURL || undefined,
      };

      await this.#authAccountService.changeUserProfileData(mainPayload);

      if (!oldPassphrase) {
        return true;
      }

      await this._handleOptionalPasswordUpdate(oldPassphrase, passphrase);
      await this._handleOptionalEmailUpdate(
        oldPassphrase,
        passphrase,
        oldEmail,
        email
      );

      return true;
    } catch (err) {
      console.error('Updating online user ', err);
      return false;
    }
  }

  private async _handleOptionalPasswordUpdate(
    oldPassphrase?: string,
    passphrase?: string
  ) {
    if (oldPassphrase && passphrase) {
      return await this.#authAccountService.updatePassword(
        oldPassphrase,
        passphrase
      );
    }

    throw new Error('No existing password nor new password has been provided.');
  }

  private async _handleOptionalEmailUpdate(
    existingPassphrase?: string,
    newPassphrase?: string,
    oldEmail?: string,
    email?: string
  ) {
    if (!existingPassphrase) {
      throw new Error('No existing password has been provided.');
    }

    const wasPasswordUpdated = !!existingPassphrase && !!newPassphrase;

    if (oldEmail && email) {
      const result = await this.#authAccountService.updateEmail(
        wasPasswordUpdated ? newPassphrase : existingPassphrase,
        oldEmail,
        email
      );

      if (result.errors) {
        if (result.errors.alreadyInUseError) {
          throw new Error('Email already in use.');
        }
      }

      return result;
    }

    throw new Error('No existing email nor new email has been provided.');
  }
}
