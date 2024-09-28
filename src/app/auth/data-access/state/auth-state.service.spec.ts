import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { AuthStateService } from './auth-state.service';
import {
  Auth,
  User,
  browserLocalPersistence,
  browserSessionPersistence,
} from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { FirebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service';
import { firebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service.mock';

describe('AuthStateService', () => {
  // Mocks
  const authMock = jasmine.createSpyObj<Auth>(['setPersistence']);
  const firebaseAuthControllerServiceMock = firebaseAuthControllerService;
  const userValueSubject = new BehaviorSubject<User | null>(null);

  // Service
  let service: AuthStateService;

  beforeEach(() => {
    firebaseAuthControllerServiceMock.user.and.returnValue(
      userValueSubject.asObservable()
    );
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Auth,
          useValue: authMock,
        },
        {
          provide: FirebaseAuthControllerService,
          useValue: firebaseAuthControllerServiceMock,
        },
      ],
    });
    service = TestBed.inject(AuthStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`user$`, () => {
    it(`should allow a component or any consumer to subscribe to the observable.`, fakeAsync(() => {
      userValueSubject.next({} as User);

      let data: User | null;

      service.user$.subscribe((user) => {
        data = user;
      });

      flush();

      expect(data!).not.toBeNull();
    }));

    it(`should call updateSession() each time user$ emits a new value.`, fakeAsync(() => {
      // Arrange
      const spy = spyOn(service, 'updateSession');

      // Act
      userValueSubject.next({} as User);

      flush();

      // Assert
      expect(spy).toHaveBeenCalled();
    }));
  });

  describe(`methods`, () => {
    describe('rememberMe()', () => {
      it('should call setPersistence with browserLocalPersistence.', () => {
        service.rememberMe(true);

        expect(authMock.setPersistence).toHaveBeenCalledWith(
          browserLocalPersistence
        );
      });

      it('should call setPersistence with browserSessionPersistence.', () => {
        service.rememberMe(false);

        expect(authMock.setPersistence).toHaveBeenCalledWith(
          browserSessionPersistence
        );
      });
    });

    describe('checkUserSession()', () => {
      it('should return the user email if it exists.', () => {
        const user = { email: 'test@example.com' } as User;
        service['_session'].set(user);
        expect(service.checkUserSession()).toBe('test@example.com');
      });

      it('should return null if the user email does NOT exist.', () => {
        expect(service.checkUserSession()).toBeNull();
      });
    });
  });
});
