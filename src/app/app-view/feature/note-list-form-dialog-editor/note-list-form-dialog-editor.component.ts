import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
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
import { combineLatest, EMPTY, map, of, switchMap, take } from 'rxjs';
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
  #notesService = inject(NotesService, { self: true });
  #noteRestService = inject(NoteRestService, { self: true });
  #cd = inject(ChangeDetectorRef);

  private _noteGroupId = inject<INoteListFormDialogData>(MAT_DIALOG_DATA).id;

  @ViewChild('form') formElement!: NoteListFormComponent;

  noteGroup$ = this.#notesService.notes$.pipe(
    map((groups) =>
      (groups as NoteGroupModel[]).find(
        ({ id: storedId }) => storedId === this._noteGroupId
      )
    ),
    switchMap((group) => {
      if (!group) {
        this._closeDialogWithoutResult();
        return EMPTY;
      }

      return of(group);
    })
  );

  groupNotes$ = this.#noteRestService.notesBuffer$;

  protected data$ = combineLatest({
    noteGroup: this.noteGroup$,
    groupNotes: this.#noteRestService.notesBuffer$,
  });

  ngOnInit(): void {
    this.noteGroup$.pipe(take(1)).subscribe((noteGroup) => {
      this.#noteRestService.fillNotesBuffer(noteGroup.notes);
    });
  }

  onCreateNote(event: MatChipInputEvent) {
    this.#noteRestService.onCreateNote(event);
    this.#cd.markForCheck();
  }

  onEditNote(eventObj: { note: NoteModel; event: MatChipEditedEvent }) {
    this.#noteRestService.onEditNote(eventObj);
    this.#cd.markForCheck();
  }

  onRemoveNote(event: NoteModel) {
    this.#noteRestService.onRemoveNote(event);
    this.#cd.markForCheck();
  }

  @HostListener('window:keydown.Escape')
  private _closeDialogWithoutResult() {
    this.#dialogRef.close({ action: 'close' });
  }

  closeDialog(action: NoteListFormEditor['action']) {
    const noteGroupTitleFormElement =
      this.formElement.newNoteGroupForm.controls.groupName;

    if (noteGroupTitleFormElement.errors && action === 'save') {
      return;
    }

    this.#noteRestService.notesBuffer$
      .pipe(take(1))
      .subscribe((notesGroupBuffer) => {
        this.#dialogRef.close({
          action,
          noteGroupTitle: noteGroupTitleFormElement.getRawValue(),
          notesGroupBuffer,
        });
      });
  }
}
