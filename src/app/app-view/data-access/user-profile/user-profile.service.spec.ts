/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import {
  UserProfileService,
  UserProfileUpdateResultI,
} from './user-profile.service';
import {
  AuthUserConnectorService,
  UserType,
} from '../auth-user-connector/auth-user-connector.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { LocalUserAccount } from 'src/app/auth/utils/Models/LocalAuthModels.interface';
import { User } from '@angular/fire/auth';
import {
  UserProfile,
  UserProfileChangesI,
} from '../../utils/models/user-profile.interface';

describe('UserProfileService', () => {
  // Mocks
  let activeUser: UserType = null;
  const activeUserSubject = new BehaviorSubject<LocalUserAccount | User | null>(
    activeUser
  );
  const authUserConnectorServiceMock = {
    activeUser$: activeUserSubject.asObservable(),
    updateUser: jasmine.createSpy(
      'updateUser',
      AuthUserConnectorService.prototype.updateUser
    ),
    activeUserTypeSig: () => activeUser,
  };

  // Service
  let service: UserProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthUserConnectorService,
          useValue: authUserConnectorServiceMock,
        },
      ],
    });
    service = TestBed.inject(UserProfileService);
  });

  // Reset
  beforeEach(() => {
    activeUser = null;
    activeUserSubject.next(activeUser);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`userProfile$`, () => {
    it(`should not emit a value when activeUser is null.`, fakeAsync(() => {
      // Arrange
      let profile: UserProfile = { name: 'Non existing user' } as UserProfile;

      // Act
      const subscription = service.userProfile$.subscribe((user) => {
        profile = user;
      });

      tick(5_000);
      subscription.unsubscribe();

      // Assert
      // If the observable doesn't emit a value, the profile.name should be 'Non existing user'
      expect(profile.name).toBe('Non existing user');
    }));

    it(`should call _createUserProfile() when activeUser$ is not null.`, fakeAsync(() => {
      // Arrange
      const spy = spyOn(service as any, '_createUserProfile');

      activeUserSubject.next({} as LocalUserAccount);

      // Act
      const subscription = service.userProfile$.subscribe();

      subscription.unsubscribe();

      // Assert
      expect(spy).toHaveBeenCalled();
    }));
  });

  describe(`userProfileUpdateAction$`, () => {
    it(`should call authUserConnectorService.updateUser() when it emits a value.`, fakeAsync(() => {
      // Arrange
      const spy = authUserConnectorServiceMock.updateUser.and.resolveTo(true);

      // Act
      const subscription = service.userProfileUpdateAction$.subscribe();

      service['_userProfileUpdateSubject'].next({} as UserProfileChangesI);

      tick(5_000);
      subscription.unsubscribe();

      // Assert
      expect(spy).toHaveBeenCalled();
    }));
  });

  describe(`userProfileUpdateResult$`, () => {
    it(`should return { state: 'success' } when userProfileUpdateAction$ returns true.`, fakeAsync(() => {
      // Arrange
      let result: UserProfileUpdateResultI = {} as UserProfileUpdateResultI;
      spyOnProperty(service, 'userProfileUpdateAction$', 'get').and.returnValue(
        of(true)
      );

      // Act
      const subscription = service.userProfileUpdateResult$.subscribe((res) => {
        result = res;
      });

      tick(5_000);
      subscription.unsubscribe();

      // Assert
      expect(result).toEqual({ state: 'success' });
    }));

    it(`should return { state: 'failure' } when userProfileUpdateAction$ returns false.`, fakeAsync(() => {
      // Arrange
      let result: UserProfileUpdateResultI = {} as UserProfileUpdateResultI;
      spyOnProperty(service, 'userProfileUpdateAction$', 'get').and.returnValue(
        of(false)
      );

      // Act
      const subscription = service.userProfileUpdateResult$.subscribe((res) => {
        result = res;
      });

      tick(5_000);
      subscription.unsubscribe();

      // Assert
      expect(result).toEqual({ state: 'failure' });
    }));

    it(`should return { state: 'failure', cause: 'error message' } when an error occurs in the stream.`, fakeAsync(() => {
      // Arrange
      let result: UserProfileUpdateResultI = {} as UserProfileUpdateResultI;
      spyOnProperty(service, 'userProfileUpdateAction$', 'get').and.returnValue(
        throwError(() => ({ message: 'error message' }))
      );

      // Act
      const subscription = service.userProfileUpdateResult$.subscribe((res) => {
        result = res;
      });

      tick(5_000);
      subscription.unsubscribe();

      // Assert
      expect(result.cause).toEqual('error message');
    }));
  });

  describe(`uploadProfileChanges()`, () => {
    it(`should pass the user profile changes to the stream.`, () => {
      // Arrange
      const spy = spyOn(
        service['_userProfileUpdateSubject'],
        'next'
      ).and.callThrough();

      // Act
      service.uploadProfileChanges({} as UserProfileChangesI);

      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`_createUserProfile()`, () => {
    it(`should return a user profile without a profile color if it is an online user.`, () => {
      // Arrange
      activeUser = 'online';

      const payload = {
        photoURL: "example url to a user's photo",
        displayName: 'Example nickname',
      } as User;

      // Act
      const result = service['_createUserProfile'](payload);

      // Assert
      expect(result.profileColor).toBeUndefined();
    });

    it(`should return a user profile with a profile color if it is a local user.`, () => {
      // Arrange
      activeUser = 'local';

      const payload = {
        auth: { name: 'example name', authOption: 'pin' },
        profileColor: '#df0',
      } as LocalUserAccount;

      // Act
      const result = service['_createUserProfile'](payload);

      // Assert
      expect(typeof result.profileColor).toBe('string');
    });
  });
});
