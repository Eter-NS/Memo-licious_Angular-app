import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ViewportListenersService } from './viewport-listeners.service';
import { ThemeOptions } from 'src/app/app-view/utils/models/app-settings.interface';
import { AppConfigService } from 'src/app/app-view/data-access/app-config/app-config.service';
import { Provider } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Observable, of } from 'rxjs';

describe('ViewportListenersService', () => {
  const appConfigServiceMock = {
    appConfigState: {
      theme: 'auto' satisfies ThemeOptions,
    },
    updateConfig: jasmine.createSpy(
      'updateConfig',
      AppConfigService.prototype.updateConfig
    ),
  };
  const breakpointObserverMock = jasmine.createSpyObj<BreakpointObserver>([
    'observe',
  ]);

  let service: ViewportListenersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppConfigService,
          useValue: appConfigServiceMock,
        },
        {
          provide: BreakpointObserver,
          useValue: breakpointObserverMock,
        },
      ] satisfies Provider[],
    });
    service = TestBed.inject(ViewportListenersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`appTheme$`, () => {
    it(`should return _appTheme subject as the observable with the default value.`, fakeAsync(() => {
      // Arrange
      let value: ThemeOptions | undefined;

      // Act
      const subscription = service.appTheme$.subscribe((theme) => {
        value = theme;
      });

      tick();
      subscription.unsubscribe();

      // Assert
      expect(value).toBe('auto');
    }));

    it(`should return _appTheme subject's latest value.`, fakeAsync(() => {
      // Arrange
      service['_appTheme'].next('light');
      let value: ThemeOptions | undefined;

      // Act
      const subscription = service.appTheme$.subscribe((theme) => {
        value = theme;
      });

      tick();
      subscription.unsubscribe();

      // Assert
      expect(value).toBe('light');
    }));
  });

  describe(`isHandset$`, () => {
    it(`should return the value of type boolean right after subscribing.`, fakeAsync(() => {
      // Arrange
      breakpointObserverMock.observe.and.returnValue(
        of({ matches: true } as BreakpointState)
      );
      let value: boolean | undefined;

      // Act
      const subscription = service.isHandset$.subscribe((handset) => {
        value = handset;
      });

      tick();
      subscription.unsubscribe();

      // Assert
      expect(value).toBeTrue();
    }));

    it(`should create hot observable which always contains the latest state.`, fakeAsync(() => {
      // Arrange
      breakpointObserverMock.observe.and.returnValue(
        of({ matches: true } as BreakpointState)
      );
      let value1: boolean | undefined;
      let value2: boolean | undefined;
      let changeCounter = 0;

      // Act
      const subscription1 = service.isHandset$.subscribe((handset) => {
        value1 = handset;
        changeCounter++;
      });

      tick(3_000);

      const subscription2 = service.isHandset$.subscribe((handset) => {
        value2 = handset;
        changeCounter++;
      });

      tick();
      subscription1.unsubscribe();
      subscription2.unsubscribe();

      // Assert
      expect(value1).toBeTrue();
      expect(value2).toBeTrue();
      expect(changeCounter).toBe(2);
    }));

    it(`should return a new value if the device dimensions change.`, fakeAsync(() => {
      // Arrange
      breakpointObserverMock.observe.and.returnValue(
        new Observable((observer) => {
          observer.next({ matches: true } as BreakpointState);

          setTimeout(() => {
            observer.next({ matches: false } as BreakpointState);
          }, 5000);
        })
      );
      let value: boolean | undefined;

      // Act
      const subscription = service.isHandset$.subscribe((handset) => {
        value = handset;
      });

      tick();

      // Assert
      expect(value).toBeTrue();

      tick(6_000);
      subscription.unsubscribe();

      // Assert
      expect(value).toBeFalse();
    }));
  });

  describe(`darkModeListener$`, () => {
    it(`should call _darkModeListener() which returns an Observable throttled to 30fps.`, fakeAsync(() => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      spyOn(service as any, '_darkModeListener').and.returnValue(
        of(
          new MediaQueryListEvent('change', {
            bubbles: false,
            matches: true,
            media: '(prefers-color-scheme: dark)',
          })
        )
      );
      let value: boolean | undefined;

      // Act
      const subscription = service.darkModeListener$.subscribe((event) => {
        value = event.matches;
      });

      tick();
      subscription.unsubscribe();

      // Assert
      expect(value).toBeTrue();
    }));
  });

  describe(`changeTheme()`, () => {
    it(`should update value of _appTheme subject`, fakeAsync(() => {
      // Arrange
      let value: ThemeOptions | undefined;
      const subscription = service.appTheme$.subscribe((theme) => {
        // The first value is 'auto'
        value = theme;
      });

      // Act
      service.changeTheme('dark');

      tick();
      subscription.unsubscribe();

      // Assert
      expect(value).toBe('dark');
    }));

    it(`should call appConfigService.updateConfig().`, () => {
      // Arrange
      const spy = appConfigServiceMock.updateConfig;

      // Act
      service.changeTheme('dark');

      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });
});
