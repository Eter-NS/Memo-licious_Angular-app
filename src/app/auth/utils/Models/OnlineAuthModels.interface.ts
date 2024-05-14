import { NoteGroupModel } from './UserDataModels.interface';

/**
 * How to use:
 * - code - camelCase syntax,
 * - message - Potential message to the user,
 * @Example
 *  {
 *    code: 'sendingPostToDB',
 *    message: 'Sending post to DB failed'
 *  }
 */
export interface UnknownError {
  code: string;
  message: string;
}
export type FirebaseAuthError = UnknownError;
export interface Errors {
  alreadyInUseError?: true;
  emailDoesNotExist?: true;
  wrongEmailOrPassword?: true;
  sendingPostToDB?: true;
  unverifiedEmail?: true;
  noEmailProvided?: true;
  unknownError?: UnknownError;
}
export interface RegisterCustomOptions {
  displayName?: string | null;
  photoURL?: string | null;
}
export interface AuthReturnCredits {
  passed?: true;
  registered?: boolean | null;
  errors?: Errors;
}

export interface DbInitialPayload {
  email: string;
  photoURL: string | null;
  groups: NoteGroupModel[];
}
