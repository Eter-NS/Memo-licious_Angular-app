import { TestBed } from '@angular/core/testing';

import { redirectLoggedInToGuard } from './redirect-logged-in-to.guard';

describe('redirectLoggedInToGuard', () => {
  const executeGuard = (loggedInFallback: string) => {
    return TestBed.runInInjectionContext(() => {
      return redirectLoggedInToGuard(loggedInFallback);
    });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
