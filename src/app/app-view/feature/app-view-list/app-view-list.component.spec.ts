import {
  ComponentFixture,
  DeferBlockBehavior,
  DeferBlockFixture,
  DeferBlockState,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';

import { AppViewListComponent } from './app-view-list.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DebugElement, Provider } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { firebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service.mock';
import { BehaviorSubject, of } from 'rxjs';
import { firebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service.mock';
import { Database } from '@angular/fire/database';
import { firebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service.mock';
import { Storage } from '@angular/fire/storage';
import { FirebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service';
import { FirebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service';
import { FirebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service';
import { AuthLocalUserService } from 'src/app/auth/data-access/local-user/auth-local-user.service';
import { LocalUserAccount } from 'src/app/auth/utils/Models/LocalAuthModels.interface';
import { hsl } from 'random-color-creator';
import {
  localUTCTimestamp,
  randomId,
} from 'src/app/reusable/utils/data-tools/objectTools';
import { getElement } from 'src/app/reusable/utils/testing/utils/getElement';
import { NotesService } from '../../data-access/notes/notes.service';
import { NoteRestService } from '../../data-access/note-REST/note-rest.service';
import { By } from '@angular/platform-browser';
import {
  MatChipEditedEvent,
  MatChipInput,
  MatChipInputEvent,
} from '@angular/material/chips';
import { EditNoteI } from '../../ui/note-list-form/note-list-form.component';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/utils/Models/UserDataModels.interface';
import {
  OBJECT_TOOLS,
  OBJECT_TOOLS_TYPE,
} from 'src/app/reusable/utils/data-tools/objectTools.token';

const exampleLocalUser: LocalUserAccount = {
  auth: {
    authOption: 'pin',
    name: 'Example Name',
    value: '8563',
  },
  profileColor: hsl({
    alphaChannel: 1,
    colorParts: ['', '', ''],
    optionsObj: {
      hsl: {
        saturation: { minValue: 25 },
        lightness: { minValue: 25, maxValue: 50 },
      },
    },
  }) as string,
  groups: [],
};

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

describe('AppViewListComponent - integration', () => {
  // Mocks
  const authMock = jasmine.createSpyObj<Auth>(['setPersistence']);
  const firebaseAuthControllerServiceMock = firebaseAuthControllerService;
  const onlineUserValue = new BehaviorSubject<User | null>(null);

  const firebaseDatabaseControllerServiceMock = {
    ...firebaseDatabaseControllerService,
    db: {} as Database,
  };
  const firebaseStorageControllerServiceMock = {
    ...firebaseStorageControllerService,
    storage: {} as Storage,
  };

  const objectToolsMock: Partial<OBJECT_TOOLS_TYPE> = {
    createTimestamp: async () => localUTCTimestamp(),
    randomId: randomId,
  };

  // Component
  let fixture: ComponentFixture<AppViewListComponent>;
  let component: AppViewListComponent;
  let deferBlockFixture: DeferBlockFixture;

  let authLocalUserService: AuthLocalUserService;
  let noteRestService: NoteRestService;

  function loginOnlineUser(withNoteGroup = false) {
    onlineUserValue.next({
      displayName: 'Sam',
      emailVerified: true,
      email: 'example@domain.com',
      uid: 'some-uid',
    } as User);

    firebaseDatabaseControllerServiceMock.listVal.and.returnValue(
      withNoteGroup ? of([exampleNoteGroupModel]) : of([])
    );
  }

  function loginLocalUser(withNoteGroup = false) {
    authLocalUserService.createUser({
      auth: exampleLocalUser.auth,
    });

    if (withNoteGroup) {
      authLocalUserService.modifyCurrentUser({
        groups: [exampleNoteGroupModel],
      });
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      imports: [AppViewListComponent],
      providers: [
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
        {
          provide: OBJECT_TOOLS,
          useValue: objectToolsMock,
        },
        provideNoopAnimations(),
        NotesService,
        NoteRestService,
      ] as Provider[],
    }).compileComponents();

    fixture = TestBed.createComponent(AppViewListComponent);
    component = fixture.componentInstance;

    authLocalUserService = TestBed.inject(AuthLocalUserService);
    noteRestService = TestBed.inject(NoteRestService);
  });

  beforeEach(() => {
    onlineUserValue.next(null);
    firebaseAuthControllerServiceMock.user.and.returnValue(onlineUserValue);

    localStorage.clear();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe(`mobile/tablet viewport`, () => {
    beforeAll(() => {
      viewport.set('mobile');
    });

    afterAll(() => {
      viewport.reset();
    });

    it(`should show the h1 tag.`, () => {
      // Arrange

      // Act
      const h1Element = getElement<AppViewListComponent, HTMLHeadingElement>(
        fixture,
        `[data-test="app-view-list-mobile-h1"]`
      );

      // Assert
      expect(h1Element).toBeTruthy();
    });

    it(`should show a section with a button to create a new note group.`, () => {
      // Arrange

      // Act
      const sectionElement = getElement<AppViewListComponent, HTMLElement>(
        fixture,
        `[data-test="mobile-create-note-group-section"]`
      );

      // Assert
      expect(sectionElement).toBeTruthy();
    });

    describe(`bottom sheet`, () => {
      let toggleBottomSheetButtonElement: DebugElement;
      let bottomSheetElement: DebugElement;
      let formComponentInsideBottomSheet: DebugElement;

      beforeEach(fakeAsync(async () => {
        deferBlockFixture = (await fixture.getDeferBlocks())[1];
        await deferBlockFixture.render(DeferBlockState.Complete);

        toggleBottomSheetButtonElement = fixture.debugElement.query(
          By.css(`[data-test="mobile-show-note-group-form-button"]`)
        );
        toggleBottomSheetButtonElement.triggerEventHandler('click', null);

        flush();
        fixture.detectChanges();

        bottomSheetElement = fixture.debugElement.query(
          By.css(`[data-test="bottom-sheet-with-note-list-form"]`)
        );

        formComponentInsideBottomSheet = fixture.debugElement.query(
          By.css(`[data-test="note-list-form-for-touch-devices"]`)
        );
      }));

      it(`should show a bottom sheet with a form to create a new note group if the button is clicked.`, () => {
        // Arrange

        // Act

        // Assert
        expect(
          bottomSheetElement.componentInstance['_isOpenedSubject'].value
        ).toBeTruthy();
      });

      it(`should show a button to create a new note group after closing the bottom sheet.`, () => {
        // Arrange

        // Act
        fixture.debugElement
          .query(
            By.css(
              `[data-test="bottom-sheet-with-note-list-form"] [data-test="sheet-overlay"]`
            )
          )
          .triggerEventHandler('click');
        fixture.detectChanges();

        // Assert
        expect(
          (
            toggleBottomSheetButtonElement.nativeElement as HTMLButtonElement
          ).classList.contains('add-new-noteList__open-button--toggled')
        ).toBeFalsy();
      });

      it(`should emit the createNote event to create a new note in noteRestService.noteBuffer$.`, fakeAsync(() => {
        // Arrange
        const payload: MatChipInputEvent = {
          value: `Hi! I'm a new value`,
          chipInput: {
            clear: () => {},
          } as MatChipInput,
          input: {} as HTMLInputElement,
        };

        // Act
        formComponentInsideBottomSheet.triggerEventHandler(
          'createNote',
          payload
        );

        flush();

        // Assert
        expect(
          noteRestService['_notesBufferSubject'].value.find(
            ({ value }) => value === payload.value
          )
        ).toBeTruthy();
      }));

      it(`should emit the editNote event to modify existing note in noteRestService.noteBuffer$.`, fakeAsync(() => {
        // Arrange
        const existingNewNote: NoteModel = {
          id: randomId(27),
          createdAt: Date.now(),
          value: 'a new note',
        };
        noteRestService.fillNotesBuffer([existingNewNote]);
        const payload: EditNoteI = {
          note: existingNewNote,
          event: {
            value: `I'm an edited value`,
          } as MatChipEditedEvent,
        };

        // Act
        formComponentInsideBottomSheet.triggerEventHandler('editNote', payload);

        flush();

        // Assert
        expect(
          noteRestService['_notesBufferSubject'].value.find(
            ({ id }) => id === existingNewNote.id
          )?.value
        ).toBe(payload.event.value);
      }));

      it(`should emit the removeNote event to delete the existing note in noteRestService.noteBuffer$.`, fakeAsync(() => {
        // Arrange
        const existingNewNote: NoteModel = {
          id: randomId(27),
          createdAt: Date.now(),
          value: 'a new note',
        };
        noteRestService.fillNotesBuffer([existingNewNote]);
        const payload: NoteModel = { ...existingNewNote };

        // Act
        formComponentInsideBottomSheet.triggerEventHandler(
          'removeNote',
          payload
        );

        flush();

        // Assert
        expect(
          noteRestService['_notesBufferSubject'].value.find(
            ({ id }) => id === existingNewNote.id
          )
        ).toBeUndefined();
      }));

      it(`should emit the data event to handle note group creation based on the state of NoteListForm component form (online).`, fakeAsync(() => {
        // Arrange
        loginOnlineUser();
        const updateSpy =
          firebaseDatabaseControllerServiceMock.update.and.resolveTo();
        noteRestService['_notesBufferSubject'].next([exampleNoteModel]);
        const payload: { groupName: string } = {
          groupName: 'A new example note group',
        };

        // Act
        formComponentInsideBottomSheet.triggerEventHandler('data', payload);

        flush();

        // Assert
        expect(updateSpy).toHaveBeenCalled();
      }));

      it(`should emit the data event to handle note group creation based on the state of NoteListForm component form (local).`, fakeAsync(() => {
        // Arrange
        loginLocalUser();
        const modifyCurrentUserSpy = spyOn(
          authLocalUserService,
          'modifyCurrentUser'
        ).and.callThrough();
        noteRestService['_notesBufferSubject'].next([exampleNoteModel]);
        const payload: {
          groupName: string;
        } = {
          groupName: 'A new example note group',
        };

        // Act
        formComponentInsideBottomSheet.triggerEventHandler('data', payload);

        flush(3);

        // Assert
        expect(modifyCurrentUserSpy).toHaveBeenCalled();
        expect(
          authLocalUserService['_localUserSubject$'].value?.groups.length
        ).toBeGreaterThan(0);
      }));
    });
  });

  describe(`higher viewport`, () => {
    let formComponent: DebugElement;

    beforeEach(() => {
      formComponent = fixture.debugElement.query(
        By.css(`[data-test="standalone-note-list-form"]`)
      );
    });

    it(`should show the section with NoteListForm component instead of H1 tag.`, () => {
      // Arrange

      // Act

      // Assert
      expect(formComponent).toBeTruthy();
    });

    it(`should emit the createNote event to create a new note in noteRestService.noteBuffer$.`, fakeAsync(() => {
      // Arrange
      const payload: MatChipInputEvent = {
        value: `Hi! I'm a new value`,
        chipInput: {
          clear: () => {},
        } as MatChipInput,
        input: {} as HTMLInputElement,
      };

      // Act
      formComponent.triggerEventHandler('createNote', payload);

      flush();

      // Assert
      expect(
        noteRestService['_notesBufferSubject'].value.find(
          ({ value }) => value === payload.value
        )
      ).toBeTruthy();
    }));

    it(`should emit the editNote event to modify existing note in noteRestService.noteBuffer$.`, fakeAsync(() => {
      // Arrange
      const existingNewNote: NoteModel = {
        id: randomId(27),
        createdAt: Date.now(),
        value: 'a new note',
      };
      noteRestService.fillNotesBuffer([existingNewNote]);
      const payload: EditNoteI = {
        note: existingNewNote,
        event: {
          value: `I'm an edited value`,
        } as MatChipEditedEvent,
      };

      // Act
      formComponent.triggerEventHandler('editNote', payload);

      flush();

      // Assert
      expect(
        noteRestService['_notesBufferSubject'].value.find(
          ({ id }) => id === existingNewNote.id
        )?.value
      ).toBe(payload.event.value);
    }));

    it(`should emit the removeNote event to delete the existing note in noteRestService.noteBuffer$.`, fakeAsync(() => {
      // Arrange
      const existingNewNote: NoteModel = {
        id: randomId(27),
        createdAt: Date.now(),
        value: 'a new note',
      };
      noteRestService.fillNotesBuffer([existingNewNote]);
      const payload: NoteModel = { ...existingNewNote };

      // Act
      formComponent.triggerEventHandler('removeNote', payload);

      flush();

      // Assert
      expect(
        noteRestService['_notesBufferSubject'].value.find(
          ({ id }) => id === existingNewNote.id
        )
      ).toBeUndefined();
    }));

    it(`should emit the data event to handle note group creation based on the state of NoteListForm component form (online).`, fakeAsync(() => {
      // Arrange
      loginOnlineUser();

      const updateSpy =
        firebaseDatabaseControllerServiceMock.update.and.resolveTo();
      noteRestService['_notesBufferSubject'].next([exampleNoteModel]);
      const payload: { groupName: string } = {
        groupName: 'A new example note group',
      };

      // Act
      formComponent.triggerEventHandler('data', payload);

      flush();

      // Assert
      expect(updateSpy).toHaveBeenCalled();
    }));

    it(`should emit the data event to handle note group creation based on the state of NoteListForm component form (local).`, fakeAsync(() => {
      // Arrange
      loginLocalUser();
      const modifyCurrentUserSpy = spyOn(
        authLocalUserService,
        'modifyCurrentUser'
      ).and.callThrough();
      noteRestService['_notesBufferSubject'].next([exampleNoteModel]);
      const payload: {
        groupName: string;
      } = {
        groupName: 'A new example note group',
      };

      // Act
      formComponent.triggerEventHandler('data', payload);

      flush(3);

      // Assert
      expect(modifyCurrentUserSpy).toHaveBeenCalled();
      expect(
        authLocalUserService['_localUserSubject$'].value?.groups.length
      ).toBeGreaterThan(0);
    }));
  });

  describe(`independent from viewport size`, () => {
    it(`should show a mat-spinner if NoteGroupListContainer component is loading.`, async () => {
      // Arrange
      deferBlockFixture = (await fixture.getDeferBlocks())[0];
      await deferBlockFixture.render(DeferBlockState.Loading);

      // Act
      const matSpinner = getElement<AppViewListComponent, HTMLElement>(
        fixture,
        `[data-test="note-group-list-container-loading"]`
      );

      // Assert
      expect(matSpinner).toBeTruthy();
    });

    it(`should use the #noElementsInfo template if user doesn't have any notes.`, async () => {
      // Arrange
      deferBlockFixture = (await fixture.getDeferBlocks())[0];
      await deferBlockFixture.render(DeferBlockState.Complete);

      // Act
      const noElementsInfoElement = getElement<
        AppViewListComponent,
        HTMLElement
      >(fixture, `[data-test="no-elements-info-container"]`);

      // Assert
      expect(noElementsInfoElement).toBeTruthy();
    });
  });
});
