import { TestBed } from '@angular/core/testing';

import { ErrorHandlerService } from './error-handler.service';
import { Observable } from 'rxjs';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`error$`, () => {
    it(`should return an Observable`, () => {
      expect(service.error$ instanceof Observable).toBeTrue();
    });
  });

  describe(`onError()`, () => {
    it(`should pass an error message to the _error subject`, () => {
      const spy = spyOn(service['_error'], 'next').and.callThrough();

      service.onError('test');

      expect(spy).toHaveBeenCalledWith('test');
    });
  });

  describe(`ngOnDestroy()`, () => {
    it(`should complete the _error subject`, () => {
      const spy = spyOn(service['_error'], 'complete').and.callThrough();

      service.ngOnDestroy();

      expect(spy).toHaveBeenCalled();
    });
  });
});
