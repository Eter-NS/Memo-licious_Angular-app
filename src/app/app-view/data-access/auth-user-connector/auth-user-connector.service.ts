import { Injectable, inject, signal } from '@angular/core';
import { AuthAccountService } from 'src/app/auth/services/account/auth-account.service';
import { AuthLocalUserService } from 'src/app/auth/services/local-user/auth-local-user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthUserConnectorService {
  #authLocalUserService = inject(AuthLocalUserService);
  #authAccountService = inject(AuthAccountService);

  #activeUser = signal<'online' | 'local' | null>(null);

  get activeUserSig() {
    return this.#activeUser.asReadonly();
  }

  updateUser(value: 'online' | 'local' | null) {
    this.#activeUser.set(value);
  }

  logOutUser() {
    if (!this.activeUserSig()) return;

    switch (this.activeUserSig()) {
      case 'local':
        this.#authLocalUserService.logOut();
        break;
      case 'online':
        this.#authAccountService.signOutUser();
        break;
      default:
        throw new Error('Unknown value of $activeUser');
    }
  }
}
