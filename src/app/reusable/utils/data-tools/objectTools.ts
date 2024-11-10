import { UTCTimestampBody } from '../Models/UTCTimestampBody.interface';

export function hasNestedKey<T extends object>(obj: T, key: string): boolean {
  for (const objectKey in obj) {
    if (objectKey === key) {
      return true;
    }

    if (typeof obj[objectKey] === 'object' && obj[objectKey] !== null) {
      if (hasNestedKey(obj[objectKey] as T, key)) {
        return true;
      }
    }
  }
  // Not found
  return false;
}

export function objectKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * @returns In case os using unixtime property, don't forget to multiply the value by 1000!
 */
export async function getUTCTimestamp(): Promise<UTCTimestampBody> {
  const API_URL = 'http://worldtimeapi.org/api/timezone/Etc/UTC';
  const controller = new AbortController();
  const REQUEST_TIMEOUT_MS = 1_000;

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(API_URL, { signal: controller.signal });
  } catch (err) {
    clearTimeout(timeout);

    throw (err as Error).name === 'AbortController'
      ? new Error('Timestamp request timeout')
      : err;
  }

  if (!response.ok) {
    throw new Error('Error fetching UTC timestamp: ' + response.statusText);
  }

  return await response.json();
}

export function localUTCTimestamp() {
  const now = new Date();
  return now.getTime() + now.getTimezoneOffset();
}

const INCREMENT_INTERVAL = 1000;
let cachedTimestamp: number | undefined = undefined;
let intervalId: ReturnType<typeof setInterval> | undefined = undefined;

/**
 * Clears the cached timestamp and stops the interval
 */
export function clearCachedTimestamp(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
  cachedTimestamp = undefined;
}

/**
 * Creates a timestamp in UTC or a local machine version if the device is offline.
 */
export async function createTimestamp(): Promise<number> {
  if (cachedTimestamp) {
    return cachedTimestamp;
  }

  try {
    cachedTimestamp = (await getUTCTimestamp()).unixtime * 1000;
  } catch (err) {
    cachedTimestamp = localUTCTimestamp();
  }

  intervalId = setInterval(() => {
    (cachedTimestamp as number) += INCREMENT_INTERVAL;
  }, INCREMENT_INTERVAL);

  return cachedTimestamp;
}

/**
 * @param {Number} length Number indicating the length of produced random ID
 */
export function randomId(length: number): string {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function base64ToFile(
  dataUrl: string,
  filename: string
): Promise<
  { data: File; error: undefined } | { data: undefined; error: unknown }
> {
  try {
    const response = await fetch(dataUrl);

    if (!response.ok) {
      throw new Error('Error fetching from base64: ' + response.statusText);
    }

    const blob = await response.blob();
    return {
      data: new File([blob], filename, { type: blob.type }),
      error: undefined,
    };
  } catch (error) {
    return { data: undefined, error };
  }
}
