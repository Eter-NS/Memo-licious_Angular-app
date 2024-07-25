import { FirebaseAuthControllerService } from './firebase-auth-controller.service';

export const firebaseAuthControllerService =
  jasmine.createSpyObj<FirebaseAuthControllerService>([
    'createUserWithEmailAndPassword',
    'getRedirectResult',
    'reauthenticateWithCredential',
    'sendEmailVerification',
    'sendPasswordResetEmail',
    'signInWithEmailAndPassword',
    'signInWithPopup',
    'signInWithRedirect',
    'signOut',
    'updateEmail',
    'updatePassword',
    'updateProfile',
    'user',
  ]);
