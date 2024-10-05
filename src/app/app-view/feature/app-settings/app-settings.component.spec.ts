/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { AppSettingsComponent } from './app-settings.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Provider } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { Auth, User } from '@angular/fire/auth';
import { firebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service.mock';
import { FirebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service';
import { BehaviorSubject } from 'rxjs';
import { AuthLocalUserService } from 'src/app/auth/data-access/local-user/auth-local-user.service';
import { LocalUserAccount } from 'src/app/auth/utils/Models/LocalAuthModels.interface';
import { hsl } from 'random-color-creator';
import { randomId } from 'src/app/reusable/utils/data-tools/objectTools';
import { firebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service.mock';
import { Database } from '@angular/fire/database';
import { FirebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service';
import { firebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service.mock';
import { Storage } from '@angular/fire/storage';
import { FirebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service';
import { NotesService } from '../../data-access/notes/notes.service';
import { NoteRestService } from '../../data-access/note-REST/note-rest.service';
import { By } from '@angular/platform-browser';
import { getElement } from 'src/app/reusable/utils/testing/utils/getElement';
import { NoProfilePictureComponent } from 'src/app/reusable/ui/SVGs/no-profile-picture/no-profile-picture.component';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { SwitchComponent } from 'src/app/reusable/ui/switch/switch.component';
import { APP_SETTINGS_FORM_TOKEN } from '../../utils/tokens/app-settings.tokens';
import { LocalStorageService } from 'src/app/reusable/data-access/localStorage/local-storage.service';
import { ThemeOptions } from '../../utils/models/app-settings.interface';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatSelectHarness } from '@angular/material/select/testing';

@Component({
  standalone: true,
  selector: 'app-test',
  template: `The test component works!`,
})
class TestComponent {}

const exampleOnlineUser = {
  email: 'example@domain.com',
  displayName: 'Nick',
  emailVerified: true,
  photoURL: `https://source.unsplash.com/random/300x300`,
} as User;

const exampleLocalUser: LocalUserAccount = {
  auth: {
    authOption: 'pin',
    name: 'Example Name',
    value: '8563',
  },
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
  groups: [
    {
      id: randomId(27),
      createdAt: Date.now(),
      title: 'Hello World',
      notes: [
        {
          id: randomId(27),
          createdAt: Date.now(),
          value: 'XYZ',
        },
      ],
    },
  ],
};

describe('AppSettingsComponent - integration', () => {
  // Mocks
  const authMock = jasmine.createSpyObj<Auth>(['setPersistence']);
  const firebaseAuthControllerServiceMock = firebaseAuthControllerService;
  const onlineUserValue = new BehaviorSubject<User | null>(null);

  const firebaseDatabaseControllerServiceMock = {
    ...firebaseDatabaseControllerService,
    db: {} as Database,
  };
  const firebaseStorageControllerServiceMock = {
    ...firebaseStorageControllerService,
    storage: {} as Storage,
  };

  // Component
  let harness: RouterTestingHarness;
  let loader: HarnessLoader;
  let component: AppSettingsComponent;
  let matSelectHarness: MatSelectHarness;

  let authLocalUserService: AuthLocalUserService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, AppSettingsComponent],
      providers: [
        provideRouter([
          {
            path: 'guest/:siteAction',
            component: TestComponent,
          },
          {
            path: 'app',
            children: [
              {
                path: 'settings',
                loadComponent: () =>
                  import('./app-settings.component').then(
                    (c) => c.AppSettingsComponent
                  ),
              },
              {
                path: 'account',
                component: TestComponent,
              },
            ],
          },
        ]),
        provideLocationMocks(),
        {
          provide: Auth,
          useValue: authMock,
        },
        {
          provide: FirebaseAuthControllerService,
          useValue: firebaseAuthControllerServiceMock,
        },
        {
          provide: FirebaseDatabaseControllerService,
          useValue: firebaseDatabaseControllerServiceMock,
        },
        {
          provide: FirebaseStorageControllerService,
          useValue: firebaseStorageControllerServiceMock,
        },
        NotesService,
        NoteRestService,
      ] as Provider[],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl(
      '/app/settings',
      AppSettingsComponent
    );
    authLocalUserService = TestBed.inject(AuthLocalUserService);
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    onlineUserValue.next(null);

    firebaseAuthControllerServiceMock.user.and.returnValue(
      onlineUserValue.asObservable()
    );
    spyOn(TestBed.inject(ViewTransitionService) as any, '_runTransition');

    localStorage.clear();
    localStorage.setItem(
      authLocalUserService['_USER_PATH'],
      JSON.stringify([exampleLocalUser])
    );

    harness.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe(`render`, () => {
    describe(`loading content`, () => {
      it(`should show the mat-spinner if user profile is loading.`, () => {
        // Act
        const matSpinner = harness.routeDebugElement?.query(
          By.css(`[data-test="user-profile-loading"]`)
        ).nativeElement;

        // Assert
        expect(matSpinner).toBeTruthy();
      });

      it(`should show the settings layout if user profile is loaded.`, () => {
        // Arrange
        onlineUserValue.next(exampleOnlineUser);
        harness.detectChanges();

        // Act
        const userImageContainer = getElement<unknown, HTMLElement>(
          harness.fixture,
          `[data-test="user-image-container"]`
        );
        const settingsForm = getElement<unknown, HTMLElement>(
          harness.fixture,
          `[data-test="settings-form"]`
        );

        // Assert
        expect(userImageContainer).toBeTruthy();
        expect(settingsForm).toBeTruthy();
      });
    });

    describe(`user picture`, () => {
      it(`should set user's image from the url provided in the observable.`, () => {
        // Arrange
        onlineUserValue.next(exampleOnlineUser);
        harness.detectChanges();

        // Act
        const imgElement = getElement<unknown, HTMLImageElement>(
          harness.fixture,
          `[data-test="user-image-container"] img`
        );

        // Assert
        expect(imgElement.src).toBe(exampleOnlineUser.photoURL as string);
      });

      it(`should create a user avatar from the first nickname character and random color generated if user was created (only local user scenario).`, () => {
        // Arrange
        TestBed.inject(AuthLocalUserService).logIn(
          exampleLocalUser.auth.name,
          exampleLocalUser.auth.value,
          'session'
        );
        harness.detectChanges();

        // Act
        const userAvatarContainer = getElement<unknown, HTMLElement>(
          harness.fixture,
          `[data-test="user-letter-avatar"]`
        );

        // Assert
        expect(userAvatarContainer).toBeTruthy();
      });

      it(`should show NoProfilePictureComponent if user does not have a profile picture (only online user scenario).`, () => {
        // Arrange
        onlineUserValue.next({ ...exampleOnlineUser, photoURL: null });
        harness.detectChanges();

        // Act
        const userAvatarContainer = harness.routeDebugElement?.query(
          By.directive(NoProfilePictureComponent)
        );

        // Assert
        expect(userAvatarContainer).toBeTruthy();
      });
    });

    describe(`settings form`, () => {
      beforeEach(async () => {
        onlineUserValue.next(exampleOnlineUser);
        harness.detectChanges();

        loader = TestbedHarnessEnvironment.loader(harness.fixture);
        matSelectHarness = await loader.getHarness(
          MatSelectHarness.with({
            selector: `[data-test="theme-select"]`,
          })
        );
      });

      it(`should load default settings if user didn't change them.`, () => {
        // Arrange

        // Act
        const themeOption = getElement<unknown, HTMLElement>(
          harness.fixture,
          `[data-test="theme-option-system"]`
        );
        const deletingModeOption = harness.routeDebugElement?.query(
          By.css(`[data-test="deleting-mode-option"]`)
        ).componentInstance as SwitchComponent;

        // Assert
        expect(themeOption).toBeTruthy();
        expect(deletingModeOption.checked).toBeFalse();
      });

      it(`should save the settings each time a user changes an option.`, fakeAsync(() => {
        // Arrange

        // Act
        matSelectHarness.focus().then(() => {
          matSelectHarness.clickOptions({
            selector: `[data-test="theme-option-dark"]`,
          });
        });

        harness.routeDebugElement
          ?.query(By.css(`[data-test="deleting-mode-option"] button`))
          .triggerEventHandler('click');

        flush();

        // Assert
        expect(
          TestBed.inject(LocalStorageService).loadFromStorage<{
            theme: ThemeOptions;
            fastDeletingMode: boolean;
          }>(APP_SETTINGS_FORM_TOKEN)
        ).toEqual({
          theme: 'dark',
          fastDeletingMode: true,
        });
      }));

      it(`should load saved settings if they've been changed in the past.`, async () => {
        // Arrange
        localStorage.setItem(
          APP_SETTINGS_FORM_TOKEN,
          JSON.stringify({
            theme: 'dark',
            fastDeletingMode: true,
          })
        );

        // Act
        component = await harness.navigateByUrl(
          '/app/settings',
          AppSettingsComponent
        );

        // Assert
        expect(component.appSettingsForm.getRawValue()).toEqual({
          theme: 'dark',
          fastDeletingMode: true,
        });
      });
    });

    describe(`settings sections`, () => {
      beforeEach(() => {
        onlineUserValue.next(exampleOnlineUser);
        harness.detectChanges();
      });

      describe(`Account section`, () => {
        it(`should move user to the /app/account page  if clicked.`, fakeAsync(() => {
          // Arrange
          // Act
          harness.routeDebugElement
            ?.query(By.css(`[data-test="settings-account-link"]`))
            .triggerEventHandler('click', null);

          flush();

          // Assert
          expect(router.url).toBe('/app/account');
        }));
      });
    });
  });
});
