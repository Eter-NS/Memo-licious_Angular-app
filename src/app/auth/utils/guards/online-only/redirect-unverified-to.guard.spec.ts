import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { redirectUnverifiedToGuard } from './redirect-unverified-to.guard';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { User } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthUserConnectorService } from 'src/app/app-view/data-access/auth-user-connector/auth-user-connector.service';
import { LocalUserAccount } from '../../Models/LocalAuthModels.interface';
import { NoteGroupModel } from '../../Models/UserDataModels.interface';

describe('redirectUnverifiedToGuard', () => {
  const activeUserSubject = new BehaviorSubject<User | LocalUserAccount | null>(
    null
  );
  const authUserConnectorServiceMock = {
    activeUser$: activeUserSubject.asObservable(),
  };
  const routerMock = jasmine.createSpyObj<Router>(['navigateByUrl']);

  const path = '/app';
  let instance: CanActivateFn;

  const executeGuard = (unverifiedFallback: string) => {
    return TestBed.runInInjectionContext(() =>
      redirectUnverifiedToGuard(unverifiedFallback)
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
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    });

    instance = executeGuard(path);
  });

  it('should be created', () => {
    expect(instance).toBeTruthy();
  });

  it('should call router.navigateByUrl() if no user is logged in', fakeAsync(() => {
    activeUserSubject.next(null);

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

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith(path);
      expect(value).toBe(false);
    });
  }));

  it('should call router.navigateByUrl() if user is logged in (online user)', fakeAsync(() => {
    activeUserSubject.next({ emailVerified: false } as User);

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

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith(path);
      expect(value).toBe(false);
    });
  }));

  it('should return true if user is logged in (verified online user)', fakeAsync(() => {
    activeUserSubject.next({ emailVerified: true } as User);

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

  it('should return true if user is logged in (offline user)', fakeAsync(() => {
    activeUserSubject.next({
      groups: [] as NoteGroupModel[],
    } as LocalUserAccount);

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
});
