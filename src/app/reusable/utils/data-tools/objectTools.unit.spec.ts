import { UTCTimestampBody } from '../Models/UTCTimestampBody.interface';
import { OBJECT_TOOLS_TYPE } from './objectTools.token';
import * as ObjectTools from './objectTools';

describe('objectTools', () => {
  let module: OBJECT_TOOLS_TYPE;

  beforeEach(async () => {
    module = ObjectTools;

    module.clearCachedTimestamp();
  });

  describe('hasNestedKey()', () => {
    it('should return true if the object has a key in the first object level.', () => {
      // Arrange
      const obj = {
        name: 'Henry',
        surname: 'Ford',
      };

      // Act
      const result = module.hasNestedKey(obj, 'name');

      // Assert
      expect(result).toBeTrue();
    });

    it('should return true if the object has a nested key.', () => {
      // Arrange
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

      // Act
      const result = module.hasNestedKey(obj, 'father');

      // Assert
      expect(result).toBeTrue();
    });

    it('should return false if the object does not have a nested key.', () => {
      // Arrange
      const obj = {
        name: 'Henry',
        surname: 'Ford',
        parents: {},
      };

      // Act
      const result = module.hasNestedKey(obj, 'father');

      // Assert
      expect(result).toBeFalse();
    });
  });

  describe('objectKeys', () => {
    it('should return the keys of an object.', () => {
      // Arrange
      const obj = {
        name: 'Henry',
        surname: 'Ford',
        parents: {},
      };

      // Act
      const result = module.objectKeys(obj);

      // Assert
      expect(result).toEqual(['name', 'surname', 'parents']);
    });
  });

  describe('getUTCTimestamp()', () => {
    it('should return a UTC timestamp fetched from a server.', async () => {
      // Arrange
      const okResponse = new Response(JSON.stringify({} as UTCTimestampBody), {
        status: 200,
        statusText: 'OK',
      });
      const spy = spyOn(window, 'fetch').and.resolveTo(okResponse);

      // Act
      const timestamp = await module.getUTCTimestamp();

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(timestamp).toBeTruthy();
    });

    it('should reject with an error if fetch fails.', async () => {
      // Arrange
      const badResponse = new Response(JSON.stringify({} as UTCTimestampBody), {
        status: 501,
        statusText: 'NOT IMPLEMENTED',
      });
      spyOn(window, 'fetch').and.resolveTo(badResponse);

      // Act & Assert
      await expectAsync(module.getUTCTimestamp()).toBeRejectedWithError(
        'Error fetching UTC timestamp: ' + badResponse.statusText
      );
    });
  });

  describe(`createTimestamp()`, () => {
    it(`should return fetch based timestamp.`, async () => {
      // Arrange
      const now = new Date();
      const timestamp = Math.trunc(
        (now.getTime() + now.getTimezoneOffset()) / 1000
      );
      const okResponse = new Response(
        JSON.stringify({
          unixtime: timestamp,
        } as UTCTimestampBody),
        {
          status: 200,
          statusText: 'OK',
        }
      );
      spyOn(window, 'fetch').and.resolveTo(okResponse);

      // Act
      const result = await module.createTimestamp();

      // Assert
      expect(result).toBe(timestamp * 1000);
    });

    it(`should return device based timestamp when getUTCTimestamp rejects.`, async () => {
      // Arrange
      const badResponse = new Response(JSON.stringify({} as UTCTimestampBody), {
        status: 501,
        statusText: 'NOT IMPLEMENTED',
      });
      spyOn(window, 'fetch').and.resolveTo(badResponse);

      // Act
      const result = await module.createTimestamp();

      // Assert
      expect(typeof result).toEqual('number');
    });

    it(`should return cached timestamp when it's defined.`, async () => {
      // Arrange
      const now = new Date();
      const timestamp = Math.trunc(
        (now.getTime() + now.getTimezoneOffset()) / 1000
      );
      const okResponse = new Response(
        JSON.stringify({
          unixtime: timestamp,
        } as UTCTimestampBody),
        {
          status: 200,
          statusText: 'OK',
        }
      );
      const fetchSpy = spyOn(window, 'fetch').and.resolveTo(okResponse);

      // Act
      await module.createTimestamp();

      const result = await module.createTimestamp();

      // Assert
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(timestamp * 1000);
    });

    it(`should return updated timestamp if createTimestamp is called after the interval execution.`, async () => {
      // Arrange
      const now = new Date();
      const timestamp = Math.trunc(
        (now.getTime() + now.getTimezoneOffset()) / 1000
      );
      const okResponse = new Response(
        JSON.stringify({
          unixtime: timestamp,
        } as UTCTimestampBody),
        {
          status: 200,
          statusText: 'OK',
        }
      );
      const fetchSpy = spyOn(window, 'fetch').and.resolveTo(okResponse);

      // Act
      await module.createTimestamp();

      // Wait for 1.5 seconds
      await (() =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1_500);
        }))();

      const result = await module.createTimestamp();

      // Assert
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(timestamp * 1000 + 1000);
    });
  });

  describe(`randomId()`, () => {
    it(`should return a random generated id with a length of 10.`, () => {
      // Arrange
      const length = 10;

      // Act
      const result = module.randomId(length);

      // Assert
      expect(typeof result).toBe('string');
      expect(result.length).toBe(length);
    });
  });

  describe(`base64ToFile()`, () => {
    it(`should return error when the base64 string is incorrect.`, async () => {
      // Arrange
      const badResponse = new Response('', {
        status: 400,
        statusText: 'Bad Request',
      });
      spyOn(window, 'fetch').and.resolveTo(badResponse);

      // Act
      const result = await module.base64ToFile('', 'photo.jpg');

      // Assert
      expect(result.error).toBeTruthy();
      expect(result.data).toBeUndefined();
    });

    it(`should return File when the base64 string is correct.`, async () => {
      // Arrange
      const okResponse = new Response('', {
        status: 200,
        statusText: 'OK',
      });
      spyOn(window, 'fetch').and.resolveTo(okResponse);
      const name = 'photo.jpg';

      // Act
      const result = await module.base64ToFile('base64', name);

      // Assert
      expect(result.error).toBeUndefined();
      expect(result.data).toBeInstanceOf(File);
      expect(result.data?.name).toBe(name);
    });
  });
});
