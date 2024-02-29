/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';

import { AuthEmailService } from './auth-email.service';
import { AuthStateService } from '../state/auth-state.service';
import { Provider, signal } from '@angular/core';
import { UserCredential } from '@angular/fire/auth';

describe('AuthEmailService', () => {
  const authStateServiceMock = {
    session: signal<UserCredential | null | undefined>(undefined),
    auth: {},
  };

  let service: AuthEmailService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStateService,
          useValue: authStateServiceMock,
        },
      ] satisfies Provider[],
    });
    service = TestBed.inject(AuthEmailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`sendVerificationEmail()`, () => {
    it(`should return null when #authState.session() is falsy`, async () => {
      const spy = spyOn(service as any, `sendEmailVerification`);

      const result = await service.sendVerificationEmail();

      expect(spy).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it(`should call sendEmailVerification() and return undefined if everything is ok`, async () => {
      authStateServiceMock.session.set({} as UserCredential);
      const spy = spyOn(service as any, `sendEmailVerification`);

      const result = await service.sendVerificationEmail();

      expect(spy).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it(`should log the error message if something went wrong ({code: string, message:string})`, async () => {
      authStateServiceMock.session.set({} as UserCredential);
      spyOn(service as any, `sendEmailVerification`).and.rejectWith({
        code: 'xxx',
        message: 'Example error',
      });
      const spy = spyOn(console, 'error').and.callThrough();

      await service.sendVerificationEmail();

      expect(spy).toHaveBeenCalled();
    });

    it(`should log the error message if something went wrong (new Error())`, async () => {
      authStateServiceMock.session.set({} as UserCredential);
      spyOn(service as any, `sendEmailVerification`).and.rejectWith(
        new Error('Example error')
      );
      const spy = spyOn(console, 'error').and.callThrough();

      await service.sendVerificationEmail();

      expect(spy).toHaveBeenCalled();
    });

    afterEach(() => {
      authStateServiceMock.session.set(undefined);
    });
  });

  describe(`sendResetEmail()`, () => {
    it(`should return false if no email is passed`, async () => {
      const result = await service.sendResetEmail('');

      expect(result).toBe(false);
    });

    it(`should call sendPasswordResetEmail() and return true if everything is ok`, async () => {
      spyOn(service as any, `sendPasswordResetEmail`).and.resolveTo();

      const result = await service.sendResetEmail('example@example.com');

      expect(result).toBe(true);
    });

    it(`should log the error message if something went wrong ({code:string, message:string})`, async () => {
      spyOn(service as any, `sendPasswordResetEmail`).and.rejectWith({
        code: 'xxx',
        message: 'Example error',
      });
      const spy = spyOn(console, 'error').and.callThrough();

      await service.sendResetEmail('example@example.com');

      expect(spy).toHaveBeenCalled();
    });

    it(`should log the error message if something went wrong (new Error())`, async () => {
      spyOn(service as any, `sendPasswordResetEmail`).and.rejectWith(
        new Error('Example error')
      );
      const spy = spyOn(console, 'error').and.callThrough();

      await service.sendResetEmail('example@example.com');

      expect(spy).toHaveBeenCalled();
    });
  });
});
