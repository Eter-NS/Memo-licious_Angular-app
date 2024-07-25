/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { NoteRestService } from './note-rest.service';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { NoteModel } from 'src/app/auth/utils/Models/UserDataModels.interface';
import { Observable } from 'rxjs';
import { Provider } from '@angular/core';
import { TIMESTAMP_TOKEN } from 'src/app/reusable/data-access/timestamp/timestamp.token';
import { localUTCTimestamp } from 'src/app/reusable/utils/data-tools/objectTools';

describe('NoteRestService', () => {
  const liveAnnouncerMock = jasmine.createSpyObj<LiveAnnouncer>(['announce']);

  const exampleNoteModel: NoteModel = {
    createdAt: Date.now(),
    id: 'xxxx',
    value: 'Hello World!',
  };

  let service: NoteRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NoteRestService,
        { provide: LiveAnnouncer, useValue: liveAnnouncerMock },
        { provide: TIMESTAMP_TOKEN, useFactory: () => localUTCTimestamp },
      ] satisfies Provider[],
    });
    service = TestBed.inject(NoteRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`notesBuffer$`, () => {
    it(`should return an Observable that emits empty notesBuffer (right after creating the service)`, fakeAsync(() => {
      expect(service.notesBuffer$ instanceof Observable).toBeTruthy();

      const subscription = service.notesBuffer$.subscribe((buffer) => {
        expect(buffer).toEqual([]);
      });

      tick();

      subscription.unsubscribe();
    }));
  });

  describe(`ngOnDestroy()`, () => {
    it(`should reset notesBuffer$ to empty array.`, () => {
      // Arrange
      let noteModels: NoteModel[] = [];
      service.fillNotesBuffer([exampleNoteModel]);

      // Act
      const subscription = service.notesBuffer$.subscribe((value) => {
        noteModels = value;
      });

      // Assert
      expect(noteModels.length).toBe(1);

      // Act
      service.ngOnDestroy();

      subscription.unsubscribe();

      // Assert
      expect(noteModels.length).toBe(0);
    });

    it(`should complete notesBuffer$.`, () => {
      // Arrange
      let result = false;

      // Act
      const subscription = service.notesBuffer$.subscribe({
        complete: () => (result = true),
      });

      service.ngOnDestroy();

      subscription.unsubscribe();

      // Assert
      expect(result).toBe(true);
    });
  });

  describe(`fillNotesBuffer()`, () => {
    it(`should pass an array of noteModels to notesBuffer$.`, () => {
      // Arrange
      const payload: NoteModel[] = [exampleNoteModel];
      let noteModels: NoteModel[] = [];

      // Act

      const subscription = service.notesBuffer$.subscribe((value) => {
        noteModels = value;
      });

      // Assert
      expect(noteModels.length).toBe(0);

      // Act
      service.fillNotesBuffer(payload);

      subscription.unsubscribe();

      // Assert
      expect(noteModels.length).toEqual(1);
    });
  });

  describe(`onCreateNote()`, () => {
    it(`should stop executing the method if value is empty`, async () => {
      const spy = spyOn(service as any, '_createNote');
      const payload = {
        value: '',
        chipInput: { clear: () => {} },
      } as MatChipInputEvent;

      await service.onCreateNote(payload);

      expect(spy).not.toHaveBeenCalled();
    });

    it(`should clear chip input after successful note creation`, async () => {
      const payload = {
        value: 'example value',
        chipInput: { clear: () => {} },
      } as MatChipInputEvent;
      spyOn(service as any, '_createNote').and.resolveTo(undefined);
      const spy = spyOn(payload.chipInput, 'clear');

      await service.onCreateNote(payload);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`onEditNote()`, () => {
    it('should call onRemoveNote if note is empty', () => {
      const spy = spyOn(service as any, '_editNote');
      const payload = {
        event: {
          value: '',
        },
        note: {},
      } as { note: NoteModel; event: MatChipEditedEvent };

      service.onEditNote(payload);

      expect(spy).not.toHaveBeenCalled();
    });

    it(`should call noteService.editNote() if note is not empty`, () => {
      const spy = spyOn(service as any, '_editNote');
      const payload = {
        event: {
          value: 'some value',
        },
        note: {},
      } as { note: NoteModel; event: MatChipEditedEvent };

      service.onEditNote(payload);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`onRemoveNote()`, () => {
    it(`should not announce note removal if note wasn't removed`, () => {
      spyOn(service as any, '_deleteNote').and.returnValue(false);
      const spy = liveAnnouncerMock.announce;
      const payload = {
        id: '123',
        value: 'some value',
      } as NoteModel;

      service.onRemoveNote(payload);

      expect(spy).not.toHaveBeenCalled();
    });

    it(`should  announce note removal if note was removed`, () => {
      spyOn(service as any, '_deleteNote').and.returnValue(true);
      const spy = liveAnnouncerMock.announce;
      const payload = {
        id: '123',
        value: 'some value',
      } as NoteModel;

      service.onRemoveNote(payload);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`_createNote()`, () => {
    it(`should log the warning when an empty string comes as an argument.`, async () => {
      // Arrange
      const spy = spyOn(console, 'warn').and.stub();

      // Act
      await service['_createNote']('');

      // Assert
      expect(spy).toHaveBeenCalledWith('No value provided to new note');
    });

    it(`should call _notesBufferSubject.next() with the new note.`, async () => {
      // Arrange
      const spy = spyOn(
        service['_notesBufferSubject'],
        'next'
      ).and.callThrough();

      // Act
      await service['_createNote']('some value');

      // Assert
      const notesModel = service['_notesBufferSubject'].value.findIndex(
        (note) => note.value === 'some value'
      );
      expect(spy).toHaveBeenCalled();
      expect(notesModel).toBeGreaterThan(-1);
    });
  });

  describe(`_editNote()`, () => {
    it(`should return false if a note hasn't changed.`, () => {
      // Arrange
      service.fillNotesBuffer([
        { id: 'xyz', createdAt: Date.now(), value: 'current value' },
      ]);

      // Act
      const result = service['_editNote']('xyz2', { value: 'new value' });

      // Assert
      expect(result).toBeFalse();
    });

    it(`should not call _notesBufferSubject.next() if a note hasn't changed.`, () => {
      // Arrange
      service.fillNotesBuffer([
        { id: 'xyz', createdAt: Date.now(), value: 'current value' },
      ]);
      const spy = spyOn(
        service['_notesBufferSubject'],
        'next'
      ).and.callThrough();

      // Act
      const result = service['_editNote']('xyz2', { value: 'new value' });

      // Assert
      expect(spy).not.toHaveBeenCalled();
      expect(result).toBeFalse();
    });

    it(`should call _notesBufferSubject.next() and return true if a note has changed.`, () => {
      // Arrange
      service.fillNotesBuffer([
        { id: 'xyz', createdAt: Date.now(), value: 'current value' },
      ]);
      const spy = spyOn(
        service['_notesBufferSubject'],
        'next'
      ).and.callThrough();

      // Act
      const result = service['_editNote']('xyz', { value: 'new value' });

      // Assert
      const noteModel = service['_notesBufferSubject'].value.find(
        ({ id }) => id === 'xyz'
      );
      expect(spy).toHaveBeenCalled();
      expect(result).toBeTrue();
      expect(noteModel?.value).toBe('new value');
    });
  });

  describe(`_deleteNote()`, () => {
    it(`should return false if a note hasn't been removed.`, () => {
      // Arrange
      service.fillNotesBuffer([
        { id: 'xyz', createdAt: Date.now(), value: 'current value' },
      ]);

      // Act
      const result = service['_deleteNote']('xyz2');

      // Assert
      expect(result).toBeFalse();
    });

    it(`should not call _notesBufferSubject.next() if a note hasn't been removed.`, () => {
      // Arrange
      service.fillNotesBuffer([
        { id: 'xyz', createdAt: Date.now(), value: 'current value' },
      ]);
      const spy = spyOn(
        service['_notesBufferSubject'],
        'next'
      ).and.callThrough();

      // Act
      const result = service['_deleteNote']('xyz2');

      // Assert
      expect(spy).not.toHaveBeenCalled();
      expect(result).toBeFalse();
    });

    it(`should call _notesBufferSubject.next() and return true if a note has been removed.`, () => {
      // Arrange
      service.fillNotesBuffer([
        { id: 'xyz', createdAt: Date.now(), value: 'current value' },
      ]);
      const spy = spyOn(
        service['_notesBufferSubject'],
        'next'
      ).and.callThrough();

      // Act
      const result = service['_deleteNote']('xyz');

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(result).toBeTrue();
    });
  });
});
