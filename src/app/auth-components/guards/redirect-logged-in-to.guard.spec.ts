import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { redirectLoggedInToGuard } from './redirect-logged-in-to.guard';

describe('redirectLoggedInToGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => redirectLoggedInToGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
