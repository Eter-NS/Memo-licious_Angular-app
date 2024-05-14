import { NoteModel } from 'src/app/auth/utils/Models/UserDataModels.interface';

export interface NoteListFormEditor {
  action: 'save' | 'close';
  noteGroupTitle?: string;
  notesGroupBuffer?: NoteModel[];
}
