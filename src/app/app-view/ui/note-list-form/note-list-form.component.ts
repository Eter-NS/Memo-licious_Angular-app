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
import { NoteModel } from 'src/app/auth/services/Models/UserDataModels';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatInputModule } from '@angular/material/input';
import { FormCommonFeaturesService } from 'src/app/auth/services/form-common-features/form-common-features.service';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { AdaptiveButtonComponent } from '../../../ui/adaptive-button/adaptive-button.component';

export type NewNoteGroupForm = ReturnType<
  typeof NoteListFormComponent.prototype.newNoteGroupForm.getRawValue
>;

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
  @Output() editNote = new EventEmitter<{
    note: NoteModel;
    event: MatChipEditedEvent;
  }>();
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

  submitForm() {
    if (this.newNoteGroupForm.controls.groupName.errors) return;

    this.data.emit(this.newNoteGroupForm.getRawValue());

    this.newNoteGroupForm.reset();
  }
}
