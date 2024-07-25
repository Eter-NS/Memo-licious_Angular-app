/* eslint-disable @typescript-eslint/no-explicit-any */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Provider, Renderer2 } from '@angular/core';
import { ViewportListenersService } from './reusable/data-access/viewport-listeners/viewport-listeners.service';
import { BehaviorSubject } from 'rxjs';
import { ThemeOptions } from './app-view/utils/models/app-settings.interface';

describe(`AppComponent - methods`, () => {
  // Mocks
  const appThemeValue = new BehaviorSubject<ThemeOptions>('auto');
  const darkModeListenerValue = new BehaviorSubject<MediaQueryList>({
    matches: false,
  } as MediaQueryList);

  const viewportListenersServiceMock = {
    appTheme$: appThemeValue.asObservable(),
    darkModeListener$: darkModeListenerValue.asObservable(),
  };
  let rendererMock: Renderer2;

  // Component
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Renderer2, useValue: rendererMock },
        {
          provide: ViewportListenersService,
          useValue: viewportListenersServiceMock,
        },
      ] satisfies Provider[],
    });
  });

  beforeEach(() => {
    appThemeValue.next('auto');

    darkModeListenerValue.next({
      matches: false,
    } as MediaQueryList);

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    rendererMock = fixture.componentRef.injector.get(Renderer2);
  });

  describe(`_listenForThemeChanges()`, () => {
    it(`should subscribe to viewportListenersService.appTheme$ and immediately get a value.`, () => {
      // Arrange
      component['_currTheme'] = 'auto';

      // Act
      appThemeValue.next('light');
      TestBed.runInInjectionContext(() => {
        component['_listenForThemeChanges']();
      });

      // Assert
      expect(component['_currTheme']).toBe('light');
    });

    it(`should call _updateBodyClass().`, () => {
      // Arrange
      (component['_currTheme'] as any) = undefined;
      const spy = spyOn(component as any, '_updateBodyClass');

      // Act
      appThemeValue.next('dark');
      TestBed.runInInjectionContext(() => {
        component['_listenForThemeChanges']();
      });

      // Assert
      expect(component['_currTheme']).toBe('dark');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`_listenForAutomaticThemeChanges()`, () => {
    it(`should subscribe to viewportListenersService.darkModeListener$ and immediately get a value.`, () => {
      // Arrange
      (component['_isDeviceInDarkMode'] as any) = undefined;

      // Act
      darkModeListenerValue.next({ matches: true } as MediaQueryList);

      TestBed.runInInjectionContext(() => {
        component['_listenForAutomaticThemeChanges']();
      });

      // Assert
      expect(component['_isDeviceInDarkMode']).toBe(true);
    });

    it(`should call _toggleTheme() when _currTheme is equal to 'auto'.`, () => {
      // Arrange
      (component['_isDeviceInDarkMode'] as any) = undefined;
      const spy = spyOn(component as any, '_toggleTheme');

      // Act
      appThemeValue.next('auto');
      darkModeListenerValue.next({ matches: false } as MediaQueryList);

      TestBed.runInInjectionContext(() => {
        component['_listenForAutomaticThemeChanges']();
      });

      // Assert
      expect(component['_isDeviceInDarkMode']).toBe(false);
      expect(spy).toHaveBeenCalled();
    });

    it(`should NOT call _toggleTheme() when _currTheme is NOT equal to 'auto'.`, () => {
      // Arrange
      (component['_isDeviceInDarkMode'] as any) = undefined;
      const spy = spyOn(component as any, '_toggleTheme');

      // Act
      appThemeValue.next('dark');
      darkModeListenerValue.next({ matches: true } as MediaQueryList);

      TestBed.runInInjectionContext(() => {
        component['_listenForAutomaticThemeChanges']();
      });

      // Assert
      expect(component['_isDeviceInDarkMode']).toBe(true);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe(`_updateBodyClass()`, () => {
    it(`should remove theme classes from body element on the page.`, () => {
      // Arrange
      const spy = spyOn(rendererMock, 'removeClass');

      // Act
      component['_updateBodyClass']();

      // Assert
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it(`should call _toggleTheme() when _currTheme is equal to 'auto'.`, () => {
      // Arrange
      component['_currTheme'] = 'auto';
      const spy = spyOn(component as any, '_toggleTheme');

      // Act
      component['_updateBodyClass']();

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    it(`should NOT call _toggleTheme() when _currTheme is NOT equal to 'auto'.`, () => {
      // Arrange
      component['_currTheme'] = 'dark';
      const spy = spyOn(component as any, '_toggleTheme');

      // Act
      component['_updateBodyClass']();

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });

    it(`should call renderer.addClass() when _currTheme is NOT equal to 'auto'.`, () => {
      // Arrange
      component['_currTheme'] = 'light';
      const spy = spyOn(rendererMock, 'addClass');

      // Act
      component['_updateBodyClass']();

      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });
});
