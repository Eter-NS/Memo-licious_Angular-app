import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable, combineLatestWith, map } from 'rxjs';
import { AuthStateService } from '../../services/state/auth-state.service';
import { AuthLocalUserService } from '../../services/local-user/auth-local-user.service';

export const redirectUnverifiedToGuard = (
  unverifiedFallback: string
): CanActivateFn => {
  return function (/* route, state */):
    | boolean
    | Promise<boolean>
    | Observable<boolean> {
    const authStateService = inject(AuthStateService),
      authLocalUserService = inject(AuthLocalUserService),
      router = inject(Router);

    return authStateService.user$.pipe(
      combineLatestWith(authLocalUserService.localUser$),
      map(([onlineUser, localUser]) => {
        if (onlineUser?.emailVerified || localUser) {
          return true;
        }
        router.navigateByUrl(unverifiedFallback);
        return false;
      })
    );
  };
};
