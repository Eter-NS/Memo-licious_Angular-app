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
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { PreviousPageButtonComponent } from 'src/app/ui/previous-page-button/previous-page-button.component';
import { NoteListFormComponent } from '../../ui/note-list-form/note-list-form.component';
import { NotesService } from '../../data-access/notes/notes.service';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/services/Models/UserDataModels';
import { ActivatedRoute, ResolveEnd, Router } from '@angular/router';
import { NoteRestService } from '../../data-access/note-REST/note-rest.service';
import { MatChipInputEvent, MatChipEditedEvent } from '@angular/material/chips';
import {
  EMPTY,
  Observable,
  combineLatest,
  filter,
  map,
  of,
  switchMap,
  take,
} from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { AdaptiveButtonComponent } from '../../../ui/adaptive-button/adaptive-button.component';
import { MatIconModule } from '@angular/material/icon';
import { NoteListFormEditor } from '../../utils/models/note-list-form-editor.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const NOTES_ROUTE = '/app/notes';

@Component({
  selector: 'app-app-group-details',
  standalone: true,
  templateUrl: './app-group-details.component.html',
  styleUrl: './app-group-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PreviousPageButtonComponent,
    NoteListFormComponent,
    AsyncPipe,
    AdaptiveButtonComponent,
    MatIconModule,
  ],
})
export class AppGroupDetailsComponent implements OnInit, AfterViewInit {
  viewTransitionService = inject(ViewTransitionService);
  #notesService = inject(NotesService);
  #noteRestService = inject(NoteRestService);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #cd = inject(ChangeDetectorRef);

  @ViewChild('viewContainer') viewContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('form') formElement!: NoteListFormComponent;

  groupNotes$: Observable<NoteModel[]> = this.#notesService.notesBuffer$;
  noteGroup$ = this.#route.data.pipe(
    filter((data) => data['groupNotes']),
    map((data) => data['groupNotes'] as NoteGroupModel[]),
    switchMap((groups) => {
      const id = this.#route.snapshot.paramMap.get('groupDetails');
      const group = groups.find(({ id: storedId }) => storedId === id);

      if (!group) {
        this.viewTransitionService.goBack(
          this.viewContainer.nativeElement,
          NOTES_ROUTE
        );
        return EMPTY;
      }

      return of(group);
    })
  );

  constructor() {
    this._listenForRouteChange();
  }

  ngOnInit(): void {
    this._fetchNoteGroup();
  }

  ngAfterViewInit(): void {
    this.viewTransitionService.viewFadeIn(this.viewContainer.nativeElement);
  }

  private _fetchNoteGroup() {
    this.noteGroup$.pipe(take(1)).subscribe((group) => {
      if (!group) {
        return;
      }

      this.#notesService.fillNotesBuffer(group.notes);
    });
  }

  private _listenForRouteChange() {
    this.#router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof ResolveEnd) {
        this._clearNoteBuffer();
      }
    });
  }

  private _clearNoteBuffer() {
    this.#notesService.fillNotesBuffer([]);
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
    if (action === 'close') {
      await this.viewTransitionService.goBack(
        this.viewContainer.nativeElement,
        NOTES_ROUTE
      );
      this.#notesService.fillNotesBuffer([]);
      return;
    }

    this._updateGroup();
  }

  private _updateGroup() {
    const element = this.viewContainer.nativeElement;
    const newNoteGroupTitle: string =
      this.formElement.newNoteGroupForm.controls.groupName.value;

    combineLatest([
      this.#notesService.notes$,
      this.groupNotes$,
      this.noteGroup$,
    ])
      .pipe(
        take(1),
        map(
          ([groups, noteBuffer, group]) =>
            [groups, noteBuffer, group] as [
              NoteGroupModel[],
              NoteModel[],
              NoteGroupModel
            ]
        )
      )
      .subscribe(async ([groups, noteBuffer, group]) => {
        if (!noteBuffer.length) {
          await this.#notesService.deleteGroup(group.id);
          this.viewTransitionService.goBack(element, NOTES_ROUTE);
          return;
        }

        const updatedGroups: NoteGroupModel[] = groups.map((storedGroup) => {
          return storedGroup.id === group.id
            ? { ...group, notes: noteBuffer, title: newNoteGroupTitle }
            : storedGroup;
        });

        try {
          const result = await this.#notesService.modifyGroups(updatedGroups);

          if (result) {
            this.viewTransitionService.goBack(element, NOTES_ROUTE);
          }
        } catch (err) {
          console.error(err);
        }
      });
  }
}
