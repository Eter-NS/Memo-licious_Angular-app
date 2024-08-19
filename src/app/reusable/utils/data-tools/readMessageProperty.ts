export function readMessageProperty(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (typeof value !== 'object') {
    return null;
  }

  if (!('message' in value)) {
    return null;
  }

  if (typeof value.message !== 'string') {
    return null;
  }

  return value.message;
}
