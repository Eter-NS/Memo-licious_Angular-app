/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BehaviorSubject } from 'rxjs';
import { ThemeOptions } from './app-view/utils/models/app-settings.interface';
import { ViewportListenersService } from './reusable/data-access/viewport-listeners/viewport-listeners.service';
import { DOCUMENT } from '@angular/common';

describe('AppComponent - template and observables', () => {
  // Mocks
  const appThemeValue = new BehaviorSubject<ThemeOptions>('auto');
  const darkModeListenerValue = new BehaviorSubject<MediaQueryList>({
    matches: false,
  } as MediaQueryList);

  const viewportListenersServiceMock = {
    appTheme$: appThemeValue.asObservable(),
    darkModeListener$: darkModeListenerValue.asObservable(),
  };

  // Component
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let documentInstance: Document;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        {
          provide: ViewportListenersService,
          useValue: viewportListenersServiceMock,
        },
      ],
    })
  );

  beforeEach(() => {
    appThemeValue.next('auto');
    darkModeListenerValue.next({
      matches: false,
    } as MediaQueryList);

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    documentInstance = TestBed.inject(DOCUMENT);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should assign light mode theme to app`, () => {
    const spy = spyOn(component as any, '_updateBodyClass').and.callThrough();

    appThemeValue.next('light');
    fixture.detectChanges();

    const element = documentInstance.body.classList;

    expect(spy).toHaveBeenCalled();
    expect(element.contains('light')).toBeTrue();
    expect(element.contains('dark')).toBeFalse();
  });

  it(`should assign dark mode theme to app`, () => {
    const spy = spyOn(component as any, '_updateBodyClass').and.callThrough();

    appThemeValue.next('dark');
    fixture.detectChanges();

    const element = documentInstance.body.classList;

    expect(spy).toHaveBeenCalled();
    expect(element.contains('dark')).toBeTrue();
    expect(element.contains('light')).toBeFalse();
  });
});
