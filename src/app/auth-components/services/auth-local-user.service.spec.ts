import { TestBed } from '@angular/core/testing';

import { AuthLocalUserService } from './auth-local-user.service';

describe('AuthLocalUserService', () => {
  let service: AuthLocalUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthLocalUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
