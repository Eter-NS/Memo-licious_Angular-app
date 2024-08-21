import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveToStorage()', () => {
    it('should save data to storage', () => {
      const token = 'test';
      const payload = { testKey: 'test-value' };

      service.saveToStorage(token, payload);

      expect(localStorage.getItem(token)).toEqual(JSON.stringify(payload));
    });

    it('should override data in storage', () => {
      const token = 'test';
      const payload = { testKey: 'test-value' };
      service.saveToStorage(token, payload);

      payload.testKey = '';

      service.saveToStorage(token, payload);

      expect(localStorage.getItem(token)).toEqual(JSON.stringify(payload));
    });

    it(`should write the data directly if the type of it is string.`, () => {
      // Arrange
      const token = 'test';
      const payload = 'string-value';

      // Act
      service.saveToStorage(token, payload);

      // Assert
      expect(localStorage.getItem(token)).toEqual(payload);
    });
  });

  describe('loadFromStorage()', () => {
    it('should return null if there is no data in storage', () => {
      const data = service.loadFromStorage('test');

      expect(data).toBeNull();
    });

    it('should return element if there is such data in storage, with a correct types', () => {
      const token = 'test';
      const storedData = { testKey: 'test-value' };

      localStorage.setItem(token, JSON.stringify(storedData));

      const data = service.loadFromStorage<typeof storedData>(token);

      expect(data).toEqual(storedData);
    });
  });

  describe('checkElementInStorage()', () => {
    it('should return true if there is such data in storage (id)', () => {
      const token = 'test';
      localStorage.setItem(token, JSON.stringify({ testExample: 'test' }));

      const data = service.checkElementInStorage(token);

      expect(data).toBeTrue();
    });

    it('should return true if there is such data in storage (id + object data structure)', () => {
      const token = 'test';
      localStorage.setItem(token, JSON.stringify({ testExample: 'test' }));

      const data = service.checkElementInStorage(token, 'testExample');

      expect(data).toBeTrue();
    });

    it('should return false if there is Not such data in storage', () => {
      const token = 'test';

      const data = service.checkElementInStorage(token, 'testExample');

      expect(data).toBeFalse();
    });
  });

  describe('removeFromStorage', () => {
    it('should remove data from storage', () => {
      const token = 'test';
      localStorage.setItem(token, JSON.stringify({ testExample: 'test' }));

      service.removeFromStorage(token);

      expect(localStorage.getItem(token)).toBeNull();
    });
  });
});
