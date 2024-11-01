/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
} from '@angular/core/testing';
import {
  INoteListFormDialogData,
  NoteListFormDialogEditorComponent,
} from './note-list-form-dialog-editor.component';
import { AfterViewInit, Component, inject, Provider } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Auth, User } from '@angular/fire/auth';
import { firebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service.mock';
import { BehaviorSubject } from 'rxjs';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/utils/Models/UserDataModels.interface';
import * as tools from 'src/app/reusable/utils/data-tools/objectTools';
import { firebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service.mock';
import { Database } from '@angular/fire/database';
import { Storage } from '@angular/fire/storage';
import { firebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service.mock';
import { FirebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service';
import { FirebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service';
import { FirebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service';
import { NoteRestService } from '../../data-access/note-REST/note-rest.service';
import { NotesService } from '../../data-access/notes/notes.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoteListFormEditor } from '../../utils/models/note-list-form-editor.interface';
import { HarnessLoader, TestKey } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import {
  MatChipEditInputHarness,
  MatChipInputHarness,
  MatChipRemoveHarness,
  MatChipRowHarness,
} from '@angular/material/chips/testing';
import { setFormInputValue } from 'src/app/reusable/utils/testing/utils/setFormInputValue';

const exampleOnlineUser = {
  displayName: 'Example Name',
  photoURL: 'example:url',
  email: 'example@example.com',
  uid: 'example-uid',
} as User;

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

const noteGroupMarkedToRemove: NoteGroupModel = {
  id: tools.randomId(27),
  title: 'second',
  createdAt: Date.now() - 1000,
  notes: [
    {
      id: tools.randomId(27),
      createdAt: Date.now(),
      value: 'Another note',
    },
  ],
  deleteAt: Date.now() + 1000,
};

@Component({
  standalone: true,
  selector: 'app-test',
  template: `The app-test component works!`,
})
class TestComponent implements AfterViewInit {
  #dialog = inject(MatDialog);

  dialogRef:
    | MatDialogRef<NoteListFormDialogEditorComponent, NoteListFormEditor>
    | undefined;

  ngAfterViewInit(): void {
    this.dialogRef = this.#dialog.open<
      NoteListFormDialogEditorComponent,
      INoteListFormDialogData,
      NoteListFormEditor
    >(NoteListFormDialogEditorComponent, {
      data: {
        id: exampleNoteGroupModel.id,
      },
    });
  }
}

describe(`NoteListFormDialogEditorComponent - integration`, () => {
  // Mocks
  const authMock = jasmine.createSpyObj<Auth>([`setPersistence`]);
  const firebaseAuthControllerServiceMock = firebaseAuthControllerService;
  const onlineUserValue = new BehaviorSubject<User | null>(exampleOnlineUser);
  const onlineUserNoteGroups = new BehaviorSubject<NoteGroupModel[]>([
    exampleNoteGroupModel,
    noteGroupMarkedToRemove,
  ]);

  const firebaseDatabaseControllerServiceMock = {
    ...firebaseDatabaseControllerService,
    db: {} as Database,
  };
  const firebaseStorageControllerServiceMock = {
    ...firebaseStorageControllerService,
    storage: {} as Storage,
  };

  // Component
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let loader: HarnessLoader;

  beforeAll(() => {
    firebaseAuthControllerServiceMock.user.and.returnValue(
      onlineUserValue.asObservable()
    );
    firebaseDatabaseControllerServiceMock.listVal.and.returnValue(
      onlineUserNoteGroups.asObservable()
    );
  });

  beforeEach(() => {
    onlineUserValue.next(exampleOnlineUser);

    onlineUserNoteGroups.next([exampleNoteGroupModel, noteGroupMarkedToRemove]);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteListFormDialogEditorComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: Auth,
          useValue: authMock,
        },
        {
          provide: FirebaseAuthControllerService,
          useValue: firebaseAuthControllerServiceMock,
        },
        {
          provide: FirebaseDatabaseControllerService,
          useValue: firebaseDatabaseControllerServiceMock,
        },
        {
          provide: FirebaseStorageControllerService,
          useValue: firebaseStorageControllerServiceMock,
        },
        NotesService,
        NoteRestService,
      ] as Provider[],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it(`should close the dialog immediately when the selected groups wasn't found.`, fakeAsync(() => {
    // Arrange
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    if (!component.dialogRef) {
      throw new Error(`DialogRef not created`);
    }
    const closeSpy = spyOn(component.dialogRef, 'close').and.callThrough();
    onlineUserNoteGroups.next([
      { ...exampleNoteGroupModel, id: tools.randomId(27) },
    ]);

    // Act
    let resultAfterClosed: NoteListFormEditor | undefined;
    const subscription = component.dialogRef
      .beforeClosed()
      .subscribe((result) => {
        resultAfterClosed = result;
      });

    flush();
    subscription.unsubscribe();

    // Assert
    expect(closeSpy).toHaveBeenCalledWith({ action: 'close' });
    expect(resultAfterClosed).toEqual({ action: `close` });
  }));

  it(`should open dialog with correct data.`, () => {
    expect(component.dialogRef).toBeTruthy();
  });

  it(`should close dialog when Escape key is pressed.`, fakeAsync(() => {
    // Arrange
    if (!component.dialogRef) {
      throw new Error(`DialogRef not created`);
    }
    const closeSpy = spyOn(component.dialogRef, 'close').and.callThrough();

    // Act
    let resultAfterClosed: NoteListFormEditor | undefined;
    const subscription = component.dialogRef
      .beforeClosed()
      .subscribe((result) => {
        resultAfterClosed = result;
      });

    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
    });
    window.dispatchEvent(escapeEvent);

    fixture.detectChanges();
    flush();
    subscription.unsubscribe();

    // Assert
    expect(closeSpy).toHaveBeenCalledWith({ action: 'close' });
    expect(resultAfterClosed).toEqual({ action: `close` });
  }));

  it(`should do nothing if noteGroupTitleFormElement.errors is truthy.`, fakeAsync(async () => {
    // Arrange
    if (!component.dialogRef) {
      throw new Error(`DialogRef not created`);
    }
    const closeSpy = spyOn(component.dialogRef, 'close').and.callThrough();
    const dialogComponent = component.dialogRef.componentInstance;

    // Act
    let expectedNotes: NoteModel[] | undefined;
    const subscription = dialogComponent.groupNotes$.subscribe((notes) => {
      expectedNotes = notes;
    });

    const titleFormElement = document.querySelector(
      `[data-test="note-list-title-input"]`
    ) as HTMLInputElement;

    setFormInputValue(
      titleFormElement,
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex voluptatibus quo odio temporibus placeat vero, possimus accusamus doloribus quam ea! Deleniti aspernatur tenetur soluta minus? Totam facilis deserunt beatae velit animi iusto perferendis exercitationem molestiae!'
    );
    fixture.detectChanges();

    const saveButton = document.querySelector(
      `[data-test="dialog-action-button-save"]`
    ) as HTMLButtonElement;

    saveButton.click();
    fixture.detectChanges();

    flush();
    subscription.unsubscribe();

    // Assert
    expect(expectedNotes!.length).not.toBeGreaterThan(1);
    expect(closeSpy).not.toHaveBeenCalled();
  }));

  it(`should close dialog when Close button has been clicked.`, fakeAsync(async () => {
    // Arrange
    if (!component.dialogRef) {
      throw new Error(`DialogRef not created`);
    }
    const closeSpy = spyOn(component.dialogRef, 'close').and.callThrough();

    // Act
    let resultAfterClosed: NoteListFormEditor | undefined;
    const subscription = component.dialogRef
      .beforeClosed()
      .subscribe((result) => {
        resultAfterClosed = result;
      });

    const closeButton = document.querySelector(
      `[data-test="dialog-action-button-close"]`
    ) as HTMLButtonElement;
    closeButton.click();

    fixture.detectChanges();
    flush();
    subscription.unsubscribe();

    // Assert
    expect(closeSpy).toHaveBeenCalledWith({
      action: 'close',
      noteGroupTitle: exampleNoteGroupModel.title,
      notesGroupBuffer: exampleNoteGroupModel.notes,
    });
    expect(resultAfterClosed).toEqual({
      action: 'close',
      noteGroupTitle: exampleNoteGroupModel.title,
      notesGroupBuffer: exampleNoteGroupModel.notes,
    });
  }));

  it(`should close dialog with save action and updated data.`, fakeAsync(() => {
    // Arrange
    if (!component.dialogRef) {
      throw new Error(`DialogRef not created`);
    }

    // Act
    let resultAfterClosed: NoteListFormEditor | undefined;
    const subscription = component.dialogRef
      .beforeClosed()
      .subscribe((result) => {
        resultAfterClosed = result;
      });

    const saveButton = document.querySelector(
      `[data-test="dialog-action-button-save"]`
    ) as HTMLButtonElement;
    saveButton.click();

    fixture.detectChanges();
    flush();
    subscription.unsubscribe();

    // Assert
    expect(resultAfterClosed!.action).toBe(`save`);
    expect(resultAfterClosed!.noteGroupTitle).toBeTruthy();
    expect(resultAfterClosed!.notesGroupBuffer).toBeTruthy();
  }));

  it(`should handle note creation.`, fakeAsync(async () => {
    // Arrange
    if (!component.dialogRef) {
      throw new Error(`DialogRef not created`);
    }

    const dialogComponent = component.dialogRef.componentInstance;

    const newNoteInputElement = await loader.getHarness(
      MatChipInputHarness.with({
        selector: `[data-test="create-note-input"]`,
      })
    );

    // Act
    let expectedNotes: NoteModel[] | undefined;
    const subscription = dialogComponent.groupNotes$.subscribe((notes) => {
      expectedNotes = notes;
    });

    await newNoteInputElement.focus();
    await newNoteInputElement.setValue('A newly created value');
    await newNoteInputElement.sendSeparatorKey(TestKey.ENTER);

    flush();
    subscription.unsubscribe();

    // Assert
    expect(expectedNotes!.length).toBeGreaterThan(1);
  }));

  it(`should handle note editing.`, fakeAsync(async () => {
    // Arrange
    if (!component.dialogRef) {
      throw new Error(`DialogRef not created`);
    }

    const dialogComponent = component.dialogRef.componentInstance;

    const chipRowNoteElement = await loader.getHarness(
      MatChipRowHarness.with({
        selector: `[data-test="note-chip-${exampleNoteGroupModel.notes[0].id}"]`,
      })
    );

    // Act
    let expectedNotes: NoteModel[] | undefined;
    const subscription = dialogComponent.groupNotes$.subscribe((notes) => {
      expectedNotes = notes;
    });

    await chipRowNoteElement.startEditing();
    await (
      await chipRowNoteElement.getHarness(MatChipEditInputHarness)
    ).setValue('An edited note');
    await chipRowNoteElement.finishEditing();

    flush();
    subscription.unsubscribe();

    // Assert
    if (!expectedNotes) {
      throw new Error(`Expected notes not received`);
    }

    expect(expectedNotes.length).toBe(1);
    expect(expectedNotes[0].value).toBe('An edited note');
  }));

  it(`should handle note deletion.`, fakeAsync(async () => {
    // Arrange
    if (!component.dialogRef) {
      throw new Error(`DialogRef not created`);
    }

    const dialogComponent = component.dialogRef.componentInstance;

    const deleteButton = await loader.getHarness(
      MatChipRemoveHarness.with({
        selector: `[data-test="note-chip-${exampleNoteGroupModel.notes[0].id}"] button[matChipRemove]`,
      })
    );

    // Act
    let expectedNotes: NoteModel[] | undefined;
    const subscription = dialogComponent.groupNotes$.subscribe((notes) => {
      expectedNotes = notes;
    });

    await deleteButton.click();
    flush();
    subscription.unsubscribe();

    // Assert
    expect(
      expectedNotes!.find((note) => note.id === exampleNoteModel.id)
    ).toBeFalsy();
  }));
});
