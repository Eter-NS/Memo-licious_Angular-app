import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  NgZone,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { NoteModel } from 'src/app/auth/services/Models/UserDataModels';
import {
  finishAnimation,
  removeAnimations,
} from 'src/app/reusable/animations/animation-tools';
import { runAnimationOnce } from 'src/app/reusable/animations/animation-triggers';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { AdaptiveButtonComponent } from 'src/app/ui/adaptive-button/adaptive-button.component';
import { NoteRestService } from '../../data-access/note-rest/note-rest.service';
import { NotesService } from '../../data-access/notes/notes.service';
import { BottomSheetComponent } from '../../../ui/bottom-sheet/bottom-sheet.component';
import {
  NoteListFormComponent,
  NewNoteGroupForm,
} from '../../ui/note-list-form/note-list-form.component';
import { NotesListGroupElementComponent } from '../../ui/notes-list-group-element/notes-list-group-element.component';
import { EntriesPipe } from '../../utils/pipes/entries/entries.pipe';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { ViewportListenersService } from 'src/app/reusable/data-access/viewport-listeners/viewport-listeners.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoteGroupListContainerComponent } from '../note-group-list-container/note-group-list-container/note-group-list-container.component';
import { GrinningFaceWithSweatEmojiComponent } from '../../../reusable/SVGs/grinning-face-with-sweat-emoji/grinning-face-with-sweat-emoji.component';

@Component({
  standalone: true,
  templateUrl: './app-view-list.component.html',
  styleUrl: './app-view-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    EntriesPipe,
    MatIconModule,
    NgTemplateOutlet,
    BottomSheetComponent,
    NoteListFormComponent,
    AdaptiveButtonComponent,
    MatProgressSpinnerModule,
    NotesListGroupElementComponent,
    NoteGroupListContainerComponent,
    GrinningFaceWithSweatEmojiComponent,
  ],
})
export class AppViewListComponent {
  viewTransitionService = inject(ViewTransitionService);
  notesService = inject(NotesService);
  viewportListenersService = inject(ViewportListenersService);
  #noteRestService = inject(NoteRestService);
  #cd = inject(ChangeDetectorRef);
  #zone = inject(NgZone);

  private _finishAnimation = finishAnimation;
  private _removeAnimations = removeAnimations;
  private _runAnimationOnce = runAnimationOnce;

  @ViewChild('container') mainElement!: ElementRef<HTMLDivElement>;
  @ViewChild('mobileAddNoteGroupButton') button!: ElementRef<HTMLDivElement>;

  mobileFormVisible = false;

  notes$ = this.notesService.notes$;
  notesBuffer$ = this.notesService.notesBuffer$;

  constructor() {
    this.viewportListenersService.isHandset$
      .pipe(takeUntilDestroyed())
      .subscribe((isMobile) => !isMobile && (this.mobileFormVisible = false));
  }

  toggleNoteListForm(state: 'open' | 'close') {
    const element = this.button.nativeElement;

    switch (state) {
      case 'open':
        this.fadeInOutElement(element, 'out', 'top');
        this.mobileFormVisible = true;
        break;

      case 'close':
        this.fadeInOutElement(element, 'in', 'top');
        this.mobileFormVisible = false;
        break;

      default:
        throw new Error('Unknown state value');
    }
  }

  private fadeInOutElement(
    element: HTMLElement,
    state: 'in' | 'out',
    fromTo: 'top' | 'bottom'
  ) {
    this.#zone.runOutsideAngular(() => {
      switch (state) {
        case 'out':
          this._finishAnimation(element);
          this._runAnimationOnce(element, `fadeOut-to-${fromTo}-animation`);
          break;

        case 'in':
          this._finishAnimation(element);
          this._runAnimationOnce(element, `fadeIn-from-${fromTo}-animation`, {
            removeClassOnFinish: true,
          });
          this._removeAnimations(element, `fadeOut-to-${fromTo}-animation`);
          break;

        default:
          throw new Error('Unknown state value');
      }
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

  handleGroupCreation({ groupName }: NewNoteGroupForm) {
    if (!this.notesService.isNewGroupValid(groupName)) return;

    this.notesService.createGroup(groupName);
  }

  handleGroupMarkForDelete(id: string, state: boolean) {
    if (!id) return;
    this.notesService.markGroupToDelete(id, state);
  }
}
