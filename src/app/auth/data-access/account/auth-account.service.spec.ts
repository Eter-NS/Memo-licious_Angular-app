/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { AuthAccountService } from '../account/auth-account.service';
import { AuthStateService } from '../state/auth-state.service';
import { AuthDatabaseService } from '../database/auth-database.service';
import { Router } from '@angular/router';
import {
  Auth,
  AuthCredential,
  EmailAuthCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthCredential,
  User,
  UserCredential,
} from '@angular/fire/auth';
import {
  FirebaseAuthError,
  UnknownError,
} from '../../utils/Models/OnlineAuthModels.interface';
import { FirebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service';
import { firebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service.mock';

describe('AuthAccountService', () => {
  let sessionSigValue: User | null | undefined = undefined;

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
    auth: {
      setPersistence: jasmine.createSpy(
        'setPersistence',
        Auth.prototype.setPersistence
      ),
      currentUser: {} as User | null,
    },
    updateSession: jasmine.createSpy(
      'updateSession',
      AuthStateService.prototype.updateSession
    ),
    sessionSig: () => sessionSigValue,
  };
  const authDatabaseServiceMock = jasmine.createSpyObj<AuthDatabaseService>([
    'databaseRegisterHandler',
  ]);
  const firebaseAuthControllerServiceMock = firebaseAuthControllerService;

  let service: AuthAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({
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
        {
          provide: FirebaseAuthControllerService,
          useValue: firebaseAuthControllerServiceMock,
        },
      ],
    });

    service = TestBed.inject(AuthAccountService);
  });

  beforeEach(() => {
    sessionSigValue = undefined;
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
      firebaseAuthControllerServiceMock.createUserWithEmailAndPassword.and.resolveTo(
        {} as UserCredential
      );
      authDatabaseServiceMock.databaseRegisterHandler.and.resolveTo({
        passed: true,
        registered: true,
      });

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
      firebaseAuthControllerServiceMock.createUserWithEmailAndPassword.and.rejectWith(
        {
          code: 'auth/email-already-in-use',
          message: 'Examples message',
        } as FirebaseAuthError
      );

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

    it('should return {errors: { unknownError }} in case of errors with message property and unknown code.', async () => {
      firebaseAuthControllerServiceMock.createUserWithEmailAndPassword.and.rejectWith(
        {
          code: 'exampleError',
          message: 'Examples message',
        } as UnknownError
      );

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

    it('should return {errors: { unknownError }} in case of other errors without message property.', async () => {
      const spy = spyOn(console, 'error').and.stub();
      firebaseAuthControllerServiceMock.createUserWithEmailAndPassword.and.rejectWith(
        {
          code: 'exampleError',
          msg: 'Examples message',
        }
      );

      const result = await service.signupWithEmail(
        'example@example.com',
        'zaq1@WSX',
        {
          displayName: 'Example',
        }
      );

      expect(spy).toHaveBeenCalled();
      expect(result.passed).toBeUndefined();
      expect(result.registered).toBeUndefined();
      expect(result.errors?.unknownError?.message).toBe('Unknown Error');
    });
  });

  describe('signInWithEmail()', () => {
    it('should return {passed: true} if the user is verified', async () => {
      firebaseAuthControllerServiceMock.signInWithEmailAndPassword.and.resolveTo(
        {
          user: { emailVerified: true },
        } as UserCredential
      );

      const result = await service.signInWithEmail(
        'example@example.com',
        'zaq1@WSX'
      );

      expect(result.passed).toBeTrue();
      expect(result.registered).toBeUndefined();
      expect(result.errors).toBeUndefined();
    });

    it('should return { errors: { unverifiedEmail: true } } if the user is NOT verified', async () => {
      firebaseAuthControllerServiceMock.signInWithEmailAndPassword.and.resolveTo(
        {
          user: { emailVerified: false },
        } as UserCredential
      );

      const result = await service.signInWithEmail(
        'example@example.com',
        'zaq1@WSX'
      );

      expect(result.passed).toBeUndefined();
      expect(result.registered).toBeUndefined();
      expect(result.errors?.unverifiedEmail).toBeTrue();
    });

    it('should return { errors: { emailDoesNotExist: true } } if the user does NOT exist', async () => {
      firebaseAuthControllerServiceMock.signInWithEmailAndPassword.and.rejectWith(
        {
          code: 'auth/user-not-found',
          message: 'Example message',
        } as FirebaseAuthError
      );

      const result = await service.signInWithEmail(
        'example@example.com',
        'zaq1@WSX'
      );

      expect(result.passed).toBeUndefined();
      expect(result.registered).toBeUndefined();
      expect(result.errors?.emailDoesNotExist).toBeTrue();
    });

    it('should return { errors: { emailDoesNotExist: true } } if the user does NOT exist', async () => {
      firebaseAuthControllerServiceMock.signInWithEmailAndPassword.and.rejectWith(
        {
          code: 'auth/wrong-password',
          message: 'Example message',
        } as FirebaseAuthError
      );

      const result = await service.signInWithEmail(
        'example@example.com',
        'zaq1@WSX'
      );

      expect(result.passed).toBeUndefined();
      expect(result.registered).toBeUndefined();
      expect(result.errors?.wrongEmailOrPassword).toBeTrue();
    });

    it('should return {errors: { unknownError }} if case of other errors', async () => {
      firebaseAuthControllerServiceMock.signInWithEmailAndPassword.and.rejectWith(
        {
          code: 'exampleError',
          message: 'Example message',
        } as UnknownError
      );

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
    it(`should call signInWithPopup() if the user's device is mobile (smartphone/tablet)`, async () => {
      spyOn(service, '_isMobileDevice').and.returnValue(true);
      await service.continueWithGoogle();

      expect(
        firebaseAuthControllerServiceMock.signInWithRedirect
      ).toHaveBeenCalled();
    });

    it(`should call signInWithRedirect() if the user's device is laptop/desktop`, async () => {
      spyOn(service, '_isMobileDevice').and.returnValue(false);
      await service.continueWithGoogle();

      expect(
        firebaseAuthControllerServiceMock.signInWithPopup
      ).toHaveBeenCalled();
    });

    it(`should return {passed: true, registered: true} if user was signed up with a provider`, async () => {
      spyOn(service, '_isMobileDevice').and.returnValue(false);
      firebaseAuthControllerServiceMock.signInWithPopup.and.resolveTo({
        user: {
          uid: '123',
          emailVerified: true,
        },
      } as UserCredential);
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
      firebaseAuthControllerServiceMock.getRedirectResult.and.resolveTo(
        {} as UserCredential
      );
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
      firebaseAuthControllerServiceMock.getRedirectResult.and.resolveTo(null);

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
      sessionSigValue = null;

      service.signOutUser();

      expect(firebaseAuthControllerServiceMock.signOut).not.toHaveBeenCalled();
    });

    it('should call signOut() if there is user logged in', () => {
      sessionSigValue = {} as User;

      service.signOutUser();

      expect(firebaseAuthControllerServiceMock.signOut).toHaveBeenCalled();
    });
  });

  describe('changeUserProfileData()', () => {
    beforeEach(() => {
      authStateServiceMock.auth.currentUser = {} as User;
    });

    it(`should log an error when no user is logged in.`, async () => {
      authStateServiceMock.auth.currentUser = null;
      const spy = spyOn(console, 'error').and.stub();

      const result = await service.changeUserProfileData({
        displayName: 'Example Name',
      });

      expect(spy).toHaveBeenCalledWith(
        'changeUserProfileData ',
        'No user logged in'
      );
      expect(result).toBeFalse();
    });

    it(`should log an error when unknown error occurs.`, async () => {
      sessionSigValue = {} as User;
      const errorObject = { msg: 'Example error' };
      firebaseAuthControllerServiceMock.updateProfile.and.rejectWith(
        errorObject
      );
      const spy = spyOn(console, 'error').and.stub();

      const result = await service.changeUserProfileData({
        displayName: 'Example Name',
      });

      expect(spy).toHaveBeenCalledWith('changeUserProfileData ', errorObject);
      expect(result).toBeFalse();
    });

    it(`should log the error "No options provided" when options parameter does not have properties`, async () => {
      sessionSigValue = {} as User;
      const spy = spyOn(console, 'error').and.stub();

      await service.changeUserProfileData({});

      expect(spy).toHaveBeenCalledWith('No options provided.');
    });

    it(`should call updateProfile() if its parameters are truthy`, async () => {
      sessionSigValue = {} as User;

      await service.changeUserProfileData({ displayName: 'Example Name' });

      expect(
        firebaseAuthControllerServiceMock.updateProfile
      ).toHaveBeenCalled();
    });

    it(`should return true when user profile is updated successfully.`, async () => {
      sessionSigValue = {} as User;
      firebaseAuthControllerServiceMock.updateProfile.and.resolveTo();

      const result = await service.changeUserProfileData({
        displayName: 'Example Name',
      });

      expect(result).toBeTrue();
    });
  });

  describe(`updateEmail()`, () => {
    it(`should return errors property when user is not logged in.`, async () => {
      // Arrange
      sessionSigValue = null;

      // Act
      const result = await service.updateEmail(
        'example-password',
        'current-email',
        'new-email'
      );

      // Assert
      expect(result.passed).toBeUndefined();
      expect(result.errors?.unknownError?.message).toBe('No user logged in');
    });

    it(`should return { errors: unknownError: { code: 'Unknown', message: 'Unknown Error' } } when the error does not contain message property.`, async () => {
      // Arrange
      sessionSigValue = {} as User;
      firebaseAuthControllerServiceMock.updateEmail.and.rejectWith({
        msg: 'example message',
      });

      // Act
      const result = await service.updateEmail(
        'example-password',
        'current-email',
        'new-email'
      );

      // Assert
      expect(result.passed).toBeUndefined();
      expect(result.errors?.unknownError?.message).toBe('Unknown Error');
    });

    it(`should return { passed: true } if email has been updated without auth/requires-recent-login error.`, async () => {
      // Arrange
      sessionSigValue = {} as User;
      const spy = firebaseAuthControllerServiceMock.updateEmail.and.resolveTo();

      // Act
      const result = await service.updateEmail(
        'example-password',
        'current-email',
        'new-email'
      );

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(result.passed).toBeTrue();
      expect(result.registered).toBeUndefined();
      expect(result.errors).toBeUndefined();
    });

    it(`should return { passed: true } if email has been updated after re-authentication.`, async () => {
      // Arrange
      sessionSigValue = {} as User;
      const updateEmailSpy =
        firebaseAuthControllerServiceMock.updateEmail.and.rejectWith({
          code: 'auth/requires-recent-login',
          message: 'Example message',
        });
      const reauthenticateUserSpy = spyOn(
        service as any,
        '_reauthenticateUser'
      ).and.callFake(async () => {
        updateEmailSpy.and.resolveTo();
      });

      // Act
      const result = await service.updateEmail(
        'example-password',
        'current-email',
        'new-email'
      );

      // Assert
      expect(updateEmailSpy).toHaveBeenCalled();
      expect(reauthenticateUserSpy).toHaveBeenCalled();
      expect(result.passed).toBeTrue();
      expect(result.registered).toBeUndefined();
      expect(result.errors).toBeUndefined();
    });
  });

  describe(`updatePassword()`, () => {
    it(`should return errors if no user is logged in.`, async () => {
      // Arrange
      sessionSigValue = null;

      // Act
      const result = await service.updatePassword(
        'existing-password',
        'new-password'
      );

      // Assert
      expect(result.passed).toBeUndefined();
      expect(result.registered).toBeUndefined();
      expect(result.errors?.unknownError?.message).toBe('No user logged in');
    });

    it(`should return { errors: unknownError: { code: 'Unknown', message: 'Unknown Error' } } when the error does not contain message property.`, async () => {
      // Arrange
      sessionSigValue = {} as User;
      firebaseAuthControllerServiceMock.updatePassword.and.rejectWith({
        msg: 'example message',
      });

      // Act
      const result = await service.updatePassword(
        'current-password',
        'new-password'
      );

      // Assert
      expect(result.passed).toBeUndefined();
      expect(result.errors?.unknownError?.message).toBe('Unknown Error');
    });

    it(`should return { passed: true } if email has been updated without auth/requires-recent-login error.`, async () => {
      // Arrange
      sessionSigValue = {} as User;
      const spy =
        firebaseAuthControllerServiceMock.updatePassword.and.resolveTo();

      // Act
      const result = await service.updatePassword(
        'current-password',
        'new-password'
      );

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(result.passed).toBeTrue();
      expect(result.registered).toBeUndefined();
      expect(result.errors).toBeUndefined();
    });

    it(`should return { passed: true } if email has been updated after re-authentication.`, async () => {
      // Arrange
      sessionSigValue = {} as User;
      const updatePasswordSpy =
        firebaseAuthControllerServiceMock.updatePassword.and.rejectWith({
          code: 'auth/requires-recent-login',
          message: 'Example message',
        });
      const reauthenticateUserSpy = spyOn(
        service as any,
        '_reauthenticateUser'
      ).and.callFake(async () => {
        updatePasswordSpy.and.resolveTo();
      });

      // Act
      const result = await service.updatePassword(
        'current-password',
        'new-password'
      );

      // Assert
      expect(updatePasswordSpy).toHaveBeenCalled();
      expect(reauthenticateUserSpy).toHaveBeenCalled();
      expect(result.passed).toBeTrue();
      expect(result.registered).toBeUndefined();
      expect(result.errors).toBeUndefined();
    });
  });

  describe(`_getUser()`, () => {
    it(`should throw noUser error if no user is logged in.`, () => {
      // Arrange
      sessionSigValue = null;

      // Act
      // Assert
      expect(() => service['_getUser']()).toThrow();
    });

    it(`should return currently logged in user.`, () => {
      // Arrange
      sessionSigValue = {} as User;

      // Act
      const result = service['_getUser']();

      // Assert
      expect(typeof result).toBe('object');
    });
  });

  describe(`_reauthenticateUser()`, () => {
    it(`should reject in case of unsupported provider.`, async () => {
      // Arrange
      const spy =
        firebaseAuthControllerServiceMock.reauthenticateWithCredential;
      const user = {
        providerData: [{ providerId: 'different-provider' }],
      } as User;
      // Act
      // Assert
      await expectAsync(
        service['_reauthenticateUser'](
          user,
          'current-password',
          'current-email'
        )
      ).toBeRejectedWithError('Unsupported auth provider');
      expect(spy).not.toHaveBeenCalled();
    });

    it(`should call _googleReauthenticate() if providerId is equal to 'google.com'.`, async () => {
      // Arrange
      const spy = spyOn(service as any, '_googleReauthenticate').and.resolveTo(
        {} as AuthCredential
      );
      const user = { providerData: [{ providerId: 'google.com' }] } as User;

      // Act
      await service['_reauthenticateUser'](
        user,
        'example-password',
        'example-email'
      );

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    it(`should call _emailReauthenticate() if providerId is equal to 'password'.`, async () => {
      // Arrange
      const spy = spyOn(service as any, '_emailReauthenticate').and.returnValue(
        {} as EmailAuthCredential
      );
      const user = { providerData: [{ providerId: 'password' }] } as User;

      // Act
      await service['_reauthenticateUser'](
        user,
        'example-password',
        'example-email'
      );

      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`_googleReauthenticate()`, () => {
    it(`should reject if fireAuthController.signInWithPopup throws an error.`, async () => {
      // Arrange
      firebaseAuthControllerServiceMock.signInWithPopup.and.rejectWith({
        code: 'example-error-code',
        message: 'Something went wrong',
      });
      const spy = spyOn(GoogleAuthProvider, 'credential');

      // Act
      // Assert
      await expectAsync(service['_googleReauthenticate']()).toBeRejected();
      expect(spy).not.toHaveBeenCalled();
    });

    it(`should reject if GoogleAuthProvider.credentialFromResult returns null.`, async () => {
      // Arrange
      firebaseAuthControllerServiceMock.signInWithPopup.and.resolveTo(
        {} as UserCredential
      );
      spyOn(GoogleAuthProvider, 'credentialFromResult').and.returnValue(null);
      const spy = spyOn(GoogleAuthProvider, 'credential');

      // Act
      // Assert
      await expectAsync(service['_googleReauthenticate']()).toBeRejectedWith({
        code: 'noDataFromPopup',
        message:
          'The popup has been closed without authenticating, or an error occurred during validation.',
      });
      expect(spy).not.toHaveBeenCalled();
    });

    it(`should return OAuthCredential if the method runs successfully.`, async () => {
      // Arrange
      firebaseAuthControllerServiceMock.signInWithPopup.and.resolveTo({
        user: {} as User,
      } as UserCredential);
      spyOn(GoogleAuthProvider, 'credentialFromResult').and.returnValue(
        {} as OAuthCredential
      );
      const spy = spyOn(GoogleAuthProvider, 'credential').and.returnValue({
        idToken: 'xxx',
      } as OAuthCredential);

      // Act
      const result = await service['_googleReauthenticate']();

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(result.idToken).toEqual('xxx');
    });
  });

  describe(`_emailReauthenticate()`, () => {
    it(`should throw { noEmailProvided: true } when no email is provided.`, async () => {
      // Arrange
      // Act
      // Assert
      expect(() => service['_emailReauthenticate']('', '')).toThrow({
        noEmailProvided: true,
      });
    });

    it(`should throw noPassword error when no password is provided.`, async () => {
      // Arrange
      // Act
      // Assert
      expect(() =>
        service['_emailReauthenticate']('example-email', '')
      ).toThrow({
        code: 'noPassword',
        message: 'No password provided',
      });
    });

    it(`should return EmailAuthCredential if method runs successfully.`, () => {
      // Arrange
      const spy = spyOn(EmailAuthProvider, 'credential').and.returnValue({
        providerId: 'xxx',
      } as EmailAuthCredential);

      // Act
      const result = service['_emailReauthenticate'](
        'example-email',
        'example-password'
      );

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(result.providerId).toEqual('xxx');
    });
  });

  describe(`_createGoogleProvider()`, () => {
    it(`should create a Google provider with added scopes.`, () => {
      // Arrange
      // Act
      const result = service['_createGoogleProvider']();

      // Assert
      expect(result instanceof GoogleAuthProvider).toBeTruthy();
    });
  });

  describe(`_handleAuthError()`, () => {
    it(`should return null if the error is not AuthError.`, () => {
      // Arrange
      // Act
      const result = service['_handleAuthError']({});

      // Assert
      expect(result).toBeNull();
    });

    it(`should return an error from a dictionary if error.code matched one of described codes.`, () => {
      // Arrange
      // Act
      const result = service['_handleAuthError']({
        code: 'auth/user-not-found',
        message: 'Example message',
      });

      // Assert
      expect(result?.errors.emailDoesNotExist).toBeTrue();
    });

    it(`should return an error from the object provided to the method.`, () => {
      // Arrange
      // Act
      const result = service['_handleAuthError']({
        code: 'example-code',
        message: 'Example message',
      });

      // Assert
      expect(result?.errors.unknownError?.code).toBe('example-code');
    });
  });

  describe(`_devErrorLog()`, () => {
    it(`should log an error to the console only in development mode.`, () => {
      // Arrange
      const spy = spyOn(console, 'error').and.stub();
      const message = 'Example message';

      // Act
      service['_devErrorLog'](message);

      // Assert
      expect(spy).toHaveBeenCalledWith(message);
    });
  });

  describe(`_catchResolve()`, () => {
    it(`should return code 'Unknown' if the error doesn't match.`, () => {
      // Arrange
      const message = 'Example message';

      // Act
      const result = service['_catchResolve'](message);

      // Assert
      expect(result.errors.unknownError?.code).toBe('Unknown');
    });

    it(`should return error prepared by _handleAuthError() if the error matches.`, () => {
      // Arrange
      const message = { code: 'example-code', message: 'Example message' };

      // Act
      const result = service['_catchResolve'](message);

      // Assert
      expect(result.errors.unknownError?.code).toBe('example-code');
    });
  });
});
