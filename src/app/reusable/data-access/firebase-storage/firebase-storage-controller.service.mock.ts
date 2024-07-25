import { FirebaseStorageControllerService } from './firebase-storage-controller.service';

export const firebaseStorageControllerServiceMock =
  jasmine.createSpyObj<FirebaseStorageControllerService>(
    ['getBlob', 'getDownloadURL', 'ref', 'uploadBytes'],
    ['storage']
  );
