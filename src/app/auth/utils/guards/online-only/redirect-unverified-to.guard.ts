import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthUserConnectorService } from 'src/app/app-view/data-access/auth-user-connector/auth-user-connector.service';

export const redirectUnverifiedToGuard = (
  unverifiedFallback: string
): CanActivateFn => {
  return function (/* route, state */): Observable<boolean> {
    const authUserConnectorService = inject(AuthUserConnectorService),
      router = inject(Router);

    return authUserConnectorService.activeUser$.pipe(
      map((user) => {
        const redirect = () => {
          router.navigateByUrl(unverifiedFallback);
          return false;
        };

        if (!user) {
          return redirect();
        }

        if ('groups' in user) {
          return true;
        }

        if ('emailVerified' in user && user.emailVerified) {
          return true;
        }

        return redirect();
      })
    );
  };
};
