import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import {
  NoteValidationService,
  ValidationErrorI,
} from './note-validation.service';

describe('NoteValidationService', () => {
  let service: NoteValidationService;

  beforeEach(() => {
    // Arrange
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoteValidationService);
  });

  describe('Configuration', () => {
    it('should provide validation configuration', () => {
      // Act
      const config = service.validationConfig;

      // Assert
      expect(config).toEqual({
        min: 0,
        max: 35,
      });
    });
  });

  describe(`methods`, () => {
    describe('validateNoteLength()', () => {
      it('should return valid state for text within limits', () => {
        // Arrange
        const validText = 'Valid text';

        // Act
        const result = service.validateNoteLength(validText);

        // Assert
        expect(result).toEqual({
          state: 'valid',
          cause: null,
        });
      });

      it('should return invalid state with "too-long" cause when text exceeds max length', () => {
        // Arrange
        const longText =
          'This is a very long text that exceeds the maximum length limit';

        // Act
        const result = service.validateNoteLength(longText);

        // Assert
        expect(result).toEqual({
          state: 'invalid',
          cause: 'too-long',
        });
      });

      it('should return invalid state with "empty" cause when text is empty', () => {
        // Arrange
        const emptyText = '';

        // Act
        const result = service.validateNoteLength(emptyText);

        // Assert
        expect(result).toEqual({
          state: 'invalid',
          cause: 'empty',
        });
      });
    });

    describe('setError()', () => {
      it(`should set a new value for _errorMessage BehaviorSubject`, fakeAsync(() => {
        // Arrange
        const errorMessage: ValidationErrorI = {
          cause: 'Some error message',
        };

        // Act
        service.setError(errorMessage);

        let expectedValue: ValidationErrorI | null | undefined;
        const subscription = service.errorMessage$.subscribe((value) => {
          expectedValue = value;
        });

        flush();
        subscription.unsubscribe();

        // Assert
        expect(expectedValue).toEqual(errorMessage);
      }));
    });
  });

  describe('Error handling', () => {
    it('should initially have no active error', () => {
      // Act & Assert
      expect(service.hasActiveError).toBeFalse();
    });

    it('should provide error message observable', fakeAsync(() => {
      // Act
      let expectedValue: ValidationErrorI | null | undefined;
      const subscription = service.errorMessage$.subscribe((error) => {
        expectedValue = error;
      });

      flush();
      subscription.unsubscribe();

      // Assert
      expect(expectedValue).toBeUndefined();
    }));
  });
});
