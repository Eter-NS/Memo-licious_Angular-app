import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import {
  Auth,
  User,
  browserLocalPersistence,
  browserSessionPersistence,
  user,
} from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService implements OnDestroy {
  auth = inject(Auth);
  session = signal<User | null | undefined>(undefined);
  #subscription!: Subscription;

  private _user = user;

  get user$() {
    return this._user(this.auth);
  }

  constructor() {
    this.#subscription = this.user$.subscribe((user) => {
      if (user) {
        this.session.set(user);
      }
    });
  }

  ngOnDestroy(): void {
    this.#subscription.unsubscribe();
  }

  async rememberMe(action: boolean) {
    action
      ? await this.auth.setPersistence(browserLocalPersistence)
      : await this.auth.setPersistence(browserSessionPersistence);
  }

  checkUserSession() {
    const email = this.session()?.email;
    return email ?? null;
  }
}
