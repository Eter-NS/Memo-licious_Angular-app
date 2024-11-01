/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  INoteListFormDialogData,
  NoteListFormDialogEditorComponent,
} from './note-list-form-dialog-editor.component';
import * as tools from 'src/app/reusable/utils/data-tools/objectTools';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/utils/Models/UserDataModels.interface';
import { ChangeDetectorRef, Provider } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotesService } from '../../data-access/notes/notes.service';
import { BehaviorSubject } from 'rxjs';
import { NoteRestService } from '../../data-access/note-REST/note-rest.service';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatChipInputEvent, MatChipEditedEvent } from '@angular/material/chips';
import { NoteListFormEditor } from '../../utils/models/note-list-form-editor.interface';

const exampleNoteModel: NoteModel = {
  id: tools.randomId(27),
  createdAt: Date.now(),
  value: 'XYZ',
};

const exampleNoteGroupModel: NoteGroupModel = {
  id: tools.randomId(27),
  createdAt: Date.now(),
  title: 'Hello World',
  notes: [exampleNoteModel],
};

describe('NoteListFormDialogEditorComponent', () => {
  // Mocks
  const dialogRefMock = jasmine.createSpyObj<
    MatDialogRef<NoteListFormDialogEditorComponent>
  >(['close']);

  const notesValue = new BehaviorSubject<NoteGroupModel[]>([]);
  const notesServiceMock = jasmine.createSpyObj<NotesService>([], {
    notes$: notesValue,
  });

  const notesBufferValue = new BehaviorSubject<NoteModel[]>([]);
  const noteRestServiceMock = jasmine.createSpyObj<NoteRestService>(
    ['onCreateNote', 'onEditNote', 'onRemoveNote', 'fillNotesBuffer'],
    {
      notesBuffer$: notesBufferValue,
    }
  );

  const changeDetectorRefMock = jasmine.createSpyObj<ChangeDetectorRef>([
    'markForCheck',
  ]);

  const MAT_DIALOG_DATA_MOCK = {
    id: exampleNoteGroupModel.id,
  } satisfies INoteListFormDialogData;

  // Component
  let component: NoteListFormDialogEditorComponent;
  let fixture: ComponentFixture<NoteListFormDialogEditorComponent>;

  beforeEach(() => {
    notesValue.next([exampleNoteGroupModel]);
    notesBufferValue.next(exampleNoteGroupModel.notes);
  });

  beforeEach(() => {
    dialogRefMock.close.calls.reset();
    noteRestServiceMock.onCreateNote.calls.reset();
    noteRestServiceMock.onEditNote.calls.reset();
    noteRestServiceMock.onRemoveNote.calls.reset();
    noteRestServiceMock.fillNotesBuffer.calls.reset();
    changeDetectorRefMock.markForCheck.calls.reset();
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [NoteListFormDialogEditorComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: MatDialogRef,
          useValue: dialogRefMock,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: MAT_DIALOG_DATA_MOCK,
        },
        {
          provide: ChangeDetectorRef,
          useValue: changeDetectorRefMock,
        },
      ] as Provider[],
    })
      .overrideProvider(NotesService, { useValue: notesServiceMock })
      .overrideProvider(NoteRestService, { useValue: noteRestServiceMock });

    fixture = TestBed.createComponent(NoteListFormDialogEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe(`ViewChildren`, () => {
    describe(`form`, () => {
      it(`should be defined.`, () => {
        expect(component.formElement).toBeDefined();
      });
    });
  });

  describe(`observables`, () => {
    describe(`noteGroup$`, () => {
      it(`should call _closeDialogWithoutResult if the _noteGroupId does not match any of the IDs user note groups.`, fakeAsync(() => {
        // Arrange
        fixture = TestBed.createComponent(NoteListFormDialogEditorComponent);
        component = fixture.componentInstance;

        const closeDialogWithoutResultSpy = spyOn(
          component as any,
          '_closeDialogWithoutResult'
        );
        component['_noteGroupId'] = tools.randomId(27);

        // Act
        let expectedGroup: NoteGroupModel | undefined;
        const subscription = component.noteGroup$.subscribe((group) => {
          expectedGroup = group;
        });

        tick(1_000);
        subscription.unsubscribe();

        // Assert
        expect(closeDialogWithoutResultSpy).toHaveBeenCalled();
        expect(expectedGroup).toBe(undefined);
      }));

      it(`should retrieve the group with _noteGroupId from user's note groups.`, fakeAsync(() => {
        // Arrange
        const closeDialogWithoutResultSpy = spyOn(
          component as any,
          '_closeDialogWithoutResult'
        );

        // Act
        let expectedGroup: NoteGroupModel | undefined;
        const subscription = component.noteGroup$.subscribe((group) => {
          expectedGroup = group;
        });

        tick(1_000);
        subscription.unsubscribe();

        // Assert
        expect(expectedGroup).toEqual(exampleNoteGroupModel);
        expect(closeDialogWithoutResultSpy).not.toHaveBeenCalled();
      }));
    });
  });

  describe(`lifecycle hooks`, () => {
    describe(`OnInit`, () => {
      it(`should call noteRestService.fillNotesBuffer 1 time with the latest value.`, fakeAsync(() => {
        // Arrange
        noteRestServiceMock.fillNotesBuffer.calls.reset();
        const fillNotesBufferSpy = noteRestServiceMock.fillNotesBuffer;
        fixture = TestBed.createComponent(NoteListFormDialogEditorComponent);
        component = fixture.componentInstance;

        // Act
        fixture.detectChanges();

        tick(1_000);

        // Assert
        expect(fillNotesBufferSpy).toHaveBeenCalledTimes(1);
      }));
    });
  });

  describe(`methods`, () => {
    describe(`onCreateNote()`, () => {
      it(`should call noteRestService.onCreateNote and cd.markForCheck.`, () => {
        // Arrange
        const onCreateNoteSpy = noteRestServiceMock.onCreateNote;
        const changeDetectorRef =
          fixture.debugElement.injector.get(ChangeDetectorRef);
        const markForCheckSpy = spyOn(
          changeDetectorRef.constructor.prototype,
          'markForCheck'
        );

        // Act
        component.onCreateNote({} as MatChipInputEvent);

        // Assert
        expect(onCreateNoteSpy).toHaveBeenCalled();
        expect(markForCheckSpy).toHaveBeenCalled();
      });
    });

    describe(`onEditNote()`, () => {
      it(`should call noteRestService.onEditNote and cd.markForCheck.`, () => {
        // Arrange
        const onEditNoteSpy = noteRestServiceMock.onEditNote;
        const changeDetectorRef =
          fixture.debugElement.injector.get(ChangeDetectorRef);
        const markForCheckSpy = spyOn(
          changeDetectorRef.constructor.prototype,
          'markForCheck'
        );

        // Act
        component.onEditNote({
          note: exampleNoteModel,
          event: {} as MatChipEditedEvent,
        });

        // Assert
        expect(onEditNoteSpy).toHaveBeenCalled();
        expect(markForCheckSpy).toHaveBeenCalled();
      });
    });

    describe(`onRemoveNote()`, () => {
      it(`should call noteRestService.onRemoveNote and cd.markForCheck.`, () => {
        // Arrange
        const onRemoveNoteSpy = noteRestServiceMock.onRemoveNote;
        const changeDetectorRef =
          fixture.debugElement.injector.get(ChangeDetectorRef);
        const markForCheckSpy = spyOn(
          changeDetectorRef.constructor.prototype,
          'markForCheck'
        );

        // Act
        component.onRemoveNote(exampleNoteModel);

        // Assert
        expect(onRemoveNoteSpy).toHaveBeenCalled();
        expect(markForCheckSpy).toHaveBeenCalled();
      });
    });

    describe(`_closeDialogWithoutResult()`, () => {
      it(`should call dialogRef.close with object and property action set to 'close'.`, () => {
        // Arrange
        const closeSpy = dialogRefMock.close;

        // Act
        component['_closeDialogWithoutResult']();

        // Assert
        expect(closeSpy).toHaveBeenCalledWith({ action: 'close' });
      });
    });

    describe(`closeDialog()`, () => {
      it(`should do nothing if noteGroupTitleFormElement.errors is truthy and action is 'save'.`, fakeAsync(() => {
        // Arrange
        const closeSpy = dialogRefMock.close;

        component.formElement.newNoteGroupForm.patchValue({
          groupName:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias nostrum earum perferendis nam consectetur sint tempore itaque soluta eius recusandae laborum totam nobis corporis, officia vel quia molestias distinctio veniam. Accusamus doloribus quidem iusto reprehenderit?',
        });

        fixture.detectChanges();
        flush();

        //  Act
        component.closeDialog('save');

        // Assert
        expect(closeSpy).not.toHaveBeenCalled();
      }));

      it(`should call dialogRef.close with object and property action set to 'save'.`, fakeAsync(() => {
        // Arrange
        const closeSpy = dialogRefMock.close;
        const newGroupTitle = 'Lorem ipsum dolor sit';

        component.formElement.newNoteGroupForm.patchValue({
          groupName: newGroupTitle,
        });

        fixture.detectChanges();
        flush();

        // Act
        component.closeDialog('save');

        // Assert
        expect(closeSpy).toHaveBeenCalledWith({
          action: 'save',
          noteGroupTitle: newGroupTitle,
          notesGroupBuffer: exampleNoteGroupModel.notes,
        } satisfies NoteListFormEditor);
      }));
    });
  });
});
