export interface ObjectWithMessage {
  message: string;
}

export function hasMessage(value: unknown): value is ObjectWithMessage {
  if (!value) {
    return false;
  }

  if (typeof value !== 'object') {
    return false;
  }

  return 'message' in value && typeof value.message === 'string';
}
