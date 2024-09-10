/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupMobileDetailsComponent } from './app-group-mobile-details.component';
import { Router, Routes, provideRouter } from '@angular/router';
import { NotesService } from '../../data-access/notes/notes.service';
import { Component, Provider, signal } from '@angular/core';
import { firebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service.mock';
import { Database } from '@angular/fire/database';
import { FirebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service';
import { firebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service.mock';
import { Storage } from '@angular/fire/storage';
import { FirebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service';
import { NoteRestService } from '../../data-access/note-REST/note-rest.service';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/utils/Models/UserDataModels.interface';
import { randomId } from 'src/app/reusable/utils/data-tools/objectTools';
import { provideLocationMocks } from '@angular/common/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { groupNotesResolver } from '../../utils/resolvers/groupNotes/group-notes.resolver';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { User } from '@angular/fire/auth';
import { AuthStateService } from 'src/app/auth/data-access/state/auth-state.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { getElement } from 'src/app/reusable/utils/testing/utils/getElement';
import { By } from '@angular/platform-browser';
import {
  EditNoteI,
  NoteListFormComponent,
} from '../../ui/note-list-form/note-list-form.component';
import {
  MatChipEditedEvent,
  MatChipInput,
  MatChipInputEvent,
} from '@angular/material/chips';

@Component({
  standalone: true,
  selector: 'app-test',
  template: `<p>Test component works!</p>`,
})
class TestComponent {}

const exampleNoteGroup: NoteGroupModel = {
  createdAt: Date.now(),
  id: randomId(27),
  title: 'Hello World',
  notes: [
    { id: randomId(27), createdAt: Date.now(), value: 'I hate everyone' },
  ],
};
const anotherNoteGroup: NoteGroupModel = {
  createdAt: Date.now(),
  id: randomId(27),
  title: 'Hello World 2',
  notes: [
    { id: randomId(27), createdAt: Date.now(), value: 'I love everyone' },
  ],
};

const exampleOnlineUser = { uid: 'example-uid', emailVerified: true } as User;

describe('AppGroupDetailsComponent - integration', () => {
  // Mocks
  const onlineUserValue = new BehaviorSubject<User | null>(null);
  const sessionSigValue = signal<User | null | undefined>(undefined);
  const authStateServiceMock: Partial<AuthStateService> = {
    user$: onlineUserValue.asObservable(),
    sessionSig: sessionSigValue.asReadonly(),
  };

  const firebaseDatabaseControllerServiceMock = {
    ...firebaseDatabaseControllerService,
    db: {} as Database,
  };
  const firebaseStorageControllerServiceMock = {
    ...firebaseStorageControllerService,
    storage: {} as Storage,
  };

  // Component
  let fixture: ComponentFixture<unknown>;
  let harness: RouterTestingHarness;
  let component: GroupMobileDetailsComponent;

  let viewTransitionService: ViewTransitionService;

  async function loadTestComponent() {
    return await harness.navigateByUrl(`/app/notes`, TestComponent);
  }

  async function loadTestedComponent() {
    return await harness.navigateByUrl(
      `/app/notes/${exampleNoteGroup.id}`,
      GroupMobileDetailsComponent
    );
  }

  beforeEach(() => {
    onlineUserValue.next(exampleOnlineUser);
    sessionSigValue.set(exampleOnlineUser);

    firebaseDatabaseControllerServiceMock.listVal.and.returnValue(
      of([anotherNoteGroup, exampleNoteGroup])
    );
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, GroupMobileDetailsComponent],
      providers: [
        provideRouter([
          {
            path: 'app/notes',
            children: [
              {
                path: ':groupDetails',
                loadComponent: () =>
                  import(
                    '../app-group-mobile-details/app-group-mobile-details.component'
                  ).then((m) => m.GroupMobileDetailsComponent),
                resolve: {
                  groupNotes: groupNotesResolver,
                },
              },
              {
                path: '',
                component: TestComponent,
              },
            ],
          },
        ] satisfies Routes),
        provideLocationMocks(),
        NotesService,
        NoteRestService,
        { provide: AuthStateService, useValue: authStateServiceMock },
        {
          provide: FirebaseDatabaseControllerService,
          useValue: firebaseDatabaseControllerServiceMock,
        },
        {
          provide: FirebaseStorageControllerService,
          useValue: firebaseStorageControllerServiceMock,
        },
      ] as Provider[],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
    fixture = harness.fixture;
    await loadTestComponent();
  });

  beforeEach(() => {
    viewTransitionService = TestBed.inject(ViewTransitionService);
    spyOn(viewTransitionService as any, '_runTransition').and.resolveTo();
  });

  describe(`component creation behavior`, () => {
    let navigateByUrlSpy: unknown;

    beforeEach(() => {
      navigateByUrlSpy = spyOn(
        TestBed.inject(Router),
        'navigateByUrl'
      ).and.callThrough();
    });

    it(`should redirect to the notes page if no group is found.`, async () => {
      // Arrange

      // Act
      component = await harness.navigateByUrl(
        '/app/notes/exampleNonExistingId',
        GroupMobileDetailsComponent
      );
      harness.detectChanges();
      await fixture.whenStable();

      // Assert
      expect(navigateByUrlSpy).toHaveBeenCalledTimes(2);
      expect(TestBed.inject(Router).url).toEqual(`/app/notes`);
    });

    it(`should redirect to the notes page if the edited group is marked to delete.`, async () => {
      // Arrange
      firebaseDatabaseControllerServiceMock.listVal.and.returnValue(
        of([
          { ...exampleNoteGroup, deleteAt: Date.now() + 1000 },
        ] as NoteGroupModel[])
      );

      // Act
      component = await harness.navigateByUrl(
        `/app/notes/${exampleNoteGroup.id}`,
        GroupMobileDetailsComponent
      );
      harness.detectChanges();
      await fixture.whenStable();

      // Assert
      expect(navigateByUrlSpy).toHaveBeenCalledTimes(2);
      expect(TestBed.inject(Router).url).toEqual(`/app/notes`);
    });

    it('should be created successfully if the note group is found.', async () => {
      // Act
      component = await loadTestedComponent();

      // Assert
      expect(navigateByUrlSpy).toHaveBeenCalledTimes(1);
      expect(component).toBeTruthy();
      expect(TestBed.inject(Router).url).toEqual(
        `/app/notes/${exampleNoteGroup.id}`
      );
    });
  });

  describe(`component interactions`, () => {
    describe(`template errors`, () => {
      it(`should show the FetchError component if data$ does not emit value.`, async () => {
        // Arrange
        const notesBufferValue = new Subject<NoteModel[]>();
        spyOnProperty(
          TestBed.inject(NoteRestService),
          'notesBuffer$',
          'get'
        ).and.returnValue(notesBufferValue);

        // Act
        component = await loadTestedComponent();
        harness.detectChanges();
        await fixture.whenStable();
        const fetchErrorComponent = harness.routeNativeElement?.querySelector(
          `[data-test="fetch-error-data$-no-emit"]`
        );

        // Assert
        expect(fetchErrorComponent).toBeTruthy();
      });
    });

    describe(`renders`, () => {
      beforeEach(async () => {
        component = await loadTestedComponent();
      });

      it(`should render NoteListForm component if data$ emits value.`, async () => {
        // Arrange

        // Act
        const formComponent = getElement(fixture, `[data-test="editing-form"]`);

        // Assert
        expect(formComponent).toBeTruthy();
      });

      it(`should render two action buttons to close the editor.`, async () => {
        // Arrange

        // Act
        const cancelButton = getElement<unknown, HTMLButtonElement>(
          fixture,
          `[data-test="note-edit-action-button-cancel"]`
        );
        const saveButton = getElement<unknown, HTMLButtonElement>(
          fixture,
          `[data-test="note-edit-action-button-save"]`
        );

        // Assert
        expect(cancelButton).toBeTruthy();
        expect(saveButton).toBeTruthy();
      });

      it(`should call closeEditor method if cancel button has been clicked.`, () => {
        // Arrange
        const spy = spyOn(component, `closeEditor`).and.callThrough();

        // Act
        const cancelButton = getElement<unknown, HTMLButtonElement>(
          fixture,
          `[data-test="note-edit-action-button-cancel"]`
        );
        cancelButton.click();

        // Assert
        expect(spy).toHaveBeenCalledWith('close');
      });

      it(`should call closeEditor method if save button has been clicked.`, () => {
        // Arrange
        const spy = spyOn(component, `closeEditor`).and.callThrough();

        // Act
        const cancelButton = getElement<unknown, HTMLButtonElement>(
          fixture,
          `[data-test="note-edit-action-button-save"]`
        );
        cancelButton.click();

        // Assert
        expect(spy).toHaveBeenCalledWith('save');
      });
    });

    describe(`handling NoteListFormComponent events`, () => {
      beforeEach(async () => {
        component = await loadTestedComponent();
      });

      it(`should call onCreateNote if NoteListFormComponent emits createNote event.`, () => {
        // Arrange
        const spy = spyOn(component, `onCreateNote`).and.callThrough();
        const payload: MatChipInputEvent = {
          value: `Hi! I'm a new value`,
          chipInput: {
            clear: () => {},
          } as MatChipInput,
          input: {} as HTMLInputElement,
        };

        // Act
        const noteListFormComponent = harness.routeDebugElement?.query(
          By.directive(NoteListFormComponent)
        );
        noteListFormComponent?.triggerEventHandler('createNote', payload);

        // Assert
        expect(spy).toHaveBeenCalled();
      });

      it(`should call onEditNote if NoteListFormComponent emits editNote event.`, () => {
        // Arrange
        const spy = spyOn(component, `onEditNote`).and.callThrough();
        const payload: EditNoteI = {
          note: exampleNoteGroup.notes[0],
          event: {
            value: `I'm an edited value`,
          } as MatChipEditedEvent,
        };

        // Act
        const noteListFormComponent = harness.routeDebugElement?.query(
          By.directive(NoteListFormComponent)
        );
        noteListFormComponent?.triggerEventHandler('editNote', payload);

        // Assert
        expect(spy).toHaveBeenCalled();
      });

      it(`should call removeNote if NoteListFormComponent emits removeNote event.`, () => {
        // Arrange
        const spy = spyOn(component, `onRemoveNote`).and.callThrough();
        const payload: NoteModel = exampleNoteGroup.notes[0];

        // Act
        const noteListFormComponent = harness.routeDebugElement?.query(
          By.directive(NoteListFormComponent)
        );
        noteListFormComponent?.triggerEventHandler('removeNote', payload);

        // Assert
        expect(spy).toHaveBeenCalled();
      });
    });

    describe(`saving scenarios`, () => {
      beforeEach(async () => {
        component = await loadTestedComponent();
      });

      it(`should clear the notesBuffer and go to the previous page (or fallback).`, async () => {
        // Arrange

        // Act
        const cancelButton = getElement<unknown, HTMLButtonElement>(
          fixture,
          `[data-test="note-edit-action-button-cancel"]`
        );
        cancelButton.click();

        await harness.fixture.whenStable();

        // Assert
        expect(
          TestBed.inject(NoteRestService)['_notesBufferSubject'].value.length
        ).toEqual(0);
      });

      it(`should remove the group if noteBuffer doesn't contain any notes.`, async () => {
        // Arrange
        const spy = spyOn(TestBed.inject(NotesService), 'deleteGroup');
        harness.routeDebugElement
          ?.query(By.directive(NoteListFormComponent))
          .triggerEventHandler('removeNote', exampleNoteGroup.notes[0]);

        // Act
        getElement<unknown, HTMLButtonElement>(
          fixture,
          `[data-test="note-edit-action-button-save"]`
        ).click();

        // Assert
        expect(spy).toHaveBeenCalledWith(exampleNoteGroup.id);
      });

      it(`should save the changes and go to the previous page (or fallback)`, async () => {
        // Arrange
        const spy = spyOn(TestBed.inject(NotesService), 'modifyGroups');
        const newValue = "I'm an edited value";
        harness.routeDebugElement
          ?.query(By.directive(NoteListFormComponent))
          .triggerEventHandler('editNote', {
            note: exampleNoteGroup.notes[0],
            event: { value: newValue } as MatChipEditedEvent,
          } satisfies EditNoteI);
        const editedGroup: NoteGroupModel = {
          ...exampleNoteGroup,
          notes: [{ ...exampleNoteGroup.notes[0], value: newValue }],
        };

        // Act
        getElement<unknown, HTMLButtonElement>(
          fixture,
          `[data-test="note-edit-action-button-save"]`
        ).click();

        // Assert
        expect(spy).toHaveBeenCalledWith([anotherNoteGroup, editedGroup]);
      });
    });
  });
});
