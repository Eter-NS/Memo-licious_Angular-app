import { TestBed } from '@angular/core/testing';
import { AuthStateService } from './auth-state.service';
import {
  Auth,
  User,
  UserCredential,
  browserLocalPersistence,
  browserSessionPersistence,
} from '@angular/fire/auth';
import { of } from 'rxjs';

describe('AuthStateService', () => {
  const authMock = jasmine.createSpyObj<Auth>(['setPersistence']);
  let service: AuthStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Auth,
          useValue: authMock,
        },
      ],
    });
    service = TestBed.inject(AuthStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it(`should allow the component or any consumer to subscribe to user$`, (done: DoneFn) => {
    spyOn(service, 'user').and.returnValue(of({} as User));

    let data: User | null;

    service.user$.subscribe((user) => {
      data = user;
    });

    expect(data!).not.toBeNull();
    done();
  });

  describe('rememberMe()', () => {
    it('should call setPersistence with browserLocalPersistence', () => {
      service.rememberMe(true);
      expect(authMock.setPersistence).toHaveBeenCalledWith(
        browserLocalPersistence
      );
    });

    it('should call setPersistence with browserSessionPersistence', () => {
      service.rememberMe(false);
      expect(authMock.setPersistence).toHaveBeenCalledWith(
        browserSessionPersistence
      );
    });
  });

  describe('checkUserSession()', () => {
    it('should return the user email if it exists', () => {
      const user = { user: { email: 'test@example.com' } } as UserCredential;
      service.session.set(user);
      expect(service.checkUserSession()).toBe('test@example.com');
    });

    it('should return null if the user email does NOT exist', () => {
      expect(service.checkUserSession()).toBeNull();
    });
  });
});
