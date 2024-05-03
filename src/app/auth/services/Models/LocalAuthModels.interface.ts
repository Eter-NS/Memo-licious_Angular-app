import { NoteGroupModel } from './UserDataModels.interface';

export type AuthOptions = 'password' | 'pin';

export interface LocalUserAuth {
  name: string;
  authOption: AuthOptions;
  value: string;
}
export interface LocalUserFormData {
  auth: LocalUserAuth;
}
export interface LocalUserAccount extends LocalUserFormData {
  profileColor: string;
  profilePictureFile?: File;
  profilePictureUrl?: string;
  groups: NoteGroupModel[];
}
export interface LocalUsers {
  name: string;
  profileColor: string;
  profilePictureUrl?: string;
}
