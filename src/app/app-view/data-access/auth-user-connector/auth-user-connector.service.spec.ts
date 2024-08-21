/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { AuthUserConnectorService } from './auth-user-connector.service';
import { AuthLocalUserService } from 'src/app/auth/data-access/local-user/auth-local-user.service';
import { AuthAccountService } from 'src/app/auth/data-access/account/auth-account.service';
import { AuthStateService } from 'src/app/auth/data-access/state/auth-state.service';
import { StorageService } from 'src/app/reusable/data-access/firebase-storage/storage.service';
import { ErrorHandlerService } from '../../../reusable/data-access/error-handler/error-handler.service';
import { User } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { LocalUserAccount } from 'src/app/auth/utils/Models/LocalAuthModels.interface';
import { NoteGroupModel } from 'src/app/auth/utils/Models/UserDataModels.interface';
import {
  UserProfileChangesI,
  UserProfileChangesWithImageI,
} from '../../utils/models/user-profile.interface';
import { FILE_TO_BASE64_TOKEN } from 'src/app/reusable/utils/file-to-base64/file-to-base64.pipe.injector';
import { UploadResult } from '@angular/fire/storage';
import { AuthReturnCredits } from 'src/app/auth/utils/Models/OnlineAuthModels.interface';

describe(`AuthUserConnectorService`, () => {
  const localUserCreator = () =>
    new BehaviorSubject<LocalUserAccount | null | undefined>(undefined);
  let localUserSubject = localUserCreator();
  const authLocalUserServiceMock = {
    _allUsers: [] as LocalUserAccount[],
    _localUserSubject$: localUserSubject,
    localUser$: localUserSubject.asObservable(),
    logOut: jasmine.createSpy(`logOut`, AuthLocalUserService.prototype.logOut),
    modifyCurrentUser: jasmine.createSpy(
      `modifyCurrentUser`,
      AuthLocalUserService.prototype.modifyCurrentUser
    ),
    _loadUserData: jasmine.createSpy(
      `_loadUserData`,
      AuthLocalUserService.prototype['_loadUserData']
    ),
    _saveUsersData: jasmine.createSpy(
      `_saveUsersData`,
      AuthLocalUserService.prototype['_saveUsersData']
    ),
  };
  const authAccountServiceMock = jasmine.createSpyObj<AuthAccountService>([
    `signOutUser`,
    `changeUserProfileData`,
    `updatePassword`,
    `updateEmail`,
  ]);

  const onlineUserCreator = () => new BehaviorSubject<User | null>(null);
  let onlineUserSubject = onlineUserCreator();
  const authStateServiceMock = {
    user$: onlineUserSubject.asObservable(),
    sessionSig: jasmine
      .createSpy<() => User | null | undefined>(`sessionSig`)
      .and.returnValue(undefined),
  };
  const storageServiceMock = jasmine.createSpyObj<StorageService>([
    `uploadFile`,
    `getFileUrl`,
  ]);
  const errorHandlerServiceMock = jasmine.createSpyObj<ErrorHandlerService>([
    `onError`,
  ]);

  let service: AuthUserConnectorService;

  beforeEach(() => {
    localUserSubject = localUserCreator();
    authLocalUserServiceMock._localUserSubject$ = localUserSubject;
    authLocalUserServiceMock.localUser$ = localUserSubject.asObservable();

    onlineUserSubject = onlineUserCreator();
    authStateServiceMock.user$ = onlineUserSubject.asObservable();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthLocalUserService,
          useValue: authLocalUserServiceMock,
        },
        {
          provide: AuthAccountService,
          useValue: authAccountServiceMock,
        },
        {
          provide: AuthStateService,
          useValue: authStateServiceMock,
        },
        {
          provide: StorageService,
          useValue: storageServiceMock,
        },
        {
          provide: ErrorHandlerService,
          useValue: errorHandlerServiceMock,
        },
      ],
    });

    service = TestBed.inject(AuthUserConnectorService);
  });

  it(`should be created`, () => {
    expect(service).toBeTruthy();
  });

  describe(`signals`, () => {
    it(`should emit be null at startup when no one has subscribed to the activeUser$`, () => {
      expect(service.activeUserTypeSig()).toBeNull();
    });

    it(`should assign a new state to the _activeUserType and the old state to _previousUserType`, () => {
      const exampleNewState = `online`;

      service[`_updateUserType`](exampleNewState);

      expect(service[`_activeUserType`]()).toBe(exampleNewState);
      expect(service[`_previousUserType`]()).not.toBe(
        service[`_activeUserType`]()
      );
    });
  });

  describe(`Observables`, () => {
    describe(`activeUser$`, () => {
      const onlineUser = {
        email: `example@example.com`,
        emailVerified: true,
        displayName: `Example`,
      } as User;

      const localUser = {
        groups: [] as NoteGroupModel[],
        auth: { authOption: `pin`, name: `Example`, value: `1234` },
        profileColor: `xxx`,
      } as LocalUserAccount;

      it(`should call authLocalUserService.logOut(), authAccountService.signOutUser(), and emit null when two types of users are logged in simultaneously.`, fakeAsync(() => {
        // Arrange
        authAccountServiceMock.signOutUser.calls.reset();
        authLocalUserServiceMock.logOut.calls.reset();
        const onlineUserLogOutSpy = authAccountServiceMock.signOutUser;
        const localUserLogOutSpy = authLocalUserServiceMock.logOut;
        let result: LocalUserAccount | User | null = null;
        const subscription = service.activeUser$.subscribe((user) => {
          result = user;
        });

        // Act
        onlineUserSubject.next(onlineUser);
        localUserSubject.next(localUser);
        tick();
        subscription.unsubscribe();

        // Assert
        expect(onlineUserLogOutSpy).toHaveBeenCalled();
        expect(localUserLogOutSpy).toHaveBeenCalled();
        expect(result).toBe(null);
      }));

      it(`should emit LocalUserAccount type value if a local user is logged in`, fakeAsync(() => {
        let result: LocalUserAccount | User | null;
        const subscription = service.activeUser$.subscribe((user) => {
          result = user;
        });

        localUserSubject.next(localUser);
        tick();
        subscription.unsubscribe();

        expect(result!).toBe(localUser);
        expect(service.activeUserTypeSig()).toBe(`local`);
      }));

      it(`should emit User type value if an online user is logged in`, fakeAsync(() => {
        let result: LocalUserAccount | User | null;
        const subscription = service.activeUser$.subscribe((user) => {
          result = user;
        });

        onlineUserSubject.next(onlineUser);
        tick();
        subscription.unsubscribe();

        expect(result!).toBe(onlineUser);
        expect(service.activeUserTypeSig()).toBe(`online`);
      }));

      it(`should emit null value if no user is logged in`, fakeAsync(() => {
        let result: LocalUserAccount | User | null;
        const subscription = service.activeUser$.subscribe((user) => {
          result = user;
        });

        const noUser = null;
        localUserSubject.next(noUser);
        tick();
        subscription.unsubscribe();

        expect(result!).toBe(noUser!);
        expect(service.activeUserTypeSig()).toBe(null);
      }));

      it(`should call errorHandlerService.onError() when error occurs in the stream (with readMessageProperty()).`, fakeAsync(() => {
        // Arrange
        errorHandlerServiceMock.onError.calls.reset();
        const spy = errorHandlerServiceMock.onError;
        let value: LocalUserAccount | User | null = null;
        let errorValue: unknown = null;
        const subscription = service.activeUser$.subscribe({
          next: (user) => {
            value = user;
          },
          error: (err) => {
            errorValue = err;
          },
        });
        const errorObj = { message: 'Example error' };

        // Act
        onlineUserSubject.error(errorObj);
        tick();
        subscription.unsubscribe();

        // Assert
        expect(value).toBeNull();
        expect(spy).toHaveBeenCalledWith(errorObj.message);
        expect(errorValue).toEqual(errorObj);
      }));

      it(`should not call errorHandlerService.onError() when error occurs in the stream (no message property).`, fakeAsync(() => {
        // Arrange
        errorHandlerServiceMock.onError.calls.reset();
        const spy = errorHandlerServiceMock.onError;
        let value: LocalUserAccount | User | null = null;
        let errorValue: unknown = null;
        const subscription = service.activeUser$.subscribe({
          next: (user) => {
            value = user;
          },
          error: (err) => {
            errorValue = err;
          },
        });
        const errorObj = { msg: 'Example error' };

        // Act
        onlineUserSubject.error(errorObj);
        tick();
        subscription.unsubscribe();

        // Assert
        expect(value).toBeNull();
        expect(spy).not.toHaveBeenCalled();
        expect(errorValue).toEqual(errorObj);
      }));
    });
  });

  describe(`methods`, () => {
    describe(`updateUser()`, () => {
      it(`should return false if there is no user`, async () => {
        service[`_updateUserType`](null);

        const result = await service.updateUser({} as UserProfileChangesI);

        expect(result).toBeFalse();
      });

      it(`should call _handleOnlineUserUpdate if online user is active`, async () => {
        const spy = spyOn(
          service as any,
          `_handleOnlineUserUpdate`
        ).and.resolveTo(true);
        service[`_updateUserType`](`online`);

        const result = await service.updateUser({} as UserProfileChangesI);

        expect(spy).toHaveBeenCalled();
        expect(result).toBeTrue();
      });

      it(`should call _handleLocalUserUpdate if local user is active`, async () => {
        const spy = spyOn(
          service as any,
          `_handleLocalUserUpdate`
        ).and.resolveTo(true);
        service[`_updateUserType`](`local`);

        const result = await service.updateUser({} as UserProfileChangesI);

        expect(spy).toHaveBeenCalled();
        expect(result).toBeTrue();
      });
    });

    describe(`logOutUser()`, () => {
      it(`should not do anything if there is no active user`, () => {
        service['_updateUserType'](null);
        authAccountServiceMock.signOutUser.calls.reset();
        authLocalUserServiceMock.logOut.calls.reset();
        const spy1 = authAccountServiceMock.signOutUser;
        const spy2 = authLocalUserServiceMock.logOut;

        service.logOutUser();

        expect(spy1).not.toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
      });

      it(`should call authAccountService.signOutUser if an online user is active`, () => {
        service[`_updateUserType`](`online`);
        const spy = authAccountServiceMock.signOutUser;

        service.logOutUser();

        expect(spy).toHaveBeenCalled();
      });

      it(`should call authLocalUserService.logOut if an local user is active`, () => {
        service[`_updateUserType`](`local`);
        const spy = authAccountServiceMock.signOutUser;

        service.logOutUser();

        expect(spy).toHaveBeenCalled();
      });
    });

    describe(`_handleLocalUserUpdate()`, () => {
      beforeEach(() => {
        authLocalUserServiceMock._allUsers = [];
      });

      it(`should run fileTobase64Pipe.transform and return false if transformation fails`, async () => {
        // Arrange
        const spy1 = spyOn(
          TestBed.inject(FILE_TO_BASE64_TOKEN),
          `transform`
        ).and.returnValue(Promise.resolve(null));

        const spy2 = authLocalUserServiceMock.modifyCurrentUser;
        const payload: UserProfileChangesWithImageI = {
          photoBlob: {
            extension: `jpg`,
            blob: new File([], `example.jpg`),
          },
        } as UserProfileChangesWithImageI;

        // Act
        const result = await service[`_handleLocalUserUpdate`](payload);

        // Assert
        expect(spy1).toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
        expect(result).toBeFalse();
      });

      it(`should run fileToBase64Pipe.transform and authLocalUserService.modifyCurrentUser if a new user picture was received`, async () => {
        const spy1 = spyOn(
          TestBed.inject(FILE_TO_BASE64_TOKEN),
          `transform`
        ).and.callThrough();
        const spy2 =
          authLocalUserServiceMock.modifyCurrentUser.and.returnValue(true);
        const payload: UserProfileChangesWithImageI = {
          photoBlob: {
            extension: `jpg`,
            blob: new File([], `example.jpg`),
          },
        } as UserProfileChangesWithImageI;

        const result = await service[`_handleLocalUserUpdate`](payload);

        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
        expect(result).toBeTrue();
      });

      it(`should return false if no passphrase has been added and user hasn't changed the picture`, async () => {
        const payload = {};

        const result = await service[`_handleLocalUserUpdate`](
          payload as UserProfileChangesI
        );

        expect(result).toBeFalse();
      });

      it(`should return false if something went wrong inside authLocalUserService.modifyCurrentUser`, async () => {
        const spy =
          authLocalUserServiceMock.modifyCurrentUser.and.callThrough();

        const result = await service[`_handleLocalUserUpdate`]({
          passphrase: 'xyz',
        } as UserProfileChangesI);

        expect(spy).toHaveBeenCalled();
        expect(result).toBeFalse();
      });

      it(`should return true if everything went right`, async () => {
        const user: LocalUserAccount = {
          auth: {
            authOption: 'pin',
            value: '1234',
            name: 'Example',
          },
          groups: [] as NoteGroupModel[],
          profileColor: '#000',
        };
        authLocalUserServiceMock._allUsers = [user];
        localUserSubject.next(user);
        const spy =
          authLocalUserServiceMock.modifyCurrentUser.and.callThrough();

        const result = await service[`_handleLocalUserUpdate`]({
          passphrase: '0356',
          authOption: 'pin',
          name: 'New Example',
        });

        expect(spy).toHaveBeenCalled();
        expect(result).toBeTrue();
      });
    });

    describe(`_handleOnlineUserUpdate()`, () => {
      beforeEach(() => {
        authStateServiceMock.sessionSig.and.returnValue({ uid: 'xyz' } as User);
      });

      afterAll(() => {
        authStateServiceMock.sessionSig.and.returnValue(undefined);
      });

      it(`should return false if payload does contain photoBlob but no user is logged in`, async () => {
        authStateServiceMock.sessionSig.and.returnValue(undefined);
        const spy = storageServiceMock.uploadFile;
        const payload: UserProfileChangesWithImageI = {
          photoBlob: {
            extension: 'jpg',
            blob: new File([], 'example.jpg'),
          },
        } as UserProfileChangesWithImageI;

        const result = await service['_handleOnlineUserUpdate'](payload);

        expect(spy).not.toHaveBeenCalled();
        expect(result).toBeFalse();
      });

      it(`should return false and log the error if updating the user profile fails (readMessageProperty())`, async () => {
        const spy = spyOn(console, 'error').and.stub();
        storageServiceMock.uploadFile.and.rejectWith(
          new Error('example error')
        );
        const payload: UserProfileChangesWithImageI = {
          photoBlob: {
            extension: 'jpg',
            blob: new File([], 'example.jpg'),
          },
          name: 'someone',
        } as UserProfileChangesWithImageI;

        const result = await service['_handleOnlineUserUpdate'](payload);

        expect(spy).toHaveBeenCalledWith(
          'Error while updating online user: ',
          'example error'
        );
        expect(result).toBeFalse();
      });

      it(`should return false and log the error if updating the user profile fails (error value)`, async () => {
        const spy = spyOn(console, 'error').and.stub();
        const errorObject = { msg: 'Example error' };
        storageServiceMock.uploadFile.and.rejectWith(errorObject);
        const payload: UserProfileChangesWithImageI = {
          photoBlob: {
            extension: 'jpg',
            blob: new File([], 'example.jpg'),
          },
          name: 'someone',
        } as UserProfileChangesWithImageI;

        const result = await service['_handleOnlineUserUpdate'](payload);

        expect(spy).toHaveBeenCalledWith(
          'Error while updating online user: ',
          errorObject
        );
        expect(result).toBeFalse();
      });

      it(`should return true when the profileDataResult is true, user passed a new profile image, and no old password has been passed to the method`, async () => {
        storageServiceMock.uploadFile.and.resolveTo({
          ref: { fullPath: 'example path' },
        } as UploadResult);
        storageServiceMock.getFileUrl.and.resolveTo('example url');
        authAccountServiceMock.changeUserProfileData.and.resolveTo(true);
        const payload: UserProfileChangesWithImageI = {
          photoBlob: {
            extension: 'jpg',
            blob: new File([], 'example.jpg'),
          },
          name: 'someone',
        } as UserProfileChangesWithImageI;

        const result = await service['_handleOnlineUserUpdate'](payload);

        expect(result).toBeTrue();
      });

      it(`should return true while _handleOptionalPasswordUpdate requirements weren't met`, async () => {
        spyOn(service as any, '_handleOptionalPasswordUpdate').and.resolveTo(
          null
        );
        const payload: UserProfileChangesI = {
          name: 'someone',
          oldPassphrase: 'oldPassword',
        } as UserProfileChangesI;

        const result = await service['_handleOnlineUserUpdate'](payload);

        expect(result).toBeTrue();
      });

      it(`should return false if _handleOptionalPasswordUpdate failed`, async () => {
        const spy = spyOn(console, 'error').and.stub();
        spyOn(service as any, '_handleOptionalPasswordUpdate').and.throwError(
          'TEST: example error'
        );
        const payload: UserProfileChangesI = {
          name: 'someone',
          oldPassphrase: 'oldPassword',
        } as UserProfileChangesI;

        const result = await service['_handleOnlineUserUpdate'](payload);

        expect(result).toBeFalse();
        expect(spy).toHaveBeenCalled();
      });

      it(`should return true while _handleOptionalEmailUpdate requirements weren't met`, async () => {
        spyOn(service as any, '_handleOptionalPasswordUpdate').and.resolveTo({
          passed: true,
        });
        spyOn(service as any, '_handleOptionalEmailUpdate').and.resolveTo(null);
        const payload: UserProfileChangesI = {
          name: 'someone',
          oldPassphrase: 'oldPassword',
          passphrase: 'newPassword',
        } as UserProfileChangesI;

        const result = await service['_handleOnlineUserUpdate'](payload);

        expect(result).toBeTrue();
      });

      it(`should return false if _handleOptionalEmailUpdate failed`, async () => {
        const spy = spyOn(console, 'error').and.stub();
        spyOn(service as any, '_handleOptionalEmailUpdate').and.throwError(
          'TEST: example error'
        );
        const payload: UserProfileChangesI = {
          name: 'someone',
          oldPassphrase: 'oldPassword',
        } as UserProfileChangesI;

        const result = await service['_handleOnlineUserUpdate'](payload);

        expect(result).toBeFalse();
        expect(spy).toHaveBeenCalled();
      });
    });

    describe(`_handleOptionalPasswordUpdate()`, () => {
      it(`should return null while requirements weren't met`, async () => {
        const result1 = await service['_handleOptionalPasswordUpdate']();
        const result2 = await service['_handleOptionalPasswordUpdate'](
          'old_password'
        );

        expect(result1).toBeNull();
        expect(result2).toBeNull();
      });

      it(`should throw error if requirements were met but action failed`, async () => {
        const returnedValue = {
          errors: {
            unknownError: { code: 'xxx', message: 'TEST: No user logged in' },
          },
        } as AuthReturnCredits;
        authAccountServiceMock.updatePassword.and.resolveTo(returnedValue);

        await expectAsync(
          service['_handleOptionalPasswordUpdate'](
            'old_password',
            'new_password'
          )
        ).toBeRejectedWithError(returnedValue.errors?.unknownError?.message);
      });

      it(`should return passed property if requirements were met and action succeeded`, async () => {
        const returnedValue = {
          passed: true,
        } as AuthReturnCredits;
        authAccountServiceMock.updatePassword.and.resolveTo(returnedValue);

        const result = await service['_handleOptionalPasswordUpdate'](
          'old_password',
          'new_password'
        );

        expect(result).toEqual(returnedValue);
      });
    });

    describe(`_handleOptionalEmailUpdate()`, () => {
      it(`should return null if requirements were not met`, async () => {
        const result1 = await service['_handleOptionalEmailUpdate']({});
        const result2 = await service['_handleOptionalEmailUpdate']({
          existingPassphrase: 'a_password',
          oldEmail: 'old.email@example.com',
        });
        const result3 = await service['_handleOptionalEmailUpdate']({
          existingPassphrase: 'a_password',
          email: 'new.email@example.com',
        });

        expect(result1).toBeNull();
        expect(result2).toBeNull();
        expect(result3).toBeNull();
      });

      it(`should throw error if requirements were met and action failed (email already in use)`, async () => {
        const returnedValue = {
          errors: {
            alreadyInUseError: true,
          },
        } as AuthReturnCredits;
        authAccountServiceMock.updateEmail.and.resolveTo(returnedValue);

        await expectAsync(
          service['_handleOptionalEmailUpdate']({
            existingPassphrase: 'existingPassword',
            oldEmail: 'old.email@example.com',
            email: 'new.email@example.com',
          })
        ).toBeRejectedWithError('Email already in use.');
      });

      it(`should throw error if requirements were met and action failed (unknown error with message)`, async () => {
        const returnedValue = {
          errors: {
            unknownError: { code: 'xxx', message: 'TEST: No user logged in' },
          },
        } as AuthReturnCredits;
        authAccountServiceMock.updateEmail.and.resolveTo(returnedValue);

        await expectAsync(
          service['_handleOptionalEmailUpdate']({
            existingPassphrase: 'existingPassword',
            oldEmail: 'old.email@example.com',
            email: 'new.email@example.com',
          })
        ).toBeRejectedWithError(returnedValue.errors?.unknownError?.message);
      });

      it(`should return passed property if requirements were met and action succeeded`, async () => {
        const returnedValue = {
          passed: true,
        } as AuthReturnCredits;
        authAccountServiceMock.updateEmail.and.resolveTo(returnedValue);

        const result = await service['_handleOptionalEmailUpdate']({
          existingPassphrase: 'existingPassword',
          newPassphrase: 'newPassword',
          oldEmail: 'old.email@example.com',
          email: 'new.email@example.com',
        });

        expect(result).toEqual(returnedValue);
      });
    });
  });
});
