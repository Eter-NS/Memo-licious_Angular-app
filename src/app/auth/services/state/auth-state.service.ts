import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  User,
  browserLocalPersistence,
  browserSessionPersistence,
} from '@angular/fire/auth';
import { FirebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  auth = inject(Auth);
  #firebaseAuthControllerService = inject(FirebaseAuthControllerService);
  #session = signal<User | null | undefined>(undefined);

  get sessionSig() {
    return this.#session.asReadonly();
  }

  readonly user$ = this.#firebaseAuthControllerService.user(this.auth);

  constructor() {
    this.user$.subscribe((state) => {
      this.updateSession(state);
    });
  }

  async rememberMe(action: boolean) {
    action
      ? await this.auth.setPersistence(browserLocalPersistence)
      : await this.auth.setPersistence(browserSessionPersistence);
  }

  checkUserSession() {
    const email = this.sessionSig()?.email;
    return email ?? null;
  }

  updateSession(state: User | null | undefined) {
    this.#session.set(state);
  }
}
