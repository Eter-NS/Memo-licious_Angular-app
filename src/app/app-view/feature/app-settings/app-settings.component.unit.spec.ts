/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppSettingsComponent } from './app-settings.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Provider } from '@angular/core';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { UserProfileService } from '../../data-access/user-profile/user-profile.service';
import { ViewportListenersService } from 'src/app/reusable/data-access/viewport-listeners/viewport-listeners.service';
import { LocalStorageService } from 'src/app/reusable/data-access/localStorage/local-storage.service';
import { NotesService } from '../../data-access/notes/notes.service';
import { BehaviorSubject } from 'rxjs';
import { UserProfile } from '../../utils/models/user-profile.interface';
import { hsl } from 'random-color-creator';

describe(`AppSettingsComponent`, () => {
  // Mocks
  const viewTransitionServiceMock = jasmine.createSpyObj<ViewTransitionService>(
    ['viewFadeIn', 'goForward']
  );

  const userProfileValue = new BehaviorSubject<UserProfile>({
    authOption: 'password',
    name: 'Sam',
    email: 'example@domain.com',
    profileColor: hsl({
      alphaChannel: 1,
      colorParts: ['', '', ''],
      optionsObj: {
        hsl: {
          saturation: { minValue: 25 },
          lightness: { minValue: 25, maxValue: 50 },
        },
      },
    }) as string,
  });
  const userProfileServiceMock: Partial<UserProfileService> = {
    userProfile$: userProfileValue.asObservable(),
  };

  const viewportListenersServiceMock =
    jasmine.createSpyObj<ViewportListenersService>(['changeTheme']);
  const localStorageServiceMock = jasmine.createSpyObj<LocalStorageService>([
    'loadFromStorage',
    'saveToStorage',
  ]);
  const notesServiceMock = jasmine.createSpyObj<NotesService>([
    'changeRemovingStrategy',
  ]);

  // Component
  let fixture: ComponentFixture<AppSettingsComponent>;
  let component: AppSettingsComponent;

  beforeEach(() => {
    localStorageServiceMock.loadFromStorage.and.returnValue(null);
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, AppSettingsComponent],
      providers: [
        {
          provide: ViewTransitionService,
          useValue: viewTransitionServiceMock,
        },
        {
          provide: UserProfileService,
          useValue: userProfileServiceMock,
        },
        {
          provide: ViewportListenersService,
          useValue: viewportListenersServiceMock,
        },
        {
          provide: LocalStorageService,
          useValue: localStorageServiceMock,
        },
        {
          provide: NotesService,
          useValue: notesServiceMock,
        },
      ] as Provider[],
    });

    fixture = TestBed.createComponent(AppSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(`should be created.`, () => {
    // Arrange

    // Act

    // Assert
    expect(component).toBeTruthy();
  });

  describe(`Lifecycle hooks`, () => {
    describe(`ngOnInit`, () => {
      it(`should call _loadAppState, _listenForAppSettingsChanges, and viewTransitionService.viewFadeIn.`, () => {
        // Arrange
        const loadAppStateSpy = spyOn(component as any, '_loadAppState');
        const listenForAppSettingsChangesSpy = spyOn(
          component as any,
          '_listenForAppSettingsChanges'
        );
        const viewTransitionServiceViewFadeInSpy =
          viewTransitionServiceMock.viewFadeIn;

        // Act
        component.ngOnInit();

        // Assert
        expect(loadAppStateSpy).toHaveBeenCalled();
        expect(listenForAppSettingsChangesSpy).toHaveBeenCalled();
        expect(viewTransitionServiceViewFadeInSpy).toHaveBeenCalled();
      });
    });
  });

  describe(`methods`, () => {
    describe(`_listenForAppSettingsChanges()`, () => {
      it(`should subscribe to appSettingsForm.valueChanges and call _saveAppChanges if the form changes.`, () => {
        // Arrange
        const saveAppChangesSpy = spyOn(component as any, '_saveAppChanges');

        // Act
        component['_listenForAppSettingsChanges']();

        component.appSettingsForm.patchValue({
          theme: 'light',
        });

        // Assert
        expect(saveAppChangesSpy).toHaveBeenCalled();
      });
    });

    describe(`_loadAppState()`, () => {
      it(`should do nothing if _savedFormState is null.`, () => {
        // Arrange
        const setValueSpy = spyOn(component.appSettingsForm, 'setValue');
        component['_savedFormState'] = null;

        // Act
        component['_loadAppState'];

        // Assert
        expect(setValueSpy).not.toHaveBeenCalled();
      });

      it(`should update the app settings form with the previously saved form data.`, () => {
        // Arrange
        const setValueSpy = spyOn(component.appSettingsForm, 'setValue');
        component['_savedFormState'] = {
          theme: 'light',
          fastDeletingMode: false,
        };

        // Act
        component['_loadAppState']();

        // Assert
        expect(setValueSpy).toHaveBeenCalled();
      });
    });

    describe(`_saveAppChanges()`, () => {
      it(`should call viewportListenersService.changeTheme if theme changed.`, () => {
        // Arrange
        const changeThemeSpy = viewportListenersServiceMock.changeTheme;
        const changeRemovingStrategySpy =
          notesServiceMock.changeRemovingStrategy;
        const saveToStorageSpy = localStorageServiceMock.saveToStorage;

        component['_savedFormState'] = {
          theme: 'dark',
          fastDeletingMode: false,
        };

        // Act
        component.appSettingsForm.patchValue(
          {
            theme: 'light',
          },
          {
            emitEvent: false,
          }
        );
        component['_saveAppChanges']();

        // Assert
        expect(changeThemeSpy).toHaveBeenCalled();
        expect(changeRemovingStrategySpy).not.toHaveBeenCalled();
        expect(saveToStorageSpy).toHaveBeenCalled();
      });

      it(`should call notesService.changeRemovingStrategy if deleting strategy changed (set 'fast').`, () => {
        // Arrange
        viewportListenersServiceMock.changeTheme.calls.reset();
        const changeThemeSpy = viewportListenersServiceMock.changeTheme;
        const changeRemovingStrategySpy =
          notesServiceMock.changeRemovingStrategy;
        const saveToStorageSpy = localStorageServiceMock.saveToStorage;

        component['_savedFormState'] = {
          theme: 'auto',
          fastDeletingMode: false,
        };

        // Act
        component.appSettingsForm.patchValue(
          {
            fastDeletingMode: true,
          },
          {
            emitEvent: false,
          }
        );
        component['_saveAppChanges']();

        // Assert
        expect(changeThemeSpy).not.toHaveBeenCalled();
        expect(changeRemovingStrategySpy).toHaveBeenCalled();
        expect(saveToStorageSpy).toHaveBeenCalled();
      });

      it(`should call notesService.changeRemovingStrategy if deleting strategy changed (set 'fast').`, () => {
        // Arrange
        viewportListenersServiceMock.changeTheme.calls.reset();
        const changeThemeSpy = viewportListenersServiceMock.changeTheme;
        const changeRemovingStrategySpy =
          notesServiceMock.changeRemovingStrategy;
        const saveToStorageSpy = localStorageServiceMock.saveToStorage;

        component['_savedFormState'] = {
          theme: 'auto',
          fastDeletingMode: true,
        };

        // Act
        component.appSettingsForm.patchValue(
          {
            fastDeletingMode: false,
          },
          {
            emitEvent: false,
          }
        );
        component['_saveAppChanges']();

        // Assert
        expect(changeThemeSpy).not.toHaveBeenCalled();
        expect(changeRemovingStrategySpy).toHaveBeenCalled();
        expect(saveToStorageSpy).toHaveBeenCalled();
      });
    });
  });
});
