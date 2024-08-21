import { FirebaseAuthError } from 'src/app/auth/utils/Models/OnlineAuthModels.interface';

export function isAuthError(error: unknown): error is FirebaseAuthError {
  return Boolean(
    error && typeof error === 'object' && 'code' in error && 'message' in error
  );
}
