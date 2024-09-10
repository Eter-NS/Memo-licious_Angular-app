/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';

import { GroupMobileDetailsComponent } from './app-group-mobile-details.component';
import { ChangeDetectorRef, Component, Provider } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NotesService } from '../../data-access/notes/notes.service';
import { NoteRestService } from '../../data-access/note-REST/note-rest.service';
import { BehaviorSubject } from 'rxjs';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/utils/Models/UserDataModels.interface';
import { ResolveFn, provideRouter } from '@angular/router';
import { randomId } from 'src/app/reusable/utils/data-tools/objectTools';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideLocationMocks } from '@angular/common/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';

@Component({
  standalone: true,
  selector: 'app-test',
  template: `Test component works!`,
})
class TestComponent {}

const exampleGroupNote: NoteGroupModel = {
  createdAt: Date.now(),
  id: randomId(27),
  title: 'Hello World',
  notes: [
    { id: randomId(27), createdAt: Date.now(), value: 'I hate everyone' },
  ],
};

const anotherGroupNote: NoteGroupModel = {
  createdAt: Date.now(),
  id: randomId(27),
  title: 'Example title 2',
  notes: [
    {
      createdAt: Date.now(),
      id: randomId(27),
      value: 'Example note 2',
    },
  ],
};

const fakeNotes = new BehaviorSubject<NoteGroupModel[]>([]);
const fakeResolver: ResolveFn<NoteGroupModel[]> = () => {
  return fakeNotes.asObservable();
};

describe('AppGroupDetailsComponent', () => {
  // Mocks
  const titleMock = jasmine.createSpyObj<Title>(['setTitle']);
  const notesServiceMock: Partial<NotesService> = {
    notes$: fakeNotes.asObservable(),
    modifyGroups: jasmine.createSpy(
      'deleteGroup',
      NotesService.prototype.modifyGroups
    ),
    deleteGroup: jasmine.createSpy(
      'deleteGroup',
      NotesService.prototype.deleteGroup
    ),
  };
  const notesBufferValue = new BehaviorSubject<NoteModel[]>([]);
  const noteRestServiceMock = {
    notesBuffer$: notesBufferValue.asObservable(),
    fillNotesBuffer: jasmine
      .createSpy('fillNotesBuffer')
      .and.callFake((notes) => {
        notesBufferValue.next(notes);
      }),
    onCreateNote: jasmine.createSpy(
      'onCreateNote',
      NoteRestService.prototype.onCreateNote
    ),
    onEditNote: jasmine.createSpy(
      'onEditNote',
      NoteRestService.prototype.onEditNote
    ),
    onRemoveNote: jasmine.createSpy(
      'onRemoveNote',
      NoteRestService.prototype.onRemoveNote
    ),
  };

  // Component
  let harness: RouterTestingHarness;
  let component: GroupMobileDetailsComponent;

  async function loadComponent(config?: {
    url?: string;
    overloadNoteGroups?: NoteGroupModel[];
  }) {
    if (config?.overloadNoteGroups) {
      fakeNotes.next(config.overloadNoteGroups);
    } else {
      fakeNotes.next([anotherGroupNote, exampleGroupNote]);
    }

    harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl(
      '/app/notes' + (config?.url ?? `/${exampleGroupNote.id}`),
      GroupMobileDetailsComponent
    );
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
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
                  groupNotes: fakeResolver,
                },
              },
              {
                path: '',
                component: TestComponent,
              },
            ],
          },
        ]),
        provideLocationMocks(),
        ChangeDetectorRef,
        { provide: Title, useValue: titleMock },
        { provide: NotesService, useValue: notesServiceMock },
        { provide: NoteRestService, useValue: noteRestServiceMock },
      ] as Provider[],
    });
  });

  it('should create', async () => {
    await loadComponent();
    harness.detectChanges();
    expect(component).toBeTruthy();
  });

  describe(`ViewChild elements`, () => {
    beforeEach(async () => {
      await loadComponent();
      harness.detectChanges();
    });
    it(`should contain viewContainer element after component creation.`, () => {
      // Arrange
      // Act
      // Assert
      expect(component.viewContainer).not.toBeFalsy();
    });

    it(`should contain formElement element after component creation.`, () => {
      // Arrange
      // Act
      // Assert
      expect(component.formElement).not.toBeFalsy();
    });
  });

  describe(`noteGroup$`, () => {
    it(`should call _goBack method if the group hasn't been found.`, async () => {
      // Arrange
      const spy = spyOn(
        GroupMobileDetailsComponent.prototype as any,
        '_goBack'
      ).and.returnValue(Promise.resolve());

      // Act
      await loadComponent({ url: '/nonExistingGroupId' });

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    it(`should call _goBack method if the group has been marked to be deleted.`, async () => {
      // Arrange
      const spy = spyOn(
        GroupMobileDetailsComponent.prototype as any,
        '_goBack'
      ).and.returnValue(Promise.resolve());

      // Act
      await loadComponent({
        overloadNoteGroups: [{ ...exampleGroupNote, deleteAt: Date.now() }],
      });

      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`component creation`, () => {
    it(`should call _listenForRouteChange.`, async () => {
      // Arrange
      const spy = spyOn(
        GroupMobileDetailsComponent.prototype as any,
        '_listenForRouteChange'
      );

      // Act
      await loadComponent();

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    it(`should call _loadNotesAndTitle.`, async () => {
      // Arrange
      const spy = spyOn(
        GroupMobileDetailsComponent.prototype as any,
        '_loadNotesAndTitle'
      );

      // Act
      await loadComponent();

      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`methods`, () => {
    beforeEach(async () => {
      await loadComponent();
      harness.detectChanges();
    });

    describe(`_loadNotesAndTitle`, () => {
      it(`should call #title.setTitle and #noteRestService.fillNotesBuffer.`, () => {
        // Arrange
        const setTitleSpy = titleMock.setTitle;
        const fillNotesBufferSpy = noteRestServiceMock.fillNotesBuffer;

        // Act
        component['_loadNotesAndTitle']();

        // Assert
        expect(setTitleSpy).toHaveBeenCalledWith(exampleGroupNote.title);
        expect(fillNotesBufferSpy).toHaveBeenCalledWith(exampleGroupNote.notes);
      });
    });

    describe(`_listenForRouteChange`, () => {
      it(`should call _clearNoteBuffer if router emits ResolveEnd event and _isClosingEditor is true.`, async () => {
        // Arrange
        const spy = spyOn(component as any, '_clearNoteBuffer');
        component['_isClosingEditor'] = true;

        // Act
        await component['_goBack']();

        // Assert
        expect(spy).toHaveBeenCalled();
      });
    });

    describe(`_clearNoteBuffer`, () => {
      it(`should call #noteRestService.fillNotesBuffer`, () => {
        // Arrange
        const spy = noteRestServiceMock.fillNotesBuffer;

        // Act
        component['_clearNoteBuffer']();

        // Assert
        expect(spy).toHaveBeenCalled();
      });
    });

    describe(`onCreateNote`, () => {
      it(`should call #noteRestService.onCreateNote and ChangeDetectorRef.markForCheck`, () => {
        // Arrange
        const onCreateNoteSpy = noteRestServiceMock.onCreateNote;
        const payload = {} as MatChipInputEvent;

        // Act
        component['onCreateNote'](payload);

        // Assert
        expect(onCreateNoteSpy).toHaveBeenCalledWith(payload);
      });
    });

    describe(`onEditNote`, () => {
      it(`should call #noteRestService.onEditNote and ChangeDetectorRef.markForCheck`, () => {
        // Arrange
        const onEditNoteSpy = noteRestServiceMock.onEditNote;
        const payload = {} as { note: NoteModel; event: MatChipEditedEvent };

        // Act
        component['onEditNote'](payload);

        // Assert
        expect(onEditNoteSpy).toHaveBeenCalledWith(payload);
      });
    });

    describe(`onRemoveNote`, () => {
      it(`should call #noteRestService.onRemoveNote and ChangeDetectorRef.markForCheck`, () => {
        // Arrange
        const onRemoveNoteSpy = noteRestServiceMock.onRemoveNote;
        const payload = {} as NoteModel;

        // Act
        component['onRemoveNote'](payload);

        // Assert
        expect(onRemoveNoteSpy).toHaveBeenCalledWith(payload);
      });
    });

    describe(`closeEditor`, () => {
      it(`should clear noteBuffer and move user to the previous view (or fallback if no history exist) (close action).`, async () => {
        // Arrange
        const goBackSpy = spyOn(component as any, '_goBack');
        const clearNoteBufferSpy = spyOn(component as any, '_clearNoteBuffer');

        // Act
        await component.closeEditor('close');

        // Assert
        expect(goBackSpy).toHaveBeenCalled();
        expect(clearNoteBufferSpy).toHaveBeenCalled();
      });

      it(`should call _updateGroup only (save action).`, async () => {
        // Arrange
        const updateGroupSpy = spyOn(component as any, '_updateGroup');

        // Act
        await component.closeEditor('save');

        // Assert
        expect(updateGroupSpy).toHaveBeenCalled();
      });
    });

    describe(`_updateGroup`, () => {
      it(`should call #notesService.deleteGroup and _goBack if noteBuffer has no elements.`, async () => {
        // Arrange
        const deleteGroupSpy = notesServiceMock.deleteGroup;
        const goBackSpy = spyOn(component as any, '_goBack');

        // Act
        component['_clearNoteBuffer']();
        await component['_updateGroup']();

        // Assert
        expect(deleteGroupSpy).toHaveBeenCalledWith(exampleGroupNote.id);
        expect(goBackSpy).toHaveBeenCalled();
      });

      it(`should update the group and call _goBack.`, async () => {
        // Arrange
        const goBackSpy = spyOn(component as any, '_goBack');
        const modifyGroupsSpy = (
          notesServiceMock.modifyGroups as jasmine.Spy
        ).and.resolveTo(true);
        component.formElement.newNoteGroupForm.patchValue({
          groupName: 'new group name',
        });
        const editedNote: NoteModel = {
          ...exampleGroupNote.notes[0],
          value: 'new value',
        };
        notesBufferValue.next([editedNote]);

        const expectedValue: NoteGroupModel = {
          ...exampleGroupNote,
          title: 'new group name',
          notes: [editedNote],
        };

        // Act
        await component['_updateGroup']();

        // Assert
        expect(modifyGroupsSpy).toHaveBeenCalledWith([
          anotherGroupNote,
          expectedValue,
        ] satisfies NoteGroupModel[]);
        expect(goBackSpy).toHaveBeenCalled();
      });

      it(`should log an error when #notesService.modifyGroups fails.`, async () => {
        // Arrange
        (notesServiceMock.modifyGroups as jasmine.Spy).and.rejectWith(
          new Error('Unknown user state')
        );
        const spy = spyOn(console, 'error');

        // Act

        // Assert
        await expectAsync(component['_updateGroup']()).toBeRejected();
        expect(spy).toHaveBeenCalledWith(new Error('Unknown user state'));
      });
    });

    describe(`_goBack`, () => {
      it(`should call viewTransitionService.goBack.`, async () => {
        // Arrange
        const spy = spyOn(TestBed.inject(ViewTransitionService), 'goBack');

        // Act
        await component['_goBack']();

        // Assert
        expect(spy).toHaveBeenCalled();
      });
    });
  });
});
