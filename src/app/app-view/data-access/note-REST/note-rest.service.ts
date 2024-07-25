import { Injectable, OnDestroy, inject } from '@angular/core';
import { MatChipInputEvent, MatChipEditedEvent } from '@angular/material/chips';
import { NoteModel } from 'src/app/auth/utils/Models/UserDataModels.interface';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { randomId } from 'src/app/reusable/utils/data-tools/objectTools';
import { BehaviorSubject } from 'rxjs';
import { TIMESTAMP_TOKEN } from 'src/app/reusable/data-access/timestamp/timestamp.token';

@Injectable()
export class NoteRestService implements OnDestroy {
  #announcer = inject(LiveAnnouncer);
  #timestamp = inject(TIMESTAMP_TOKEN);

  readonly ID_LENGTH = 27;

  private _notesBufferSubject = new BehaviorSubject<NoteModel[]>([]);

  get notesBuffer$() {
    return this._notesBufferSubject.asObservable();
  }

  ngOnDestroy(): void {
    this.fillNotesBuffer([]);
    this._notesBufferSubject.complete();
  }

  fillNotesBuffer(notes: NoteModel[]) {
    this._notesBufferSubject.next(notes);
  }

  async onCreateNote(event: MatChipInputEvent) {
    const value = event.value.trim();
    if (!value) {
      return;
    }

    await this._createNote(value);

    event.chipInput.clear();
  }

  onEditNote({ note, event }: { note: NoteModel; event: MatChipEditedEvent }) {
    const trimmedValue = event.value.trim();

    if (!trimmedValue) {
      this.onRemoveNote(note);
      return;
    }

    const payload: Partial<NoteModel> = {
      id: note.id,
      value: trimmedValue,
    };

    this._editNote(note.id, payload);
  }

  onRemoveNote({ id, value }: NoteModel) {
    if (!this._deleteNote(id)) {
      return;
    }

    this.#announcer.announce(`Removed ${value}`);
  }

  /* NoteModel methods */

  private async _createNote(value: string) {
    if (!value) {
      console.warn('No value provided to new note');
      return;
    }

    const createdAt = await this.#timestamp();
    const note: NoteModel = {
      createdAt,
      id: randomId(this.ID_LENGTH),
      value,
    };

    this._notesBufferSubject.next([...this._notesBufferSubject.value, note]);
  }

  private _editNote(noteId: string, changes: Partial<NoteModel>): boolean {
    let isEdited = false;

    const updatedNotes = this._notesBufferSubject.value.map((note) => {
      if (note.id === noteId) {
        isEdited = true;
        return { ...note, ...changes };
      }

      return note;
    });

    if (isEdited) {
      this._notesBufferSubject.next(updatedNotes);
    }

    return isEdited;
  }

  private _deleteNote(id: string): boolean {
    const initialLength = this._notesBufferSubject.value.length;

    const leftNotes = this._notesBufferSubject.value.filter(
      (note) => note.id !== id
    );
    const isEqualLength = leftNotes.length !== initialLength;

    if (isEqualLength) {
      this._notesBufferSubject.next(leftNotes);
    }

    return isEqualLength;
  }
}
