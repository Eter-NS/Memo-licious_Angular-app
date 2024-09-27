import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { NoteListFormComponent } from '../../ui/note-list-form/note-list-form.component';
import { NoteRestService } from '../../data-access/note-REST/note-rest.service';
import { NotesService } from '../../data-access/notes/notes.service';
import { MatChipInputEvent, MatChipEditedEvent } from '@angular/material/chips';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/utils/Models/UserDataModels.interface';
import { EMPTY, filter, map, of, switchMap, take } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { NoteListFormEditor } from '../../utils/models/note-list-form-editor.interface';
import { AdaptiveButtonDirective } from 'src/app/reusable/utils/adaptive-button/adaptive-button.directive';

export interface INoteListFormDialogData {
  id: string;
}

@Component({
  standalone: true,
  templateUrl: './note-list-form-dialog-editor.component.html',
  styleUrl: './note-list-form-dialog-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    NoteListFormComponent,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatIconModule,
    AdaptiveButtonDirective,
  ],
  providers: [NotesService, NoteRestService],
})
export class NoteListFormDialogEditorComponent implements OnInit {
  #dialogRef =
    inject<MatDialogRef<NoteListFormDialogEditorComponent, NoteListFormEditor>>(
      MatDialogRef
    );
  #dialogData = inject<INoteListFormDialogData>(MAT_DIALOG_DATA);
  #notesService = inject(NotesService, { self: true });
  #noteRestService = inject(NoteRestService, { self: true });
  #cd = inject(ChangeDetectorRef);

  @ViewChild('form') formElement!: NoteListFormComponent;

  private _noteGroupId = this.#dialogData.id;
  noteGroup$ = this.#notesService.notes$.pipe(
    filter((groups) => !!groups),
    map((groups) =>
      (groups as NoteGroupModel[]).find(
        ({ id: storedId }) => storedId === this._noteGroupId
      )
    ),
    switchMap((group) => {
      if (!group) {
        this.#dialogRef.close({ action: 'close' });
        return EMPTY;
      }
      return of(group);
    })
  );

  groupNotes$ = this.#noteRestService.notesBuffer$;

  ngOnInit(): void {
    this.noteGroup$.pipe(take(1)).subscribe((noteGroup) => {
      this.#noteRestService.fillNotesBuffer(noteGroup.notes);
    });
  }

  onCreateNote(event: MatChipInputEvent) {
    this.#noteRestService.onCreateNote(event);
    this.#cd.markForCheck();
  }

  onEditNote(event: { note: NoteModel; event: MatChipEditedEvent }) {
    this.#noteRestService.onEditNote(event);
    this.#cd.markForCheck();
  }

  onRemoveNote(event: NoteModel) {
    this.#noteRestService.onRemoveNote(event);
    this.#cd.markForCheck();
  }

  closeDialog(action: NoteListFormEditor['action']) {
    const noteGroupFormElement =
      this.formElement.newNoteGroupForm.controls.groupName;

    if (noteGroupFormElement.errors) {
      return;
    }

    this.#noteRestService.notesBuffer$
      .pipe(take(1))
      .subscribe((notesGroupBuffer) => {
        this.#dialogRef.close({
          action,
          noteGroupTitle: noteGroupFormElement.getRawValue(),
          notesGroupBuffer,
        });
      });
  }
}
