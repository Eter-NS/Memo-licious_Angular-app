import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';
import { firebaseStorageControllerService } from './firebase-storage-controller.service.mock';
import { Provider } from '@angular/core';
import { FirebaseStorageControllerService } from './firebase-storage-controller.service';
import { UploadResult } from '@angular/fire/storage';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FirebaseStorageControllerService,
          useValue: firebaseStorageControllerService,
        },
      ] satisfies Provider[],
    });

    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`Methods`, () => {
    describe(`getBlob()`, () => {
      it(`should return a promise with the blob`, () => {
        // Arrange
        firebaseStorageControllerService.getBlob.and.resolveTo(new Blob());

        // Act
        const result = service.getBlob('/xyz');

        // Assert
        expect(result instanceof Promise).toBeTruthy();
      });
    });

    describe(`getFileUrl()`, () => {
      it(`should return a promise with url string.`, () => {
        // Arrange
        firebaseStorageControllerService.getDownloadURL.and.resolveTo(
          'https://example.com/logo.svg'
        );

        // Act
        const result = service.getFileUrl('/xyz');

        // Assert
        expect(result instanceof Promise).toBeTruthy();
      });
    });

    describe(`uploadFile()`, () => {
      it(`should return a promise of UploadResult.`, () => {
        // Arrange
        firebaseStorageControllerService.uploadBytes.and.resolveTo(
          {} as UploadResult
        );

        // Act
        const result = service.uploadFile('', new Blob());

        // Assert
        expect(result instanceof Promise).toBeTruthy();
      });
    });
  });
});
