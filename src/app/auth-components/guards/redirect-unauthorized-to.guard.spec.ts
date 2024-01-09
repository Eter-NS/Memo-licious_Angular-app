import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { redirectUnauthorizedToGuard } from './redirect-unauthorized-to.guard';
import { of } from 'rxjs';
import { LocalUserData } from '../services/Models/UserDataModels';
import { AuthStateService } from '../services/state/auth-state.service';
import { UserCredential } from '@angular/fire/auth';
import { AuthLocalUserService } from '../services/local-user/auth-local-user.service';

describe('redirectUnauthorizedToGuard', () => {
  const executeGuard = (loggedInFallback: string) => {
    return TestBed.runInInjectionContext(() =>
      redirectUnauthorizedToGuard(loggedInFallback)
    );
  };

  let activatedRouteMock: ActivatedRoute;
  const authLocalUserServiceMock = {
    localUser$: of<LocalUserData | null | undefined>(undefined),
  };
  const authStateServiceMock = {
    session: jasmine
      .createSpy('session', AuthStateService.prototype.session)
      .and.returnValue({} as UserCredential),
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

  it(`should return true when the online user is signed in`, () => {
    authStateServiceMock.session.and.returnValue({} as UserCredential);
    authLocalUserServiceMock.localUser$ = of(null);

    const result = TestBed.runInInjectionContext(() =>
      instance(activatedRouteMock.snapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBe(true);
  });

  it(`should return true when the online user is signed in`, () => {
    authStateServiceMock.session.and.returnValue(null);
    authLocalUserServiceMock.localUser$ = of({} as LocalUserData);

    const result = TestBed.runInInjectionContext(() =>
      instance(activatedRouteMock.snapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBe(true);
  });

  it(`should call router.navigateByUrl() when no user is signed in`, async () => {
    authStateServiceMock.session.and.returnValue(null);
    authLocalUserServiceMock.localUser$ = of(null);

    await TestBed.runInInjectionContext(() =>
      instance(activatedRouteMock.snapshot, {} as RouterStateSnapshot)
    );

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith(path);
  });
});
