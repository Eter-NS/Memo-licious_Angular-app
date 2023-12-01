import { TestBed } from '@angular/core/testing';

import { AuthDatabaseService } from './auth-database.service';

describe('AuthDatabaseService', () => {
  let service: AuthDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
