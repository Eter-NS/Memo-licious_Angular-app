/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { AuthAccountService } from '../account/auth-account.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthStateService } from '../state/auth-state.service';
import { AuthDatabaseService } from '../database/auth-database.service';
import { Router } from '@angular/router';
import { Auth, User, UserCredential } from '@angular/fire/auth';
import { signal } from '@angular/core';
import { FirebaseAuthError, UnknownError } from '../Models/authModels';

describe('AuthAccountService', () => {
  const routerMock = {
    navigateByUrl: jasmine.createSpy(
      'navigateByUrl',
      Router.prototype.navigateByUrl
    ),
  };
  const authStateServiceMock = {
    checkUserSession: jasmine.createSpy(
      'checkUserSession',
      AuthStateService.prototype.checkUserSession
    ),
    session: signal<UserCredential | null | undefined>(undefined),
    auth: {
      setPersistence: jasmine.createSpy(
        'setPersistence',
        Auth.prototype.setPersistence
      ),
      currentUser: {} as User | null,
    },
  };
  const authDatabaseServiceMock = {
    databaseRegisterHandler: jasmine.createSpy(
      'databaseRegisterHandler',
      AuthDatabaseService.prototype.databaseRegisterHandler
    ),
  };

  let service: AuthAccountService;

  let createUserWithEmailAndPasswordSpy: jasmine.Spy<any>;
  let signInWithEmailAndPasswordSpy: jasmine.Spy<any>;
  let signInWithRedirectSpy: jasmine.Spy<any>;
  let signInWithPopupSpy: jasmine.Spy<any>;
  let getRedirectResultSpy: jasmine.Spy<any>;
  let signOutSpy: jasmine.Spy<any>;
  let updateProfileSpy: jasmine.Spy<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: AuthStateService,
          useValue: authStateServiceMock,
        },
        {
          provide: AuthDatabaseService,
          useValue: authDatabaseServiceMock,
        },
      ],
    });
    service = TestBed.inject(AuthAccountService);

    createUserWithEmailAndPasswordSpy = spyOn(
      service as any,
      'createUserWithEmailAndPassword'
    );
    signInWithEmailAndPasswordSpy = spyOn(
      service as any,
      'signInWithEmailAndPassword'
    );
    signInWithRedirectSpy = spyOn(service as any, 'signInWithRedirect');
    signInWithPopupSpy = spyOn(service as any, 'signInWithPopup');
    getRedirectResultSpy = spyOn(service as any, 'getRedirectResult');
    signOutSpy = spyOn(service as any, 'signOut');
    updateProfileSpy = spyOn(service as any, 'updateProfile');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signupWithEmail()', () => {
    it('should return noDisplayNameProvided error if options.displayName was NOT provided', async () => {
      const result = await service.signupWithEmail(
        'example@example.com',
        'zaq1@WSX',
        {}
      );

      expect(result.errors?.unknownError?.code).toBe('noDisplayNameProvided');
    });

    it('should return {passed: true, registered: true} if user has been signed up', async () => {
      authDatabaseServiceMock.databaseRegisterHandler.and.resolveTo({
        passed: true,
        registered: true,
      });
      createUserWithEmailAndPasswordSpy.and.resolveTo({});

      const result = await service.signupWithEmail(
        'example@example.com',
        'zaq1@WSX',
        {
          displayName: 'Example',
        }
      );

      expect(result.passed).toBeTrue();
      expect(result.registered).toBeTrue();
      expect(result.errors).toBeUndefined();
    });

    it('should return { errors: { alreadyInUseError: true } } if there is such user already', async () => {
      createUserWithEmailAndPasswordSpy.and.rejectWith({
        code: 'auth/email-already-in-use',
        message: 'Examples message',
      } as FirebaseAuthError);

      const result = await service.signupWithEmail(
        'example@example.com',
        'zaq1@WSX',
        {
          displayName: 'Example',
        }
      );

      expect(result.passed).toBeUndefined();
      expect(result.registered).toBeUndefined();
      expect(result.errors?.alreadyInUseError).toBeTrue();
    });

    it('should return {errors: { unknownError }} in case of other errors', async () => {
      createUserWithEmailAndPasswordSpy.and.rejectWith({
        code: 'exampleError',
        message: 'Examples message',
      } as UnknownError);

      const result = await service.signupWithEmail(
        'example@example.com',
        'zaq1@WSX',
        {
          displayName: 'Example',
        }
      );

      expect(result.passed).toBeUndefined();
      expect(result.registered).toBeUndefined();
      expect(result.errors?.unknownError).toBeTruthy();
    });
  });

  describe('signInWithEmail()', () => {
    it('should return {passed: true} if the user is verified', async () => {
      signInWithEmailAndPasswordSpy.and.resolveTo({
        user: { emailVerified: true },
      });

      const result = await service.signInWithEmail(
        'example@example.com',
        'zaq1@WSX'
      );

      expect(result.passed).toBeTrue();
      expect(result.registered).toBeUndefined();
      expect(result.errors).toBeUndefined();
    });

    it('should return { errors: { unverifiedEmail: true } } if the user is NOT verified', async () => {
      signInWithEmailAndPasswordSpy.and.resolveTo({
        user: { emailVerified: false },
      });

      const result = await service.signInWithEmail(
        'example@example.com',
        'zaq1@WSX'
      );

      expect(result.passed).toBeUndefined();
      expect(result.registered).toBeUndefined();
      expect(result.errors?.unverifiedEmail).toBeTrue();
    });

    it('should return { errors: { emailDoesNotExist: true } } if the user does NOT exist', async () => {
      signInWithEmailAndPasswordSpy.and.rejectWith({
        code: 'auth/user-not-found',
        message: 'Example message',
      } as FirebaseAuthError);

      const result = await service.signInWithEmail(
        'example@example.com',
        'zaq1@WSX'
      );

      expect(result.passed).toBeUndefined();
      expect(result.registered).toBeUndefined();
      expect(result.errors?.emailDoesNotExist).toBeTrue();
    });

    it('should return { errors: { emailDoesNotExist: true } } if the user does NOT exist', async () => {
      signInWithEmailAndPasswordSpy.and.rejectWith({
        code: 'auth/wrong-password',
        message: 'Example message',
      } as FirebaseAuthError);

      const result = await service.signInWithEmail(
        'example@example.com',
        'zaq1@WSX'
      );

      expect(result.passed).toBeUndefined();
      expect(result.registered).toBeUndefined();
      expect(result.errors?.wrongEmailOrPassword).toBeTrue();
    });

    it('should return {errors: { unknownError }} if case of other errors', async () => {
      signInWithEmailAndPasswordSpy.and.rejectWith({
        code: 'exampleError',
        message: 'Example message',
      } as UnknownError);

      const result = await service.signInWithEmail(
        'example@example.com',
        'zaq1@WSX'
      );

      expect(result.passed).toBeUndefined();
      expect(result.registered).toBeUndefined();
      expect(result.errors?.unknownError).toBeTruthy();
    });
  });

  describe('continueWithGoogle', () => {
    it(`should call signInWithRedirect() if the user's device is laptop/desktop`, async () => {
      spyOnProperty(navigator, 'maxTouchPoints', 'get').and.returnValue(2);
      await service.continueWithGoogle();

      expect(signInWithRedirectSpy).toHaveBeenCalled();
    });

    it(`should call signInWithPopup() if the user's device is mobile (smartphone, tablet etc.)`, async () => {
      await service.continueWithGoogle();

      expect(signInWithPopupSpy).toHaveBeenCalled();
    });

    it(`should return {passed: true, registered: true} if user was signed up with a provider`, async () => {
      authDatabaseServiceMock.databaseRegisterHandler.and.resolveTo({
        passed: true,
        registered: true,
      });

      const result = await service.continueWithGoogle();

      expect(result.passed).toBeTrue();
      expect(result.registered).toBeTrue();
      expect(result.errors).toBeUndefined();
    });

    it(`should return {passed: true, registered: false} if user was signed up previously and signed with a provider`, async () => {
      authDatabaseServiceMock.databaseRegisterHandler.and.resolveTo({
        passed: true,
        registered: false,
      });

      const result = await service.continueWithGoogle();

      expect(result.passed).toBeTrue();
      expect(result.registered).toBeFalse();
      expect(result.errors).toBeUndefined();
    });

    it(`should return {errors: { unknownError }} if an error occurred`, async () => {
      authDatabaseServiceMock.databaseRegisterHandler.and.rejectWith({
        code: 'exampleError',
        message: 'Example error message',
      } satisfies UnknownError);

      const result = await service.continueWithGoogle();

      expect(result.passed).toBeUndefined();
      expect(result.registered).toBeUndefined();
      expect(result.errors?.unknownError).toBeTruthy();
    });
  });

  describe('getDataFromRedirect()', () => {
    beforeEach(() => {
      getRedirectResultSpy.and.resolveTo({});
    });

    it(`should return {passed: true, registered: true} if user was signed up with a provider`, async () => {
      authDatabaseServiceMock.databaseRegisterHandler.and.resolveTo({
        passed: true,
        registered: true,
      });

      const result = await service.getDataFromRedirect();

      expect(result?.passed).toBeTrue();
      expect(result?.registered).toBeTrue();
      expect(result?.errors).toBeUndefined();
    });

    it(`should return {passed: true, registered: false} if user was signed up previously and signed with a provider`, async () => {
      authDatabaseServiceMock.databaseRegisterHandler.and.resolveTo({
        passed: true,
        registered: false,
      });

      const result = await service.getDataFromRedirect();

      expect(result?.passed).toBeTrue();
      expect(result?.registered).toBeFalse();
      expect(result?.errors).toBeUndefined();
    });

    it(`should return null if no data was pending from signInWithRedirect()`, async () => {
      getRedirectResultSpy.and.resolveTo(null);

      const result = await service.getDataFromRedirect();

      expect(result).toBeNull();
    });

    it(`should return {errors: { unknownError }} if an error occurred`, async () => {
      authDatabaseServiceMock.databaseRegisterHandler.and.rejectWith({
        code: 'exampleError',
        message: 'Example error message',
      } satisfies UnknownError);

      const result = await service.getDataFromRedirect();

      expect(result?.passed).toBeUndefined();
      expect(result?.registered).toBeUndefined();
      expect(result?.errors?.unknownError).toBeTruthy();
    });
  });

  describe('signOutUser()', () => {
    it('should NOT call signOut() if there is no user logged in', () => {
      authStateServiceMock.session.set(null);

      service.signOutUser();

      expect(signOutSpy).not.toHaveBeenCalled();
    });

    it('should  call signOut() if there is user logged in', () => {
      authStateServiceMock.session.set({} as UserCredential);

      service.signOutUser();

      expect(signOutSpy).toHaveBeenCalled();
    });
  });

  describe('changeUserProfileData()', () => {
    beforeEach(() => {
      authStateServiceMock.auth.currentUser = {} as User;
    });

    it(`should log the error "No user registered/logged in" when auth.currentUser is falsy`, async () => {
      authStateServiceMock.auth.currentUser = null;
      const spy = spyOn(console, 'error').and.callThrough();

      await service.changeUserProfileData({ displayName: 'Example Name' });

      expect(spy).toHaveBeenCalledWith('No user registered/logged in');
    });

    it(`should log the error "No options provided" when options parameter does not have properties`, async () => {
      const spy = spyOn(console, 'error').and.callThrough();

      await service.changeUserProfileData({});

      expect(spy).toHaveBeenCalledWith('No options provided');
    });

    it(`should call updateProfile() if its parameters are truthy`, async () => {
      await service.changeUserProfileData({ displayName: 'Example Name' });

      expect(updateProfileSpy).toHaveBeenCalled();
    });
  });

  describe('isTheDeviceMobile()', () => {
    it('should return true if the device is mobile (maxTouchPoints if state)', () => {
      spyOnProperty(navigator, 'maxTouchPoints', 'get').and.returnValue(2);

      const result = (service as any).isTheDeviceMobile();

      expect(result).toBeTrue();
    });

    it('should return false if the device is not mobile', () => {
      const result = (service as any).isTheDeviceMobile();

      expect(result).toBeFalse();
    });
  });
});
