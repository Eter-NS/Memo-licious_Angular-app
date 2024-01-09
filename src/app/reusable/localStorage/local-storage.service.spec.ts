import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveToStorage()', () => {
    it('should save data to storage', () => {
      service.saveToStorage('test', { test: 'test' });
      expect(localStorage.getItem('test')).toEqual(
        JSON.stringify({ test: 'test' })
      );
    });

    it('should override data in storage', () => {
      service.saveToStorage('test', { test: 'test' });
      service.saveToStorage('test', { test: '' });
      expect(localStorage.getItem('test')).toEqual(
        JSON.stringify({ test: '' })
      );
    });

    afterEach(() => {
      localStorage.clear();
    });
  });

  describe('loadFromStorage()', () => {
    it('should return null if there is no data in storage', () => {
      const data = service.loadFromStorage('test');
      expect(data).toBeNull();
    });

    it('should return element if there is such data in storage, with a correct types', () => {
      localStorage.setItem('test', JSON.stringify({ test: 'test' }));
      const data = service.loadFromStorage<{ test: string }>('test');
      expect(data).toEqual({ test: 'test' });
    });
  });

  describe('checkElementInStorage()', () => {
    it('should return true if there is such data in storage (id)', () => {
      localStorage.setItem('test', JSON.stringify({ testExample: 'test' }));
      const data = service.checkElementInStorage('test');
      expect(data).toBeTrue();
    });

    it('should return true if there is such data in storage (id + object data structure)', () => {
      localStorage.setItem('test', JSON.stringify({ testExample: 'test' }));
      const data = service.checkElementInStorage('test', 'testExample');
      expect(data).toBeTrue();
    });

    it('should return false if there is Not such data in storage', () => {
      const data = service.checkElementInStorage('test', 'testExample');
      expect(data).toBeFalse();
    });

    afterEach(() => {
      localStorage.clear();
    });
  });

  describe('removeFromStorage', () => {
    it('should remove data from storage', () => {
      localStorage.setItem('test', JSON.stringify({ testExample: 'test' }));
      service.removeFromStorage('test');
      expect(localStorage.getItem('test')).toBeNull();
    });
  });
});
