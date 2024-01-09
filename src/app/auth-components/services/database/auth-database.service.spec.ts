/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';

import { AuthDatabaseService } from './auth-database.service';
import {
  DataSnapshot,
  Database,
  DatabaseReference,
} from '@angular/fire/database';
import { AuthStateService } from '../state/auth-state.service';
import { Provider } from '@angular/core';
import { UserCredential } from '@angular/fire/auth';

describe('AuthDatabaseService', () => {
  const currentUserSpy = { email: 'example@example.com', uid: 'xxx' };
  const authStateServiceMock = {
    auth: {
      currentUser: currentUserSpy,
    },
  };
  const databaseMock = jasmine.createSpyObj<Database>([], ['app', 'type']);

  let service: AuthDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStateService,
          useValue: authStateServiceMock,
        },
        {
          provide: Database,
          useValue: databaseMock,
        },
      ] as Provider[],
    });
    service = TestBed.inject(AuthDatabaseService);
  });

  it(`should be created`, () => {
    expect(service).toBeTruthy();
  });

  describe(`databaseRegisterHandler()`, () => {
    it(`should return { errors: { noEmailProvided: true } } when no email was found in the result parameter`, async () => {
      const result = await service.databaseRegisterHandler({
        user: { email: null },
      } as UserCredential);

      expect(result.errors?.noEmailProvided).toBeTrue();
    });

    it(`should return { passed: true, registered: false } when the user is already in the database`, async () => {
      spyOn(service, 'isUserInDatabase').and.resolveTo(true);

      const result = await service.databaseRegisterHandler({
        user: { email: 'example@example.com' },
      } as UserCredential);

      expect(result.passed).toBeTrue();
      expect(result.registered).toBeFalse();
    });

    it(`should return { passed: true, registered: true } when the user is NOT in the database and the registerInDatabase() runs correctly`, async () => {
      spyOn(service, 'isUserInDatabase').and.resolveTo(false);
      spyOn(service, 'registerInDatabase').and.resolveTo(true);

      const result = await service.databaseRegisterHandler({
        user: { email: 'example@example.com' },
      } as UserCredential);

      expect(result.passed).toBeTrue();
      expect(result.registered).toBeTrue();
    });

    it(`should return { passed: true, registered: false } when the user is NOT in the database and an error occurs in registerInDatabase() or there is no email passed in parameter`, async () => {
      spyOn(service, 'isUserInDatabase').and.resolveTo(false);
      spyOn(service, 'registerInDatabase').and.resolveTo(false);

      const result = await service.databaseRegisterHandler({
        user: { email: 'example@example.com' },
      } as UserCredential);

      expect(result.passed).toBeUndefined();
      expect(result.registered).toBeUndefined();
      expect(result.errors?.sendingPostToDB).toBeTrue();
    });
  });

  describe(`isUserInDatabase()`, () => {
    it(`should return true if the user exists in the database`, async () => {
      spyOn(service as any, 'ref').and.returnValue({} as DatabaseReference);
      spyOn(service as any, 'get').and.resolveTo({
        exists: () => true,
        val: () => ({ email: authStateServiceMock.auth.currentUser.email }),
      } as DataSnapshot);

      const result = await service.isUserInDatabase(
        authStateServiceMock.auth.currentUser.uid
      );

      expect(result).toBeTrue();
    });

    it(`should return false if the user does NOT exist in the database`, async () => {
      spyOn(service as any, 'ref').and.returnValue({} as DatabaseReference);
      spyOn(service as any, 'get').and.resolveTo({
        exists: () => false,
      } as DataSnapshot);

      const result = await service.isUserInDatabase(
        authStateServiceMock.auth.currentUser.uid
      );

      expect(result).toBeFalse();
    });

    it(`should return undefined if an error occurred during method execution`, async () => {
      spyOn(service as any, 'ref').and.returnValue({} as DatabaseReference);
      spyOn(service as any, 'get').and.rejectWith({
        code: 'xxx',
        message: 'No Internet connection',
      });

      const result = await service.isUserInDatabase(
        authStateServiceMock.auth.currentUser.uid
      );

      expect(result).toBeUndefined();
    });
  });

  describe(`registerInDatabase()`, () => {
    it(`should return true if user is being registered in the database`, async () => {
      spyOn(service as any, 'ref').and.returnValue({} as DatabaseReference);
      spyOn(service as any, 'set').and.resolveTo();

      const result = await service.registerInDatabase(
        null,
        authStateServiceMock.auth.currentUser.email,
        null
      );

      expect(result).toBeTrue();
    });

    it(`should return false if an error occurred during method execution`, async () => {
      spyOn(service as any, 'ref').and.returnValue({} as DatabaseReference);
      spyOn(service as any, 'set').and.rejectWith({
        code: 'xxx',
        message: 'No Internet connection',
      });

      const result = await service.registerInDatabase(
        null,
        authStateServiceMock.auth.currentUser.email,
        null
      );

      expect(result).toBeFalse();
    });
  });
});
