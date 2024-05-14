import { TestBed } from '@angular/core/testing';

import { AuthCommonFeaturesService } from './auth-common-features.service';

describe('AuthCommonFeaturesService', () => {
  let service: AuthCommonFeaturesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthCommonFeaturesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
