export function isAuthError(
  error: unknown
): error is { message: string; code: string } {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    'code' in error
  ) {
    return true;
  } else return false;
}
