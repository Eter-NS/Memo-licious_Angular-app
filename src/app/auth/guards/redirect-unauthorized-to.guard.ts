import { inject } from '@angular/core';
import { AuthStateService } from '../services/state/auth-state.service';
import { AuthLocalUserService } from '../services/local-user/auth-local-user.service';
import { CanActivateFn, Router } from '@angular/router';
import { Observable, combineLatestWith, map } from 'rxjs';

export const redirectUnauthorizedToGuard = (
  denyFallback: string
): CanActivateFn => {
  return function (/* route, state */):
    | boolean
    | Promise<boolean>
    | Observable<boolean> {
    const authStateService = inject(AuthStateService),
      authLocalUserService = inject(AuthLocalUserService),
      router = inject(Router);

    return authLocalUserService.localUser$.pipe(
      combineLatestWith(authStateService.user$),
      map(([offlineUser, onlineUser]) => {
        if (offlineUser || onlineUser?.emailVerified) {
          return true;
        }
        router.navigateByUrl(denyFallback);
        return false;
      })
    );
  };
};
