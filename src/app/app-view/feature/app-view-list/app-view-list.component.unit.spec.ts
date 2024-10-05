/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';
import { AppViewListComponent } from './app-view-list.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NoteModel } from 'src/app/auth/utils/Models/UserDataModels.interface';
import { randomId } from 'src/app/reusable/utils/data-tools/objectTools';
import { NotesService } from '../../data-access/notes/notes.service';
import { NoteRestService } from '../../data-access/note-REST/note-rest.service';
import { BehaviorSubject } from 'rxjs';
import { ViewportListenersService } from 'src/app/reusable/data-access/viewport-listeners/viewport-listeners.service';
import { Provider } from '@angular/core';
import {
  MatChip,
  MatChipEditedEvent,
  MatChipInput,
  MatChipInputEvent,
} from '@angular/material/chips';
import { NewNoteGroupForm } from '../../ui/note-list-form/note-list-form.component';

const exampleNoteModel: NoteModel = {
  id: randomId(27),
  createdAt: Date.now(),
  value: 'XYZ',
};

describe(`AppViewListComponent`, () => {
  // Mocks
  const notesServiceMock = jasmine.createSpyObj<NotesService>([
    'isNewGroupValid',
    'createGroup',
  ]);

  const notesBufferValue = new BehaviorSubject<NoteModel[]>([]);
  const noteRestServiceMock: Partial<NoteRestService> = {
    ...jasmine.createSpyObj<NoteRestService>([
      'onCreateNote',
      'onEditNote',
      'onRemoveNote',
    ]),
    notesBuffer$: notesBufferValue.asObservable(),
  };

  const isHandsetValue = new BehaviorSubject<boolean>(false);
  const viewportListenersServiceMock: Partial<ViewportListenersService> = {
    isHandset$: isHandsetValue.asObservable(),
  };

  // Component
  let fixture: ComponentFixture<AppViewListComponent>;
  let component: AppViewListComponent;

  beforeEach(() => {
    notesBufferValue.next([]);
    isHandsetValue.next(false);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppViewListComponent],
      providers: [
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
        provideNoopAnimations(),
      ] as Provider[],
    }).compileComponents();

    fixture = TestBed.createComponent(AppViewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(`should be created`, () => {
    // Arrange
    // Act
    // Assert
    expect(component).toBeTruthy();
  });

  it(`should emit 'false' value to _mobileFormVisibleSubject Observable when viewportListenersService.isHandset$ emits 'false'.`, fakeAsync(() => {
    // Arrange
    const nextSpy = spyOn(
      component['_mobileFormVisibleSubject'],
      'next'
    ).and.callThrough();

    // Act
    isHandsetValue.next(false);

    flush();

    // Assert
    expect(nextSpy).toHaveBeenCalledWith(false);
  }));

  describe(`methods`, () => {
    describe(`toggleNoteListForm()`, () => {
      it(`should call _fadeInOutElement with second parameter 'out' if state parameters equals 'open'.`, () => {
        // Arrange
        isHandsetValue.next(true);
        fixture.detectChanges();
        const fadeInOUtElementSpy = spyOn(
          component as any,
          '_fadeInOutElement'
        );

        // Act
        component.toggleNoteListForm('open');

        // Assert
        expect(fadeInOUtElementSpy).toHaveBeenCalledWith(
          component.button.nativeElement,
          'out',
          'top'
        );
      });

      it(`should call _fadeInOutElement with second parameter 'in' if state parameters equals 'close'.`, () => {
        // Arrange
        isHandsetValue.next(true);
        fixture.detectChanges();
        const fadeInOUtElementSpy = spyOn(
          component as any,
          '_fadeInOutElement'
        );

        // Act
        component.toggleNoteListForm('close');

        // Assert
        expect(fadeInOUtElementSpy).toHaveBeenCalledWith(
          component.button.nativeElement,
          'in',
          'top'
        );
      });
    });

    describe(`_fadeInOutElement()`, () => {
      beforeEach(() => {
        isHandsetValue.next(true);
        fixture.detectChanges();
      });

      it(`should show the error log if state parameter is neither doesn't match any case.`, () => {
        // Arrange
        const errorSpy = spyOn(console, 'error');
        const incorrectParam = 'something';

        // Act
        component['_fadeInOutElement'](
          component.button.nativeElement,
          incorrectParam as 'in',
          'bottom'
        );

        // Assert
        expect(errorSpy).toHaveBeenCalledWith(
          'Unknown state value: ',
          incorrectParam
        );
      });

      it(`should call only _runAnimationOnce with second parameter 'fadeOut-to-\${fromTo}-animation' if state equals 'out'.`, () => {
        // Arrange
        const runAnimationOnceSpy = spyOn(
          component as any,
          '_runAnimationOnce'
        );

        // Act
        component['_fadeInOutElement'](
          component.button.nativeElement,
          'out',
          'bottom'
        );

        // Assert
        expect(runAnimationOnceSpy).toHaveBeenCalledWith(
          component.button.nativeElement,
          `fadeOut-to-bottom-animation`
        );
      });

      it(`should call _runAnimationOnce and _removeAnimations if state equals 'in.`, () => {
        // Arrange
        const runAnimationOnceSpy = spyOn(
          component as any,
          '_runAnimationOnce'
        );
        const removeAnimationsSpy = spyOn(
          component as any,
          '_removeAnimations'
        );

        // Act
        component['_fadeInOutElement'](
          component.button.nativeElement,
          'in',
          'top'
        );

        // Assert
        expect(runAnimationOnceSpy).toHaveBeenCalledWith(
          component.button.nativeElement,
          `fadeIn-from-top-animation`,
          { removeClassOnFinish: true }
        );
        expect(removeAnimationsSpy).toHaveBeenCalledWith(
          component.button.nativeElement,
          `fadeOut-to-top-animation`
        );
      });
    });

    describe(`onCreateNote()`, () => {
      it(`should call #noteRestService.onCreateNote and #cd.markForCheck.`, async () => {
        // Arrange
        const onCreateNoteSpy = noteRestServiceMock.onCreateNote;

        const payload: MatChipInputEvent = {
          value: 'An example value',
          input: document.createElement('input'),
          chipInput: {} as MatChipInput,
        };

        // Act
        await component.onCreateNote(payload);

        // Assert
        expect(onCreateNoteSpy).toHaveBeenCalledWith(payload);
      });
    });

    describe(`onEditNote()`, () => {
      it(`should call #noteRestService.onEditNote and #cd.markForCheck.`, () => {
        // Arrange
        const onEditNoteSpy = noteRestServiceMock.onEditNote;

        const payload: { note: NoteModel; event: MatChipEditedEvent } = {
          note: exampleNoteModel,
          event: {
            chip: {} as MatChip,
            value: 'An edited value',
          },
        };

        // Act
        component.onEditNote(payload);

        // Assert
        expect(onEditNoteSpy).toHaveBeenCalledWith(payload);
      });
    });

    describe(`onRemoveNote()`, () => {
      it(`should call #noteRestService.onRemoveNote and #cd.markForCheck.`, () => {
        // Arrange
        const onRemoveNoteSpy = noteRestServiceMock.onRemoveNote;

        const payload: NoteModel = { ...exampleNoteModel };

        // Act
        component.onRemoveNote(payload);

        // Assert
        expect(onRemoveNoteSpy).toHaveBeenCalledWith(payload);
      });
    });

    describe(`handleGroupCreation()`, () => {
      it(`should NOT call #notesService.createGroup if #notesService.isNewGroupValid resolves to false.`, async () => {
        // Arrange
        const isNewGroupValidSpy =
          notesServiceMock.isNewGroupValid.and.resolveTo(false);
        const createGroupSpy = notesServiceMock.createGroup;

        const payload: NewNoteGroupForm = {
          groupName: 'An example note group name',
        };

        // Act
        await component.handleGroupCreation(payload);

        // Assert
        expect(isNewGroupValidSpy).toHaveBeenCalledWith(payload.groupName);
        expect(createGroupSpy).not.toHaveBeenCalled();
      });

      it(`should  call #notesService.createGroup if #notesService.isNewGroupValid resolves to true.`, async () => {
        // Arrange
        const isNewGroupValidSpy =
          notesServiceMock.isNewGroupValid.and.resolveTo(true);
        const createGroupSpy = notesServiceMock.createGroup;

        const payload: NewNoteGroupForm = {
          groupName: 'An example note group name',
        };

        // Act
        await component.handleGroupCreation(payload);

        // Assert
        expect(isNewGroupValidSpy).toHaveBeenCalledWith(payload.groupName);
        expect(createGroupSpy).toHaveBeenCalledWith(payload.groupName);
      });
    });
  });
});
