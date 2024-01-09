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

interface UTCTimestampBody {
  abbreviation: string;
  client_ip: string;
  datetime: string;
  day_of_week: number;
  day_of_year: number;
  dst: boolean;
  dst_from: null;
  dst_offset: number;
  dst_until: null;
  raw_offset: number;
  timezone: 'Etc/UTC';
  unixtime: number;
  utc_datetime: string;
  utc_offset: '+00:00';
  week_number: number;
}

export async function getUTCTimestamp(): Promise<void | UTCTimestampBody | null> {
  const response = await fetch('http://worldtimeapi.org/api/timezone/Etc/UTC');
  if (!response) return console.error('Request timed out');
  if (response.status >= 500) return console.error('The API has failed');
  if (response.ok) {
    return (await response.json()) as UTCTimestampBody;
  }
  return null;
}
