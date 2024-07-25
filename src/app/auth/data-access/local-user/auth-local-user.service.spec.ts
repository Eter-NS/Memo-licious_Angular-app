/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { AuthLocalUserService } from './auth-local-user.service';
import { LocalStorageService } from 'src/app/reusable/data-access/localStorage/local-storage.service';
import { Router } from '@angular/router';
import {
  LocalUserFormData,
  LocalUserAccount,
} from '../../utils/Models/LocalAuthModels.interface';
import { NoteGroupModel } from '../../utils/Models/UserDataModels.interface';

describe('AuthLocalUserService', () => {
  let localStore: Record<string, string> = {};
  const localStorageServiceMock = {
    loadFromStorage: <T>(key: string): T | null => {
      const stringifiedData = localStore[key];
      return stringifiedData ? (JSON.parse(localStore[key]) as T) : null;
    },
    saveToStorage: (key: string, payload: unknown): void => {
      localStore[key] = JSON.stringify(payload);
    },
    removeFromStorage: (key: string): void => {
      delete localStore[key];
    },
  };
  const routerMock = jasmine.createSpyObj<Router>(['navigateByUrl']);

  const user: LocalUserAccount = {
    auth: {
      name: 'Example',
      authOption: 'pin',
      value: '1234',
    },
    groups: [
      {
        id: 'example-id',
        createdAt: Date.now(),
        title: 'example group',
        notes: [
          {
            id: 'Example note id',
            createdAt: Date.now(),
            value: 'Hello World!',
          },
        ],
      },
    ],
    profileColor: 'ffffff',
  };

  let service: AuthLocalUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LocalStorageService,
          useValue: localStorageServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    });

    service = TestBed.inject(AuthLocalUserService);
  });

  beforeEach(() => {
    localStore = {};
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`getter allUsers()`, () => {
    it(`should return an empty array if no user exists in local storage.`, () => {
      // Arrange
      service['_allUsers'] = [];

      // Act
      const result = service.allUsers;

      // Assert
      expect(result.length).toBe(0);
    });

    it(`should return an array of users on the device.`, () => {
      // Arrange
      service['_allUsers'] = [user];

      // Act
      const result = service.allUsers;

      // Assert
      expect(result.length).toBe(1);
    });
  });

  describe('createUser()', () => {
    let payload: LocalUserFormData;

    beforeEach(() => {
      payload = {
        auth: {
          name: 'Example',
          authOption: 'pin',
          value: '1234',
        },
      };
    });

    it('should create user if there is no other account on the device', fakeAsync(() => {
      service.createUser(payload);
      let result: LocalUserAccount | null | undefined = undefined;

      const sub = service.localUser$.subscribe((user) => {
        result = user;
      });

      tick(1_000);
      sub.unsubscribe();

      expect(result!.auth.name).toEqual(payload.auth.name);
      expect(result!.auth.authOption).toEqual(payload.auth.authOption);
      expect(result!.auth.value).toEqual(payload.auth.value);
    }));

    it('should create user if there are other accounts on the device', fakeAsync(() => {
      const payload2: LocalUserFormData = JSON.parse(JSON.stringify(payload));
      payload2.auth.name = 'Example2';
      let result: LocalUserAccount | null | undefined = undefined;

      service.createUser(payload);
      service.createUser(payload2);

      const sub = service.localUser$.subscribe((user) => {
        result = user;
      });

      tick(1_000);
      sub.unsubscribe();

      expect(result!.auth.name).toBe(payload2.auth.name);
    }));

    it('should return object with error property if there is an account with the same auth.name', () => {
      service.createUser(payload);
      const error = service.createUser(payload);

      expect(error).toEqual({
        code: 'user-exists',
        message: 'Account already exists',
      });
    });

    describe('localUser$', () => {
      it('should return latest user data', fakeAsync(() => {
        const payload: LocalUserFormData = {
          auth: {
            name: 'Example',
            authOption: 'pin',
            value: '1234',
          },
        };
        let result: LocalUserAccount | null | undefined = undefined;

        service.createUser(payload);

        const sub = service.localUser$.subscribe((user) => {
          result = user;
        });

        tick(1_000);
        sub.unsubscribe();

        expect(result!.auth.name).toEqual(payload.auth.name);
        expect(result!.auth.authOption).toEqual(payload.auth.authOption);
        expect(result!.auth.value).toEqual(payload.auth.value);
      }));
    });

    describe('getter / setter rememberMe', () => {
      it('should return default persistance if there is NO storage saved token.', () => {
        const value = service.rememberMe;

        expect(value.type).toBeUndefined();
        expect(value.user).toBeUndefined();
        expect(value.expires).toBe(0);
      });

      it('should return session persistance if there is a token saved in storage with session persistance.', () => {
        service.rememberMe = {
          type: 'session',
          user: { name: 'xxx', authOption: 'pin', value: '1234' },
        };
        const value = service.rememberMe;

        expect(value.type).toBe('session');
        expect(value.user?.name).toBe('xxx');
      });

      it('should return local persistance if there is a token saved in storage.', () => {
        service.rememberMe = {
          type: 'local',
          user: { name: 'xxx', authOption: 'pin', value: '1234' },
        };
        const value = service.rememberMe;

        expect(value.type).toBe('local');
        expect(value.user?.name).toBe('xxx');
      });
    });

    describe('logIn()', () => {
      it('should return object with the error property if there is no account on the device', () => {
        const value = service.logIn('Example123', '1234');

        expect(value).toEqual({
          code: 'no-accounts',
          message: 'No Accounts on the device',
        });
      });

      it('should return object with the error property if there is no account with that parameters', () => {
        service.createUser({
          auth: {
            name: 'Example',
            authOption: 'pin',
            value: '1234',
          },
        });

        const value = service.logIn('Example123', '1234');

        expect(value).toEqual({
          code: 'invalid-passkey',
          message: 'Invalid credentials',
        });
      });

      it('should call loadUserData() if the user has been found', () => {
        service.createUser({
          auth: {
            name: 'Example',
            authOption: 'pin',
            value: '1234',
          },
        });
        const loadUserDataSpy = spyOn(service as any, '_loadUserData');

        service.logIn('Example', '1234');

        expect(loadUserDataSpy).toHaveBeenCalled();
      });

      it(`should set persistance if it's passed as an argument and call loadUserData()`, () => {
        service.createUser({
          auth: {
            name: 'Example',
            authOption: 'pin',
            value: '1234',
          },
        });
        const loadUserDataSpy = spyOn(service as any, '_loadUserData');
        const setExpirationSpy = spyOn(service as any, '_setExpiration');

        service.logIn('Example', '1234', 'session');

        expect(loadUserDataSpy).toHaveBeenCalled();
        expect(setExpirationSpy).toHaveBeenCalled();
      });
    });

    describe('logout()', () => {
      it(`should call _noLoggedInUser() if no user is logged in.`, () => {
        // Arrange
        const spy = spyOn(service as any, '_noLoggedInUser');

        // Act
        service.logOut();

        // Assert
        expect(spy).toHaveBeenCalled();
      });

      it('should call removeCurrentUser() and redirect to guest page', () => {
        service['_localUserSubject$'].next(user);
        const removeCurrentUserSpy = spyOn(
          service as any,
          '_removeCurrentUser'
        );
        const redirectToLoginPageSpy = spyOn(
          service as any,
          '_redirectToLoginPage'
        );

        service.logOut();

        expect(removeCurrentUserSpy).toHaveBeenCalled();
        expect(redirectToLoginPageSpy).toHaveBeenCalled();
      });
    });

    describe('modifyCurrentUser()', () => {
      let payload: LocalUserAccount;

      beforeEach(() => {
        payload = user;
      });

      it('should use existing user data and override only what has been modified.', fakeAsync(() => {
        // Arrange
        const errorSpy = spyOn(console, 'error').and.stub();
        const noLoggedInUser = spyOn(service as any, '_noLoggedInUser');

        service['_allUsers'] = [user];
        service['_localUserSubject$'].next(user);

        let result: LocalUserAccount | null | undefined = undefined;

        // Act
        const modifyCurrentUserResult = service.modifyCurrentUser(payload);
        const subscription = service.localUser$.subscribe((user) => {
          result = user;
        });
        tick(1_000);
        subscription.unsubscribe();

        // Assert
        expect(errorSpy).not.toHaveBeenCalled();
        expect(noLoggedInUser).not.toHaveBeenCalled();
        expect(modifyCurrentUserResult).toBeTrue();
        expect(result!).toEqual(payload);
      }));

      it('should leave other users untouched.', fakeAsync(() => {
        // Arrange
        const errorSpy = spyOn(console, 'error').and.stub();
        const noLoggedInUser = spyOn(service as any, '_noLoggedInUser');

        service['_allUsers'] = [
          user,
          {
            ...user,
            auth: {
              name: 'Other name',
              authOption: 'password',
              value: 'example-password',
            },
          },
        ];
        service['_localUserSubject$'].next(user);

        let result: LocalUserAccount | null | undefined = undefined;

        // Act
        const modifyCurrentUserResult = service.modifyCurrentUser(payload);
        const subscription = service.localUser$.subscribe((user) => {
          result = user;
        });
        tick(1_000);
        subscription.unsubscribe();

        // Assert
        expect(errorSpy).not.toHaveBeenCalled();
        expect(noLoggedInUser).not.toHaveBeenCalled();
        expect(modifyCurrentUserResult).toBeTrue();
        expect(result!).toEqual(payload);
      }));

      it('should log the error when tried to override non existing user', () => {
        const spy = spyOn(console, 'error').and.stub();

        service.modifyCurrentUser(payload);

        expect(spy).toHaveBeenCalled();
      });

      it('should log the error when no account exist', () => {
        service['_loadUserData']({} as LocalUserAccount);
        const spy = spyOn(console, 'error').and.stub();

        service.modifyCurrentUser(payload);

        expect(spy).toHaveBeenCalled();
      });
    });
  });

  describe(`deleteGroup()`, () => {
    it(`should return false and call _noLoggedInUser when no user is logged in.`, () => {
      // Arrange
      const spy = spyOn(service as any, '_noLoggedInUser').and.stub();

      // Act
      const result = service.deleteGroup('group');

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(result).toBeFalse();
    });

    it(`should return false and log a warning of no groups in storage.`, () => {
      // Arrange
      service['_localUserSubject$'].next({
        groups: [] as NoteGroupModel[],
      } as LocalUserAccount);
      const spy = spyOn(console, 'warn').and.stub();

      // Act
      const result = service.deleteGroup('group');

      // Assert
      expect(spy).toHaveBeenCalledWith('No groups in storage');
      expect(result).toBeFalse();
    });

    it(`should return true if group has been deleted.`, () => {
      // Arrange
      service['_localUserSubject$'].next(user);
      service['_allUsers'] = [user];

      // Act
      const result = service.deleteGroup('example-id');

      const groupsCount = service['_localUserSubject$'].value?.groups.length;

      // Assert
      expect(result).toBeTrue();
      expect(groupsCount).toBe(0);
    });
  });

  describe(`doesAccountExist()`, () => {
    it(`should return false if a user with given accountName doesn't exist.`, () => {
      // Arrange
      service['_allUsers'] = [user];

      // Act
      const result = service.doesAccountExist('example-name');

      // Assert
      expect(result).toBeFalse();
    });

    it(`should return true if a user with given accountName does exist.`, () => {
      // Arrange
      service['_allUsers'] = [user];

      // Act
      const result = service.doesAccountExist(user.auth.name);

      // Assert
      expect(result).toBeTrue();
    });
  });

  describe(`_redirectToLoginPage()`, () => {
    it(`should call router.navigateByUrl to login page.`, () => {
      // Arrange
      const spy = routerMock.navigateByUrl.and.stub();

      // Act
      service['_redirectToLoginPage']();

      // Assert
      expect(spy).toHaveBeenCalledWith('/guest/force=login');
    });
  });

  describe(`_checkForPersistedUser()`, () => {
    it(`should return undefined if there is no persisted user.`, () => {
      // Arrange
      // Act
      const result = service['_checkForPersistedUser']();

      // Assert
      expect(result).toBeUndefined();
    });

    it(`should return undefined and call localStorageService.removeFromStorage() if stored user data is invalid.`, () => {
      // Arrange
      service.rememberMe = {
        type: 'local',
        user: user.auth,
      };
      spyOn(service, 'validateUser').and.returnValue({
        code: 'invalid-passkey',
        message: 'Invalid credentials',
      });
      const spy = spyOn(service as any, '_removeRememberMeToken');

      // Act
      const result = service['_checkForPersistedUser']();

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it(`should return undefined and call localStorageService.removeFromStorage() if stored user data is invalid.`, () => {
      // Arrange
      service.rememberMe = {
        type: 'local',
        user: user.auth,
      };
      service['_allUsers'] = [user];

      // Act
      const result = service['_checkForPersistedUser']();

      // Assert
      expect(result).toEqual(user);
    });
  });
});
