import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  Input,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxMasonryModule } from 'ngx-masonry';
import { combineLatest, filter, map, take } from 'rxjs';
import { NotesService } from 'src/app/app-view/data-access/notes/notes.service';
import { NotesListGroupElementComponent } from 'src/app/app-view/ui/notes-list-group-element/notes-list-group-element.component';
import { NoteListFormEditor } from 'src/app/app-view/utils/models/note-list-form-editor.interface';
import { NoteGroupModel } from 'src/app/auth/services/Models/UserDataModels.interface';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { ViewportListenersService } from 'src/app/reusable/data-access/viewport-listeners/viewport-listeners.service';
import {
  INoteListFormDialogData,
  NoteListFormDialogEditorComponent,
} from '../note-list-form-dialog-editor/note-list-form-dialog-editor.component';

@Component({
  selector: 'app-note-group-list-container',
  standalone: true,
  imports: [
    AsyncPipe,
    NotesListGroupElementComponent,
    NgxMasonryModule,
    NgTemplateOutlet,
  ],
  templateUrl: './note-group-list-container.component.html',
  styleUrl: './note-group-list-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteGroupListContainerComponent {
  #viewportListenersService = inject(ViewportListenersService);
  #viewTransitionService = inject(ViewTransitionService);
  #notesService = inject(NotesService);
  #dialog = inject(MatDialog);

  @Input() markForDelete: boolean = false;

  @ContentChild('noElementsInfo') noGroupsFound!: TemplateRef<unknown>;

  @ViewChild('container') mainElement!: ElementRef<HTMLDivElement>;

  notes$ = this.#notesService.notes$.pipe(
    map((groups) =>
      groups.filter(({ deleteAt }) =>
        this.markForDelete ? deleteAt : !deleteAt
      )
    )
  );

  handleGroupMarkForDelete(id: string, state: boolean) {
    if (!id) return;
    this.#notesService.markGroupToDelete(id, state);
  }

  handleClick(id: string) {
    this.#viewportListenersService.isHandset$
      .pipe(take(1))
      .subscribe((value) => {
        if (value) {
          this.#viewTransitionService.goForward(
            this.mainElement.nativeElement,
            `/app/notes/${id}`
          );
        } else {
          this.handleDialog(id);
        }
      });
  }

  handleDialog(id: string) {
    const config: MatDialogConfig<INoteListFormDialogData> = {
      minWidth: '500px',
      maxWidth: '75vw',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '200ms',
      ariaLabel: 'you can edit your notes here',
      data: { id },
      closeOnNavigation: true,
    };

    const dialogRef = this.#dialog.open<
      NoteListFormDialogEditorComponent,
      INoteListFormDialogData,
      NoteListFormEditor
    >(NoteListFormDialogEditorComponent, config);

    combineLatest([dialogRef.beforeClosed(), this.notes$])
      .pipe(
        take(1),
        filter(
          ([dialogState, notes]) => Boolean(dialogState) && Array.isArray(notes)
        ),
        map(
          ([dialogState, notes]) =>
            [dialogState, notes] as [NoteListFormEditor, NoteGroupModel[]]
        )
      )
      .subscribe(async ([dialogState, groups]) => {
        if (!dialogState.noteGroupTitle) {
          return;
        }
        if (!dialogState.notesGroupBuffer) {
          return;
        }

        if (dialogState.action === 'close') {
          this.#notesService.fillNotesBuffer([]);
          return;
        }

        let updatedGroups: NoteGroupModel[];

        if (dialogState.notesGroupBuffer.length === 0) {
          updatedGroups = groups.filter((group) => group.id !== id);
        } else {
          updatedGroups = groups.map((group) => {
            return group.id === id
              ? {
                  ...group,
                  title: dialogState.noteGroupTitle!,
                  notes: dialogState.notesGroupBuffer!,
                }
              : group;
          });
        }

        try {
          const result = await this.#notesService.modifyGroups(updatedGroups);

          dialogRef.disableClose = !result;
        } catch (err) {
          console.error(err);
        }
      });
  }
}
