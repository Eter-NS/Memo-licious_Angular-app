/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { NoteGroupListContainerComponent } from './note-group-list-container.component';
import { Provider } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/utils/Models/UserDataModels.interface';
import { BehaviorSubject, of } from 'rxjs';
import { NotesService } from '../../data-access/notes/notes.service';
import { NoteRestService } from '../../data-access/note-REST/note-rest.service';
import { ViewportListenersService } from 'src/app/reusable/data-access/viewport-listeners/viewport-listeners.service';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { randomId } from 'src/app/reusable/utils/data-tools/objectTools';
import { NoteListFormEditor } from '../../utils/models/note-list-form-editor.interface';
import { NoteListFormDialogEditorComponent } from '../note-list-form-dialog-editor/note-list-form-dialog-editor.component';

const exampleNoteModel: NoteModel = {
  id: randomId(27),
  createdAt: Date.now(),
  value: 'XYZ',
};

const exampleNoteGroupModel: NoteGroupModel = {
  id: randomId(27),
  createdAt: Date.now(),
  title: 'Hello World',
  notes: [exampleNoteModel],
};

describe(`NoteGroupListContainerComponent`, () => {
  // Mocks
  const isHandsetValue = new BehaviorSubject<boolean>(false);
  const viewportListenersServiceMock =
    jasmine.createSpyObj<ViewportListenersService>([], {
      isHandset$: isHandsetValue,
    });

  const viewTransitionServiceMock = jasmine.createSpyObj<ViewTransitionService>(
    ['goForward']
  );

  const notesValue = new BehaviorSubject<NoteGroupModel[]>([]);
  const notesServiceMock = jasmine.createSpyObj<NotesService>(
    ['markGroupToDelete', 'modifyGroups'],
    {
      notes$: notesValue,
    }
  );

  const notesBufferValue = new BehaviorSubject<NoteModel[]>([]);
  const noteRestServiceMock = jasmine.createSpyObj<NoteRestService>(
    ['fillNotesBuffer'],
    { notesBuffer$: notesBufferValue }
  );

  const dialogMock = jasmine.createSpyObj<MatDialog>(['open']);

  // Component
  let fixture: ComponentFixture<NoteGroupListContainerComponent>;
  let component: NoteGroupListContainerComponent;

  beforeEach(() => {
    notesBufferValue.next([]);
    isHandsetValue.next(false);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteGroupListContainerComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: NotesService,
          useValue: notesServiceMock,
        },
        {
          provide: NoteRestService,
          useValue: noteRestServiceMock,
        },
        {
          provide: ViewportListenersService,
          useValue: viewportListenersServiceMock,
        },
        {
          provide: ViewTransitionService,
          useValue: viewTransitionServiceMock,
        },
        {
          provide: MatDialog,
          useValue: dialogMock,
        },
      ] as Provider[],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteGroupListContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(`should create`, () => {
    // Arrange
    // Act
    // Assert
    expect(component).toBeTruthy();
  });

  describe(`observables`, () => {
    describe(`filteredNotes$`, () => {
      beforeEach(() => {
        notesValue.next([
          exampleNoteGroupModel,
          {
            createdAt: Date.now(),
            id: 'some-id',
            title: 'some-title',
            deleteAt: Date.now() + 10_000,
            notes: [{ ...exampleNoteModel, value: 'Another note' }],
          },
        ]);
      });

      it(`should filter all note groups marked to delete if markToDelete input is false.`, fakeAsync(() => {
        // Arrange
        component.markForDelete = false;
        fixture.detectChanges();

        // Act
        let expectedNotes: NoteGroupModel[];
        const subscription = component.filteredNoteGroups$.subscribe(
          (notes) => {
            expectedNotes = notes;
          }
        );

        tick();
        subscription.unsubscribe();

        // Assert
        if (!expectedNotes!) {
          throw new Error('expectedNotes is not defined');
        }
        expect(expectedNotes.length).toBe(1);
        expect(expectedNotes.every(({ deleteAt }) => !deleteAt));
        expect(expectedNotes[0].id).toEqual(exampleNoteGroupModel.id);
      }));

      it(`should filter all note groups NOT marked to delete if markToDelete input is true.`, fakeAsync(() => {
        // Arrange
        component.markForDelete = true;
        fixture.detectChanges();

        // Act
        let expectedNotes: NoteGroupModel[];
        const subscription = component.filteredNoteGroups$.subscribe(
          (notes) => {
            expectedNotes = notes;
          }
        );

        tick();
        subscription.unsubscribe();

        // Assert
        if (!expectedNotes!) {
          throw new Error('expectedNotes is not defined');
        }
        expect(expectedNotes.length).toBe(1);
        expect(expectedNotes.every(({ deleteAt }) => deleteAt));
        expect(expectedNotes[0].id).toEqual('some-id');
      }));
    });
  });

  describe(`methods`, () => {
    describe(`handleGroupMarkForDelete()`, () => {
      it(`should call #notesService.markGroupToDelete.`, () => {
        // Arrange
        const markGroupToDeleteSpy = notesServiceMock.markGroupToDelete;

        // Act
        component['handleGroupMarkForDelete'](exampleNoteGroupModel.id, false);

        // Assert
        expect(markGroupToDeleteSpy).toHaveBeenCalledWith(
          exampleNoteGroupModel.id,
          false
        );
      });
    });

    describe(`handleClick()`, () => {
      it(`should do nothing if _mainElement is falsy.`, () => {
        // Arrange
        const goForwardSpy = viewTransitionServiceMock.goForward;
        const handleDialogSpy = spyOn(component as any, '_handleDialog');
        (component['_mainElement'] as any) = undefined;
        fixture.detectChanges();

        // Act
        component['handleClick'](exampleNoteGroupModel.id);

        // Assert
        expect(goForwardSpy).not.toHaveBeenCalled();
        expect(handleDialogSpy).not.toHaveBeenCalled();
      });

      it(`should call #viewTransitionService.goForward to move user to the mobile note group editor.`, () => {
        // Arrange
        isHandsetValue.next(true);
        const goForwardSpy = viewTransitionServiceMock.goForward;

        // Act
        component['handleClick'](exampleNoteGroupModel.id);

        // Assert
        expect(goForwardSpy).toHaveBeenCalledWith(
          component['_mainElement']!.nativeElement,
          `/app/notes/${exampleNoteGroupModel.id}`
        );
      });

      it(`should call handleDialog to move user to the mobile note group editor.`, () => {
        // Arrange
        isHandsetValue.next(false);
        const handleDialogSpy = spyOn(component as any, '_handleDialog');

        // Act
        component['handleClick'](exampleNoteGroupModel.id);

        // Assert
        expect(handleDialogSpy).toHaveBeenCalledWith(exampleNoteGroupModel.id);
      });
    });

    describe(`_handleDialog()`, () => {
      it(`should call _configureDialog, #dialog.open, and _subscribeToDialogEvents`, () => {
        // Arrange
        const configureDialogSpy = spyOn(
          component as any,
          '_configureDialog'
        ).and.callThrough();
        const openSpy = dialogMock.open;
        const subscribeToDialogEventsSpy = spyOn(
          component as any,
          '_subscribeToDialogEvents'
        );

        const id = 'some-id';

        // Act
        component['_handleDialog'](id);

        // Assert
        expect(configureDialogSpy).toHaveBeenCalledWith(id);
        expect(openSpy).toHaveBeenCalled();
        expect(subscribeToDialogEventsSpy).toHaveBeenCalled();
      });
    });

    describe(`_configureDialog()`, () => {
      it(`should return a configuration object for MatDialog with the correct properties.`, () => {
        // Arrange
        const id = 'some-id';

        // Act
        const config = component['_configureDialog'](id);

        // Assert
        expect(Object.keys(config)).toEqual([
          'minWidth',
          'maxWidth',
          'enterAnimationDuration',
          'exitAnimationDuration',
          'ariaLabel',
          'data',
          'closeOnNavigation',
        ]);
        expect(config.data).toEqual({
          id,
        });
      });
    });

    describe(`_subscribeToDialogEvents()`, () => {
      let title: string;
      let notesBuffer: NoteModel[];
      let id: string;

      beforeEach(() => {
        notesValue.next([exampleNoteGroupModel]);

        title = 'some-title';
        notesBuffer = [
          exampleNoteModel,
          {
            ...exampleNoteModel,
            id: 'modified-id',
            value: 'modified-value',
          },
        ];
        id = 'some-id';
      });

      it(`should do nothing if noteGroupTitle and notesGroupBuffer inside dialogState are falsy.`, () => {
        // Arrange
        const modifyGroupsSpy = spyOn(component as any, '_modifyGroups');

        // Act
        component['_subscribeToDialogEvents'](
          {
            beforeClosed: () =>
              of<NoteListFormEditor | undefined>({ action: 'close' }),
          } as MatDialogRef<
            NoteListFormDialogEditorComponent,
            NoteListFormEditor
          >,
          id
        );

        // Assert
        expect(modifyGroupsSpy).not.toHaveBeenCalled();
      });

      it(`should do nothing if action inside dialogState is 'close'.`, () => {
        // Arrange
        const modifyGroupsSpy = spyOn(component as any, '_modifyGroups');
        const matDialogRef = {
          beforeClosed: () =>
            of<NoteListFormEditor | undefined>({
              action: 'close',
              noteGroupTitle: title,
              notesGroupBuffer: notesBuffer,
            }),
        } as MatDialogRef<
          NoteListFormDialogEditorComponent,
          NoteListFormEditor
        >;

        // Act
        component['_subscribeToDialogEvents'](matDialogRef, id);

        // Assert
        expect(modifyGroupsSpy).not.toHaveBeenCalled();
      });

      it(`should call _modifyGroups() if dialogState.action equals 'save'.`, () => {
        // Arrange
        const modifyGroupsSpy = spyOn(component as any, '_modifyGroups');
        const matDialogRef = {
          beforeClosed: () =>
            of<NoteListFormEditor | undefined>({
              action: 'save',
              noteGroupTitle: title,
              notesGroupBuffer: notesBuffer,
            }),
        } as MatDialogRef<
          NoteListFormDialogEditorComponent,
          NoteListFormEditor
        >;

        // Act
        component['_subscribeToDialogEvents'](matDialogRef, id);

        // Assert
        expect(modifyGroupsSpy).toHaveBeenCalledWith(
          [exampleNoteGroupModel],
          title,
          notesBuffer,
          id
        );
      });

      it(`should call console.error and set MatDialogRef.disableClose to true if _modifyGroups rejects the Promise (message property defined).`, fakeAsync(() => {
        // Arrange
        const errorMessage = 'An example error';

        const modifyGroupsSpy = spyOn(
          component as any,
          '_modifyGroups'
        ).and.rejectWith(new Error(errorMessage));
        const errorSpy = spyOn(console, 'error');
        const matDialogRef = {
          beforeClosed: () =>
            of<NoteListFormEditor | undefined>({
              action: 'save',
              noteGroupTitle: title,
              notesGroupBuffer: notesBuffer,
            }),
        } as MatDialogRef<
          NoteListFormDialogEditorComponent,
          NoteListFormEditor
        >;

        // Act
        component['_subscribeToDialogEvents'](matDialogRef, id);

        flush();

        // Assert
        expect(modifyGroupsSpy).toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(errorMessage);
        expect(matDialogRef.disableClose).toBeTrue();
      }));

      it(`should call console.error and set MatDialogRef.disableClose to true if _modifyGroups rejects the Promise (message property NOT defined).`, fakeAsync(() => {
        // Arrange
        const errorObject = {
          code: 'Example-error-code',
          msg: 'An example error message',
        };

        const modifyGroupsSpy = spyOn(
          component as any,
          '_modifyGroups'
        ).and.rejectWith(errorObject);
        const errorSpy = spyOn(console, 'error');
        const matDialogRef = {
          beforeClosed: () =>
            of<NoteListFormEditor | undefined>({
              action: 'save',
              noteGroupTitle: title,
              notesGroupBuffer: notesBuffer,
            }),
        } as MatDialogRef<
          NoteListFormDialogEditorComponent,
          NoteListFormEditor
        >;

        // Act
        component['_subscribeToDialogEvents'](matDialogRef, id);

        flush();

        // Assert
        expect(modifyGroupsSpy).toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(errorObject);
        expect(matDialogRef.disableClose).toBeTrue();
      }));

      it(`should set the disableClose property inside matDialogRef to false if _modifyGroups() resolves its promise to 'true'.`, () => {
        // Arrange
        const modifyGroupsSpy = spyOn(
          component as any,
          '_modifyGroups'
        ).and.resolveTo(true);
        const errorSpy = spyOn(console, 'error');
        const matDialogRef = {
          beforeClosed: () =>
            of<NoteListFormEditor | undefined>({
              action: 'save',
              noteGroupTitle: title,
              notesGroupBuffer: notesBuffer,
            }),
        } as MatDialogRef<
          NoteListFormDialogEditorComponent,
          NoteListFormEditor
        >;

        // Act
        component['_subscribeToDialogEvents'](matDialogRef, id);

        // Assert
        expect(modifyGroupsSpy).toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();
        expect(matDialogRef.disableClose).toBeFalsy();
      });

      it(`should set the disableClose property inside matDialogRef to 'true' if _modifyGroups() resolves its promise to 'false'.`, fakeAsync(() => {
        // Arrange
        const modifyGroupsSpy = spyOn(
          component as any,
          '_modifyGroups'
        ).and.resolveTo(false);
        const errorSpy = spyOn(console, 'error');
        const matDialogRef = {
          beforeClosed: () =>
            of<NoteListFormEditor | undefined>({
              action: 'save',
              noteGroupTitle: title,
              notesGroupBuffer: notesBuffer,
            }),
        } as MatDialogRef<
          NoteListFormDialogEditorComponent,
          NoteListFormEditor
        >;

        // Act
        component['_subscribeToDialogEvents'](matDialogRef, id);

        flush();

        // Assert
        expect(modifyGroupsSpy).toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();
        expect(matDialogRef.disableClose).toBeTruthy();
      }));
    });

    describe(`_modifyGroups()`, () => {
      it(`should call #notesService.modifyGroups.`, () => {
        // Arrange
        const modifyGroupsSpy = notesServiceMock.modifyGroups;
        const groups = [exampleNoteGroupModel];
        const title = 'some-title';
        const notesBuffer = [
          exampleNoteModel,
          {
            ...exampleNoteModel,
            id: 'modified-id',
            value: 'modified-value',
          },
        ];
        const id = exampleNoteGroupModel.id;

        // Act
        component['_modifyGroups'](groups, title, notesBuffer, id);

        // Assert
        expect(modifyGroupsSpy).toHaveBeenCalledWith([
          {
            id,
            createdAt: exampleNoteGroupModel.createdAt,
            title,
            notes: notesBuffer,
          },
        ]);
      });
    });

    describe(`_updateGroups()`, () => {
      it(`should remove the selected group if it the buffer for the group is empty.`, () => {
        // Arrange
        const groups: NoteGroupModel[] = [
          exampleNoteGroupModel,
          {
            createdAt: Date.now(),
            id: 'another-id',
            notes: [],
            title: 'Another Group',
          },
        ];
        const title = 'some-title';
        const notesBuffer: NoteModel[] = [];
        const id = exampleNoteGroupModel.id;

        // Act
        const result = component['_updateGroups'](
          groups,
          title,
          notesBuffer,
          id
        );

        // Assert
        expect(result.length).toBe(1);
        expect(result[0].title).not.toBe(title);
        expect(result[0].id).toBe('another-id');
      });

      it(`should update the selected group by updating its title and notes.`, () => {
        // Arrange
        const groups: NoteGroupModel[] = [
          exampleNoteGroupModel,
          {
            createdAt: Date.now(),
            id: 'another-id',
            notes: [],
            title: 'Another Group',
          },
        ];
        const title = 'some-title';
        const notesBuffer = [
          exampleNoteModel,
          {
            ...exampleNoteModel,
            id: 'modified-id',
            value: 'modified-value',
          },
        ];
        const id = exampleNoteGroupModel.id;

        // Act
        const result = component['_updateGroups'](
          groups,
          title,
          notesBuffer,
          id
        );

        // Assert
        expect(result.length).toBe(2);
        expect(result[0].notes).toEqual(notesBuffer);
        expect(result[0].title).toEqual(title);
        expect(result[1].notes).not.toEqual(notesBuffer);
        expect(result[1].title).not.toEqual(title);
      });
    });
  });
});
