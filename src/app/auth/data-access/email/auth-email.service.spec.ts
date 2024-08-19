/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';

import { AuthEmailService } from './auth-email.service';
import { AuthStateService } from '../state/auth-state.service';
import { Provider } from '@angular/core';
import { User } from '@angular/fire/auth';
import { FirebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service';
import { firebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service.mock';

describe('AuthEmailService', () => {
  let sessionSigValue: User | null | undefined = undefined;
  const authStateServiceMock = {
    sessionSig: () => sessionSigValue,
    auth: {},
  };
  const firebaseAuthControllerServiceMock = firebaseAuthControllerService;

  let service: AuthEmailService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStateService,
          useValue: authStateServiceMock,
        },
        {
          provide: FirebaseAuthControllerService,
          useValue: firebaseAuthControllerServiceMock,
        },
      ] satisfies Provider[],
    });
    service = TestBed.inject(AuthEmailService);
  });

  beforeEach(() => {
    sessionSigValue = undefined;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`sendVerificationEmail()`, () => {
    it(`should reject with 'No active user' when authState.sessionSig() is falsy.`, async () => {
      const spy = firebaseAuthControllerServiceMock.sendEmailVerification;

      await expectAsync(service.sendVerificationEmail()).toBeRejectedWithError(
        'No active user'
      );
      expect(spy).not.toHaveBeenCalled();
    });

    it(`should call sendEmailVerification() and return undefined if everything is ok.`, async () => {
      sessionSigValue = {} as User;
      const spy = firebaseAuthControllerServiceMock.sendEmailVerification;

      const result = await service.sendVerificationEmail();

      expect(spy).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it(`should log and reject with an error message if something went wrong (AuthError).`, async () => {
      sessionSigValue = {} as User;
      const error = {
        code: 'xxx',
        message: 'Example error',
      };
      firebaseAuthControllerServiceMock.sendEmailVerification.and.rejectWith(
        error
      );
      const spy = spyOn(console, 'error').and.stub();

      await expectAsync(service.sendVerificationEmail()).toBeRejectedWith(
        error
      );
      expect(spy).toHaveBeenCalled();
    });

    it(`should log and reject with an error message if something went wrong (new Error()).`, async () => {
      sessionSigValue = {} as User;
      const error = new Error('Example error');
      firebaseAuthControllerServiceMock.sendEmailVerification.and.rejectWith(
        error
      );
      const spy = spyOn(console, 'error').and.stub();

      await expectAsync(service.sendVerificationEmail()).toBeRejectedWith(
        error
      );
      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`sendResetEmail()`, () => {
    it(`should return false if no email is passed.`, async () => {
      const result = await service.sendResetEmail('');

      expect(result).toBe(false);
    });

    it(`should call sendPasswordResetEmail() and return true if everything is ok.`, async () => {
      firebaseAuthControllerServiceMock.sendPasswordResetEmail.and.resolveTo();

      const result = await service.sendResetEmail('example@example.com');

      expect(result).toBe(true);
    });

    it(`should log the error message if something went wrong ({code:string, message:string}).`, async () => {
      firebaseAuthControllerServiceMock.sendPasswordResetEmail.and.rejectWith({
        code: 'xxx',
        message: 'Example error',
      });
      const spy = spyOn(console, 'error').and.stub();

      await service.sendResetEmail('example@example.com');

      expect(spy).toHaveBeenCalled();
    });

    it(`should log the error message if something went wrong (new Error()).`, async () => {
      firebaseAuthControllerServiceMock.sendPasswordResetEmail.and.rejectWith(
        new Error('Example error')
      );
      const spy = spyOn(console, 'error').and.stub();

      await service.sendResetEmail('example@example.com');

      expect(spy).toHaveBeenCalled();
    });
  });
});
