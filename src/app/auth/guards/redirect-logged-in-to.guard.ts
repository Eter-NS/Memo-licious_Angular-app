import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthUserConnectorService } from 'src/app/app-view/data-access/auth-user-connector/auth-user-connector.service';

export const redirectLoggedInToGuard = (
  loggedInFallback: string
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
          return true;
        }

        if ('groups' in user || 'emailVerified' in user) {
          router.navigateByUrl(loggedInFallback);
          return false;
        }

        return true;
      })
    );
  };
};
