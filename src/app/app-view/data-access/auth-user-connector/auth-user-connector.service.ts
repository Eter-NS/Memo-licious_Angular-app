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
import { ErrorHandlerService } from '../../../reusable/data-access/error-handler/error-handler.service';
import { User } from '@angular/fire/auth';
import { UserProfileChangesWithImageI } from '../../utils/models/user-profile.interface';
import { environment } from 'src/environments/environment.dev';
import { RegisterCustomOptions } from 'src/app/auth/utils/Models/OnlineAuthModels.interface';
import { StorageService } from 'src/app/reusable/data-access/firebase-storage/storage.service';
import { FILE_TO_BASE64_TOKEN } from 'src/app/reusable/utils/file-to-base64/file-to-base64.pipe.injector';
import { readMessageProperty } from 'src/app/reusable/utils/data-tools/readMessageProperty';

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
      const message = readMessageProperty(err);

      if (message) {
        this.#errorHandlerService.onError(message);
      }

      return throwError(() => err);
    })
  );

  updateUser(changes: UserProfileChangesWithImageI): Promise<boolean> {
    const userType = this.activeUserTypeSig();

    if (!userType) {
      return Promise.resolve(false);
    }

    const handleMethods = {
      online: (change: UserProfileChangesWithImageI) =>
        this._handleOnlineUserUpdate(change),
      local: (change: UserProfileChangesWithImageI) =>
        this._handleLocalUserUpdate(change),
    };

    return handleMethods[userType](changes);
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
    changes: UserProfileChangesWithImageI
  ): Promise<boolean> {
    const { name, authOption, passphrase, photoBlob, profileColor } = changes;
    let didUpdateProfilePicture = false;

    if (photoBlob) {
      const profilePictureUrl = await this.#fileToBase64Pipe.transform(
        photoBlob.blob
      );

      didUpdateProfilePicture = this.#authLocalUserService.modifyCurrentUser({
        profilePictureUrl,
      });
    }

    if (!passphrase) {
      // Returns false if nothing was updated or true if at least profile picture was updated.
      return didUpdateProfilePicture;
    }

    return this.#authLocalUserService.modifyCurrentUser({
      auth: { name, authOption, value: passphrase },
      profileColor,
    });
  }

  private async _handleOnlineUserUpdate(
    changes: UserProfileChangesWithImageI
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

      const profileDataResult =
        await this.#authAccountService.changeUserProfileData(mainPayload);

      if (!oldPassphrase) {
        return profileDataResult;
      }

      let result = await this._handleOptionalPasswordUpdate(
        oldPassphrase,
        passphrase
      );

      if (result?.errors) {
        return false;
      }
      result = await this._handleOptionalEmailUpdate({
        oldEmail,
        email,
        existingPassphrase: oldPassphrase,
        newPassphrase: passphrase,
      });

      if (result?.errors) {
        return false;
      }
      return true;
    } catch (err) {
      console.error(
        'Error while updating online user: ',
        readMessageProperty(err) || err
      );
      return false;
    }
  }

  private async _handleOptionalPasswordUpdate(
    oldPassphrase?: string,
    passphrase?: string
  ) {
    if (!oldPassphrase || !passphrase) {
      return null;
    }
    const result = await this.#authAccountService.updatePassword(
      oldPassphrase,
      passphrase
    );

    if (!result.errors) {
      return result;
    }
    if (!environment.production) {
      console.error(
        'Error while attending to change password: ',
        result.errors
      );
    }
    throw new Error(result.errors.unknownError?.message);
  }

  private async _handleOptionalEmailUpdate(args: {
    existingPassphrase?: string;
    newPassphrase?: string;
    oldEmail?: string;
    email?: string;
  }) {
    const { existingPassphrase, newPassphrase, oldEmail, email } = args;

    if (!existingPassphrase) {
      return null;
    }
    if (!oldEmail || !email) {
      return null;
    }
    const wasPasswordUpdated =
      !!newPassphrase && newPassphrase !== existingPassphrase;

    const result = await this.#authAccountService.updateEmail(
      wasPasswordUpdated ? newPassphrase : existingPassphrase,
      oldEmail,
      email
    );

    if (!result.errors) {
      return result;
    }
    if (!environment.production) {
      console.error('Error while attending to change email: ', result.errors);
    }
    if (result.errors.alreadyInUseError) {
      throw new Error('Email already in use.');
    }
    throw new Error(result.errors.unknownError?.message);
  }
}
