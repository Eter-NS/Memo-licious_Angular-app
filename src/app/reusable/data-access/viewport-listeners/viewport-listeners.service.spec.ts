import { TestBed } from '@angular/core/testing';

import { ViewportListenersService } from './viewport-listeners.service';

describe('ViewportListenersService', () => {
  let service: ViewportListenersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewportListenersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
