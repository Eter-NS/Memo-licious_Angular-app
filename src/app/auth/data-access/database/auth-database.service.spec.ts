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
import { User, UserCredential } from '@angular/fire/auth';
import { FirebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service';
import { Observable, of } from 'rxjs';
import { FirebaseAuthError } from '../../utils/Models/OnlineAuthModels.interface';

describe('AuthDatabaseService', () => {
  // Mocks
  let sessionSigValue: User | null | undefined = undefined;
  const authStateServiceMock = {
    sessionSig: () => sessionSigValue,
    auth: { currentUser: { uid: 'example-uid', email: 'example-email' } },
  };
  const firebaseDatabaseControllerServiceMock = {
    ...jasmine.createSpyObj<FirebaseDatabaseControllerService>([
      'ref',
      'get',
      'set',
      'listVal',
      'update',
    ]),
    db: {} as Database,
  };

  // Service
  let service: AuthDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStateService, useValue: authStateServiceMock },
        {
          provide: FirebaseDatabaseControllerService,
          useValue: firebaseDatabaseControllerServiceMock,
        },
      ] as Provider[],
    });
    service = TestBed.inject(AuthDatabaseService);
  });

  beforeEach(() => {
    sessionSigValue = undefined;
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
      firebaseDatabaseControllerServiceMock.ref.and.returnValue(
        {} as DatabaseReference
      );
      firebaseDatabaseControllerServiceMock.get.and.resolveTo({
        exists: () => true,
        val: () => ({ email: authStateServiceMock.auth.currentUser.email }),
      } as DataSnapshot);

      const result = await service.isUserInDatabase(
        authStateServiceMock.auth.currentUser.uid
      );

      expect(result).toBeTrue();
    });

    it(`should return false if the user does NOT exist in the database`, async () => {
      firebaseDatabaseControllerServiceMock.ref.and.returnValue(
        {} as DatabaseReference
      );
      firebaseDatabaseControllerServiceMock.get.and.resolveTo({
        exists: () => false,
      } as DataSnapshot);

      const result = await service.isUserInDatabase(
        authStateServiceMock.auth.currentUser.uid
      );

      expect(result).toBeFalse();
    });

    it(`should return undefined if an error occurred during method execution`, async () => {
      firebaseDatabaseControllerServiceMock.ref.and.returnValue(
        {} as DatabaseReference
      );
      firebaseDatabaseControllerServiceMock.get.and.rejectWith({
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
      firebaseDatabaseControllerServiceMock.ref.and.returnValue(
        {} as DatabaseReference
      );
      firebaseDatabaseControllerServiceMock.set.and.resolveTo();

      const result = await service.registerInDatabase(
        authStateServiceMock.auth.currentUser.email,
        null
      );

      expect(result).toBeTrue();
    });

    it(`should return false if an error occurred during method execution`, async () => {
      firebaseDatabaseControllerServiceMock.ref.and.returnValue(
        {} as DatabaseReference
      );
      firebaseDatabaseControllerServiceMock.set.and.rejectWith({
        code: 'xxx',
        message: 'No Internet connection',
      });

      const result = await service.registerInDatabase(
        authStateServiceMock.auth.currentUser.email,
        null
      );

      expect(result).toBeFalse();
    });
  });

  describe(`getGroups()`, () => {
    it(`should create an Observable that emits user note groups.`, () => {
      // Arrange
      firebaseDatabaseControllerServiceMock.listVal.and.returnValue(of([]));

      // Act
      const result = service.getGroups('example-uid');

      // Assert
      expect(result instanceof Observable).toBeTrue();
    });
  });

  describe(`updateGroups()`, () => {
    it(`should return false if no user is logged in.`, async () => {
      // Arrange
      const spy = spyOn(console, 'error').and.stub();

      // Act
      const result = await service.updateGroups([]);

      // Assert
      expect(spy).toHaveBeenCalledWith('User not logged in');
      expect(result).toBeFalse();
    });

    it(`should return false if an error occurred in fireDBController.update() (AuthError).`, async () => {
      // Arrange
      const error = {
        code: 'xxx',
        message: 'No Internet connection',
      };
      sessionSigValue = { uid: 'Example-uid' } as User;
      firebaseDatabaseControllerServiceMock.update.and.rejectWith(error);
      const spy = spyOn(console, 'error').and.stub();

      // Act
      const result = await service.updateGroups([]);

      // Assert
      expect(spy).toHaveBeenCalledWith(error.message);
      expect(result).toBeFalse();
    });

    it(`should return false if an error occurred in fireDBController.update() (other errors).`, async () => {
      // Arrange
      const error = {
        code: 'xxx',
        msg: 'No Internet connection',
      };
      sessionSigValue = { uid: 'Example-uid' } as User;
      firebaseDatabaseControllerServiceMock.update.and.rejectWith(error);
      const spy = spyOn(console, 'error').and.stub();

      // Act
      const result = await service.updateGroups([]);

      // Assert
      expect(spy).toHaveBeenCalledWith(error);
      expect(result).toBeFalse();
    });

    it(`should return true when groups are updated correctly.`, async () => {
      // Arrange
      sessionSigValue = { uid: 'Example-uid' } as User;
      firebaseDatabaseControllerServiceMock.update.and.resolveTo();

      // Act
      const result = await service.updateGroups([]);

      // Assert
      expect(result).toBeTrue();
    });
  });

  describe(`deleteGroup()`, () => {
    it(`should return false when an error occurred in updateGroups() (AuthError).`, async () => {
      // Arrange
      const error: FirebaseAuthError = {
        code: 'example-code',
        message: 'example-message',
      };
      spyOn(service, 'updateGroups').and.rejectWith(error);
      const spy = spyOn(console, 'error').and.stub();

      // Act
      const result = await service.deleteGroup([]);

      // Assert
      expect(spy).toHaveBeenCalledWith(error.message);
      expect(result).toBeFalse();
    });

    it(`should return false when an error occurred in updateGroups() (other errors).`, async () => {
      // Arrange
      const error = {
        code: 'example-code',
        msg: 'example-message',
      };
      spyOn(service, 'updateGroups').and.rejectWith(error);
      const spy = spyOn(console, 'error').and.stub();

      // Act
      const result = await service.deleteGroup([]);

      // Assert
      expect(spy).toHaveBeenCalledWith(error);
      expect(result).toBeFalse();
    });

    it(`should should return true when groups are updated with existing ones.`, async () => {
      // Arrange
      spyOn(service, 'updateGroups').and.resolveTo(true);
      const spy = spyOn(console, 'error').and.stub();

      // Act
      const result = await service.deleteGroup([]);

      // Assert
      expect(spy).not.toHaveBeenCalled();
      expect(result).toBeTrue();
    });
  });
});
