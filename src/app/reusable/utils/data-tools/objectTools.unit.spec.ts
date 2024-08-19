import { UTCTimestampBody } from '../Models/UTCTimestampBody.interface';
import {
  base64ToFile,
  createTimestamp,
  getUTCTimestamp,
  hasNestedKey,
  objectKeys,
  randomId,
} from './objectTools';

describe('objectTools', () => {
  describe('hasNestedKey()', () => {
    it('should return true if the object has a key in the first object level', () => {
      const obj = {
        name: 'Henry',
        surname: 'Ford',
      };

      const result = hasNestedKey(obj, 'name');

      expect(result).toBeTrue();
    });

    it('should return true if the object has a nested key', () => {
      const obj = {
        name: 'Henry',
        surname: 'Ford',
        parents: {
          father: {
            name: 'William',
            surname: 'Ford',
          },
          mother: {
            name: 'Mary',
            surname: 'Ford',
          },
        },
      };

      const result = hasNestedKey(obj, 'father');

      expect(result).toBeTrue();
    });
    it('should return true if the object has a nested key', () => {
      const obj = {
        name: 'Henry',
        surname: 'Ford',
        parents: {},
      };

      const result = hasNestedKey(obj, 'father');

      expect(result).toBeFalse();
    });
  });

  describe('objectKeys', () => {
    it('should return the keys of an object', () => {
      const obj = {
        name: 'Henry',
        surname: 'Ford',
        parents: {},
      };

      const result = objectKeys(obj);

      expect(result).toEqual(['name', 'surname', 'parents']);
    });
  });

  describe('getUTCTimestamp()', () => {
    it('should return a UTC timestamp (fetched from server)', async () => {
      const okResponse = new Response(JSON.stringify({} as UTCTimestampBody), {
        status: 200,
        statusText: 'OK',
      });
      const spy = spyOn(window, 'fetch').and.resolveTo(okResponse);

      const timestamp = await getUTCTimestamp();

      expect(spy).toHaveBeenCalled();
      expect(timestamp).toBeTruthy();
    });

    it('should reject with an error if fetch fails', async () => {
      const badResponse = new Response(JSON.stringify({} as UTCTimestampBody), {
        status: 501,
        statusText: 'NOT IMPLEMENTED',
      });
      spyOn(window, 'fetch').and.resolveTo(badResponse);

      await expectAsync(getUTCTimestamp()).toBeRejectedWithError(
        'Error fetching UTC timestamp: ' + badResponse.statusText
      );
    });
  });

  describe(`createTimestamp()`, () => {
    it(`should return fetch based timestamp`, async () => {
      // Arrange
      const now = new Date();
      const timestamp = (now.getTime() + now.getTimezoneOffset()) / 1000;
      const okResponse = new Response(
        JSON.stringify({
          unixtime: Math.trunc(timestamp),
        } as UTCTimestampBody),
        {
          status: 200,
          statusText: 'OK',
        }
      );
      spyOn(window, 'fetch').and.resolveTo(okResponse);

      // Act
      const result = await createTimestamp();

      // Assert
      expect(result).toBe(Math.trunc(timestamp) * 1000);
    });

    it(`should return device based timestamp when getUTCTimestamp rejects.`, async () => {
      // Arrange
      const badResponse = new Response(JSON.stringify({} as UTCTimestampBody), {
        status: 501,
        statusText: 'NOT IMPLEMENTED',
      });
      spyOn(window, 'fetch').and.resolveTo(badResponse);

      const now = new Date();
      const expectedTimestamp = now.getTime() + now.getTimezoneOffset();

      // Act
      const result = await createTimestamp();

      // Assert
      expect(result).toBe(expectedTimestamp);
    });
  });

  describe(`randomId()`, () => {
    it(`should return a random generated id with a length of 10.`, () => {
      // Arrange
      const length = 10;

      // Act
      const result = randomId(length);

      // Assert
      expect(typeof result).toBe('string');
      expect(result.length).toBe(length);
    });
  });

  describe(`base64ToFile()`, () => {
    it(`should reject when the base64 string is incorrect.`, async () => {
      // Arrange
      const badResponse = new Response('', {
        status: 400,
        statusText: 'Bad Request',
      });
      spyOn(window, 'fetch').and.resolveTo(badResponse);

      // Act
      // Assert
      await expectAsync(base64ToFile('', 'photo.jpg')).toBeRejectedWithError(
        'Error fetching from base64: ' + badResponse.statusText
      );
    });

    it(`should reject when the base64 string is incorrect.`, async () => {
      // Arrange
      const okResponse = new Response('', {
        status: 200,
        statusText: 'OK',
      });
      spyOn(window, 'fetch').and.resolveTo(okResponse);
      const name = 'photo.jpg';

      // Act
      const result = await base64ToFile('base64', name);

      // Assert
      expect(result).toBeInstanceOf(File);
      expect(result.data?.name).toBe(name);
    });
  });
});
