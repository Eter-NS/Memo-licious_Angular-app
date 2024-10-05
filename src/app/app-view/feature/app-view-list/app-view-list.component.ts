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
import { NoteModel } from 'src/app/auth/utils/Models/UserDataModels.interface';
import {
  finishAnimation,
  removeAnimations,
} from 'src/app/reusable/utils/animations/animation-tools';
import { runAnimationOnce } from 'src/app/reusable/utils/animations/animation-triggers';
import { NoteRestService } from '../../data-access/note-REST/note-rest.service';
import { NotesService } from '../../data-access/notes/notes.service';
import { BottomSheetComponent } from '../../../reusable/ui/bottom-sheet/bottom-sheet.component';
import {
  NoteListFormComponent,
  NewNoteGroupForm,
} from '../../ui/note-list-form/note-list-form.component';
import { NotesListGroupElementComponent } from '../../ui/notes-list-group-element/notes-list-group-element.component';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { ViewportListenersService } from 'src/app/reusable/data-access/viewport-listeners/viewport-listeners.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoteGroupListContainerComponent } from '../note-group-list-container/note-group-list-container.component';
import { GrinningFaceWithSweatEmojiComponent } from '../../../reusable/ui/SVGs/grinning-face-with-sweat-emoji/grinning-face-with-sweat-emoji.component';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { AdaptiveButtonDirective } from 'src/app/reusable/utils/adaptive-button/adaptive-button.directive';

@Component({
  standalone: true,
  templateUrl: './app-view-list.component.html',
  styleUrl: './app-view-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    MatIconModule,
    NgTemplateOutlet,
    BottomSheetComponent,
    NoteListFormComponent,
    AdaptiveButtonDirective,
    MatProgressSpinnerModule,
    NotesListGroupElementComponent,
    NoteGroupListContainerComponent,
    GrinningFaceWithSweatEmojiComponent,
  ],
})
export class AppViewListComponent {
  #notesService = inject(NotesService);
  #viewportListenersService = inject(ViewportListenersService);
  #noteRestService = inject(NoteRestService);
  #cd = inject(ChangeDetectorRef);
  #zone = inject(NgZone);

  private _finishAnimation = finishAnimation;
  private _removeAnimations = removeAnimations;
  private _runAnimationOnce = runAnimationOnce;

  @ViewChild('mobileAddNoteGroupButton')
  button!: ElementRef<HTMLDivElement>;

  private readonly _mobileFormVisibleSubject = new BehaviorSubject<boolean>(
    false
  );

  data$ = combineLatest({
    notesBuffer: this.#noteRestService.notesBuffer$,
    isHandset: this.#viewportListenersService.isHandset$,
    mobileFormVisible: this._mobileFormVisibleSubject.asObservable(),
  });

  constructor() {
    this.#viewportListenersService.isHandset$
      .pipe(takeUntilDestroyed())
      .subscribe((isMobile) => {
        if (!isMobile) {
          this._mobileFormVisibleSubject.next(false);
        }
      });
  }

  toggleNoteListForm(state: 'open' | 'close') {
    const element = this.button.nativeElement;
    const isGoingToBeOpen = state === 'open';

    this._fadeInOutElement(element, isGoingToBeOpen ? 'out' : 'in', 'top');

    this._mobileFormVisibleSubject.next(isGoingToBeOpen);
  }

  private _fadeInOutElement(
    element: HTMLElement,
    state: 'in' | 'out',
    fromTo: 'top' | 'bottom'
  ) {
    this.#zone.runOutsideAngular(() => {
      this._finishAnimation(element);

      switch (state) {
        case 'out':
          this._runAnimationOnce(element, `fadeOut-to-${fromTo}-animation`);
          break;

        case 'in':
          this._runAnimationOnce(element, `fadeIn-from-${fromTo}-animation`, {
            removeClassOnFinish: true,
          });
          this._removeAnimations(element, `fadeOut-to-${fromTo}-animation`);
          break;

        default:
          console.error('Unknown state value: ', state);
      }
    });
  }

  async onCreateNote(event: MatChipInputEvent) {
    await this.#noteRestService.onCreateNote(event);
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

  async handleGroupCreation({ groupName }: NewNoteGroupForm) {
    if (!(await this.#notesService.isNewGroupValid(groupName))) {
      return;
    }

    await this.#notesService.createGroup(groupName);
  }
}
