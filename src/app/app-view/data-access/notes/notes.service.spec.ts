/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { NotesService } from '../notes/notes.service';
import { AuthLocalUserService } from 'src/app/auth/data-access/local-user/auth-local-user.service';
import { AuthDatabaseService } from 'src/app/auth/data-access/database/auth-database.service';
import {
  AuthUserConnectorService,
  UserType,
} from '../auth-user-connector/auth-user-connector.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LocalUserAccount } from 'src/app/auth/utils/Models/LocalAuthModels.interface';
import { User } from '@angular/fire/auth';
import {
  AppSettingsToken,
  GroupRemovingStrategy,
} from '../../utils/models/app-settings.interface';
import { ErrorHandlerService } from '../../../reusable/data-access/error-handler/error-handler.service';
import { AppConfigService } from '../app-config/app-config.service';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/utils/Models/UserDataModels.interface';
import { NoteRestService } from '../note-REST/note-rest.service';
import { Provider } from '@angular/core';
import { TIMESTAMP_TOKEN } from 'src/app/reusable/data-access/timestamp/timestamp.token';
import { localUTCTimestamp } from 'src/app/reusable/utils/data-tools/objectTools';

describe('NotesService', () => {
  // Example model objects
  const exampleNoteModel: NoteModel = {
    createdAt: Date.now(),
    id: 'xxxx',
    value: 'Hello World!',
  };
  const exampleNoteGroup: NoteGroupModel = {
    createdAt: Date.now(),
    id: 'xxx',
    title: 'Example Group',
    notes: [exampleNoteModel],
  };

  // Mocks
  const authLocalUserServiceMock = jasmine.createSpyObj<AuthLocalUserService>([
    'modifyCurrentUser',
    'deleteGroup',
  ]);

  const authDatabaseServiceMock = jasmine.createSpyObj<AuthDatabaseService>([
    'getGroups',
    'updateGroups',
    'deleteGroup',
  ]);

  let userType: UserType = null;

  const activeUserSubject = new BehaviorSubject<LocalUserAccount | User | null>(
    null
  );

  const authUserConnectorServiceMock = {
    activeUserTypeSig: () => userType,
    activeUser$: activeUserSubject.asObservable(),
  };

  const appConfigServiceMock = {
    appConfigState: {
      deletingMode: 'slow' as GroupRemovingStrategy,
      theme: 'auto',
    } satisfies AppSettingsToken,
    updateConfig: (changes: Partial<AppSettingsToken>) => {
      changes;
    },
  };

  const errorHandlerServiceMock = jasmine.createSpyObj<ErrorHandlerService>([
    'onError',
  ]);

  const notesBufferSubject = new BehaviorSubject<NoteModel[]>([]);

  const noteRestServiceMock = {
    fillNotesBuffer: jasmine.createSpy(
      'fillNotesBuffer',
      NoteRestService.prototype.fillNotesBuffer
    ),
    notesBuffer$: notesBufferSubject.asObservable(),
  };

  // Service
  let service: NotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotesService,

        { provide: AuthLocalUserService, useValue: authLocalUserServiceMock },
        { provide: AuthDatabaseService, useValue: authDatabaseServiceMock },
        {
          provide: AuthUserConnectorService,
          useValue: authUserConnectorServiceMock,
        },
        { provide: AppConfigService, useValue: appConfigServiceMock },
        { provide: ErrorHandlerService, useValue: errorHandlerServiceMock },
        { provide: NoteRestService, useValue: noteRestServiceMock },
        { provide: TIMESTAMP_TOKEN, useFactory: () => localUTCTimestamp },
      ] satisfies Provider[],
    });
    service = TestBed.inject(NotesService);
  });

  // Resets
  beforeEach(() => {
    appConfigServiceMock.appConfigState = {
      deletingMode: 'slow',
      theme: 'auto',
    } satisfies AppSettingsToken;

    activeUserSubject.next(null);

    userType = null;

    notesBufferSubject.next([]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`_removingSpeed`, () => {
    it(`should always return the current value from appConfigService`, () => {
      expect(service['_removingSpeed']).toBe('slow');
    });
  });

  describe(`notes$`, () => {
    it(`should complete the stream if no user is logged in`, fakeAsync(() => {
      userType = null;
      let noteGroups: NoteGroupModel[] = [];

      const subscription = service.notes$.subscribe({
        next: (value) => {
          noteGroups = value;
        },
      });

      tick(1_000);
      subscription.unsubscribe();

      expect(noteGroups[0]).toBeFalsy();
    }));

    it(`should return an array of noteGroups if a local account is logged in`, fakeAsync(() => {
      // Arrange
      let noteGroups: NoteGroupModel[] = [];
      userType = 'local';

      activeUserSubject.next({
        groups: [{ ...exampleNoteGroup }],
      } as LocalUserAccount);

      // Act
      const subscription = service.notes$.subscribe((value) => {
        noteGroups = value;
      });

      tick(1_000);
      subscription.unsubscribe();

      // Assert
      expect(noteGroups[0].title).toBe(exampleNoteGroup.title);
    }));

    it(`should return an array of noteGroups if an online account is logged in`, fakeAsync(() => {
      // Arrange
      let noteGroups: NoteGroupModel[] = [];
      userType = 'online';

      authDatabaseServiceMock.getGroups.and.returnValue(of([exampleNoteGroup]));

      activeUserSubject.next({
        uid: 'xxx',
      } as User);

      // Act
      const subscription = service.notes$.subscribe((value) => {
        noteGroups = value;
      });

      tick(1_000);

      subscription.unsubscribe();

      // Assert
      expect(noteGroups[0].title).toBe(exampleNoteGroup.title);
    }));

    it(`should log the error if something is wrong with the inner observable (authDatabaseService.getGroups) and try to execute the stream after service.RECONNECT_DELAY time successfully.`, fakeAsync(() => {
      // Arrange
      let noteGroups: NoteGroupModel[] = [];
      let counter = 0;
      userType = 'online';
      const spy = spyOn(console, 'error').and.stub();

      const simulatedObservable: Observable<NoteGroupModel[]> = new Observable(
        (subscriber) => {
          if (counter === 0) {
            subscriber.error({
              code: 'xxx',
              message: 'Example error from getGroups',
            });
            counter++;
          } else {
            subscriber.next([exampleNoteGroup]);
          }
        }
      );

      authDatabaseServiceMock.getGroups.and.returnValue(simulatedObservable);

      activeUserSubject.next({
        uid: 'xxx',
      } as User);

      // Act
      const subscription = service.notes$.subscribe((value) => {
        noteGroups = value;
      });

      tick();

      // Assert
      expect(spy).toHaveBeenCalledTimes(1);

      tick(service.RECONNECT_DELAY);

      subscription.unsubscribe();

      // Assert
      expect(noteGroups[0]).toBeTruthy();
    }));

    it(`should log the error if something is wrong with the inner observable (authDatabaseService.getGroups) and stop after service.MAX_ERROR_COUNT times.`, fakeAsync(() => {
      // Arrange
      let noteGroups: NoteGroupModel[] = [];
      let counter = 0;
      userType = 'online';
      const spy = spyOn(console, 'error').and.stub();

      const simulatedObservable: Observable<NoteGroupModel[]> = new Observable(
        (subscriber) => {
          while (counter <= service.MAX_ERROR_COUNT) {
            subscriber.error({
              code: 'xxx',
              message: 'Example error from getGroups',
            });

            counter++;
          }
        }
      );

      authDatabaseServiceMock.getGroups.and.returnValue(simulatedObservable);

      activeUserSubject.next({
        uid: 'xxx',
      } as User);

      // Act
      const subscription = service.notes$.subscribe((value) => {
        noteGroups = value;
      });

      tick();

      // Assert
      expect(spy).toHaveBeenCalledTimes(1);

      tick(service.RECONNECT_DELAY * service.MAX_ERROR_COUNT);

      subscription.unsubscribe();

      // Assert
      expect(noteGroups[0]).toBeFalsy();
    }));
  });

  describe(`changeRemovingStrategy()`, () => {
    it(`should call appConfigService.updateConfig()`, () => {
      // Arrange
      const spy = spyOn(appConfigServiceMock, 'updateConfig');

      // Act
      service.changeRemovingStrategy('fast');

      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`clearNoteGroups()`, () => {
    it(`should stop the execution if user does not have any noteGroups.`, () => {
      // Arrange
      const spy = spyOn(service, 'modifyGroups');
      userType = 'local';

      activeUserSubject.next({
        groups: [] as NoteGroupModel[],
      } as LocalUserAccount);

      // Act
      service.clearNoteGroups();

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });

    it(`should call modifyGroups successfully.`, async () => {
      // Arrange
      const spy = spyOn(service, 'modifyGroups');
      userType = 'local';

      activeUserSubject.next({
        groups: [{ ...exampleNoteGroup, deleteAt: Date.now() - 1000 }],
      } as LocalUserAccount);

      // Act
      await service.clearNoteGroups();

      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`createGroup()`, () => {
    it(`should reject error if any asynchronous action fails.`, async () => {
      // Arrange
      const title = 'Hello World';
      userType = 'local';

      spyOn(service, 'modifyGroups').and.rejectWith(
        new Error('Example internal error')
      );

      activeUserSubject.next({
        groups: [] as NoteGroupModel[],
      } as LocalUserAccount);

      // Act
      // Assert
      await expectAsync(service.createGroup(title)).toBeRejected();
    });

    it(`should NOT clear the notesBuffer return false if a group is not created.`, async () => {
      // Arrange
      const title = 'Hello World';
      userType = 'local';

      const spy = noteRestServiceMock.fillNotesBuffer;
      spyOn(service, 'modifyGroups').and.resolveTo(false);

      activeUserSubject.next({
        groups: [exampleNoteGroup],
      } as LocalUserAccount);

      // Act
      const result = await service.createGroup(title);

      // Assert
      expect(spy).not.toHaveBeenCalled();
      expect(result).toBeFalse();
    });

    it(`should return true if a group is created successfully.`, async () => {
      // Arrange
      const title = 'Hello World';
      userType = 'local';

      const spy = noteRestServiceMock.fillNotesBuffer;
      spyOn(service, 'modifyGroups').and.resolveTo(true);

      activeUserSubject.next({
        groups: [exampleNoteGroup],
      } as LocalUserAccount);

      // Act
      const result = await service.createGroup(title);

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(result).toBeTrue();
    });
  });

  describe(`modifyGroups()`, () => {
    it(`should return false if no user is logged in.`, async () => {
      // Arrange
      const payload: NoteGroupModel[] = [exampleNoteGroup];

      // Act
      const result = await service.modifyGroups(payload);

      // Assert
      expect(result).toBeFalse();
    });

    it(`should throw a rejection if userType is neither "online" | "local" | null.`, async () => {
      // Arrange
      userType = 'xyz' as UserType;
      const payload: NoteGroupModel[] = [exampleNoteGroup];

      // Act
      // Assert
      await expectAsync(service.modifyGroups(payload)).toBeRejectedWithError(
        'Unknown user state'
      );
    });

    describe(`local`, () => {
      it(`should return false if a group is not modified successfully.`, async () => {
        // Arrange
        userType = 'local';

        const payload: NoteGroupModel[] = [exampleNoteGroup];

        authLocalUserServiceMock.modifyCurrentUser.and.returnValue(false);

        // Act
        const result = await service.modifyGroups(payload);

        // Assert
        expect(result).toBeFalse();
      });

      it(`should return true if a groups is modified successfully.`, async () => {
        // Arrange
        userType = 'local';

        const payload: NoteGroupModel[] = [exampleNoteGroup];

        authLocalUserServiceMock.modifyCurrentUser.and.returnValue(true);

        // Act
        const result = await service.modifyGroups(payload);

        // Assert
        expect(result).toBeTrue();
      });
    });

    describe(`online`, () => {
      it(`should return false if a group is not modified successfully.`, async () => {
        // Arrange
        userType = 'online';

        const payload: NoteGroupModel[] = [exampleNoteGroup];

        authDatabaseServiceMock.updateGroups.and.resolveTo(false);

        // Act
        const result = await service.modifyGroups(payload);

        // Assert
        expect(result).toBeFalse();
      });

      it(`should return true if a groups is modified successfully.`, async () => {
        // Arrange
        userType = 'online';

        const payload: NoteGroupModel[] = [exampleNoteGroup];

        authDatabaseServiceMock.updateGroups.and.resolveTo(true);

        // Act
        const result = await service.modifyGroups(payload);

        // Assert
        expect(result).toBeTrue();
      });
    });
  });

  describe(`deleteGroup()`, () => {
    it(`should return false if no user is logged in.`, async () => {
      // Arrange

      const payload: string = 'xxx';

      // Act
      const result = await service.deleteGroup(payload);

      // Assert
      expect(result).toBeFalse();
    });

    it(`should throw a rejection if user doesn't have an existing group.`, async () => {
      // Arrange
      userType = 'local';

      const payload: string = exampleNoteGroup.id;

      activeUserSubject.next({
        groups: [] as NoteGroupModel[],
      } as LocalUserAccount);

      // Act
      // Assert
      await expectAsync(service.deleteGroup(payload)).toBeRejectedWithError(
        'There are no groups to remove'
      );
    });

    describe(`local`, () => {
      it(`should return a boolean value returning from authLocalUserService.deleteGroup().`, async () => {
        // Arrange
        userType = 'local';

        const expectedValue = true;
        const payload: string = exampleNoteGroup.id;

        authLocalUserServiceMock.deleteGroup.and.returnValue(expectedValue);

        activeUserSubject.next({
          groups: [exampleNoteGroup, { ...exampleNoteGroup, id: 'another id' }],
        } as LocalUserAccount);

        // Act
        const result = await service.deleteGroup(payload);

        // Assert
        expect(result).toBe(expectedValue);
      });
    });

    describe(`online`, () => {
      it(`should return a boolean value returning from authLocalUserService.deleteGroup().`, async () => {
        // Arrange
        userType = 'online';

        const payload: string = exampleNoteGroup.id;
        const expectedValue = true;

        authDatabaseServiceMock.getGroups.and.returnValue(
          of([exampleNoteGroup, { ...exampleNoteGroup, id: 'another id' }])
        );

        authDatabaseServiceMock.deleteGroup.and.resolveTo(expectedValue);

        activeUserSubject.next({
          uid: 'xxx',
        } as User);

        // Act
        const result = await service.deleteGroup(payload);

        // Assert
        expect(result).toBeTrue();
      });
    });
  });

  describe(`markGroupToDelete()`, () => {
    it(`should reject if user has no groups.`, async () => {
      // Arrange
      userType = 'local';

      activeUserSubject.next({
        groups: [] as NoteGroupModel[],
      } as LocalUserAccount);

      // Act
      // Assert
      await expectAsync(
        service.markGroupToDelete(exampleNoteGroup.id, true)
      ).toBeRejectedWithError('User has no groups!');
    });

    it(`should reject if no group with given id exists.`, async () => {
      // Arrange
      userType = 'local';

      activeUserSubject.next({
        groups: [exampleNoteGroup],
      } as LocalUserAccount);

      // Act
      // Assert
      await expectAsync(
        service.markGroupToDelete('a non existing group id', true)
      ).toBeRejectedWithError(
        `No noteGroup with ID 'a non existing group id' has been found`
      );
    });

    it(`should call modifyGroups() after creating updatedGroups payload.`, async () => {
      // Arrange
      userType = 'local';

      let toDelete = true;

      const spy = spyOn(service, 'modifyGroups').and.resolveTo(true);

      activeUserSubject.next({
        groups: [exampleNoteGroup],
      } as LocalUserAccount);

      // Act
      await service.markGroupToDelete(exampleNoteGroup.id, toDelete);

      // Assert
      expect(spy).toHaveBeenCalled();

      // Arrange
      toDelete = false;

      // Act
      await service.markGroupToDelete(exampleNoteGroup.id, toDelete);

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    it(`should reject if something goes wrong inside modifyGroups().`, async () => {
      // Arrange
      userType = 'local';
      const exampleError = 'Example error';

      spyOn(service, 'modifyGroups').and.rejectWith(new Error(exampleError));

      activeUserSubject.next({
        groups: [exampleNoteGroup],
      } as LocalUserAccount);

      // Act
      // Assert
      await expectAsync(
        service.markGroupToDelete(exampleNoteGroup.id, true)
      ).toBeRejectedWithError(exampleError);
    });
  });

  describe(`isNewGroupValid()`, () => {
    it(`should call errorHandlerService.onError() and return false if no name has been passed in.`, async () => {
      // Arrange
      const exampleName = '';
      const spy = errorHandlerServiceMock.onError.and.callFake((value) => {
        console.error(value);
      });

      // Act
      const result = await service.isNewGroupValid(exampleName);

      // Assert

      expect(spy).toHaveBeenCalledWith('The group title is required');
      expect(result).toBeFalsy();
    });

    it(`should call errorHandlerService.onError() and return false if notesBuffer is empty.`, async () => {
      // Arrange
      const exampleName = 'example name';
      const spy = errorHandlerServiceMock.onError.and.callFake((value) => {
        console.error(value);
      });

      // Act
      const result = await service.isNewGroupValid(exampleName);

      // Assert

      expect(spy).toHaveBeenCalledWith('There are no notes to save');
      expect(result).toBeFalsy();
    });

    it(`should return true if everything is valid (removingSpeed 'slow').`, async () => {
      // Arrange
      const exampleName = 'example name';

      notesBufferSubject.next([exampleNoteModel]);

      // Act
      const result = await service.isNewGroupValid(exampleName);

      // Assert
      expect(result).toBeTruthy();
    });

    it(`should return true if everything is valid (removingSpeed 'fast').`, async () => {
      // Arrange
      notesBufferSubject.next([exampleNoteModel]);
      const exampleName = 'example name';

      // Act
      const result = await service.isNewGroupValid(exampleName);

      // Assert
      expect(result).toBeTruthy();
    });
  });
});
