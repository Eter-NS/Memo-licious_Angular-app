import { TestBed } from '@angular/core/testing';

import { AuthUserConnectorService } from './auth-user-connector.service';

describe('AuthUserConnectorService', () => {
  let service: AuthUserConnectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthUserConnectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
