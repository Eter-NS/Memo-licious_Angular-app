import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { NoteListFormComponent } from '../../ui/note-list-form/note-list-form.component';
import { NotesService } from '../../data-access/notes/notes.service';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/utils/Models/UserDataModels.interface';
import { ActivatedRoute, ResolveEnd, Router } from '@angular/router';
import { NoteRestService } from '../../data-access/note-REST/note-rest.service';
import { MatChipInputEvent, MatChipEditedEvent } from '@angular/material/chips';
import {
  EMPTY,
  catchError,
  combineLatest,
  combineLatestWith,
  filter,
  from,
  map,
  shareReplay,
  switchMap,
  take,
} from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NoteListFormEditor } from '../../utils/models/note-list-form-editor.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment.dev';
import { FetchErrorComponent } from '../../../reusable/ui/fetch-error/fetch-error.component';
import { AdaptiveButtonDirective } from 'src/app/reusable/utils/adaptive-button/adaptive-button.directive';

@Component({
  selector: 'app-group-details',
  standalone: true,
  templateUrl: './app-group-mobile-details.component.html',
  styleUrl: './app-group-mobile-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NoteListFormComponent,
    AsyncPipe,
    MatIconModule,
    FetchErrorComponent,
    AdaptiveButtonDirective,
  ],
})
export class GroupMobileDetailsComponent implements OnInit {
  viewTransitionService = inject(ViewTransitionService);
  #title = inject(Title);
  #notesService = inject(NotesService);
  #noteRestService = inject(NoteRestService);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #cd = inject(ChangeDetectorRef);

  @ViewChild('viewContainer', { static: true })
  viewContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('form')
  formElement!: NoteListFormComponent;

  readonly #NOTES_ROUTE = '/app/notes';
  private _isClosingEditor = false;

  #resolvedNotes$ = this.#route.data.pipe(
    filter((data) => data['groupNotes']),
    map((data) => data['groupNotes'] as NoteGroupModel[])
  );

  #noteGroup$ = this.#resolvedNotes$.pipe(
    combineLatestWith(this.#route.paramMap),
    map(([groups, params]) => {
      const id = params.get('groupDetails');

      const group = groups.find(({ id: storedId }) => storedId === id);

      if (!group) {
        throw new Error('No group found!');
      } else if (group.deleteAt) {
        throw new Error(`The group is marked to delete!`);
      } else {
        return group;
      }
    }),
    catchError(() => from(this._goBack()).pipe(switchMap(() => EMPTY))),
    shareReplay({ refCount: false, bufferSize: 1 })
  );

  data$ = combineLatest({
    groupNotes: this.#noteRestService.notesBuffer$,
    noteGroupTitle: this.#noteGroup$.pipe(map((note) => note.title)),
  });

  constructor() {
    this._listenForRouteChange();
  }

  ngOnInit(): void {
    this._loadNotesAndTitle();
  }

  private _loadNotesAndTitle() {
    this.#noteGroup$.pipe(take(1)).subscribe((group) => {
      this.#title.setTitle(group.title);
      this.#noteRestService.fillNotesBuffer(group.notes);
    });
  }

  private _listenForRouteChange() {
    this.#router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      // When user moves out of the page
      if (event instanceof ResolveEnd && this._isClosingEditor) {
        this._clearNoteBuffer();
      }
    });
  }

  private _clearNoteBuffer() {
    this.#noteRestService.fillNotesBuffer([]);
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

  async closeEditor(action: NoteListFormEditor['action']) {
    this._isClosingEditor = true;

    if (action === 'close') {
      await this._goBack();
      this._clearNoteBuffer();
      return;
    }

    await this._updateGroup();
  }

  private _updateGroup(): Promise<void> {
    const newNoteGroupTitle =
      this.formElement.newNoteGroupForm.controls.groupName.value;

    return new Promise<void>((resolve, reject) => {
      combineLatest([
        this.#notesService.notes$,
        this.#noteRestService.notesBuffer$,
        this.#noteGroup$,
      ])
        .pipe(take(1))
        .subscribe(async ([storedGroups, noteBuffer, selectedGroup]) => {
          if (!noteBuffer.length) {
            await this.#notesService.deleteGroup(selectedGroup.id);
            await this._goBack();
            resolve();
            return;
          }

          const updatedGroups: NoteGroupModel[] = storedGroups.map(
            (storedGroup) =>
              storedGroup.id === selectedGroup.id
                ? {
                    ...selectedGroup,
                    notes: noteBuffer,
                    title: newNoteGroupTitle,
                  }
                : storedGroup
          );

          try {
            const result = await this.#notesService.modifyGroups(updatedGroups);

            if (result) {
              await this._goBack();
              resolve();
            }
          } catch (err) {
            if (!environment.production) {
              console.error(err);
            }
            reject();
          }
        });
    });
  }

  private async _goBack() {
    await this.viewTransitionService.goBack(
      this.viewContainer.nativeElement,
      this.#NOTES_ROUTE
    );
  }
}
