import { FirebaseDatabaseControllerService } from './firebase-database-controller.service';

export const firebaseDatabaseControllerServiceMock =
  jasmine.createSpyObj<FirebaseDatabaseControllerService>([
    'get',
    'set',
    'update',
    'ref',
    'listVal',
  ]);
