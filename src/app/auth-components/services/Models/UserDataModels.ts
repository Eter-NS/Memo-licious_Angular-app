export interface LocalUserData {
  auth: {
    name: string;
    authOption: 'password' | 'pin';
    value: string;
  };
  groups: { [key: string]: Array<GroupModel> };
}
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
