/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { AppViewComponent } from './app-view.page.component';
import { Provider } from '@angular/core';
import { NotesService } from '../data-access/notes/notes.service';
import { AuthUserConnectorService } from '../data-access/auth-user-connector/auth-user-connector.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorHandlerService } from 'src/app/reusable/data-access/error-handler/error-handler.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { ViewportListenersService } from 'src/app/reusable/data-access/viewport-listeners/viewport-listeners.service';

describe(`AppViewComponent - methods`, () => {
  // Mocks
  const notesServiceMock = jasmine.createSpyObj<NotesService>([
    'clearNoteGroups',
  ]);
  const authUserConnectorServiceMock =
    jasmine.createSpyObj<AuthUserConnectorService>(['logOutUser']);

  const errorSubject = new Subject<string>();
  const errorHandlerServiceMock = {
    error$: errorSubject.asObservable(),
  };
  const isHandsetValue = new BehaviorSubject<boolean>(false);
  const viewportListenersServiceMock = {
    isHandset$: isHandsetValue.asObservable(),
  };
  let matSnackBarMock: MatSnackBar;

  // Component
  let fixture: ComponentFixture<AppViewComponent>;
  let component: AppViewComponent;

  beforeEach(() => {
    notesServiceMock.clearNoteGroups.calls.reset();
    authUserConnectorServiceMock.logOutUser.calls.reset();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppViewComponent, NoopAnimationsModule],
      providers: [
        {
          provide: NotesService,
          useValue: notesServiceMock,
        },
        {
          provide: AuthUserConnectorService,
          useValue: authUserConnectorServiceMock,
        },
        {
          provide: ErrorHandlerService,
          useValue: errorHandlerServiceMock,
        },
        {
          provide: ViewportListenersService,
          useValue: viewportListenersServiceMock,
        },
        {
          provide: ActivatedRoute,
          useValue: {},
        },
      ] as Provider[],
    }).compileComponents();

    fixture = TestBed.createComponent(AppViewComponent);
    component = fixture.componentInstance;

    matSnackBarMock = fixture.componentRef.injector.get(MatSnackBar);
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe(`ngOnInit()`, () => {
    it(`should call _setErrorHandler() and _setNotesCleanup()`, () => {
      // Arrange
      const _setErrorHandlerSpy = spyOn(component as any, '_setErrorHandler');
      const _setNotesCleanupSpy = spyOn(component as any, '_setNotesCleanup');

      // Act
      fixture.detectChanges();

      // Assert
      expect(_setErrorHandlerSpy).toHaveBeenCalled();
      expect(_setNotesCleanupSpy).toHaveBeenCalled();
    });
  });

  describe(`closeNavbar()`, () => {
    it(`should call navbarComponent.drawer.close() when device matches handset breakpoint.`, () => {
      // Arrange
      fixture.detectChanges();
      const spy = spyOn(component.navbarComponent.drawer, 'close');

      // Act
      isHandsetValue.next(true);
      component.closeNavbar();

      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`logOut()`, () => {
    it(`should call authUserConnectorService.logOutUser()`, () => {
      // Arrange
      const spy = authUserConnectorServiceMock.logOutUser;

      // Act
      component.logOut();

      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`_setErrorHandler`, () => {
    it('should open a snackbar when an error occurs', fakeAsync(() => {
      const spy = spyOn(matSnackBarMock, 'open');
      component['_setErrorHandler']();

      errorSubject.next('Example error');

      tick();
      fixture.destroy();
      expect(spy).toHaveBeenCalledTimes(1);
    }));
  });

  describe(`_setNotesCleanup()`, () => {
    it(`should call notesService.clearNoteGroups() after subscribing to timer.`, fakeAsync(() => {
      component['_setNotesCleanup']();

      tick();
      fixture.destroy();
      expect(notesServiceMock.clearNoteGroups).toHaveBeenCalledTimes(1);
    }));

    it(`should call notesService.clearNoteGroups() after timer interval.`, fakeAsync(() => {
      component['_setNotesCleanup']();

      tick(1000 * 60);
      fixture.destroy();
      expect(notesServiceMock.clearNoteGroups).toHaveBeenCalledTimes(2);
    }));
  });
});
