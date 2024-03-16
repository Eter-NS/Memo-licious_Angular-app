import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
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
import { NoteModel } from 'src/app/auth/services/Models/UserDataModels.interface';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatInputModule } from '@angular/material/input';
import { FormCommonFeaturesService } from 'src/app/reusable/data-access/form-common-features/form-common-features.service';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { AdaptiveButtonComponent } from '../../../ui/adaptive-button/adaptive-button.component';
import { BehaviorSubject } from 'rxjs';

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
    AdaptiveButtonComponent,
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

  @ViewChild('chipRow') chipRow!: MatChipRow;

  newNoteGroupForm = this.#fb.group({
    groupName: this.#fb.control(this.noteListTitle, {
      validators: [Validators.required, Validators.maxLength(32)],
    }),
  });
  timeoutId!: unknown;
  separatorCodes = [ENTER, COMMA] as const;

  #errorMessage = new BehaviorSubject<ValidationErrorI | null | undefined>(
    undefined
  );

  get errorMessage$() {
    return this.#errorMessage.asObservable();
  }

  #lengthValidationConfig = {
    min: 0,
    max: 35,
  };

  getError = (element: string, validation: string) =>
    this.#formCommonFeaturesService.getError(
      this.newNoteGroupForm,
      element,
      validation
    );

  handleTouchStart() {
    this.timeoutId = setTimeout(() => {
      // this.chipRow.
    }, 500);
  }

  handleTouchEnd() {
    clearTimeout(this.timeoutId as number);
  }

  /** For creating and modifying notes only */
  handleNoteEvent(e: MatChipInputEvent | EditNoteI) {
    if (!('event' in e) && !('value' in e)) {
      console.error('The parameter is neither MatChipInputEvent nor EditNoteI');
      return;
    }

    const isModificationEvent = 'event' in e;
    const result = isModificationEvent
      ? this._stringLengthValidator(e.event.value, this.#lengthValidationConfig)
      : this._stringLengthValidator(e.value, this.#lengthValidationConfig);

    if (!result) {
      this.#errorMessage.next({
        cause: `The note can't be longer than ${
          this.#lengthValidationConfig.max
        } characters`,
      });
    } else {
      isModificationEvent ? this.editNote.emit(e) : this.createNote.emit(e);
      this.#errorMessage.next(null);
    }
  }

  submitForm() {
    if (this.newNoteGroupForm.controls.groupName.errors) return;

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
