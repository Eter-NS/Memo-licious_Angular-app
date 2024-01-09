import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  UserCredential,
  browserLocalPersistence,
  browserSessionPersistence,
  user,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  auth = inject(Auth);
  session = signal<UserCredential | null | undefined>(undefined);

  user = user;

  get user$() {
    return this.user(this.auth);
  }

  constructor() {
    this.auth.setPersistence(browserSessionPersistence);
  }

  rememberMe(action: boolean) {
    action
      ? this.auth.setPersistence(browserLocalPersistence)
      : this.auth.setPersistence(browserSessionPersistence);
  }

  checkUserSession() {
    const email = this.session()?.user?.email;
    return email ?? null;
  }
}
