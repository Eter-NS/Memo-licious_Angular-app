import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthUserConnectorService } from 'src/app/app-view/data-access/auth-user-connector/auth-user-connector.service';

export const redirectUnverifiedToGuard = (
  unverifiedFallback: string
): CanActivateFn => {
  return function (/* route, state */):
    | boolean
    | Promise<boolean>
    | Observable<boolean> {
    const authUserConnectorService = inject(AuthUserConnectorService),
      router = inject(Router);

    return authUserConnectorService.activeUser$.pipe(
      map((user) => {
        if (!user) {
          router.navigateByUrl(unverifiedFallback);
          return false;
        }

        if ('groups' in user || 'emailVerified' in user) {
          return true;
        }

        router.navigateByUrl(unverifiedFallback);
        return false;
      })
    );
  };
};
