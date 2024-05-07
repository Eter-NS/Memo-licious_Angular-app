import { Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
  user,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthControllerService {
  createUserWithEmailAndPassword = createUserWithEmailAndPassword;
  signInWithEmailAndPassword = signInWithEmailAndPassword;
  signInWithRedirect = signInWithRedirect;
  signInWithPopup = signInWithPopup;
  getRedirectResult = getRedirectResult;
  signOut = signOut;
  updateProfile = updateProfile;
  updatePassword = updatePassword;
  updateEmail = updateEmail;
  reauthenticateWithCredential = reauthenticateWithCredential;
  user = user;
}
