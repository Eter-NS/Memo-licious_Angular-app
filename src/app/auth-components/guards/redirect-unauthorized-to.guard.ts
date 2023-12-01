import { inject } from '@angular/core';
import { AuthStateService } from '../services/state/auth-state.service';
import { AuthLocalUserService } from '../services/auth-local-user.service';
import { CanActivateFn, Router } from '@angular/router';

export const redirectUnauthorizedToGuard = (
  denyFallback: string
): CanActivateFn => {
  return function (/* route, state */): boolean | Promise<boolean> {
    const authStateService = inject(AuthStateService),
      authLocalUserService = inject(AuthLocalUserService),
      router = inject(Router);
    let isOnlineUser = false,
      isLocalUser = false;

    isOnlineUser = !!authStateService.session();

    if (isOnlineUser) {
      return true;
    } else {
      const subscription = authLocalUserService
        .getCurrentUser()
        .subscribe((userState) => {
          isLocalUser = !!userState;
        });
      subscription.unsubscribe();
      return isLocalUser || router.navigateByUrl(denyFallback);
    }
  };
};
