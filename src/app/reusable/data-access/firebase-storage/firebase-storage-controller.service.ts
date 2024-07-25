import { Injectable, inject } from '@angular/core';
import { Storage } from '@angular/fire/storage';
import {
  getBlob,
  getDownloadURL,
  uploadBytes,
  ref,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class FirebaseStorageControllerService {
  storage = inject(Storage);

  ref = ref;
  getBlob = getBlob;
  getDownloadURL = getDownloadURL;
  uploadBytes = uploadBytes;
}
