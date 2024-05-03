interface UTCTimestampBody {
  day_of_week: number;
  day_of_year: number;
  dst_offset: number;
  raw_offset: number;
  unixtime: number;
  week_number: number;
}

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
  try {
    const response = await fetch(
      'http://worldtimeapi.org/api/timezone/Etc/UTC'
    );

    return response.json() as Promise<UTCTimestampBody>;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error(error as string);
  }
}

/**
 * @param {Number} length Number indicating the length of produced random ID
 * */
export function randomId(length: number): string {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function base64ToFileObj(
  dataUrl: string,
  filename: string
): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}
