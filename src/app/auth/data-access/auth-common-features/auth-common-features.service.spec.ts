/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';

import { AuthCommonFeaturesService } from './auth-common-features.service';
import { ActivatedRoute } from '@angular/router';

describe('AuthCommonFeaturesService', () => {
  let service: AuthCommonFeaturesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthCommonFeaturesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`checkParamMap()`, () => {
    let route: any;

    beforeEach(() => {
      route = {
        snapshot: {
          paramMap: {
            get: (name: string) => {
              name;
              return null;
            },
          },
        },
      };
    });

    it(`should return the default object if pathElement is falsy.`, () => {
      // Arrange

      // Act
      const result = service.checkParamMap(
        route as ActivatedRoute,
        'parameter'
      );

      // Assert
      expect(result.register).toBeTrue();
    });

    it(`should change register property if action equals 'force'.`, () => {
      // Arrange
      route.snapshot.paramMap.get = (name: string) => {
        name;
        return 'force=login';
      };

      // Act
      const result = service.checkParamMap(
        route as ActivatedRoute,
        'parameter'
      );

      // Assert
      expect(result.register).toBeFalse();
    });

    it(`should return default object if action is 'forward' but parameter is falsy.`, () => {
      // Arrange
      const myRoute = '';
      route.snapshot.paramMap.get = (name: string) => {
        name;
        return `forward=${myRoute}`;
      };

      // Act
      const result = service.checkParamMap(
        route as ActivatedRoute,
        'parameter'
      );

      // Assert
      expect(result.redirect).toBeUndefined();
    });

    it(`should change redirect property if action equals 'forward'.`, () => {
      // Arrange
      const myRoute = 'app/notes';
      route.snapshot.paramMap.get = (name: string) => {
        name;
        return `forward=${myRoute}`;
      };

      // Act
      const result = service.checkParamMap(
        route as ActivatedRoute,
        'parameter'
      );

      // Assert
      expect(result.redirect).toBe(myRoute);
    });
  });
});
