import {
  ComponentFixture,
  DeferBlockState,
  TestBed,
} from '@angular/core/testing';
import { AccountSettingsComponent } from './account-settings.component';
import { Provider } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { FirebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service';
import { FirebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service';
import { firebaseAuthControllerService } from 'src/app/reusable/data-access/firebase-auth/firebase-auth-controller.service.mock';
import { Database } from '@angular/fire/database';
import { firebaseDatabaseControllerService } from 'src/app/reusable/data-access/firebase-database/firebase-database-controller.service.mock';
import { firebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service.mock';
import { Storage } from '@angular/fire/storage';
import { FirebaseStorageControllerService } from 'src/app/reusable/data-access/firebase-storage/firebase-storage-controller.service';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { AuthLocalUserService } from 'src/app/auth/data-access/local-user/auth-local-user.service';
import { LocalUserAccount } from 'src/app/auth/utils/Models/LocalAuthModels.interface';
import { randomId } from 'src/app/reusable/utils/data-tools/objectTools';
import { hsl } from 'random-color-creator';
import { getElement } from 'src/app/reusable/utils/testing/utils/getElement';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { AccountSettingsOnlineComponent } from '../../ui/account-settings-online/account-settings-online.component';
import { AccountSettingsLocalComponent } from '../../ui/account-settings-local/account-settings-local.component';
import { FetchErrorComponent } from 'src/app/reusable/ui/fetch-error/fetch-error.component';
import { UserProfileChangesI } from '../../utils/models/user-profile.interface';
import { UserProfileUpdateResultI } from '../../data-access/user-profile/user-profile.service';
import { createJpegImage } from 'src/app/reusable/utils/testing/utils/createJpegImage';

const exampleLocalUser: LocalUserAccount = {
  auth: {
    authOption: 'pin',
    name: 'Example Name',
    value: '8563',
  },
  profilePictureUrl: 'example:url',
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

const exampleOnlineUser = {
  displayName: 'Example Name',
  photoURL: 'example:url',
  email: 'example@example.com',
  uid: 'example-uid',
} as User;

function importFileToInput(inputElement: HTMLInputElement, fileToImport: File) {
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(fileToImport);

  inputElement.files = dataTransfer.files;
  inputElement.dispatchEvent(
    new Event('change', { bubbles: true, cancelable: true })
  );
}

function controlledTimeout(time = 1000): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

describe('AccountSettingsComponent - template', () => {
  // Mocks
  const authMock = jasmine.createSpyObj<Auth>(['setPersistence']);
  const databaseMock = {};
  const storageMock = {};

  const onlineUserValue = new BehaviorSubject<User | null>(null);
  const firebaseAuthControllerServiceMock = firebaseAuthControllerService;
  const firebaseDatabaseControllerServiceMock =
    firebaseDatabaseControllerService;
  const firebaseStorageControllerServiceMock = firebaseStorageControllerService;
  const matSnackBarMock = jasmine.createSpyObj<MatSnackBar>(['open']);

  let authLocalUserService: AuthLocalUserService;

  // Component
  let fixture: ComponentFixture<AccountSettingsComponent>;
  let component: AccountSettingsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, AccountSettingsComponent],
      providers: [
        {
          provide: Auth,
          useValue: authMock,
        },
        {
          provide: Database,
          useValue: databaseMock,
        },
        {
          provide: Storage,
          useValue: storageMock,
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
        {
          provide: MatSnackBar,
          useValue: matSnackBarMock,
        },
      ] as Provider[],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSettingsComponent);
    component = fixture.componentInstance;
    authLocalUserService = TestBed.inject(AuthLocalUserService);
  });

  beforeEach(() => {
    onlineUserValue.next(null);

    firebaseAuthControllerServiceMock.user.and.returnValue(
      onlineUserValue.asObservable()
    );

    localStorage.setItem(
      authLocalUserService['_USER_PATH'],
      JSON.stringify([exampleLocalUser])
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should wait with showing content until userProfile$ emits data.`, () => {
    // Arrange
    let spinner = fixture.debugElement.query(
      By.css(`[data-test="loading-content-spinner"]`)
    ).nativeElement;
    expect(spinner).toBeTruthy();

    // Act
    authLocalUserService.logIn(
      exampleLocalUser.auth.name,
      exampleLocalUser.auth.value,
      'session'
    );
    fixture.detectChanges();
    spinner = fixture.debugElement.query(
      By.css(`[data-test="loading-content-spinner"]`)
    );

    // Assert
    expect(spinner).toBeFalsy();
  });

  describe(`showing user's picture (online)`, () => {
    it(`should show user's image if it exists.`, () => {
      // Arrange
      onlineUserValue.next(exampleOnlineUser);
      fixture.detectChanges();

      // Act
      const imageEl = getElement<AccountSettingsComponent, HTMLImageElement>(
        fixture,
        `img`
      );

      // Assert
      expect(imageEl).toBeTruthy();
      expect(imageEl.src).toBe('example:url');
    });

    it(`should show app-no-profile-picture when user has no profile picture.`, () => {
      // Arrange
      onlineUserValue.next({ ...exampleOnlineUser, photoURL: null });
      fixture.detectChanges();

      // Act
      const noImageEl = fixture.debugElement.query(
        By.css('app-no-profile-picture')
      ).nativeElement;

      // Assert
      expect(noImageEl).toBeTruthy();
    });
  });

  describe(`changing user's picture (online)`, () => {
    let imageEl: HTMLImageElement;

    beforeEach(() => {
      onlineUserValue.next(exampleOnlineUser);
      fixture.detectChanges();
      imageEl = getElement<AccountSettingsComponent, HTMLImageElement>(
        fixture,
        'img'
      );
      matSnackBarMock.open.and.stub();
    });

    xit(`should show the newly added user's picture as preview.`, async () => {
      // Arrange
      const originalImageSource = imageEl.src;
      const inputEl = getElement<AccountSettingsComponent, HTMLInputElement>(
        fixture,
        `[data-test="profile-picture-input"]`
      );

      // Act
      importFileToInput(inputEl, await createJpegImage());
      fixture.detectChanges();
      // await fixture.whenStable();
      imageEl = getElement<AccountSettingsComponent, HTMLImageElement>(
        fixture,
        'img'
      );

      // Assert
      expect(imageEl).toBeTruthy();
      expect(originalImageSource).not.toBe(imageEl.src);
    });

    xit(`should call onSubmit() with the newly picked user image.`, async () => {
      // Arrange
      const deferBlock = (await fixture.getDeferBlocks())[0];
      await deferBlock.render(DeferBlockState.Complete);
      const spy = spyOn(component, 'onSubmit');
      const originalImageSource = imageEl.src;
      const inputEl = getElement<AccountSettingsComponent, HTMLInputElement>(
        fixture,
        `[data-test="profile-picture-input"]`
      );

      // Act
      importFileToInput(inputEl, await createJpegImage());
      fixture.detectChanges();
      // await fixture.whenStable()
      getElement<AccountSettingsComponent, HTMLButtonElement>(
        fixture,
        `form button[type="submit"]`
      ).click();
      fixture.detectChanges();

      // Assert
      expect(originalImageSource).not.toBe(imageEl.src);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`showing user's picture (local)`, () => {
    it(`should show user's image if it exists.`, () => {
      // Arrange
      authLocalUserService.logIn(
        exampleLocalUser.auth.name,
        exampleLocalUser.auth.value,
        'session'
      );
      fixture.detectChanges();

      // Act
      const imageEl = getElement<AccountSettingsComponent, HTMLImageElement>(
        fixture,
        `img`
      );

      // Assert
      expect(imageEl).toBeTruthy();
      expect(imageEl.src).toBe('example:url');
    });

    it(`should show user's first character if user has no profile picture.`, () => {
      // Arrange
      authLocalUserService.logIn(
        exampleLocalUser.auth.name,
        exampleLocalUser.auth.value,
        'session'
      );
      authLocalUserService.modifyCurrentUser({ profilePictureUrl: undefined });
      fixture.detectChanges();

      // Act
      const singleCharacterEl = fixture.debugElement.query(
        By.css(`[data-test="user-letter-avatar"]`)
      ).nativeElement;

      // Assert
      expect(singleCharacterEl).toBeTruthy();
    });
  });

  describe(`changing user's picture (local)`, () => {
    let imageEl: HTMLImageElement;

    beforeEach(() => {
      authLocalUserService.logIn(
        exampleLocalUser.auth.name,
        exampleLocalUser.auth.value,
        'session'
      );
      fixture.detectChanges();
      imageEl = getElement<AccountSettingsComponent, HTMLImageElement>(
        fixture,
        'img'
      );
      matSnackBarMock.open.and.stub();
    });

    xit(`should show the newly added user's picture as preview.`, async () => {
      // Arrange
      const originalImageSource = imageEl.src;
      const inputEl = getElement<AccountSettingsComponent, HTMLInputElement>(
        fixture,
        `[data-test="profile-picture-input"]`
      );

      // Act
      importFileToInput(inputEl, await createJpegImage());
      fixture.detectChanges();
      // await fixture.whenStable()
      imageEl = getElement<AccountSettingsComponent, HTMLImageElement>(
        fixture,
        'img'
      );

      // Assert
      expect(imageEl).toBeTruthy();
      expect(originalImageSource).not.toBe(imageEl.src);
    });

    xit(`should call onSubmit() with the newly picked user image.`, async () => {
      // Arrange
      const deferBlock = (await fixture.getDeferBlocks())[0];
      await deferBlock.render(DeferBlockState.Complete);
      const spy = spyOn(component, 'onSubmit');
      const originalImageSource = imageEl.src;
      const inputEl = getElement<AccountSettingsComponent, HTMLInputElement>(
        fixture,
        `[data-test="profile-picture-input"]`
      );

      // Act
      importFileToInput(inputEl, await createJpegImage());
      fixture.detectChanges();
      // await fixture.whenStable()
      getElement<AccountSettingsComponent, HTMLButtonElement>(
        fixture,
        `form button[type="submit"]`
      ).click();
      fixture.detectChanges();

      // Assert
      expect(originalImageSource).not.toBe(imageEl.src);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe(`go to previous page button`, () => {
    it(`should call viewTransitionService.goBack() if clicked.`, () => {
      // Arrange
      const spy = spyOn(TestBed.inject(ViewTransitionService), 'goBack');
      onlineUserValue.next(exampleOnlineUser);
      fixture.detectChanges();

      // Act
      fixture.debugElement
        .query(By.css('app-previous-page-button'))
        .triggerEventHandler('clicked');

      // Assert
      const [domEl] = spy.calls.mostRecent().args;
      expect(spy).toHaveBeenCalled();
      expect((domEl as HTMLElement).dataset['test']).toBe('content-element');
    });
  });

  describe(`user's account information change (online).`, () => {
    beforeEach(() => {
      onlineUserValue.next(exampleOnlineUser);
      fixture.detectChanges();
    });

    it(`should render FetchErrorComponent when AccountSettingsOnlineComponent has error.`, async () => {
      // Arrange
      // Act
      const deferBlock = (await fixture.getDeferBlocks())[0];
      await deferBlock.render(DeferBlockState.Error);

      await fixture.whenStable();
      const errorEl = fixture.debugElement.query(
        By.directive(FetchErrorComponent)
      );

      // Assert
      expect(errorEl).toBeTruthy();
      expect(errorEl.nativeElement.innerHTML).toContain(
        'It looks like profile notification is broken.'
      );
    });

    it(`should render spinner when AccountSettingsOnlineComponent is loading.`, async () => {
      // Arrange
      // Act
      const deferBlock = (await fixture.getDeferBlocks())[0];
      await deferBlock.render(DeferBlockState.Loading);

      await fixture.whenStable();
      const spinner = getElement(
        fixture,
        `[data-test="loading-content-online-form"]`
      );

      // Assert
      expect(spinner).toBeTruthy();
    });

    it(`should render the AccountSettingsOnlineComponent from @defer block.`, async () => {
      // Arrange
      // Act
      const deferBlock = (await fixture.getDeferBlocks())[0];
      await deferBlock.render(DeferBlockState.Complete);

      const formComponent = fixture.debugElement.query(
        By.directive(AccountSettingsOnlineComponent)
      );

      // Assert
      expect(formComponent).toBeTruthy();
    });

    it(`should handle submittedChanges Event from AccountSettingsOnlineComponent and pass the 'failure' to result prop.`, async () => {
      // Arrange
      firebaseAuthControllerServiceMock.updateProfile.and.rejectWith(undefined);
      firebaseAuthControllerServiceMock.updatePassword.and
        .rejectWith({ message: 'Soemthing went wrong' })
        .and.rejectWith({ message: 'Something went wrong' });

      const spy = spyOn(component, 'onSubmit').and.callThrough();
      const deferBlock = (await fixture.getDeferBlocks())[0];
      await deferBlock.render(DeferBlockState.Complete);

      let resultValue: UserProfileUpdateResultI | undefined;
      const subscription = component.userProfileUpdateNotifier$.subscribe(
        (newValue) => {
          resultValue = newValue;
        }
      );
      const payload: UserProfileChangesI = {
        authOption: 'password',
        name: 'Wilbur',
        oldEmail: exampleOnlineUser.email as string,
        photoUrl: exampleOnlineUser.photoURL,
        oldPassphrase: 'examplePassword',
        passphrase: 'exampleNewPassword',
      };

      // Act
      const accountSettingsOnlineComponent = fixture.debugElement.query(
        By.directive(AccountSettingsOnlineComponent)
      );
      accountSettingsOnlineComponent.triggerEventHandler(
        'submittedChanges',
        payload
      );

      await controlledTimeout();

      subscription.unsubscribe();

      // Assert
      expect(spy).toHaveBeenCalledOnceWith(payload);
      expect(resultValue?.state).toBe('failure');
    });

    it(`should handle submittedChanges Event from AccountSettingsOnlineComponent and pass the 'success' to result prop.`, async () => {
      // Arrange
      firebaseAuthControllerServiceMock.updateProfile.and.resolveTo(undefined);
      firebaseAuthControllerServiceMock.updatePassword.and.resolveTo(undefined);

      const spy = spyOn(component, 'onSubmit').and.callThrough();
      const deferBlock = (await fixture.getDeferBlocks())[0];
      await deferBlock.render(DeferBlockState.Complete);

      let resultValue: UserProfileUpdateResultI | undefined;
      const subscription = component.userProfileUpdateNotifier$.subscribe(
        (newValue) => {
          resultValue = newValue;
        }
      );
      const payload: UserProfileChangesI = {
        authOption: 'password',
        name: 'Wilbur',
        oldEmail: exampleOnlineUser.email as string,
        photoUrl: exampleOnlineUser.photoURL,
        oldPassphrase: 'examplePassword',
        passphrase: 'exampleNewPassword',
      };

      // Act
      const accountSettingsOnlineComponent = fixture.debugElement.query(
        By.directive(AccountSettingsOnlineComponent)
      );
      accountSettingsOnlineComponent.triggerEventHandler(
        'submittedChanges',
        payload
      );

      await controlledTimeout();

      subscription.unsubscribe();

      // Assert
      expect(spy).toHaveBeenCalledOnceWith(payload);
      expect(resultValue?.state).toBe('success');
    });
  });

  describe(`user's account information change (local).`, () => {
    beforeEach(() => {
      authLocalUserService.logIn(
        exampleLocalUser.auth.name,
        exampleLocalUser.auth.value,
        'session'
      );
      fixture.detectChanges();
    });

    it(`should render spinner when AccountSettingsLocalComponent is loading.`, async () => {
      // Arrange
      // Act
      const deferBlock = (await fixture.getDeferBlocks())[1];
      await deferBlock.render(DeferBlockState.Loading);

      await fixture.whenStable();
      const spinner = getElement(
        fixture,
        `[data-test="loading-content-local-form"]`
      );

      // Assert
      expect(spinner).toBeTruthy();
    });

    it(`should render FetchErrorComponent when AccountSettingsLocalComponent has error.`, async () => {
      // Arrange
      // Act
      const deferBlock = (await fixture.getDeferBlocks())[1];
      await deferBlock.render(DeferBlockState.Error);

      await fixture.whenStable();
      const errorEl = fixture.debugElement.query(
        By.directive(FetchErrorComponent)
      );

      // Assert
      expect(errorEl).toBeTruthy();
      expect(errorEl.nativeElement.innerHTML).toContain(
        'It looks like profile notification is broken.'
      );
    });

    it(`should render the AccountSettingsLocalComponent from @defer block.`, async () => {
      // Arrange

      // Act
      const deferBlock = (await fixture.getDeferBlocks())[1];
      await deferBlock.render(DeferBlockState.Complete);

      const formComponent = fixture.debugElement.query(
        By.directive(AccountSettingsLocalComponent)
      );

      // Assert
      expect(formComponent).toBeTruthy();
    });

    it(`should handle submittedChanges Event from AccountSettingsLocalComponent and pass the 'failure' to result prop.`, async () => {
      // Arrange
      const spy = spyOn(component, 'onSubmit').and.callThrough();

      const deferBlock = (await fixture.getDeferBlocks())[1];
      await deferBlock.render(DeferBlockState.Complete);

      let resultValue: UserProfileUpdateResultI | undefined;
      const subscription = component.userProfileUpdateNotifier$.subscribe(
        (result) => {
          resultValue = result;
        }
      );
      const payload: UserProfileChangesI = {
        profileColor: exampleLocalUser.profileColor,
        authOption: exampleLocalUser.auth.authOption,
        oldPassphrase: '34835',
        passphrase: '124342',
        name: 'Sam_Bridges2020',
      };

      // Act
      const accountSettingsLocalComponent = fixture.debugElement.query(
        By.directive(AccountSettingsLocalComponent)
      );
      accountSettingsLocalComponent.triggerEventHandler(
        'submittedChanges',
        payload
      );

      await fixture.whenStable();
      subscription.unsubscribe();

      // Assert
      expect(spy).toHaveBeenCalledWith(payload);
      expect(resultValue?.state).toBe('failure');
    });

    it(`should handle submittedChanges Event from AccountSettingsLocalComponent and pass the 'success' to result prop.`, async () => {
      // Arrange
      const spy = spyOn(component, 'onSubmit').and.callThrough();

      const deferBlock = (await fixture.getDeferBlocks())[1];
      await deferBlock.render(DeferBlockState.Complete);

      let resultValue: UserProfileUpdateResultI | undefined;
      const subscription = component.userProfileUpdateNotifier$.subscribe(
        (result) => {
          resultValue = result;
        }
      );
      const payload: UserProfileChangesI = {
        profileColor: exampleLocalUser.profileColor,
        authOption: exampleLocalUser.auth.authOption,
        oldPassphrase: exampleLocalUser.auth.value,
        name: 'Sam_Bridges2020',
        passphrase: undefined,
      };

      // Act
      const accountSettingsLocalComponent = fixture.debugElement.query(
        By.directive(AccountSettingsLocalComponent)
      );
      accountSettingsLocalComponent.triggerEventHandler(
        'submittedChanges',
        payload
      );

      await fixture.whenStable();
      subscription.unsubscribe();

      // Assert
      expect(spy).toHaveBeenCalledWith(payload);
      expect(resultValue?.state).toBe('success');
    });
  });
});
