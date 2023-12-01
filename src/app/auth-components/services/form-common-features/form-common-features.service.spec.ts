import { TestBed } from '@angular/core/testing';

import { FormCommonFeaturesService } from './form-common-features.service';

describe('RegisterLoginCommonFeaturesService', () => {
  let service: FormCommonFeaturesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormCommonFeaturesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
