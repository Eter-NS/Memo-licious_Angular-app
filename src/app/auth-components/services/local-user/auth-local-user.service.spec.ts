import { TestBed } from '@angular/core/testing';

import { AuthLocalUserService } from './auth-local-user.service';
import { LocalStorageService } from 'src/app/reusable/localStorage/local-storage.service';
import { Router } from '@angular/router';
import { LocalUserData } from '../Models/UserDataModels';
import { Observer } from 'rxjs';

describe('AuthLocalUserService', () => {
  const localStorageServiceMock = {
    loadFromStorage: jasmine
      .createSpy(
        'loadFromStorage',
        LocalStorageService.prototype.loadFromStorage
      )
      .and.callThrough(),
    saveToStorage: jasmine
      .createSpy('saveToStorage', LocalStorageService.prototype.saveToStorage)
      .and.callThrough(),
  };
  const routerMock = {
    navigateByUrl: jasmine.createSpy(
      'navigateByUrl',
      Router.prototype.navigateByUrl
    ),
  };
  let service: AuthLocalUserService;

  beforeEach(() => {
    localStorage.clear();

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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createUser()', () => {
    let payload: LocalUserData;

    beforeEach(() => {
      payload = {
        auth: {
          name: 'Example',
          authOption: 'pin',
          value: '1234',
        },
        groups: {},
      };
    });

    it('should create user if there is no other account on the device', () => {
      let data: LocalUserData = {} as LocalUserData;

      service.createUser(payload);

      const sub = service.getCurrentUser().subscribe((user) => {
        data = user;
      });
      sub.unsubscribe();
      expect(data).toEqual(payload);
    });

    it('should create user if there are other accounts on the device', () => {
      const payload2: LocalUserData = JSON.parse(JSON.stringify(payload));
      payload2.auth.name = 'Example2';
      let data: LocalUserData = {} as LocalUserData;

      service.createUser(payload);
      service.createUser(payload2);

      const sub = service.getCurrentUser().subscribe((user) => {
        data = user;
      });
      sub.unsubscribe();
      expect(data.auth.name).toBe(payload2.auth.name);
    });

    it('should return object with error property if there is an account with the same auth.name', () => {
      service.createUser(payload);
      const error = service.createUser(payload);

      expect(error).toEqual({ error: 'Account already exists' });
    });

    describe('getCurrentUser()', () => {
      it('should return latest user data', () => {
        const payload: LocalUserData = {
          auth: {
            name: 'Example',
            authOption: 'pin',
            value: '1234',
          },
          groups: {},
        };
        let data: LocalUserData = {} as LocalUserData;

        service.createUser(payload);

        const sub = service.getCurrentUser().subscribe((user) => (data = user));
        sub.unsubscribe();
        expect(data).toEqual(payload);
      });

      it(`should not call the next method when getCurrentUser() does not contain user's data`, () => {
        const payload: LocalUserData = {
          auth: {
            name: 'Example',
            authOption: 'pin',
            value: '1234',
          },
          groups: {},
        };
        let data: LocalUserData = {} as LocalUserData;
        const xyz: Partial<Observer<LocalUserData>> = {
          next: jasmine.createSpy('next'),
        };

        service.createUser(payload);
        const sub = service.getCurrentUser().subscribe((user) => {
          data = user;
        });
        sub.unsubscribe();
        service.logout();
        const sub2 = service.getCurrentUser().subscribe(xyz);
        sub2.unsubscribe();

        expect(data).toEqual(payload);
        expect(xyz.next).not.toHaveBeenCalled();
      });
    });

    describe('rememberMe', () => {
      it('should return false if there is NO storage saved token', () => {
        const value = service.rememberMe;

        expect(value).toBeFalse();
      });

      it('should return false if there is a token saved in storage', () => {
        service.rememberMe = false;
        const value = service.rememberMe;

        expect(value).toBeFalse();
      });

      it('should return true if there is a token saved in storage', () => {
        service.rememberMe = true;
        const value = service.rememberMe;

        expect(value).toBeTrue();
      });
    });

    describe('logIn()', () => {
      it('should return object with the error property if there is no account on the device', () => {
        const value = service.logIn('Example123', '1234');

        expect(value).toEqual({ error: 'No Accounts on the device' });
      });

      it('should return object with the error property if there is no account with that parameters', () => {
        service.createUser({
          auth: {
            name: 'Example',
            authOption: 'pin',
            value: '1234',
          },
          groups: {},
        });

        const value = service.logIn('Example123', '1234');

        expect(value).toEqual({ error: 'Invalid credentials' });
      });

      it('should call loadUserData() if the user has been found', () => {
        service.createUser({
          auth: {
            name: 'Example',
            authOption: 'pin',
            value: '1234',
          },
          groups: {},
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loadUserDataSpy = spyOn(service as any, 'loadUserData');

        service.logIn('Example', '1234');

        expect(loadUserDataSpy).toHaveBeenCalled();
      });
    });

    describe('logout()', () => {
      it('should call removeCurrentUser() and redirect to guest page', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const removeCurrentUserSpy = spyOn(service as any, 'removeCurrentUser');
        const redirectToLoginPageSpy = spyOn(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          service as any,
          'redirectToLoginPage'
        );

        service.logout();

        expect(removeCurrentUserSpy).toHaveBeenCalled();
        expect(redirectToLoginPageSpy).toHaveBeenCalled();
      });
    });

    describe('modifyCurrentUser()', () => {
      let payload: LocalUserData;
      beforeEach(() => {
        payload = {
          auth: {
            name: 'Example',
            authOption: 'pin',
            value: '1234',
          },
          groups: {
            Test: {
              createdAt: new Date(),
              values: [
                {
                  value: 'tomato',
                  createdAt: new Date(),
                },
              ],
            },
          },
        };
      });

      it('should use existing user data and override only what has been modified', (done: DoneFn) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).loadUserData({
          auth: {
            name: 'Example',
            authOption: 'pin',
            value: '1234',
          },
          groups: {},
        } satisfies LocalUserData);

        service.modifyCurrentUser(payload);

        service.getCurrentUser().subscribe((user) => {
          expect(user).toEqual(payload);
          done();
        });
      });

      it('should log the error when tried to override non existing user', () => {
        const spy = spyOn(console, 'error');

        service.modifyCurrentUser(payload);

        expect(spy).toHaveBeenCalled();
      });

      it('should log the error when no account exist', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).loadUserData({} as LocalUserData);
        const spy = spyOn(console, 'error');

        service.modifyCurrentUser(payload);

        expect(spy).toHaveBeenCalled();
      });
    });
  });
});
