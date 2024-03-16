import { NoteModel } from 'src/app/auth/services/Models/UserDataModels.interface';

export interface NoteListFormEditor {
  action: 'save' | 'close';
  noteGroupTitle?: string;
  notesGroupBuffer?: NoteModel[];
}
