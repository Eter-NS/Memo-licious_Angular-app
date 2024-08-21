/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { AppViewComponent } from './app-view.page.component';
import { Router, provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { NotesService } from '../data-access/notes/notes.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, filter } from 'rxjs';
import { AuthUserConnectorService } from '../data-access/auth-user-connector/auth-user-connector.service';
import { ErrorHandlerService } from '../../reusable/data-access/error-handler/error-handler.service';
import { Component, Provider } from '@angular/core';

@Component({
  selector: 'app-test',
  template: `<p>The component works!</p>`,
})
export class TestComponent {}

const LEFT_MOUSE_CLICK = 0;

describe('AppViewComponent - navigation', () => {
  const notesServiceMock = jasmine.createSpyObj<NotesService>([
    'clearNoteGroups',
  ]);
  const authUserConnectorServiceMock =
    jasmine.createSpyObj<AuthUserConnectorService>(['logOutUser']);

  const errorSubject = new BehaviorSubject<string | null>(null);
  const errorHandlerServiceMock = {
    error$: errorSubject
      .asObservable()
      .pipe(filter((error): error is string => !!error)),
  };

  let component: AppViewComponent;
  let fixture: ComponentFixture<AppViewComponent>;
  let harness: RouterTestingHarness;

  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AppViewComponent, NoopAnimationsModule],
      providers: [
        provideRouter([
          {
            path: 'app',
            component: AppViewComponent,
            children: [
              {
                path: 'notes',
                component: TestComponent,
              },
              {
                path: 'recycle-bin',
                component: TestComponent,
              },
              {
                path: 'settings',
                component: TestComponent,
              },
            ],
          },
          {
            path: 'online/force=login',
            component: TestComponent,
          },
          {
            path: 'guest/force=login',
            component: TestComponent,
          },
        ]),
        provideLocationMocks(),
        {
          provide: ErrorHandlerService,
          useValue: errorHandlerServiceMock,
        },
        {
          provide: NotesService,
          useValue: notesServiceMock,
        },
        {
          provide: AuthUserConnectorService,
          useValue: authUserConnectorServiceMock,
        },
      ] as Provider[],
    });

    harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl('/app', AppViewComponent);
    fixture = harness.fixture as ComponentFixture<AppViewComponent>;
    fixture.detectChanges();

    router = harness.fixture.componentRef.injector.get(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to notes', fakeAsync(() => {
    harness.routeDebugElement
      ?.query(By.css('[data-test=link-to-app-home]'))
      .triggerEventHandler('click', { button: LEFT_MOUSE_CLICK });

    tick();

    expect(TestBed.inject(Router).url).toBe('/app/notes');
  }));

  it('should navigate to recycle bin', fakeAsync(() => {
    harness.routeDebugElement
      ?.query(By.css('[data-test=link-to-app-recycle-bin]'))
      .triggerEventHandler('click', { button: LEFT_MOUSE_CLICK });

    tick();

    expect(TestBed.inject(Router).url).toBe('/app/recycle-bin');
  }));

  it('should navigate to settings', fakeAsync(() => {
    harness.routeDebugElement
      ?.query(By.css('[data-test=link-to-app-settings]'))
      .triggerEventHandler('click', { button: LEFT_MOUSE_CLICK });

    tick();

    expect(TestBed.inject(Router).url).toBe('/app/settings');
  }));

  it('should navigate to login (online account)', fakeAsync(() => {
    authUserConnectorServiceMock.logOutUser.and.callFake(() => {
      router.navigate(['/online/force=login']);
    });

    harness.routeDebugElement
      ?.query(By.css('[data-test=link-to-logout]'))
      .triggerEventHandler('click', { button: LEFT_MOUSE_CLICK });

    tick();

    expect(TestBed.inject(Router).url).toBe('/online/force%3Dlogin');
  }));

  it('should navigate to login (guest account)', fakeAsync(() => {
    authUserConnectorServiceMock.logOutUser.and.callFake(() => {
      router.navigate(['/guest/force=login']);
    });

    harness.routeDebugElement
      ?.query(By.css('[data-test=link-to-logout]'))
      .triggerEventHandler('click', { button: LEFT_MOUSE_CLICK });

    tick();

    expect(TestBed.inject(Router).url).toBe('/guest/force%3Dlogin');
  }));
});
