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
import { LocalUserData } from '../services/Models/UserDataModels';
import { of } from 'rxjs';
import { UserCredential } from '@angular/fire/auth';

describe('redirectLoggedInToGuard', () => {
  const executeGuard = (loggedInFallback: string) => {
    return TestBed.runInInjectionContext(() =>
      redirectLoggedInToGuard(loggedInFallback)
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

  it('should call router.navigateByUrl() if user is logged in (online user)', async () => {
    authStateServiceMock.session.and.returnValue({} as UserCredential);

    await TestBed.runInInjectionContext(() =>
      instance(activatedRouteMock.snapshot, {} as RouterStateSnapshot)
    );

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith(path);
  });

  it('should call router.navigateByUrl() if user is logged in (local user)', async () => {
    authStateServiceMock.session.and.returnValue(null);
    authLocalUserServiceMock.localUser$ = of({} as LocalUserData);

    TestBed.runInInjectionContext(() =>
      instance(activatedRouteMock.snapshot, {} as RouterStateSnapshot)
    );

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith(path);
  });

  it('should return true no user is logged in', async () => {
    authStateServiceMock.session.and.returnValue(null);
    authLocalUserServiceMock.localUser$ = of(null);

    const result = await TestBed.runInInjectionContext(() =>
      instance(activatedRouteMock.snapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBe(true);
  });
});
