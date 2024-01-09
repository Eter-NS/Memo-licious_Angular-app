import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthLocalUserService } from '../services/local-user/auth-local-user.service';
import { AuthStateService } from '../services/state/auth-state.service';

export const redirectLoggedInToGuard = (
  loggedInFallback: string
): CanActivateFn => {
  return function (/* route, state */): boolean | Promise<boolean> {
    const authStateService = inject(AuthStateService),
      authLocalUserService = inject(AuthLocalUserService),
      router = inject(Router);
    let isOnlineUser = false,
      isLocalUser = false;

    isOnlineUser = Boolean(authStateService.session());

    if (isOnlineUser) return router.navigateByUrl(loggedInFallback);

    const subscription = authLocalUserService.localUser$.subscribe(
      (userState) => {
        isLocalUser = Boolean(userState);
      }
    );
    subscription.unsubscribe();

    return isLocalUser ? router.navigateByUrl(loggedInFallback) : true;
  };
};
