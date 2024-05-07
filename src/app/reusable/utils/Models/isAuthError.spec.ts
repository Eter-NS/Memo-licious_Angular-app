import { isAuthError } from './isAuthError';

describe('isAuthError()', () => {
  it('should return true if the error is an auth error', () => {
    const unknownError = { message: 'Example message', code: '404' } as unknown;

    const isAuthenticationError = isAuthError(unknownError);

    expect(isAuthenticationError).toBeTrue();
  });

  it('should return true if the error is an auth error', () => {
    const unknownError = { message: 'Example message' } as unknown;

    const isAuthenticationError = isAuthError(unknownError);

    expect(isAuthenticationError).toBeFalse();
  });
});
