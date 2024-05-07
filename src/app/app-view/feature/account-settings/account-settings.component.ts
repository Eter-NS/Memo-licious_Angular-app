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
import { ErrorHandlerService } from '../../data-access/error-handler/error-handler.service';
import { AccountSettingsLocalComponent } from '../../ui/account-settings-local/account-settings-local.component';
import { AccountSettingsOnlineComponent } from '../../ui/account-settings-online/account-settings-online.component';
import {
  PhotoBlob,
  UserProfileChangesI,
} from '../../utils/models/user-profile.interface';
import { AuthLocalUserService } from 'src/app/auth/data-access/local-user/auth-local-user.service';
import { User } from '@angular/fire/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  UserProfileUpdateResultI,
  UserProfileService,
} from '../../data-access/user-profile/user-profile.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { base64ToFileObj } from 'src/app/reusable/utils/data-tools/objectTools';
import { FetchErrorComponent } from '../../../reusable/ui/fetch-error/fetch-error.component';
import { FileToUrlPipe } from '../../../reusable/utils/file-to-url/file-to-url.pipe';

const errorDictionary = {
  passwordMismatch: `The current password doesn't match the existing one, please try again.`,
  pinMismatch: `The current pin doesn't match the existing one, please try again.`,
  unregistered: 'Something went wrong, please check your profile entries',
};

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

  userProfile$ = this.#userProfileService.userProfile$;
  readonly activeUserType = this.#authUserConnectorService.activeUserTypeSig;

  #pictureChangeSubject = new BehaviorSubject<File | null>(null);
  readonly pictureChange$ = this.#pictureChangeSubject.asObservable().pipe(
    distinctUntilChanged((prev, curr) => prev?.size === curr?.size),
    switchMap((picture) => {
      return picture ? from(this._preparePicture(picture)) : of(null);
    }),
    tap(
      (isFileSelected) =>
        isFileSelected &&
        this.#snackbar.open(
          'Picture selected. Confirm the form to update the profile',
          'Close',
          { duration: 5000 }
        )
    )
  );

  #userProfileStateSubject = new BehaviorSubject<UserProfileUpdateResultI>({
    state: 'idle',
  });
  readonly userProfileUpdateNotifier$ = merge(
    this.#userProfileStateSubject.asObservable(),
    this.#userProfileService.userProfileUpdateResult$
  );

  constructor() {
    this.userProfileUpdateNotifier$.pipe(takeUntilDestroyed()).subscribe({
      next: (result) => {
        this._notifyAboutResult(result);
      },
    });
  }

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
      .subscribe((actionState) =>
        this.#userProfileStateSubject.next(actionState)
      );
  }

  onUserImageSelected(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    file && this._pushUserImage(file);
  }

  protected readUnsavedPicture(file: File) {
    return URL.createObjectURL(file);
  }

  private _pushUserImage(file: File | null) {
    this.#pictureChangeSubject.next(file);
  }

  private _prepareUpdate(
    profileChanges: UserProfileChangesI,
    activeUser: LocalUserAccount | User | null
  ): UserProfileChangesI {
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
    changes: UserProfileChangesI,
    user: LocalUserAccount
  ): UserProfileChangesI {
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
    result.state === 'failure'
      ? this._checkResultErrors(result)
      : this._checkResultState(result.state);
  }

  private _checkResultState(state: UserProfileUpdateResultI['state']): void {
    state === 'success' &&
      this.#snackbar.open('Profile changes saved!', 'close', {
        duration: 5000,
      });
  }

  private _checkResultErrors(result: UserProfileUpdateResultI) {
    if (!result.cause) {
      return;
    }
    this.#errorHandlerService.onError(
      errorDictionary[result.cause as keyof typeof errorDictionary] ||
        errorDictionary.unregistered
    );
  }

  private _preparePicture(picture: File): Promise<PhotoBlob> {
    return new Promise((resolve) => {
      // Create a TypeScript function to crop an image to 1:1 ratio by using the Canvas API. Cut the image borders to leave the center of the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      const img = new Image();
      img.src = URL.createObjectURL(picture);

      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const newSize = Math.min(width, height);

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

        const croppedImage = canvas.toDataURL(picture.type, 0.75);
        const extension = picture.type.split('/')[1];

        base64ToFileObj(croppedImage, `picture.${extension}`).then((blob) =>
          resolve({ blob, extension })
        );
      };
    });
  }
}
