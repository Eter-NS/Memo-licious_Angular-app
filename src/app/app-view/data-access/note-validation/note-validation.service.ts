import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ValidationErrorI {
  cause: string;
}

@Injectable({
  providedIn: 'root',
})
export class NoteValidationService {
  private readonly _lengthValidationConfig = {
    min: 0,
    max: 35,
  };

  get validationConfig() {
    return this._lengthValidationConfig;
  }

  get hasActiveError() {
    return !!this._errorMessage.value;
  }

  private _errorMessage = new BehaviorSubject<
    ValidationErrorI | null | undefined
  >(undefined);

  get errorMessage$(): Observable<ValidationErrorI | null | undefined> {
    return this._errorMessage.asObservable();
  }

  validateNoteLength(
    value: string
  ):
    | { state: 'valid'; cause: null }
    | { state: 'invalid'; cause: 'too-long' | 'empty' } {
    const valueLength = value.length;
    const { min, max } = this._lengthValidationConfig;

    if (valueLength >= max) {
      return {
        state: 'invalid',
        cause: 'too-long',
      };
    }

    if (valueLength <= min) {
      return {
        state: 'invalid',
        cause: 'empty',
      };
    }

    return { state: 'valid', cause: null };
  }

  setError(error: ValidationErrorI | null): void {
    this._errorMessage.next(error);
  }
}
