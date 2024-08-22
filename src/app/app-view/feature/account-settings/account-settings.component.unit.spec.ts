/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';
import { AccountSettingsComponent } from './account-settings.component';
import { Provider } from '@angular/core';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import {
  AuthUserConnectorService,
  UserType,
} from '../../data-access/auth-user-connector/auth-user-connector.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { LocalUserAccount } from 'src/app/auth/utils/Models/LocalAuthModels.interface';
import { User } from '@angular/fire/auth';
import {
  PhotoBlob,
  UserProfile,
  UserProfileChangesI,
  UserProfileChangesWithImageI,
} from '../../utils/models/user-profile.interface';
import {
  UserProfileService,
  UserProfileUpdateResultI,
} from '../../data-access/user-profile/user-profile.service';
import { AuthLocalUserService } from 'src/app/auth/data-access/local-user/auth-local-user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorHandlerService } from 'src/app/reusable/data-access/error-handler/error-handler.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoteGroupModel } from 'src/app/auth/utils/Models/UserDataModels.interface';
import { createJpegImage } from 'src/app/reusable/utils/testing/utils/createJpegImage';
import {
  OBJECT_TOOLS,
  OBJECT_TOOLS_TYPE,
} from 'src/app/reusable/utils/data-tools/objectTools.token';

const exampleUserProfile: UserProfile = {
  authOption: 'pin',
  name: 'Example name',
  email: 'Example@example.com',
  profileColor: '#289454',
};

const exampleLocalUser: LocalUserAccount = {
  auth: {
    authOption: 'pin',
    name: 'Sam',
    value: '2137',
  },
  groups: [] as NoteGroupModel[],
  profileColor: '#295368',
};

describe(`AccountSettingsComponent`, () => {
  // Mocks
  const pageStateSubject = new BehaviorSubject<'start' | 'end' | 'idle'>(
    'idle'
  );
  const viewTransitionServiceMock = {
    pageState$: pageStateSubject.asObservable(),
    goBack: jasmine.createSpy('goBack', ViewTransitionService.prototype.goBack),
    pageReload: jasmine.createSpy(
      'pageReload',
      ViewTransitionService.prototype.pageReload
    ),
  };

  const activeUserSubject = new BehaviorSubject<LocalUserAccount | User | null>(
    null
  );
  let activeUserTypeSigValue: UserType = 'online';
  const authUserConnectorServiceMock = {
    activeUser$: activeUserSubject.asObservable(),
    activeUserTypeSig: () => activeUserTypeSigValue,
  };

  const userProfileValueSubject = new BehaviorSubject<UserProfile>(
    exampleUserProfile
  );
  const userProfileUpdateResultSubject =
    new Subject<UserProfileUpdateResultI>();
  const userProfileServiceMock = {
    userProfile$: userProfileValueSubject.asObservable(),
    userProfileUpdateResult$: userProfileUpdateResultSubject.asObservable(),
    uploadProfileChanges: jasmine.createSpy(
      'uploadProfileChanges',
      UserProfileService.prototype.uploadProfileChanges
    ),
  };

  let authLocalUserService: AuthLocalUserService;

  const errorHandlerServiceMock = jasmine.createSpyObj<ErrorHandlerService>([
    'onError',
  ]);
  const objectToolsMock = jasmine.createSpyObj<OBJECT_TOOLS_TYPE>([
    'base64ToFile',
  ]);

  // Component
  let fixture: ComponentFixture<AccountSettingsComponent>;
  let component: AccountSettingsComponent;

  beforeEach(() => {
    pageStateSubject.next('idle');
    activeUserSubject.next(null);
    userProfileValueSubject.next(exampleUserProfile);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, AccountSettingsComponent],
      providers: [
        { provide: OBJECT_TOOLS, useValue: objectToolsMock },
        {
          provide: ViewTransitionService,
          useValue: viewTransitionServiceMock,
        },
        {
          provide: AuthUserConnectorService,
          useValue: authUserConnectorServiceMock,
        },
        {
          provide: UserProfileService,
          useValue: userProfileServiceMock,
        },
        {
          provide: ErrorHandlerService,
          useValue: errorHandlerServiceMock,
        },
      ] satisfies Provider[],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSettingsComponent);
    component = fixture.componentInstance;
    authLocalUserService = TestBed.inject(AuthLocalUserService);
  });

  beforeEach(() => {
    localStorage.setItem(
      authLocalUserService['_USER_PATH'],

      JSON.stringify([
        exampleLocalUser,
        {
          ...exampleLocalUser,
          auth: { authOption: 'pin', value: '18641', name: 'Alex' },
        },
      ] as LocalUserAccount[])
    );

    activeUserTypeSigValue = null;
  });

  it(`should create`, () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe(`observables`, () => {
    describe(`pictureChange$`, () => {
      it(`should return PhotoBlob object after emitting a new File value.`, fakeAsync(() => {
        // Arrange
        const openSpy = spyOn(MatSnackBar.prototype, 'open');
        const preparePictureSpy = spyOn(
          component as any,
          '_preparePicture'
        ).and.callFake(async (picture: File): Promise<PhotoBlob> => {
          const extension = picture.type.split('/')[1];

          return {
            extension: extension,
            blob: new File([''], picture.name, { type: picture.type }),
          };
        });

        const payload: File = new File([''], 'example.png', {
          type: 'image/png',
        });

        let value: PhotoBlob | null | undefined;

        // Act
        const subscription = component.pictureChange$.subscribe((picture) => {
          value = picture;
        });

        component['_pictureChangeSubject'].next(payload);

        flush();
        subscription.unsubscribe();

        // Assert
        expect(preparePictureSpy).toHaveBeenCalled();
        expect(openSpy).toHaveBeenCalled();
        expect(value?.blob.name).toBe('example.png');
        expect(value?.extension).toBe('png');
      }));

      it(`should return null when _preparePicture() rejects.`, fakeAsync(() => {
        // Arrange
        const openSpy = spyOn(MatSnackBar.prototype, 'open');
        const preparePictureSpy = spyOn(
          component as any,
          '_preparePicture'
        ).and.rejectWith('Error while creating a blob from base64 string');
        const consoleErrorSpy = spyOn(console, 'error').and.stub();

        const payload: File = new File([''], 'example.png', {
          type: 'image/png',
        });

        let value: PhotoBlob | null | undefined;

        // Act
        const subscription = component.pictureChange$.subscribe((picture) => {
          value = picture;
        });

        component['_pictureChangeSubject'].next(payload);

        flush();
        subscription.unsubscribe();

        // Assert
        expect(preparePictureSpy).toHaveBeenCalled();
        expect(openSpy).not.toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Error during image cropping: `,
          `Error while creating a blob from base64 string`
        );
        expect(value).toBeNull();
      }));
    });

    describe(`userProfileUpdateNotifier$`, () => {
      it(`should call _notifyAboutResult() when any of the observables emits value (_userProfileStateSubject).`, fakeAsync(() => {
        // Arrange
        const spy = spyOn(component as any, '_notifyAboutResult');
        const state: UserProfileUpdateResultI = { state: 'pending' };

        // Act
        const subscription = component.userProfileUpdateNotifier$.subscribe();
        component['_userProfileStateSubject'].next(state);

        flush();
        subscription.unsubscribe();

        // Assert
        expect(spy).toHaveBeenCalledWith(state);
      }));

      it(`should call _notifyAboutResult() when any of the observables emits value (userProfileService.userProfileUpdateResult$).`, fakeAsync(() => {
        // Arrange
        const spy = spyOn(component as any, '_notifyAboutResult');
        const state: UserProfileUpdateResultI = { state: 'pending' };

        // Act
        const subscription = component.userProfileUpdateNotifier$.subscribe();
        userProfileUpdateResultSubject.next(state);

        flush();
        subscription.unsubscribe();

        // Assert
        expect(spy).toHaveBeenCalledWith(state);
      }));
    });
  });

  describe(`methods`, () => {
    describe(`onSubmit()`, () => {
      it(`should not execute when authUserConnectorService.activeUser$ didn't emit a user object.`, () => {
        // Arrange
        const prepareUpdateSpy = spyOn(component as any, '_prepareUpdate');
        const payload: UserProfileChangesI = {
          name: 'Sam',
          profileColor: exampleLocalUser.profileColor,
          authOption: 'password',
          oldPassphrase: exampleLocalUser.auth.value,
          passphrase: 'dsafdRTGR#!1#$',
        };

        // Act
        component.onSubmit(payload);

        // Assert
        expect(prepareUpdateSpy).not.toHaveBeenCalled();
      });

      it(`should emit {state: failure} when _compareLocalChanges throws an error.`, () => {
        // Arrange
        spyOn(component as any, '_compareLocalChanges').and.throwError(
          'pinMismatch'
        );
        const nextSpy = spyOn(component['_userProfileStateSubject'], 'next');

        activeUserTypeSigValue = 'local';
        activeUserSubject.next(exampleLocalUser);

        const payload: UserProfileChangesI = {
          name: 'Sam',
          profileColor: exampleLocalUser.profileColor,
          authOption: 'password',
          oldPassphrase: exampleLocalUser.auth.value,
          passphrase: exampleLocalUser.auth.value,
        };

        // Act
        component.onSubmit(payload);

        // Assert
        expect(nextSpy).toHaveBeenCalledWith({
          state: 'failure',
          cause: 'pinMismatch',
        });
      });

      it(`should call _prepareUpdate() and userProfileService.uploadProfileChanges() when observables have emitted values previously.`, () => {
        // Arrange
        const prepareUpdateSpy = spyOn(
          component as any,
          '_prepareUpdate'
        ).and.callThrough();
        const uploadProfileChangesSpy =
          userProfileServiceMock.uploadProfileChanges;

        activeUserTypeSigValue = 'local';
        activeUserSubject.next(exampleLocalUser);

        // Changing password
        const payload: UserProfileChangesI = {
          name: 'Sam',
          profileColor: exampleLocalUser.profileColor,
          authOption: 'password',
          oldPassphrase: exampleLocalUser.auth.value,
          passphrase: 'dsafdRTGR#!1#$',
        };

        // Act
        component.onSubmit(payload);

        // Assert
        expect(prepareUpdateSpy).toHaveBeenCalledWith(
          {
            ...payload,
            photoBlob: undefined,
          },
          exampleLocalUser
        );
        expect(uploadProfileChangesSpy).toHaveBeenCalledWith({
          ...payload,
          photoBlob: undefined,
        });
      });
    });

    describe(`onUserImageSelected()`, () => {
      it(`should stop execution if no file has been found.`, fakeAsync(() => {
        // Arrange
        const spy = spyOn(String.prototype, 'split');
        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        inputElement.onchange = (e: Event) => {
          component.onUserImageSelected(e);
        };

        // Act
        inputElement.dispatchEvent(
          new Event('change', { bubbles: true, cancelable: true })
        );

        flush();

        // Assert
        expect(spy).not.toHaveBeenCalled();
      }));

      it(`should NOT call _pushUserImage() if the file has different extension.`, fakeAsync(() => {
        // Arrange
        const spy = spyOn(component['_pictureChangeSubject'], 'next');
        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(
          new File([''], 'test-file.pdf', {
            type: 'application/pdf',
          })
        );
        inputElement.files = dataTransfer.files;
        inputElement.onchange = (e: Event) => {
          component.onUserImageSelected(e);
        };

        // Act
        inputElement.dispatchEvent(
          new Event('change', { bubbles: true, cancelable: true })
        );

        flush();

        // Assert
        expect(spy).not.toHaveBeenCalled();
      }));

      it(`should call _pushUserImage() if the image is correct.`, fakeAsync(() => {
        // Arrange
        const spy = spyOn(component['_pictureChangeSubject'], 'next');
        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(
          new File([''], 'test-file.png', { type: 'image/png' })
        );
        inputElement.files = dataTransfer.files;
        inputElement.onchange = (e: Event) => {
          component.onUserImageSelected(e);
        };

        // Act
        inputElement.dispatchEvent(
          new Event('change', { bubbles: true, cancelable: true })
        );

        flush();

        // Assert
        expect(spy).toHaveBeenCalled();
      }));
    });

    describe(`_prepareUpdate()`, () => {
      it(`should throw error when user is not logged in.`, () => {
        // Arrange

        // Act

        // Assert
        expect(() => {
          component['_prepareUpdate']({} as UserProfileChangesWithImageI, null);
        }).toThrowError('No user logged in');
      });

      it(`should return profileChanges if user account type is online.`, () => {
        // Arrange
        activeUserTypeSigValue = 'online';
        const payload: UserProfileChangesWithImageI = {
          authOption: 'password',
          name: 'test',
        };

        // Act
        const result = component['_prepareUpdate'](payload, {} as User);

        // Assert
        expect(result).toEqual(payload);
      });

      it(`should return value from _compareLocalChanges() if user account type is local.`, () => {
        // Arrange
        const spy = spyOn(component as any, '_compareLocalChanges');
        activeUserTypeSigValue = 'local';
        const payload: UserProfileChangesWithImageI = {
          authOption: 'password',
          name: 'test',
        };

        // Act
        component['_prepareUpdate'](payload, {} as LocalUserAccount);

        // Assert
        expect(spy).toHaveBeenCalled();
      });
    });

    describe(`_compareLocalChanges()`, () => {
      it(`should throw if user credentials are wrong (authOption = pin).`, () => {
        // Arrange
        const changes = {
          oldPassphrase: '45423',
          passphrase: '5635',
        } as UserProfileChangesWithImageI;

        const user = {
          auth: { name: 'Example', authOption: 'pin' },
        } as LocalUserAccount;

        // Act
        // Assert
        expect(() => {
          component['_compareLocalChanges'](changes, user);
        }).toThrowError('pinMismatch');
      });

      it(`should throw if user credentials are wrong (authOption = password).`, () => {
        // Arrange
        const changes = {
          oldPassphrase: '45423',
          passphrase: '5635',
        } as UserProfileChangesWithImageI;

        const user = {
          auth: { name: 'Example', authOption: 'password' },
        } as LocalUserAccount;

        // Act
        // Assert
        expect(() => {
          component['_compareLocalChanges'](changes, user);
        }).toThrowError('passwordMismatch');
      });

      it(`should throw if user name user wants to change already exists.`, () => {
        // Arrange
        // add two users to localStorage ...
        const changes = {
          oldPassphrase: '45423',
          name: 'Alex',
        } as UserProfileChangesWithImageI;

        const user = exampleLocalUser;

        // Act
        // Assert
        expect(() => {
          component['_compareLocalChanges'](changes, user);
        }).toThrowError('account-exists');
      });

      it(`should return the changes with with passphrase property if it's set.`, () => {
        // Arrange
        const payload: UserProfileChangesWithImageI = {
          authOption: 'password',
          oldPassphrase: exampleLocalUser.auth.value,
          passphrase: 'as4@#@$FSD',
          name: 'Sam',
          profileColor: exampleLocalUser.profileColor,
        };

        const user = exampleLocalUser;

        // Act
        const result = component['_compareLocalChanges'](payload, user);

        // Assert
        expect(result.passphrase).toEqual('as4@#@$FSD');
      });

      it(`should return the changes with user.auth.value when passphrase property is falsy.`, () => {
        // Arrange
        const payload: UserProfileChangesWithImageI = {
          authOption: exampleLocalUser.auth.authOption,
          oldPassphrase: exampleLocalUser.auth.value,
          name: 'Sam',
          profileColor: exampleLocalUser.profileColor,
        };

        const user = exampleLocalUser;

        // Act
        const result = component['_compareLocalChanges'](payload, user);

        // Assert
        expect(result.passphrase).toEqual(exampleLocalUser.auth.value);
      });
    });

    describe(`_notifyAboutResult()`, () => {
      it(`should call _notifyAboutFailure() if result.state equals 'failure'.`, () => {
        // Arrange
        const spy = spyOn(component as any, '_notifyAboutFailure');

        // Act
        component['_notifyAboutResult']({
          state: 'failure',
          cause: 'Example error message',
        });

        // Assert
        expect(spy).toHaveBeenCalled();
      });

      it(`should call _notifyAboutSuccess() if result.state equals 'success'.`, () => {
        // Arrange
        const spy = spyOn(component as any, '_notifyAboutSuccess');

        // Act
        component['_notifyAboutResult']({ state: 'success' });

        // Assert
        expect(spy).toHaveBeenCalled();
      });
    });

    describe(`_notifyAboutSuccess()`, () => {
      it(`should call snackbar.open()`, () => {
        // Arrange
        const openSpy = spyOn(MatSnackBar.prototype, 'open');

        // Act
        component['_notifyAboutSuccess']();

        // Assert
        expect(openSpy).toHaveBeenCalledWith(
          'Profile changes saved!',
          'close',
          { duration: 5000 }
        );
      });
    });

    describe(`_notifyAboutFailure()`, () => {
      it(`should not call errorHandlerService.onError if result does not have cause property.`, () => {
        // Arrange
        const onErrorSpy = errorHandlerServiceMock.onError;
        const payload: UserProfileUpdateResultI = {
          state: 'failure',
        };

        // Act
        component['_notifyAboutFailure'](payload);

        // Assert
        expect(onErrorSpy).not.toHaveBeenCalled();
      });

      it(`should  call errorHandlerService.onError if result has cause property.`, () => {
        // Arrange
        const onErrorSpy = errorHandlerServiceMock.onError;
        const payload: UserProfileUpdateResultI = {
          state: 'failure',
          cause: 'Example error message',
        };

        // Act
        component['_notifyAboutFailure'](payload);

        // Assert
        expect(onErrorSpy).toHaveBeenCalled();
      });
    });

    describe(`_preparePicture()`, () => {
      it(`should reject if image can't be loaded correctly.`, async () => {
        // Arrange
        spyOn(console, 'error').and.stub();
        const spy = objectToolsMock.base64ToFile;

        // Act
        // Assert
        await expectAsync(
          component['_preparePicture'](
            new File([''], 'example.jpg', { type: 'image/jpg' })
          )
        ).toBeRejectedWith('Error while loading the image');
        expect(spy).not.toHaveBeenCalled();
      });

      it(`should reject if image can't be loaded correctly.`, async () => {
        // Arrange
        spyOn(console, 'error').and.stub();
        const spy = objectToolsMock.base64ToFile.and.resolveTo({
          data: undefined,
          error: 'Example error',
        });

        // Act
        // Assert
        await expectAsync(
          component['_preparePicture'](await createJpegImage())
        ).toBeRejectedWith('Error while creating a blob from base64 string');
        expect(spy).toHaveBeenCalled();
      });

      it(`should resolve if image can't be loaded correctly.`, async () => {
        // Arrange
        spyOn(console, 'error').and.stub();
        const spy = objectToolsMock.base64ToFile.and.resolveTo({
          data: await createJpegImage(),
          error: undefined,
        });

        // Act
        const result = await component['_preparePicture'](
          await createJpegImage()
        );
        // Assert
        expect(result.extension).toBe('jpeg');
        expect(spy).toHaveBeenCalled();
      });
    });
  });
});
