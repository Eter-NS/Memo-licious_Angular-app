import { FirebaseStorageControllerService } from './firebase-storage-controller.service';

export const firebaseStorageControllerService =
  jasmine.createSpyObj<FirebaseStorageControllerService>(
    ['getBlob', 'getDownloadURL', 'ref', 'uploadBytes'],
    ['storage']
  );
