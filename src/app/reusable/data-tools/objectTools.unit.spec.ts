import { getUTCTimestamp, hasNestedKey, objectKeys } from './objectTools';

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
    it('should return a UTC timestamp', (done: DoneFn) => {
      getUTCTimestamp().then((timestamp) => {
        expect(timestamp).toBeTruthy();
        done();
      });
    });
  });
});
