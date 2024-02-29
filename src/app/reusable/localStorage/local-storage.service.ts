import { Injectable } from '@angular/core';
import { hasNestedKey } from '../data-tools/objectTools';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  loadFromStorage<T>(id: string): T | null {
    const stringifiedData = localStorage.getItem(id);

    return stringifiedData ? (JSON.parse(stringifiedData) as T) : null;
  }

  checkElementInStorage<T>(id: string, key?: string): boolean {
    const data = this.loadFromStorage<T>(id);
    if (!data) {
      return false;
    } else if (key) {
      return hasNestedKey(data, key);
    } else {
      return true;
    }
  }

  saveToStorage<T>(id: string, data: T): void {
    if (typeof data === 'string') {
      localStorage.setItem(id, data);
      return;
    }

    localStorage.setItem(id, JSON.stringify(data));
  }

  removeFromStorage(id: string): void {
    localStorage.removeItem(id);
  }
}
