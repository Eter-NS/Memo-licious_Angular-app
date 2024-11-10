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
import { AsyncPipe } from '@angular/common';
import { environment } from 'src/environments/environment.dev';
import { LongPressDirective } from '../../../reusable/utils/long-press/long-press.directive';
import { NoteValidationService } from '../../data-access/note-validation/note-validation.service';

export type NewNoteGroupForm = ReturnType<
  typeof NoteListFormComponent.prototype.newNoteGroupForm.getRawValue
>;

export interface EditNoteI {
  note: NoteModel;
  event: MatChipEditedEvent;
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
    AsyncPipe,
    LongPressDirective,
  ],
})
export class NoteListFormComponent {
  protected noteFormValidation = inject(NoteValidationService);
  #fb = inject(NonNullableFormBuilder);
  #formCommonFeaturesService = inject(FormCommonFeaturesService);

  @Input({ required: true }) notes!: Array<NoteModel>;
  @Input({ required: true }) environment!: 'note-creator' | 'note-edit';
  @Input() set noteListTitle(value: string) {
    this.newNoteGroupForm.controls.groupName.patchValue(value);
  }

  @Output() createNote = new EventEmitter<MatChipInputEvent>();
  @Output() editNote = new EventEmitter<EditNoteI>();
  @Output() removeNote = new EventEmitter<NoteModel>();
  @Output() data = new EventEmitter<NewNoteGroupForm>();

  @ViewChildren('chipRow') chipRows!: QueryList<MatChipRow>;

  protected readonly separatorCodes = [ENTER, COMMA] as const;

  newNoteGroupForm = this.#fb.group({
    groupName: ['', [Validators.required, Validators.maxLength(32)]],
  });

  getError(element: string, validation: string) {
    return this.#formCommonFeaturesService.getError(
      this.newNoteGroupForm,
      element,
      validation
    );
  }

  handleMobileEdit(noteId: string): void {
    const chipRow = this.chipRows.find(({ id }) => id === noteId);
    if (!chipRow) {
      return;
    }

    chipRow._handleDoubleclick(
      new MouseEvent('dbclick', {
        button: 0,
        bubbles: false,
        cancelable: true,
      })
    );
  }

  handleNoteEvent(e: MatChipInputEvent | EditNoteI): void {
    if (!this._isValidEventType(e)) {
      return;
    }

    this.noteFormValidation.setError(null);

    const isModificationEvent = 'event' in e;
    const noteValue = isModificationEvent ? e.event.value : e.value;
    const { state: validationState, cause } =
      this.noteFormValidation.validateNoteLength(noteValue);

    if (this._isNoteTooLong(validationState, cause)) {
      return;
    }

    isModificationEvent ? this.editNote.emit(e) : this.createNote.emit(e);
  }

  submitForm(): void {
    if (this.newNoteGroupForm.controls.groupName.errors) {
      return;
    }

    if (this.noteFormValidation.hasActiveError) {
      return;
    }

    this.data.emit(this.newNoteGroupForm.getRawValue());
    this.newNoteGroupForm.reset();
  }

  private _isValidEventType(e: MatChipInputEvent | EditNoteI): boolean {
    const isValidEvent = 'event' in e || 'value' in e;
    if (isValidEvent) {
      return true;
    }

    if (!environment.production) {
      console.error(
        'Invalid event type: Expected MatChipInputEvent or EditNoteI'
      );
    }
    return false;
  }

  private _isNoteTooLong(
    validationState: string,
    cause: string | null
  ): boolean {
    if (validationState === 'invalid' && cause === 'too-long') {
      this.noteFormValidation.setError({
        cause: `The note can't be longer than ${this.noteFormValidation.validationConfig.max} characters`,
      });
      return true;
    }
    return false;
  }
}
