import { Injectable, inject } from '@angular/core';
import { FirebaseStorageControllerService } from './firebase-storage-controller.service';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  #fireStorageController = inject(FirebaseStorageControllerService);

  getBlob(path: string) {
    return this.#fireStorageController.getBlob(
      this.#fireStorageController.ref(this.#fireStorageController.storage, path)
    );
  }

  getFileUrl(path: string) {
    return this.#fireStorageController.getDownloadURL(
      this.#fireStorageController.ref(this.#fireStorageController.storage, path)
    );
  }

  uploadFile(path: string, file: Blob) {
    return this.#fireStorageController.uploadBytes(
      this.#fireStorageController.ref(
        this.#fireStorageController.storage,
        path
      ),
      file
    );
  }
}
