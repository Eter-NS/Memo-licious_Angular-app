import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  DestroyRef,
  ElementRef,
  Input,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { NgxMasonryModule } from 'ngx-masonry';
import { BehaviorSubject, combineLatest, filter, map, take } from 'rxjs';
import { NotesService } from 'src/app/app-view/data-access/notes/notes.service';
import { NotesListGroupElementComponent } from 'src/app/app-view/ui/notes-list-group-element/notes-list-group-element.component';
import { NoteListFormEditor } from 'src/app/app-view/utils/models/note-list-form-editor.interface';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/utils/Models/UserDataModels.interface';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { ViewportListenersService } from 'src/app/reusable/data-access/viewport-listeners/viewport-listeners.service';
import {
  INoteListFormDialogData,
  NoteListFormDialogEditorComponent,
} from '../note-list-form-dialog-editor/note-list-form-dialog-editor.component';
import { environment } from 'src/environments/environment.dev';
import { NoteRestService } from '../../data-access/note-REST/note-rest.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { readMessageProperty } from 'src/app/reusable/utils/data-tools/readMessageProperty';

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
  #noteRestService = inject(NoteRestService);
  #dialog = inject(MatDialog);
  #destroyRef = inject(DestroyRef);

  @Input() set markForDelete(value: boolean) {
    this._markForDeleteSubject.next(value);
  }

  private readonly _markForDeleteSubject = new BehaviorSubject<boolean>(false);

  @ContentChild('noElementsInfo') noGroupsFound!: TemplateRef<unknown>;

  @ViewChild('container')
  private readonly _mainElement?: ElementRef<HTMLDivElement>;

  filteredNoteGroups$ = combineLatest([
    this.#notesService.notes$,
    this._markForDeleteSubject,
  ]).pipe(
    map(([groups, markForDelete]) =>
      groups.filter(({ deleteAt }) => (markForDelete ? deleteAt : !deleteAt))
    )
  );

  protected handleGroupMarkForDelete(id: string, state: boolean) {
    this.#notesService.markGroupToDelete(id, state);
  }

  protected handleClick(id: string) {
    this.#viewportListenersService.isHandset$
      .pipe(take(1))
      .subscribe((isHandset) => {
        if (!this._mainElement) {
          return;
        }

        if (isHandset) {
          this.#viewTransitionService.goForward(
            this._mainElement.nativeElement,
            `/app/notes/${id}`
          );

          return;
        }

        this._handleDialog(id);
      });
  }

  private _handleDialog(id: string) {
    const config = this._configureDialog(id);

    const dialogRef = this.#dialog.open<
      NoteListFormDialogEditorComponent,
      INoteListFormDialogData,
      NoteListFormEditor
    >(NoteListFormDialogEditorComponent, config);

    this._subscribeToDialogEvents(dialogRef, id);
  }

  private _configureDialog(
    id: string
  ): MatDialogConfig<INoteListFormDialogData> {
    return {
      minWidth: '500px',
      maxWidth: '75vw',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '200ms',
      ariaLabel: 'you can edit your notes here',
      data: { id },
      closeOnNavigation: true,
    };
  }

  private _subscribeToDialogEvents(
    dialogRef: MatDialogRef<
      NoteListFormDialogEditorComponent,
      NoteListFormEditor
    >,
    id: string
  ): void {
    combineLatest([dialogRef.beforeClosed(), this.filteredNoteGroups$])
      .pipe(
        take(1),
        filter(
          ([dialogState, notes]) => Boolean(dialogState) && Array.isArray(notes)
        ),
        map(
          ([dialogState, notes]) =>
            [dialogState, notes] as [NoteListFormEditor, NoteGroupModel[]]
        ),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe(async ([dialogState, groups]) => {
        const defaultAction = () => {
          this.#noteRestService.fillNotesBuffer([]);
        };

        if (!dialogState.noteGroupTitle || !dialogState.notesGroupBuffer) {
          defaultAction();
          return;
        }

        if (dialogState.action === 'close') {
          defaultAction();
          return;
        }

        try {
          const result = await this._modifyGroups(
            groups,
            dialogState.noteGroupTitle,
            dialogState.notesGroupBuffer,
            id
          );

          dialogRef.disableClose = !result;
        } catch (err) {
          if (!environment.production) {
            console.error(readMessageProperty(err) || err);
          }

          dialogRef.disableClose = true;
        }
      });
  }

  private _modifyGroups(
    groups: NoteGroupModel[],
    noteGroupTitle: string,
    notesGroupBuffer: NoteModel[],
    id: string
  ): Promise<boolean> {
    const updatedGroups = this._updateGroups(
      groups,
      noteGroupTitle,
      notesGroupBuffer,
      id
    );

    return this.#notesService.modifyGroups(updatedGroups);
  }

  private _updateGroups(
    groups: NoteGroupModel[],
    noteGroupTitle: string,
    notesGroupBuffer: NoteModel[],
    id: string
  ): NoteGroupModel[] {
    if (notesGroupBuffer.length === 0) {
      // Remove the group
      return groups.filter((group) => group.id !== id);
    } else {
      // Modify notes in the group
      return groups.map((group) => {
        return group.id === id
          ? {
              ...group,
              title: noteGroupTitle,
              notes: notesGroupBuffer,
            }
          : group;
      });
    }
  }
}
