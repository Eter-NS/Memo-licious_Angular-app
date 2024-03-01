import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
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
} from 'src/app/auth/services/Models/UserDataModels';
import { EMPTY, filter, map, of, switchMap, take } from 'rxjs';
import { AdaptiveButtonComponent } from 'src/app/ui/adaptive-button/adaptive-button.component';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { NoteListFormEditor } from '../../utils/models/note-list-form-editor.interface';
import { runAnimationOnce } from 'src/app/reusable/animations/animation-triggers';

export interface INoteListFormDialogData {
  id: string;
}

@Component({
  selector: 'app-note-list-form-dialog-editor',
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
    AdaptiveButtonComponent,
    MatIconModule,
  ],
  providers: [NotesService, NoteRestService],
})
export class NoteListFormDialogEditorComponent
  implements OnInit, AfterViewInit
{
  private _runAnimationOnce = runAnimationOnce;

  #dialogRef =
    inject<MatDialogRef<NoteListFormDialogEditorComponent, NoteListFormEditor>>(
      MatDialogRef
    );
  #dialogData = inject<INoteListFormDialogData>(MAT_DIALOG_DATA);
  #notesService = inject(NotesService, { self: true });
  #noteRestService = inject(NoteRestService, { self: true });
  #cd = inject(ChangeDetectorRef);

  @ViewChild('form') formElement!: NoteListFormComponent;
  @ViewChild('content') content!: ElementRef<HTMLDivElement>;

  #noteGroupId = this.#dialogData.id;
  noteGroup$ = this.#notesService.notes$.pipe(
    filter((groups) => !!groups),
    map((groups) =>
      (groups as NoteGroupModel[]).find(
        ({ id: storedId }) => storedId === this.#noteGroupId
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

  groupNotes$ = this.#notesService.notesBuffer$;

  ngOnInit(): void {
    this.noteGroup$.pipe(take(1)).subscribe((noteGroup) => {
      this.#notesService.fillNotesBuffer(noteGroup.notes);
    });
  }

  ngAfterViewInit(): void {
    this._runAnimationOnce(this.content.nativeElement, 'fadeInOnLoad', {
      removeClassOnFinish: true,
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

    this.#notesService.notesBuffer$
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
