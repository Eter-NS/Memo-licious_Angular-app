import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatChipEditedEvent,
  MatChipInputEvent,
  MatChipRow,
  MatChipsModule,
} from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NoteModel } from 'src/app/auth/utils/Models/UserDataModels.interface';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatInputModule } from '@angular/material/input';
import { FormCommonFeaturesService } from 'src/app/reusable/data-access/form-common-features/form-common-features.service';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment.dev';

export type NewNoteGroupForm = ReturnType<
  typeof NoteListFormComponent.prototype.newNoteGroupForm.getRawValue
>;

export interface EditNoteI {
  note: NoteModel;
  event: MatChipEditedEvent;
}

export interface ValidationErrorI {
  cause: string;
}

@Component({
  selector: 'app-note-list-form',
  standalone: true,
  templateUrl: './note-list-form.component.html',
  styleUrl: './note-list-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    ReactiveFormsModule,
    NgTemplateOutlet,
    AsyncPipe,
  ],
})
export class NoteListFormComponent {
  #fb = inject(NonNullableFormBuilder);
  #formCommonFeaturesService = inject(FormCommonFeaturesService);

  @Input({ required: true }) notes!: Array<NoteModel> | null;
  @Input({ required: true }) environment!: 'note-creator' | 'note-edit';
  @Input() set noteListTitle(value: string) {
    if (value) {
      this.newNoteGroupForm.controls.groupName.patchValue(value);
    }
  }

  @Output() createNote = new EventEmitter<MatChipInputEvent>();
  @Output() editNote = new EventEmitter<EditNoteI>();
  @Output() removeNote = new EventEmitter<NoteModel>();
  @Output() data = new EventEmitter<NewNoteGroupForm>();

  @ViewChildren('chipRow') chipRows!: QueryList<MatChipRow>;

  newNoteGroupForm = this.#fb.group({
    groupName: this.#fb.control(this.noteListTitle, {
      validators: [Validators.required, Validators.maxLength(32)],
    }),
  });
  timeoutId: unknown | undefined = undefined;
  separatorCodes = [ENTER, COMMA] as const;

  private _errorMessage = new BehaviorSubject<
    ValidationErrorI | null | undefined
  >(undefined);

  get errorMessage$() {
    return this._errorMessage.asObservable();
  }

  private _lengthValidationConfig = {
    min: 0,
    max: 35,
  };

  getError = (element: string, validation: string) =>
    this.#formCommonFeaturesService.getError(
      this.newNoteGroupForm,
      element,
      validation
    );

  handleTouchStart(e: PointerEvent, noteId: string) {
    e.preventDefault();
    e.stopPropagation();

    const chipRow = this.chipRows.find(({ id }) => id === noteId);

    this.timeoutId = setTimeout(() => {
      chipRow?._handleDoubleclick(new MouseEvent('dbclick'));
    }, 500);
  }

  handleTouchEnd() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId as number);
    }
  }

  /** For creating and modifying notes only */
  handleNoteEvent(e: MatChipInputEvent | EditNoteI) {
    if (!('event' in e) && !('value' in e)) {
      if (!environment.production) {
        console.error(
          'The parameter is neither MatChipInputEvent nor EditNoteI'
        );
      }
      return;
    }

    this._errorMessage.next(null);

    const isModificationEvent = 'event' in e;
    const isValid = this._stringLengthValidator(
      isModificationEvent ? e.event.value : e.value,
      this._lengthValidationConfig
    );

    if (!isValid) {
      this._errorMessage.next({
        cause: `The note can't be longer than ${this._lengthValidationConfig.max} characters`,
      });
    } else {
      isModificationEvent ? this.editNote.emit(e) : this.createNote.emit(e);
      this._errorMessage.next(null);
    }
  }

  submitForm() {
    if (this.newNoteGroupForm.controls.groupName.errors) {
      return;
    }

    this.data.emit(this.newNoteGroupForm.getRawValue());

    this.newNoteGroupForm.reset();
  }

  private _stringLengthValidator(
    value: string,
    config: { min?: number; max?: number }
  ) {
    const throwNoOption = () => {
      throw new Error('No configuration detected!');
    };

    if (!config) {
      throwNoOption();
    }

    if (!Object.keys(config).length) {
      throwNoOption();
    }

    const valueLength = value.length;
    let result = false;

    if (typeof config.min === 'number' && typeof config.max === 'number') {
      result = config.min <= valueLength && valueLength <= config.max;
    } else if (typeof config.min === 'number') {
      result = config.min <= valueLength;
    } else if (typeof config.max === 'number') {
      result = valueLength <= config.max;
    }
    return result;
  }
}
