import { Injectable, inject, signal } from '@angular/core';
import { Auth, User, UserCredential, user } from '@angular/fire/auth';

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

  rememberMe(action: boolean) {
    action
      ? this.auth.setPersistence({ type: 'LOCAL' })
      : this.auth.setPersistence({ type: 'SESSION' });
  }

  checkUserSession() {
    const email = this.session()?.user?.email;
    return email ?? null;
  }
}
