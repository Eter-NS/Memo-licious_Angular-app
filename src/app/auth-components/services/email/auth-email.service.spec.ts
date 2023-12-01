import { TestBed } from '@angular/core/testing';

import { AuthEmailService } from './auth-email.service';

describe('AuthEmailService', () => {
  let service: AuthEmailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthEmailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
