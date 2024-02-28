export interface GroupModel {
  // serverTimestamp() for createdAt and deleteAt
  createdAt: Date;
  deleteAt?: Date;
  values: Array<NoteModel>;
}
export interface NoteModel {
  value: string;
  // serverTimestamp() for createdAt and deleteAt
  createdAt: Date;
  deleteAt?: Date;
}
export interface LocalUserFormData {
  auth: {
    name: string;
    authOption: 'password' | 'pin';
    value: string;
  };
}
export interface LocalUserAccount extends LocalUserFormData {
  profileColor: string;
  groups: { [key: string]: GroupModel };
}
export interface LocalUsers {
  name: string;
  profileColor: string;
}
