import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { redirectUnauthorizedToGuard } from './redirect-unauthorized-to.guard';
import { Observable, of } from 'rxjs';
import { LocalUserAccount } from '../services/Models/LocalAuthModels.interface';
import { AuthStateService } from '../services/state/auth-state.service';
import { User } from '@angular/fire/auth';
import { AuthLocalUserService } from '../services/local-user/auth-local-user.service';

describe('redirectUnauthorizedToGuard', () => {
  const executeGuard = (loggedInFallback: string) => {
    return TestBed.runInInjectionContext(() =>
      redirectUnauthorizedToGuard(loggedInFallback)
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

  const path = '/online';
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

  it(`should return true when the online user is signed in`, (done: DoneFn) => {
    authStateServiceMock.user$ = of({ emailVerified: true } as User);
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

  it(`should return true when the online user is signed in`, (done: DoneFn) => {
    authStateServiceMock.user$ = of(null);
    authLocalUserServiceMock.localUser$ = of({} as LocalUserAccount);

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

  it(`should call router.navigateByUrl() when no user is signed in`, (done: DoneFn) => {
    authStateServiceMock.user$ = of(null);
    authLocalUserServiceMock.localUser$ = of(null);

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
