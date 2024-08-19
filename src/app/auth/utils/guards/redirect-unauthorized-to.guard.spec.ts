import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { redirectUnauthorizedToGuard } from './redirect-unauthorized-to.guard';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalUserAccount } from '../Models/LocalAuthModels.interface';
import { User } from '@angular/fire/auth';
import { AuthUserConnectorService } from 'src/app/app-view/data-access/auth-user-connector/auth-user-connector.service';

describe('redirectUnauthorizedToGuard', () => {
  const activeUserSubject = new BehaviorSubject<User | LocalUserAccount | null>(
    null
  );
  const authUserConnectorServiceMock = {
    activeUser$: activeUserSubject.asObservable(),
  };
  const routerMock = jasmine.createSpyObj<Router>(['navigateByUrl']);

  const path = '/online';
  let instance: CanActivateFn;

  const executeGuard = (loggedInFallback: string) => {
    return TestBed.runInInjectionContext(() =>
      redirectUnauthorizedToGuard(loggedInFallback)
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

  it(`should return true when the online user is signed in`, fakeAsync(() => {
    activeUserSubject.next({} as User);

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

  it(`should return true when the online user is signed in`, fakeAsync(() => {
    activeUserSubject.next({} as LocalUserAccount);

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

  it(`should call router.navigateByUrl() when no user is signed in`, fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const result = instance(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      ) as Observable<boolean>;

      const subscription = result.subscribe();

      tick(1_000);
      subscription.unsubscribe();

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith(path);
    });
  }));
});
