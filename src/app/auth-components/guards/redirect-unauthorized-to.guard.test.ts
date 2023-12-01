import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { redirectUnauthorizedToGuard } from './redirect-unauthorized-to.guard';

describe('redirectLoggedInGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      redirectUnauthorizedToGuard(...guardParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
