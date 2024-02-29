export interface NoteModel {
  id: string;
  value: string;
  // getUTCTimestamp().unixtime for createdAt and deleteAt
  createdAt: number;
  deleteAt?: number;
}
export interface NoteGroupModel {
  id: string;
  title: string;
  notes: Array<NoteModel>;
  // getUTCTimestamp().unixtime for createdAt and deleteAt
  createdAt: number;
  deleteAt?: number;
}
// export interface NamedNoteGroups {
//   [key: string]: NoteGroupModel;
// }
export interface LocalUserFormData {
  auth: {
    name: string;
    authOption: 'password' | 'pin';
    value: string;
  };
}
export interface LocalUserAccount extends LocalUserFormData {
  profileColor: string;
  groups: NoteGroupModel[];
}
export interface LocalUsers {
  name: string;
  profileColor: string;
}
