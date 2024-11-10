/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNoteI, NoteListFormComponent } from './note-list-form.component';
import { Provider } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NoteValidationService } from '../../data-access/note-validation/note-validation.service';
import { FormCommonFeaturesService } from 'src/app/reusable/data-access/form-common-features/form-common-features.service';
import * as tools from 'src/app/reusable/utils/data-tools/objectTools';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/utils/Models/UserDataModels.interface';
import {
  MatChip,
  MatChipInput,
  MatChipInputEvent,
  MatChipRow,
} from '@angular/material/chips';

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

describe('NoteListFormComponent', () => {
  // Mocks
  let hasActiveErrorValue: boolean;
  let validationConfigValue: {
    min: number;
    max: number;
  };

  let noteFormValidationMock: jasmine.SpyObj<NoteValidationService>;
  let formCommonFeaturesServiceMock: jasmine.SpyObj<FormCommonFeaturesService>;

  // Component
  let component: NoteListFormComponent;
  let fixture: ComponentFixture<NoteListFormComponent>;

  function createComponent() {
    fixture = TestBed.createComponent(NoteListFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    hasActiveErrorValue = false;
    validationConfigValue = { min: 0, max: 35 };

    noteFormValidationMock = {
      ...jasmine.createSpyObj<NoteValidationService>([
        'setError',
        'validateNoteLength',
      ]),
      get hasActiveError() {
        return hasActiveErrorValue;
      },
      get validationConfig() {
        return validationConfigValue;
      },
    } as jasmine.SpyObj<NoteValidationService>;

    formCommonFeaturesServiceMock =
      jasmine.createSpyObj<FormCommonFeaturesService>(['getError']);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteListFormComponent],
      providers: [
        provideNoopAnimations(),
        { provide: NoteValidationService, useValue: noteFormValidationMock },
        {
          provide: FormCommonFeaturesService,
          useValue: formCommonFeaturesServiceMock,
        },
      ] as Provider[],
    }).compileComponents();

    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe(`ViewChildren`, () => {
    describe(`chipRows`, () => {
      it(`should be defined.`, () => {
        // Assert
        expect(component.chipRows).not.toBeFalsy();
      });
    });
  });

  describe(`methods`, () => {
    describe(`getError()`, () => {
      it(`should return the result of formCommonFeaturesService.getError method.`, () => {
        // Arrange
        const expectedValue: ReturnType<FormCommonFeaturesService['getError']> =
          false;

        const getErrorSpy =
          formCommonFeaturesServiceMock.getError.and.returnValue(expectedValue);

        // Act
        const result = component.getError('exampleElement', 'required');

        // Assert
        expect(getErrorSpy).toHaveBeenCalledWith(
          component.newNoteGroupForm,
          'exampleElement',
          'required'
        );
        expect(result).toBe(expectedValue);
      });
    });

    describe(`handleMobileEdit()`, () => {
      beforeEach(async () => {
        fixture.componentRef.setInput('notes', exampleNoteGroupModel.notes);
        fixture.componentRef.setInput('environment', 'note-creator');
        fixture.componentRef.setInput(
          'noteListTitle',
          exampleNoteGroupModel.title
        );
        fixture.detectChanges();
      });

      it(`should stop executing the method if no chipRow has been found with given noteId.`, () => {
        // Arrange
        const handleDoubleclickSpy = spyOn(
          MatChipRow.prototype,
          '_handleDoubleclick'
        );

        // Act
        component.handleMobileEdit('a random noteId');

        // Assert
        expect(handleDoubleclickSpy).not.toHaveBeenCalled();
      });

      it(`should call _handleDoubleclick method of the chipRow that has been found.`, () => {
        // Arrange
        const handleDoubleclickSpy = spyOn(
          MatChipRow.prototype,
          '_handleDoubleclick'
        );

        // Act
        component.handleMobileEdit(exampleNoteGroupModel.notes[0].id);

        // Assert
        expect(handleDoubleclickSpy).toHaveBeenCalled();
      });
    });

    describe(`handleNoteEvent()`, () => {
      it(`should stop executing the method if _isValidEventType returns false.`, () => {
        // Arrange
        spyOn(component as any, '_isValidEventType').and.returnValue(false);
        const setErrorSpy = noteFormValidationMock.setError;

        const payload: MatChipInputEvent | EditNoteI = {
          event: {
            value: 'a random new value',
            chip: {} as MatChip,
          },
          note: exampleNoteGroupModel.notes[0],
        };

        // Act
        component.handleNoteEvent(payload);

        // Assert
        expect(setErrorSpy).not.toHaveBeenCalled();
      });

      it(`should stop executing the method if _isNoteTooLong returns true.`, () => {
        // Arrange
        noteFormValidationMock.validateNoteLength.and.returnValue({
          state: 'invalid',
          cause: 'too-long',
        });
        spyOn(component as any, '_isNoteTooLong').and.returnValue(true);
        const editNoteEmitSpy = spyOn(component.editNote, 'emit');
        const createNoteEmitSpy = spyOn(component.createNote, 'emit');

        const payload: EditNoteI = {
          event: {
            value: 'a random new value',
            chip: {} as MatChip,
          },
          note: exampleNoteGroupModel.notes[0],
        };

        // Act
        component.handleNoteEvent(payload);

        // Assert
        expect(editNoteEmitSpy).not.toHaveBeenCalled();
        expect(createNoteEmitSpy).not.toHaveBeenCalled();
      });

      it(`should emit createNote when the 'e' parameter doesn't have 'event' property inside.`, () => {
        // Arrange
        noteFormValidationMock.validateNoteLength.and.returnValue({
          state: 'valid',
          cause: null,
        });
        spyOn(component as any, '_isNoteTooLong').and.returnValue(false);
        const editNoteEmitSpy = spyOn(component.editNote, 'emit');
        const createNoteEmitSpy = spyOn(component.createNote, 'emit');

        const payload: MatChipInputEvent = {
          value: 'a random new value',
          chipInput: {} as MatChipInput,
          input: {} as HTMLInputElement,
        };

        // Act
        component.handleNoteEvent(payload);

        // Assert
        expect(createNoteEmitSpy).toHaveBeenCalled();
        expect(editNoteEmitSpy).not.toHaveBeenCalled();
      });

      it(`should emit editNote when the 'e' parameter has 'event' property inside.`, () => {
        // Arrange
        noteFormValidationMock.validateNoteLength.and.returnValue({
          state: 'valid',
          cause: null,
        });
        spyOn(component as any, '_isNoteTooLong').and.returnValue(false);
        const editNoteEmitSpy = spyOn(component.editNote, 'emit');
        const createNoteEmitSpy = spyOn(component.createNote, 'emit');

        const payload: EditNoteI = {
          note: exampleNoteGroupModel.notes[0],
          event: {
            value: 'a random new value',
            chip: {} as MatChip,
          },
        };

        // Act
        component.handleNoteEvent(payload);

        // Assert
        expect(createNoteEmitSpy).not.toHaveBeenCalled();
        expect(editNoteEmitSpy).toHaveBeenCalled();
      });
    });

    describe(`submitForm()`, () => {
      it(`should stop executing the method when group title input has validation errors.`, () => {
        // Arrange
        const dataEmitSpy = spyOn(component.data, 'emit');

        const resetTitleInput = '';
        fixture.componentRef.setInput('noteListTitle', resetTitleInput);
        fixture.detectChanges();

        // Act
        component.submitForm();

        // Assert
        expect(
          component.newNoteGroupForm.controls.groupName.errors
        ).toBeTruthy();
        expect(dataEmitSpy).not.toHaveBeenCalled();
      });

      it(`should not emit data when noteFormValidation has active error.`, () => {
        // Arrange
        const dataEmitSpy = spyOn(component.data, 'emit');
        hasActiveErrorValue = true;

        noteFormValidationMock = jasmine.createSpyObj<NoteValidationService>(
          ['setError', 'validateNoteLength'],
          {
            get hasActiveError() {
              return hasActiveErrorValue;
            },
            get validationConfig() {
              return validationConfigValue;
            },
          }
        );
        createComponent();

        const validNoteTitle = 'Valid Title';
        fixture.componentRef.setInput('noteListTitle', validNoteTitle);
        fixture.detectChanges();

        // Act
        component.submitForm();

        // Assert
        expect(
          component.newNoteGroupForm.controls.groupName.errors
        ).toBeFalsy();
        expect(noteFormValidationMock.hasActiveError).toBeTruthy();
        expect(dataEmitSpy).not.toHaveBeenCalled();
      });

      it(`should emit data when form is valid and there are no active errors.`, () => {
        // Arrange
        const dataEmitSpy = spyOn(component.data, 'emit');
        component.newNoteGroupForm.controls.groupName.setValue('Valid Title');

        // Act
        component.submitForm();

        // Assert
        expect(dataEmitSpy).toHaveBeenCalled();
      });
    });

    describe(`_isValidEventType()`, () => {
      let consoleErrorSpy: jasmine.Spy;

      beforeEach(() => {
        consoleErrorSpy = spyOn(console, 'error');
      });

      it('should return true for valid MatChipInputEvent.', () => {
        // Arrange
        const validInputEvent: MatChipInputEvent = {
          value: 'test note',
          chipInput: {} as MatChipInput,
          input: {} as HTMLInputElement,
        };

        // Act
        const result = component['_isValidEventType'](validInputEvent);

        // Assert
        expect(result).toBe(true);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });

      it('should return true for valid EditNoteI.', () => {
        // Arrange
        const validEditEvent: EditNoteI = {
          note: exampleNoteModel,
          event: {
            value: 'edited note',
            chip: {} as MatChip,
          },
        };

        // Act
        const result = component['_isValidEventType'](validEditEvent);

        // Assert
        expect(result).toBe(true);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });

      it('should return false and log error for invalid event type in non-production.', () => {
        // Arrange
        const invalidEvent = { invalidProp: 'test' } as unknown as EditNoteI;

        // Act
        const result = component['_isValidEventType'](invalidEvent);

        // Assert
        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });

    describe(`_isNoteTooLong()`, () => {
      it(`should return true and set error when validation state is 'invalid' and cause is 'too-long'.`, () => {
        // Arrange
        const setErrorSpy = noteFormValidationMock.setError;
        const validationConfig = noteFormValidationMock.validationConfig;

        // Act
        const result = component['_isNoteTooLong']('invalid', 'too-long');

        // Assert
        expect(result).toBe(true);
        expect(setErrorSpy).toHaveBeenCalledWith({
          cause: `The note can't be longer than ${validationConfig.max} characters`,
        });
      });

      it(`should return false when validation state is not 'invalid' or cause is not 'too-long'.`, () => {
        // Arrange
        const setErrorSpy = noteFormValidationMock.setError;
        const testCases = [
          { state: 'valid', cause: null },
          { state: 'invalid', cause: 'other-cause' },
          { state: 'valid', cause: 'too-long' },
        ];

        // Act & Assert
        testCases.forEach(({ state, cause }) => {
          expect(component['_isNoteTooLong'](state, cause)).toBe(false);
        });
        expect(setErrorSpy).not.toHaveBeenCalled();
      });
    });
  });
});
