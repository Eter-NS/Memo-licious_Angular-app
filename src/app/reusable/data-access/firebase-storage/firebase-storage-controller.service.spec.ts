import { TestBed } from '@angular/core/testing';
import { FirebaseStorageControllerService } from './firebase-storage-controller.service';
import { Provider } from '@angular/core';
import { Storage } from '@angular/fire/storage';

describe(`FirebaseStorageControllerService`, () => {
  let service: FirebaseStorageControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Storage, useValue: {} }] satisfies Provider[],
    });

    service = TestBed.inject(FirebaseStorageControllerService);
  });

  it(`should be created`, () => {
    expect(service).toBeTruthy();
  });
});
