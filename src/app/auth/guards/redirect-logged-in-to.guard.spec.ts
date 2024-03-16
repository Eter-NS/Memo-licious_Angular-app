import { TestBed } from '@angular/core/testing';

import { redirectLoggedInToGuard } from './redirect-logged-in-to.guard';
import {
  ActivatedRoute,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthStateService } from '../services/state/auth-state.service';
import { AuthLocalUserService } from '../services/local-user/auth-local-user.service';
import { LocalUserAccount } from '../services/Models/LocalAuthModels.interface';
import { Observable, of } from 'rxjs';
import { User } from '@angular/fire/auth';

describe('redirectLoggedInToGuard', () => {
  const executeGuard = (loggedInFallback: string) => {
    return TestBed.runInInjectionContext(() =>
      redirectLoggedInToGuard(loggedInFallback)
    );
  };

  let activatedRouteMock: ActivatedRoute;
  const authLocalUserServiceMock = {
    localUser$: of<LocalUserAccount | null | undefined>(undefined),
  };
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
          provide: AuthLocalUserService,
          useValue: authLocalUserServiceMock,
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
        result;
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(path);
        expect(result).toBe(false);
        done();
      })
    );
  });

  it('should call router.navigateByUrl() if user is logged in (local user)', (done: DoneFn) => {
    authStateServiceMock.user$ = of(null);
    authLocalUserServiceMock.localUser$ = of({} as LocalUserAccount);

    TestBed.runInInjectionContext(() =>
      (
        instance(
          activatedRouteMock.snapshot,
          {} as RouterStateSnapshot
        ) as Observable<boolean>
      ).subscribe((result) => {
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(path);
        expect(result).toBe(false);
        done();
      })
    );
  });

  it('should return true no user is logged in', (done: DoneFn) => {
    authStateServiceMock.user$ = of(null);
    authLocalUserServiceMock.localUser$ = of(null);

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
});
