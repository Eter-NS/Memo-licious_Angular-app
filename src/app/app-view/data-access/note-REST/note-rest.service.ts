import { Injectable, inject } from '@angular/core';
import { NotesService } from '../notes/notes.service';
import { MatChipInputEvent, MatChipEditedEvent } from '@angular/material/chips';
import { NoteModel } from 'src/app/auth/services/Models/UserDataModels.interface';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Injectable()
export class NoteRestService {
  #notesService = inject(NotesService);
  #announcer = inject(LiveAnnouncer);

  async onCreateNote(event: MatChipInputEvent) {
    const value = event.value.trim();
    if (!value) return;

    await this.#notesService.createNote(value);

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

    this.#notesService.editNote(note.id, payload);
  }

  onRemoveNote({ id, value }: NoteModel) {
    if (!this.#notesService.deleteNote(id)) return;

    this.#announcer.announce(`Removed ${value}`);
  }
}
