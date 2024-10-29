/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { NoteGroupListContainerComponent } from './note-group-list-container.component';
import { Component, Provider, inject } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { firebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service.mock';
import { BehaviorSubject, map } from 'rxjs';
import { firebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service.mock';
import { Database } from '@angular/fire/database';
import { firebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service.mock';
import { Storage } from '@angular/fire/storage';
import { FirebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service';
import { FirebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service';
import { FirebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service';
import { NotesService } from '../../data-access/notes/notes.service';
import { NoteRestService } from '../../data-access/note-REST/note-rest.service';
import { By } from '@angular/platform-browser';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/utils/Models/UserDataModels.interface';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { AsyncPipe } from '@angular/common';
import {
  OBJECT_TOOLS,
  OBJECT_TOOLS_TYPE,
} from 'src/app/reusable/utils/data-tools/objectTools.token';
import * as tools from 'src/app/reusable/utils/data-tools/objectTools';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import {
  MatChipInputHarness,
  MatChipRemoveHarness,
} from '@angular/material/chips/testing';
import { TestKey } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { AdaptiveButtonHarness } from 'src/app/reusable/utils/adaptive-button/adaptive-button.harness';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatMenuItemHarness } from '@angular/material/menu/testing';

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
  selector: 'app-test',
  standalone: true,
  template: `
    <app-note-group-list-container [markForDelete]="markForDelete">
      <ng-template #noElementsInfo>
        <span data-test="noElementsInfo-element">Oh, nothing's here</span>
      </ng-template>
    </app-note-group-list-container>
  `,
  imports: [NoteGroupListContainerComponent],
})
class TestComponent {
  markForDelete = false;
}

@Component({
  standalone: true,
  template: `
    <h1>The mobile note group editor works!</h1>
    <p>The note group id is {{ id$ | async }}</p>
  `,
  imports: [AsyncPipe],
})
class MobileNoteGroupEditorTestComponent {
  #route = inject(ActivatedRoute);

  protected id$ = this.#route.paramMap.pipe(
    map((paramMap) => paramMap.get('groupDetails'))
  );
}

async function createNewNote(
  matChipInputHarness: MatChipInputHarness,
  newNoteValue: string
) {
  await matChipInputHarness.focus();
  await matChipInputHarness.setValue(newNoteValue);
  await matChipInputHarness.sendSeparatorKey(TestKey.ENTER);
}

describe('NoteGroupListContainerComponent - integration', () => {
  // Mocks
  const authMock = jasmine.createSpyObj<Auth>(['setPersistence']);
  const firebaseAuthControllerServiceMock = firebaseAuthControllerService;
  const onlineUserValue = new BehaviorSubject<User | null>(null);
  const onlineUserNoteGroups = new BehaviorSubject<NoteGroupModel[]>([]);

  const firebaseDatabaseControllerServiceMock = {
    ...firebaseDatabaseControllerService,
    db: {} as Database,
  };
  const firebaseStorageControllerServiceMock = {
    ...firebaseStorageControllerService,
    storage: {} as Storage,
  };

  // Component
  let harness: RouterTestingHarness;
  let component: NoteGroupListContainerComponent;

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
    onlineUserValue.next(null);

    onlineUserNoteGroups.next([]);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteGroupListContainerComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([
          {
            path: 'app/notes',
            children: [
              {
                path: ':groupDetails',
                component: MobileNoteGroupEditorTestComponent,
              },
              {
                path: '',
                component: TestComponent,
              },
            ],
          },
        ]),
        provideLocationMocks(),
        {
          provide: OBJECT_TOOLS,
          useValue: {
            ...tools,
            createTimestamp: async () => tools.localUTCTimestamp(),
          } satisfies OBJECT_TOOLS_TYPE,
        },
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

    harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('app/notes');
    harness.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(harness.fixture);

    component = harness.routeDebugElement?.query(
      By.directive(NoteGroupListContainerComponent)
    ).componentInstance;
  });

  beforeEach(() => {
    spyOn(
      TestBed.inject(ViewTransitionService) as any,
      '_runAnimationOnce'
    ).and.resolveTo();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe(`render`, () => {
    describe(`loading content`, () => {
      it(`should show noGroupsFound element if filteredNoteGroups$ doesn't emit any value.`, () => {
        // Arrange

        // Act
        const element = harness.routeDebugElement?.query(
          By.css(`[data-test="noElementsInfo-element"]`)
        ).nativeElement;

        // Assert
        expect(element).toBeTruthy();
      });

      it(`should show noGroupsFound element if filteredNoteGroups$ emits an empty Array.`, () => {
        // Arrange
        onlineUserValue.next(exampleOnlineUser);

        // Act
        const element = harness.routeDebugElement?.query(
          By.css(`[data-test="noElementsInfo-element"]`)
        ).nativeElement;

        // Assert
        expect(element).toBeTruthy();
      });

      it(`should show the NgxMasonry component with all filtered note groups.`, async () => {
        // Arrange
        onlineUserNoteGroups.next([
          exampleNoteGroupModel,
          noteGroupMarkedToRemove,
          {
            id: tools.randomId(27),
            createdAt: Date.now(),
            title: 'Example new random group',
            notes: [
              {
                createdAt: Date.now(),
                id: tools.randomId(27),
                value: 'XYZ2',
              },
            ],
          },
        ]);
        onlineUserValue.next(exampleOnlineUser);

        harness.detectChanges();

        // Act
        const noElementsInfoElement = harness.routeDebugElement?.query(
          By.css(`[data-test="noElementsInfo-element"]`)
        );

        const NgxMasonryComponentInstance = harness.routeDebugElement?.query(
          By.css(`[data-test="note-groups-container"]`)
        ).nativeElement as HTMLElement;

        const visibleGroups = NgxMasonryComponentInstance.querySelectorAll(
          `[data-test="note-group-list-item"]`
        );

        // Assert
        expect(noElementsInfoElement).toBeFalsy();
        expect(NgxMasonryComponentInstance).toBeTruthy();
        expect(visibleGroups.length).toEqual(2);
      });
    });

    describe(`interacting with note groups.`, () => {
      function triggerCardClick(id: string) {
        harness.routeDebugElement
          ?.query(By.css(`[data-test="note-group-list-item-${id}"]`))
          .triggerEventHandler('cardClick', id);
      }

      beforeEach(() => {
        onlineUserNoteGroups.next([
          exampleNoteGroupModel,
          noteGroupMarkedToRemove,
          {
            id: tools.randomId(27),
            createdAt: Date.now(),
            title: 'Example new random group',
            notes: [
              {
                createdAt: Date.now(),
                id: tools.randomId(27),
                value: 'XYZ2',
              },
            ],
          },
        ]);
        onlineUserValue.next(exampleOnlineUser);

        harness.detectChanges();
      });

      describe(`mobile view`, () => {
        it(`should navigate to mobile group editor when the user uses a smartphone/tablet.`, fakeAsync(() => {
          // Arrange
          viewport.set('mobile');
          const navigateByUrlSpy = spyOn(
            TestBed.inject(Router),
            'navigateByUrl'
          ).and.callThrough();

          // Act
          triggerCardClick(exampleNoteGroupModel.id);

          flush();

          // Assert
          viewport.reset();
          expect(navigateByUrlSpy).toHaveBeenCalledWith(
            `/app/notes/${exampleNoteGroupModel.id}`
          );
          expect(TestBed.inject(Router).url).toBe(
            `/app/notes/${exampleNoteGroupModel.id}`
          );
        }));
      });

      it(`should show a dialog with group editor when the user uses a device larger than a tablet.`, async () => {
        // Arrange
        const dialogOpenSpy = spyOn(
          TestBed.inject(MatDialog),
          'open'
        ).and.callThrough();

        // Act
        triggerCardClick(exampleNoteGroupModel.id);

        harness.detectChanges();
        await harness.fixture.whenStable();

        const dialogHarness = await loader.getHarness(MatDialogHarness);

        const dialogAriaLabel = await dialogHarness.getAriaLabel();

        // Assert
        expect(dialogOpenSpy).toHaveBeenCalled();
        expect(dialogHarness).toBeTruthy();
        expect(dialogAriaLabel).toBe(
          component['_configureDialog'](exampleNoteGroupModel.id).ariaLabel!
        );
      });

      it(`should close the dialog and clear the NotesBuffer if action is 'close'.`, async () => {
        // Arrange
        const fillNotesBufferSpy = spyOn(
          TestBed.inject(NoteRestService),
          'fillNotesBuffer'
        ).and.callThrough();

        triggerCardClick(exampleNoteGroupModel.id);

        harness.detectChanges();
        await harness.fixture.whenStable();

        const dialogHarness = await loader.getHarness(MatDialogHarness);

        // Act
        const closeButton = await dialogHarness.getHarness(
          AdaptiveButtonHarness.with({
            selector: `[data-test="dialog-action-button-close"]`,
          })
        );

        await closeButton.click();

        // Assert
        expect(fillNotesBufferSpy).toHaveBeenCalledWith([]);
      });

      it(`should close the dialog and clear the NotesBuffer if user exits the dialog in other way than action button.`, async () => {
        // Arrange
        const fillNotesBufferSpy = spyOn(
          TestBed.inject(NoteRestService),
          'fillNotesBuffer'
        ).and.callThrough();
        const escapeEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          which: 27,
        });

        triggerCardClick(exampleNoteGroupModel.id);

        harness.detectChanges();
        await harness.fixture.whenStable();

        // Act
        window.dispatchEvent(escapeEvent);

        harness.detectChanges();
        await harness.fixture.whenStable();

        // Assert
        expect(fillNotesBufferSpy).toHaveBeenCalledWith([]);
      });

      it(`should log the error to the console if _modifyGroups's Promise reject (message property defined).`, async () => {
        // Arrange
        const errorMessage = 'The request connection timed out';
        const modifyGroupsSpy = spyOn(
          TestBed.inject(NotesService),
          'modifyGroups'
        ).and.rejectWith({
          code: 'connection-timeout',
          message: errorMessage,
        });
        const errorSpy = spyOn(console, 'error');
        const newNoteValue = 'Another-Value';

        triggerCardClick(exampleNoteGroupModel.id);

        harness.detectChanges();
        await harness.fixture.whenStable();

        const dialogHarness = await loader.getHarness(MatDialogHarness);

        // Act
        const createNoteInput = await dialogHarness.getHarness(
          MatChipInputHarness.with({
            selector: `[data-test="create-note-input"]`,
          })
        );

        // Create a new note within the dialog's form
        await createNewNote(createNoteInput, newNoteValue);

        const closeButton = await dialogHarness.getHarness(
          AdaptiveButtonHarness.with({
            selector: `[data-test="dialog-action-button-save"]`,
          })
        );

        await closeButton.click();

        harness.detectChanges();
        await harness.fixture.whenStable();

        // Assert
        expect(modifyGroupsSpy).toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(errorMessage);
      });

      it(`should log the error to the console if _modifyGroups's Promise reject (message property NOT defined).`, async () => {
        // Arrange
        const errorObject = {
          code: 'connection-timeout',
          msg: 'The request connection timed out',
        };

        const modifyGroupsSpy = spyOn(
          TestBed.inject(NotesService),
          'modifyGroups'
        ).and.rejectWith(errorObject);
        const errorSpy = spyOn(console, 'error');
        const newNoteValue = 'Another-Value';

        triggerCardClick(exampleNoteGroupModel.id);

        harness.detectChanges();
        await harness.fixture.whenStable();

        const dialogHarness = await loader.getHarness(MatDialogHarness);

        // Act
        const createNoteInput = await dialogHarness.getHarness(
          MatChipInputHarness.with({
            selector: `[data-test="create-note-input"]`,
          })
        );

        await createNewNote(createNoteInput, newNoteValue);

        const closeButton = await dialogHarness.getHarness(
          AdaptiveButtonHarness.with({
            selector: `[data-test="dialog-action-button-save"]`,
          })
        );

        await closeButton.click();

        harness.detectChanges();
        await harness.fixture.whenStable();

        // Assert
        expect(modifyGroupsSpy).toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(errorObject);
      });

      it(`should close the dialog and call #notesService.modifyGroups if action is 'save'.`, async () => {
        // Arrange
        const updateSpy = firebaseDatabaseControllerServiceMock.update;
        const modifyGroupsSpy = spyOn(
          TestBed.inject(NotesService),
          'modifyGroups'
        ).and.callThrough();

        const newNoteValue = 'Another-Value';

        triggerCardClick(exampleNoteGroupModel.id);

        harness.detectChanges();
        await harness.fixture.whenStable();

        const dialogHarness = await loader.getHarness(MatDialogHarness);

        // Act
        const createNoteInput = await dialogHarness.getHarness(
          MatChipInputHarness.with({
            selector: `[data-test="create-note-input"]`,
          })
        );

        await createNewNote(createNoteInput, newNoteValue);

        const closeButton = await dialogHarness.getHarness(
          AdaptiveButtonHarness.with({
            selector: `[data-test="dialog-action-button-save"]`,
          })
        );

        await closeButton.click();

        harness.detectChanges();
        await harness.fixture.whenStable();

        // Assert
        await expectAsync(
          modifyGroupsSpy.calls.mostRecent().returnValue
        ).toBeResolvedTo(true);

        const editedGroup = (
          updateSpy.calls.mostRecent().args[1] as { groups: NoteGroupModel[] }
        ).groups[0];

        expect(editedGroup.notes.length).toBe(2);
        expect(editedGroup.notes[1].value).toBe(newNoteValue);
      });

      it(`should remove the edited group if it doesn't have notes and action is 'save'.`, async () => {
        // Arrange
        const updateSpy = firebaseDatabaseControllerServiceMock.update;
        const modifyGroupsSpy = spyOn(
          TestBed.inject(NotesService),
          'modifyGroups'
        ).and.callThrough();

        triggerCardClick(exampleNoteGroupModel.id);

        harness.detectChanges();
        await harness.fixture.whenStable();

        const dialogHarness = await loader.getHarness(MatDialogHarness);

        // Act
        const chipRemoveHarness = await dialogHarness.getHarness(
          MatChipRemoveHarness.with({
            selector: `[data-test="note-chip-${exampleNoteGroupModel.notes[0].id}"] button[matChipRemove]`,
          })
        );

        await chipRemoveHarness.click();

        const closeButton = await dialogHarness.getHarness(
          AdaptiveButtonHarness.with({
            selector: `[data-test="dialog-action-button-save"]`,
          })
        );

        await closeButton.click();

        harness.detectChanges();
        await harness.fixture.whenStable();

        // Assert
        await expectAsync(
          modifyGroupsSpy.calls.mostRecent().returnValue
        ).toBeResolvedTo(true);

        const editedGroups = (
          updateSpy.calls.mostRecent().args[1] as { groups: NoteGroupModel[] }
        ).groups;

        expect(editedGroups).not.toContain(exampleNoteGroupModel);
      });

      it(`should add the "deleteAt" property to the first visible group and refresh the group list (visible only notes not marked to being removed).`, async () => {
        // Arrange
        const updateSpy = firebaseDatabaseControllerServiceMock.update;

        // Act
        const matMenuToggleButton = await loader.getHarness(
          MatButtonHarness.with({
            variant: 'icon',
            selector: `[data-test="note-group-list-item-${exampleNoteGroupModel.id}"] [data-test="menu-button-toggle"]`,
          })
        );

        await matMenuToggleButton.click();

        const matMenuToggleRemoveOption = await loader.getHarness(
          MatMenuItemHarness.with({
            selector: `[data-test="menu-option-toggle-remove"]`,
          })
        );

        await matMenuToggleRemoveOption.click();

        // Assert
        const editedGroup = (
          updateSpy.calls.mostRecent().args[1] as { groups: NoteGroupModel[] }
        ).groups[0];
        expect(editedGroup.deleteAt).not.toBe(undefined);
      });

      it(`should remove the "deleteAt" property from the first visible group and refresh the group list (visible only notes marked to being removed).`, async () => {
        // Arrange
        const testComponent = await harness.navigateByUrl(
          'app/notes',
          TestComponent
        );

        testComponent.markForDelete = true;

        harness.detectChanges();
        await harness.fixture.whenStable();

        const updateSpy = firebaseDatabaseControllerServiceMock.update;

        // Act
        const matMenuToggleButton = await loader.getHarness(
          MatButtonHarness.with({
            variant: 'icon',
            selector: `[data-test="note-group-list-item-${noteGroupMarkedToRemove.id}"] [data-test="menu-button-toggle"]`,
          })
        );

        await matMenuToggleButton.click();

        const matMenuToggleRemoveOption = await loader.getHarness(
          MatMenuItemHarness.with({
            selector: `[data-test="menu-option-toggle-remove"]`,
          })
        );

        await matMenuToggleRemoveOption.click();

        // Assert
        const editedGroup = (
          updateSpy.calls.mostRecent().args[1] as { groups: NoteGroupModel[] }
        ).groups[0];
        expect(editedGroup.deleteAt).toBe(undefined);
      });
    });
  });
});
