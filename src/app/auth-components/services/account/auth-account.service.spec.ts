import { TestBed } from '@angular/core/testing';
import { AuthAccountService } from '../account/auth-account.service';

describe('LoginService', () => {
  let service: AuthAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
