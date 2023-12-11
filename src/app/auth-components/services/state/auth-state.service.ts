import { Injectable, OnInit, inject, signal } from '@angular/core';
import {
  Auth,
  User,
  UserCredential,
  browserLocalPersistence,
  browserSessionPersistence,
  user,
} from '@angular/fire/auth';

export function isUser(user: User | null): user is User {
  return user !== null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  session = signal<UserCredential | null | undefined>(undefined);
  auth = inject(Auth);
  user$ = user(this.auth);

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
