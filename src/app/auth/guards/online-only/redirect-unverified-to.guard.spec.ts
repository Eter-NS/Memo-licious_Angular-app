import { TestBed } from '@angular/core/testing';

import { redirectUnverifiedToGuard } from './redirect-unverified-to.guard';
import {
  ActivatedRoute,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthStateService } from '../../services/state/auth-state.service';
import { User } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';

describe('redirectUnverifiedToGuard', () => {
  const executeGuard = (unverifiedFallback: string) => {
    return TestBed.runInInjectionContext(() =>
      redirectUnverifiedToGuard(unverifiedFallback)
    );
  };

  let activatedRouteMock: ActivatedRoute;
  const authStateServiceMock = {
    user$: of<User | null>(null),
  };
  const routerMock = {
    navigateByUrl: jasmine
      .createSpy('navigateByUrl', Router.prototype.navigateByUrl)
      .and.resolveTo(true),
  };

  const path = '/app';
  let instance: CanActivateFn;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStateService,
          useValue: authStateServiceMock,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
          },
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    });

    activatedRouteMock = TestBed.inject(ActivatedRoute);
    instance = executeGuard(path);
  });

  it('should be created', () => {
    expect(instance).toBeTruthy();
  });

  it('should call router.navigateByUrl() if user is logged in (online user)', (done: DoneFn) => {
    authStateServiceMock.user$ = of({ emailVerified: true } as User);

    TestBed.runInInjectionContext(() =>
      (
        instance(
          activatedRouteMock.snapshot,
          {} as RouterStateSnapshot
        ) as Observable<boolean>
      ).subscribe((result) => {
        expect(result).toBe(true);
        done();
      })
    );
  });

  it('should return true no user is logged in', (done: DoneFn) => {
    authStateServiceMock.user$ = of(null);

    TestBed.runInInjectionContext(() =>
      (
        instance(
          activatedRouteMock.snapshot,
          {} as RouterStateSnapshot
        ) as Observable<boolean>
      ).subscribe(() => {
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(path);
        done();
      })
    );
  });
});
