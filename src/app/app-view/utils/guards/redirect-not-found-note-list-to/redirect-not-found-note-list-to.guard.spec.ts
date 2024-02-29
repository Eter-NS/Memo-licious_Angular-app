import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { redirectNotFoundNoteListToGuard } from './redirect-not-found-note-list-to.guard';

describe('redirectNotFoundNoteListToGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => redirectNotFoundNoteListToGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
