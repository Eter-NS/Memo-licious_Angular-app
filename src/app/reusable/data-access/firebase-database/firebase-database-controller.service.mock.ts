import { FirebaseDatabaseControllerService } from './firebase-database-controller.service';

export const firebaseDatabaseControllerService =
  jasmine.createSpyObj<FirebaseDatabaseControllerService>([
    'get',
    'set',
    'update',
    'ref',
    'listVal',
  ]);
