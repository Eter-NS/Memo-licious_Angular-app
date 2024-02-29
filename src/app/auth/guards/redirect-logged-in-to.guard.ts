import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthLocalUserService } from '../services/local-user/auth-local-user.service';
import { AuthStateService } from '../services/state/auth-state.service';
import { Observable, combineLatestWith, map } from 'rxjs';
import { AuthAccountService } from '../services/account/auth-account.service';

export const redirectLoggedInToGuard = (
  loggedInFallback: string
): CanActivateFn => {
  return function (/* route, state */):
    | boolean
    | Promise<boolean>
    | Observable<boolean> {
    const authStateService = inject(AuthStateService),
      authAccountService = inject(AuthAccountService),
      authLocalUserService = inject(AuthLocalUserService),
      router = inject(Router);

    return authLocalUserService.localUser$.pipe(
      combineLatestWith(authStateService.user$),
      map(([offlineUser, onlineUser]) => {
        if (offlineUser && onlineUser?.emailVerified) {
          authAccountService.signOutUser();
          authLocalUserService.logOut();

          return true;
        }

        if (offlineUser || onlineUser?.emailVerified) {
          router.navigateByUrl(loggedInFallback);
          return false;
        }

        return true;
      })
    );
  };
};
