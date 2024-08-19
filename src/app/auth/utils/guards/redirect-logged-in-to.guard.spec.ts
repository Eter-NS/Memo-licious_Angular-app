import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { redirectLoggedInToGuard } from './redirect-logged-in-to.guard';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { LocalUserAccount } from '../Models/LocalAuthModels.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '@angular/fire/auth';
import { AuthUserConnectorService } from 'src/app/app-view/data-access/auth-user-connector/auth-user-connector.service';
import { NoteGroupModel } from '../Models/UserDataModels.interface';

describe('redirectLoggedInToGuard', () => {
  const activeUserSubject = new BehaviorSubject<User | LocalUserAccount | null>(
    null
  );
  const authUserConnectorServiceMock = {
    activeUser$: activeUserSubject.asObservable(),
  };
  const routerMock = jasmine.createSpyObj<Router>(['navigateByUrl']);

  const path = '/app';
  let instance: CanActivateFn;

  const executeGuard = (loggedInFallback: string) => {
    return TestBed.runInInjectionContext(() =>
      redirectLoggedInToGuard(loggedInFallback)
    );
  };

  beforeEach(() => {
    activeUserSubject.next(null);
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthUserConnectorService,
          useValue: authUserConnectorServiceMock,
        },
        { provide: Router, useValue: routerMock },
      ],
    });

    instance = executeGuard(path);
  });

  it('should be created', () => {
    expect(instance).toBeTruthy();
  });

  it('should call router.navigateByUrl() if user is logged in (online user)', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      activeUserSubject.next({ emailVerified: true } as User);
      let value: boolean | undefined;

      const result = instance(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      ) as Observable<boolean>;

      const subscription = result.subscribe((result) => {
        value = result;
      });

      tick(1_000);
      subscription.unsubscribe();

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith(path);
      expect(value).toBe(false);
    });
  }));

  it('should call router.navigateByUrl() if user is logged in (local user)', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      activeUserSubject.next({
        groups: [] as NoteGroupModel[],
      } as LocalUserAccount);
      let value: boolean | undefined;

      const result = instance(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      ) as Observable<boolean>;

      const subscription = result.subscribe((result) => {
        value = result;
      });

      tick(1_000);
      subscription.unsubscribe();

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith(path);
      expect(value).toBe(false);
    });
  }));

  it('should return true if no user is logged in', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      let value: boolean | undefined;

      const result = instance(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      ) as Observable<boolean>;

      const subscription = result.subscribe((result) => {
        value = result;
      });

      tick(1_000);
      subscription.unsubscribe();

      expect(value).toBe(true);
    });
  }));

  it('should return true if online user is unverified', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      activeUserSubject.next({ emailVerified: false } as User);
      let value: boolean | undefined;

      const result = instance(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      ) as Observable<boolean>;

      const subscription = result.subscribe((result) => {
        value = result;
      });

      tick(1_000);
      subscription.unsubscribe();

      expect(value).toBe(true);
    });
  }));
});
