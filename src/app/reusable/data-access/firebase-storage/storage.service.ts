import { Injectable, inject } from '@angular/core';
import { Storage } from '@angular/fire/storage';
import { FirebaseStorageControllerService } from './firebase-storage-controller.service';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  storage = inject(Storage);
  private readonly _fireStorageController = inject(
    FirebaseStorageControllerService
  );

  getBlob(path: string) {
    return this._fireStorageController.getBlob(
      this._fireStorageController.ref(this.storage, path)
    );
  }

  getFileUrl(path: string) {
    return this._fireStorageController.getDownloadURL(
      this._fireStorageController.ref(this.storage, path)
    );
  }

  uploadFile(path: string, file: Blob) {
    return this._fireStorageController.uploadBytes(
      this._fireStorageController.ref(this.storage, path),
      file
    );
  }
}
