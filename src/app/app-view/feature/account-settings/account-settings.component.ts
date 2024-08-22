import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthUserConnectorService } from '../../data-access/auth-user-connector/auth-user-connector.service';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { ProfilePictureComponent } from 'src/app/reusable/ui/profile-picture/profile-picture.component';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  from,
  map,
  merge,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { PreviousPageButtonComponent } from '../../../reusable/ui/previous-page-button/previous-page-button.component';
import { LocalUserAccount } from 'src/app/auth/utils/Models/LocalAuthModels.interface';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ErrorHandlerService } from '../../../reusable/data-access/error-handler/error-handler.service';
import { AccountSettingsLocalComponent } from '../../ui/account-settings-local/account-settings-local.component';
import { AccountSettingsOnlineComponent } from '../../ui/account-settings-online/account-settings-online.component';
import {
  PhotoBlob,
  UserProfileChangesI,
  UserProfileChangesWithImageI,
} from '../../utils/models/user-profile.interface';
import { AuthLocalUserService } from 'src/app/auth/data-access/local-user/auth-local-user.service';
import { User } from '@angular/fire/auth';
import {
  UserProfileUpdateResultI,
  UserProfileService,
} from '../../data-access/user-profile/user-profile.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FetchErrorComponent } from '../../../reusable/ui/fetch-error/fetch-error.component';
import { FileToUrlPipe } from '../../../reusable/utils/file-to-url/file-to-url.pipe';
import { environment } from 'src/environments/environment.dev';
import { OBJECT_TOOLS } from 'src/app/reusable/utils/data-tools/objectTools.token';

const errorDictionary = {
  passwordMismatch: `The current password doesn't match the existing one, please try again.`,
  pinMismatch: `The current pin doesn't match the existing one, please try again.`,
  unregistered: 'Something went wrong, please check your profile entries',
} as const;

@Component({
  selector: 'app-account-settings',
  standalone: true,
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    ProfilePictureComponent,
    PreviousPageButtonComponent,
    MatSnackBarModule,
    AccountSettingsLocalComponent,
    AccountSettingsOnlineComponent,
    MatProgressSpinnerModule,
    NgTemplateOutlet,
    FetchErrorComponent,
    FileToUrlPipe,
  ],
})
export class AccountSettingsComponent {
  viewTransitionService = inject(ViewTransitionService);
  #authUserConnectorService = inject(AuthUserConnectorService);
  #userProfileService = inject(UserProfileService);
  #authLocalUserService = inject(AuthLocalUserService);
  #snackbar = inject(MatSnackBar);
  #errorHandlerService = inject(ErrorHandlerService);
  #objectTools = inject(OBJECT_TOOLS);

  protected acceptedExtensions = [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'heif',
  ] as const;

  userProfile$ = this.#userProfileService.userProfile$;
  readonly activeUserType = this.#authUserConnectorService.activeUserTypeSig;

  private _pictureChangeSubject = new BehaviorSubject<File | null>(null);
  readonly pictureChange$ = this._pictureChangeSubject.asObservable().pipe(
    distinctUntilChanged((prev, curr) => prev?.size === curr?.size),
    switchMap((picture) => {
      return picture ? from(this._preparePicture(picture)) : of(null);
    }),
    tap((isFileSelected) => {
      isFileSelected &&
        this.#snackbar.open(
          'Picture selected. Confirm the form to update the profile',
          'Close',
          { duration: 5000 }
        );
    }),
    catchError((err) => {
      console.error('Error during image cropping: ', err);
      return of(null);
    })
  );

  private _userProfileStateSubject =
    new BehaviorSubject<UserProfileUpdateResultI>({
      state: 'idle',
    });
  readonly userProfileUpdateNotifier$ = merge(
    this._userProfileStateSubject.asObservable(),
    this.#userProfileService.userProfileUpdateResult$
  ).pipe(
    tap((result) => {
      this._notifyAboutResult(result);
    })
  );

  onSubmit(profileChanges: UserProfileChangesI) {
    combineLatest([
      this.pictureChange$,
      this.#authUserConnectorService.activeUser$.pipe(
        filter((user): user is LocalUserAccount | User => !!user)
      ),
    ])
      .pipe(
        take(1),
        map(([picture, activeUser]) =>
          this._prepareUpdate(
            { ...profileChanges, photoBlob: picture || undefined },
            activeUser
          )
        ),
        map((payload): UserProfileUpdateResultI => {
          this.#userProfileService.uploadProfileChanges(payload);
          return { state: 'pending' };
        }),
        catchError((err: Error) =>
          of<UserProfileUpdateResultI>({
            state: 'failure',
            cause: err.message,
          })
        )
      )
      .subscribe((actionState) => {
        this._userProfileStateSubject.next(actionState);
      });
  }

  onUserImageSelected(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];

    if (!file) {
      return;
    }
    const fileExtension = file.type.split('/')[1];

    if (!this.acceptedExtensions.some((ext) => ext === fileExtension)) {
      return;
    }
    this._pictureChangeSubject.next(file);
  }

  private _prepareUpdate(
    profileChanges: UserProfileChangesWithImageI,
    activeUser: LocalUserAccount | User | null
  ): UserProfileChangesWithImageI {
    const userType = this.activeUserType();

    if (!userType || !activeUser) {
      throw new Error('No user logged in');
    }

    if (userType === 'online') {
      return profileChanges;
    }

    return this._compareLocalChanges(
      profileChanges,
      activeUser as LocalUserAccount
    );
  }

  private _compareLocalChanges(
    changes: UserProfileChangesWithImageI,
    user: LocalUserAccount
  ): UserProfileChangesWithImageI {
    if (changes.oldPassphrase && changes.passphrase) {
      const result = this.#authLocalUserService.validateUser(
        user.auth.name,
        changes.oldPassphrase
      );

      if ('message' in result) {
        throw new Error(
          user.auth.authOption === 'password'
            ? 'passwordMismatch'
            : 'pinMismatch'
        );
      }
    }

    if (changes.name !== user.auth.name) {
      if (this.#authLocalUserService.doesAccountExist(changes.name)) {
        throw new Error('account-exists');
      }
    }

    return {
      ...changes,
      passphrase: changes.passphrase || user.auth.value,
    };
  }

  private _notifyAboutResult(result: UserProfileUpdateResultI): void {
    if (result.state === 'failure') {
      this._notifyAboutFailure(result);
    } else if (result.state === 'success') {
      this._notifyAboutSuccess();
    }
  }

  private _notifyAboutSuccess(): void {
    this.#snackbar.open('Profile changes saved!', 'close', {
      duration: 5000,
    });
  }

  private _notifyAboutFailure(result: UserProfileUpdateResultI) {
    if (!result.cause) {
      return;
    }
    this.#errorHandlerService.onError(
      errorDictionary[result.cause as keyof typeof errorDictionary] ||
        errorDictionary.unregistered
    );
  }

  /**
   * Crops an image to 1:1 ratio by using the Canvas API. Cuts the image borders to leave the center of the image
   */
  private _preparePicture(picture: File): Promise<PhotoBlob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onerror = (e) => {
        if (!environment.production) {
          console.error(e);
        }

        reject('Error while loading the image');
        return;
      };

      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const newSize = Math.min(width, height);
        const quality = 0.75;

        canvas.width = newSize;
        canvas.height = newSize;
        ctx.drawImage(
          img,
          (width - newSize) / 2,
          (height - newSize) / 2,
          newSize,
          newSize,
          0,
          0,
          newSize,
          newSize
        );

        const croppedImage = canvas.toDataURL(picture.type, quality);
        const extension = picture.type.split('/')[1];

        this.#objectTools
          .base64ToFile(croppedImage, `picture.${extension}`)
          .then((blob) => {
            if (blob.error || !blob.data) {
              reject('Error while creating a blob from base64 string');
              return;
            }

            resolve({ blob: blob.data, extension });
          });
      };

      img.src = URL.createObjectURL(picture);
    });
  }
}
