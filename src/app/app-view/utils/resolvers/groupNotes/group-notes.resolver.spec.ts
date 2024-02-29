import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { groupNotesResolver } from './group-notes.resolver';

describe('groupNotesResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => groupNotesResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
