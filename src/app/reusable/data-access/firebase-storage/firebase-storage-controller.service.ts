import { Injectable } from '@angular/core';
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
  ref = ref;
  getBlob = getBlob;
  getDownloadURL = getDownloadURL;
  uploadBytes = uploadBytes;
}
