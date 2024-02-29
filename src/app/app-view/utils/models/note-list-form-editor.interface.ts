import { NoteModel } from 'src/app/auth/services/Models/UserDataModels';

export interface NoteListFormEditor {
  action: 'save' | 'close';
  noteGroupTitle?: string;
  notesGroupBuffer?: NoteModel[];
}
