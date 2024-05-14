import { FirebaseAuthError } from 'src/app/auth/utils/Models/OnlineAuthModels.interface';

export function isAuthError(error: unknown): error is FirebaseAuthError {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    'code' in error
  ) {
    return true;
  } else return false;
}
