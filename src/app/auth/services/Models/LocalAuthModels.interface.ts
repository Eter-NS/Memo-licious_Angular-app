import { NoteGroupModel } from './UserDataModels.interface';

export interface LocalUserAuth {
  name: string;
  authOption: 'password' | 'pin';
  value: string;
}
export interface LocalUserFormData {
  auth: LocalUserAuth;
}
export interface LocalUserAccount extends LocalUserFormData {
  profileColor: string;
  profilePictureUrl?: string;
  groups: NoteGroupModel[];
}
export interface LocalUsers {
  name: string;
  profileColor: string;
  profilePictureUrl?: string;
}
