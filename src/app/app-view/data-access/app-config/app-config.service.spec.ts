import { TestBed } from '@angular/core/testing';

import { AppConfigService } from './app-config.service';
import { LocalStorageService } from 'src/app/reusable/data-access/localStorage/local-storage.service';
import { AppSettingsToken } from '../../utils/models/app-settings.interface';

describe('AppConfigSetterService', () => {
  const LocalStorageServiceMock = jasmine.createSpyObj<LocalStorageService>([
    'loadFromStorage',
    'saveToStorage',
  ]);

  let service: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LocalStorageService, useValue: LocalStorageServiceMock },
      ],
    });
    service = TestBed.inject(AppConfigService);
  });

  it(`should be created`, () => {
    expect(service).toBeTruthy();
  });

  describe(`appConfigState`, () => {
    it(`should return default config if no config is stored in storage`, () => {
      LocalStorageServiceMock.loadFromStorage.and.returnValue(null);

      const result = service.appConfigState;

      expect(result).toEqual(service['_initialAppState']);
    });

    it(`should return stored config in case it exists`, () => {
      const expectedValue: AppSettingsToken = {
        deletingMode: 'fast',
        theme: 'dark',
      };
      service['_currentState'] = expectedValue;

      const result = service.appConfigState;

      expect(result).toEqual(expectedValue);
    });
  });

  describe(`updateConfig()`, () => {
    it(`should update config in storage`, () => {
      const expectedValue: Partial<AppSettingsToken> = {
        theme: 'light',
      };

      service.updateConfig(expectedValue);

      expect(LocalStorageServiceMock.saveToStorage).toHaveBeenCalled();
    });

    it(`should update the appConfigState value when config is updated in storage`, () => {
      const expectedValue: Partial<AppSettingsToken> = {
        theme: 'light',
      };

      service.updateConfig(expectedValue);

      expect(service.appConfigState.theme).toBe('light');
    });
  });
});
