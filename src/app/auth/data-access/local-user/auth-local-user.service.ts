import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { hsl } from 'random-color-creator';
import { LocalStorageService } from 'src/app/reusable/data-access/localStorage/local-storage.service';
import {
  LocalUserAccount,
  LocalUsers,
  LocalUserFormData,
  LocalUserAuth,
} from '../../utils/Models/LocalAuthModels.interface';

export interface LocalPersistence {
  type: 'session' | 'local' | undefined;
  user: LocalUserAuth | undefined;
  expires: number;
}

type ValidateUserError = {
  code: 'no-accounts' | 'invalid-passkey' | 'user-exists';
  message: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthLocalUserService implements OnDestroy {
  #localStorageService = inject(LocalStorageService);
  #router = inject(Router);
  private rccHsl = hsl;

  private readonly _USER_PATH = 'userData';
  private readonly _REMEMBER_ME_TOKEN = 'localRememberMe';

  private readonly _EXPIRES_AFTER_30_MINUTES = 1000 * 60 * 30;
  private readonly _EXPIRES_AFTER_YEAR = 1000 * 60 * 60 * 24 * 365;

  private _allUsers =
    this.#localStorageService.loadFromStorage<LocalUserAccount[]>(
      this._USER_PATH
    ) || [];

  private _localUserSubject$!: BehaviorSubject<
    LocalUserAccount | null | undefined
  >;
  localUser$!: Observable<LocalUserAccount | null | undefined>;

  constructor() {
    this._checkForExpiredPersistence();

    this._localUserSubject$ = new BehaviorSubject<
      LocalUserAccount | null | undefined
    >(this._checkForPersistedUser());

    this.localUser$ = this._localUserSubject$.asObservable();
  }

  ngOnDestroy(): void {
    this._removeCurrentUser();
    this._localUserSubject$.complete();
  }

  get allUsers(): LocalUsers[] {
    return this._allUsers.map(
      ({ auth: { name }, profileColor, profilePictureUrl }) => ({
        name,
        profileColor,
        profilePictureUrl,
      })
    );
  }

  public get rememberMe(): LocalPersistence {
    const defaultValue: LocalPersistence = {
      type: undefined,
      user: undefined,
      expires: this._setExpiration(undefined),
    };

    const storedValue =
      this.#localStorageService.loadFromStorage<LocalPersistence>(
        this._REMEMBER_ME_TOKEN
      );

    return storedValue || defaultValue;
  }

  public set rememberMe(newValue: Omit<LocalPersistence, 'expires'>) {
    if (newValue.type === undefined) {
      this.#localStorageService.removeFromStorage(this._REMEMBER_ME_TOKEN);
      return;
    }

    const payload = {
      ...newValue,
      expires: this._setExpiration(newValue.type),
    };

    this.#localStorageService.saveToStorage(this._REMEMBER_ME_TOKEN, payload);
  }

  createUser(userData: LocalUserFormData): void | ValidateUserError {
    if (this.doesAccountExist(userData.auth.name)) {
      return { code: 'user-exists', message: 'Account already exists' };
    }

    const user = this._buildUserAccount(userData);
    this._saveNewUser(user);
  }

  logIn(
    name: string,
    passKey: string,
    persistence?: LocalPersistence['type']
  ): void | ValidateUserError {
    const result = this.validateUser(name, passKey);

    if ('message' in result) {
      return result;
    }

    if (persistence !== undefined) {
      this.rememberMe = {
        type: persistence,
        user: result.auth,
      };
    }

    this._loadUserData(result);
  }

  logOut(unsavedUserData?: LocalUserAccount): void {
    const previousData = this._localUserSubject$.value;

    if (!previousData) {
      return this._noLoggedInUser();
    }

    if (unsavedUserData) {
      this.modifyCurrentUser(unsavedUserData);
    }

    this.rememberMe = {
      type: undefined,
      user: undefined,
    };

    this._removeCurrentUser();
    this._redirectToLoginPage();
  }

  modifyCurrentUser(modifiedData: Partial<LocalUserAccount>): boolean {
    if (!this._allUsers.length) {
      console.error('No users on the device');
      return false;
    }

    const previousData = this._localUserSubject$.value;
    if (!previousData) {
      this._noLoggedInUser();
      return false;
    }

    const updatedUser: LocalUserAccount = { ...previousData, ...modifiedData };

    const updatedUserList = this._allUsers.map((user) =>
      user.auth.name === previousData.auth.name ? updatedUser : user
    );

    this._loadUserData(updatedUser);
    this._saveUsersData(updatedUserList);
    return true;
  }

  deleteGroup(id: string) {
    const previousData = this._localUserSubject$.value;

    if (!previousData) {
      this._noLoggedInUser();
      return false;
    }

    if (!previousData.groups.length) {
      console.warn(`No groups in the storage`);
      return false;
    }

    const updatedGroups = previousData.groups.filter(
      ({ id: storedId }) => storedId !== id
    );

    this.modifyCurrentUser({ groups: updatedGroups });

    return true;
  }

  doesAccountExist(accountName: string) {
    return this._allUsers.some(({ auth: { name } }) => name === accountName);
  }

  validateUser(
    name: string,
    passKey: string
  ): LocalUserAccount | ValidateUserError {
    if (!this._allUsers.length) {
      return { code: 'no-accounts', message: 'No Accounts on the device' };
    }

    const user = this._allUsers.find(
      ({ auth }) => name === auth.name && passKey === auth.value
    );

    return user || { code: 'invalid-passkey', message: 'Invalid credentials' };
  }

  private _saveNewUser(data: LocalUserAccount) {
    this._saveUsersData(
      this._allUsers.length ? [...this._allUsers, data] : [data]
    );

    this._loadUserData(data);
  }

  /**
   * It saves the user data changes and keeps the #allUsers up-to-date without re-reading from storage
   */
  private _saveUsersData(data: LocalUserAccount[]): void {
    this.#localStorageService.saveToStorage(this._USER_PATH, data);
    this._allUsers = data;
  }

  private _noLoggedInUser() {
    console.error('Tried to override data without logged user');
  }

  private _loadUserData(userCredentials: LocalUserAccount) {
    this._localUserSubject$.next(userCredentials);
  }

  private _removeCurrentUser(): void {
    this._localUserSubject$.next(null);
  }

  private _createAvatarColor() {
    return this.rccHsl({
      alphaChannel: 1,
      colorParts: ['', '', ''],
      optionsObj: {
        hsl: {
          saturation: { minValue: 25 },
          lightness: { minValue: 25, maxValue: 50 },
        },
      },
    }) as string;
  }

  private _buildUserAccount(formData: LocalUserFormData): LocalUserAccount {
    const account: LocalUserAccount = {
      ...formData,
      profileColor: this._createAvatarColor(),
      groups: [],
    };
    return account;
  }

  private _redirectToLoginPage() {
    this.#router.navigateByUrl('/guest/force=login');
  }

  private _setExpiration(type: LocalPersistence['type']): number {
    const date = new Date();

    if (!type) {
      return date.setTime(0);
    }

    return (
      date.getTime() +
      (type === 'session'
        ? this._EXPIRES_AFTER_30_MINUTES
        : this._EXPIRES_AFTER_YEAR)
    );
  }

  private _checkForPersistedUser(): LocalUserAccount | undefined {
    const savedUser = this.rememberMe.user;

    if (!savedUser) {
      return undefined;
    }

    const result = this.validateUser(savedUser.name, savedUser.value);

    if ('message' in result) {
      return undefined;
    }

    return result;
  }

  private _checkForExpiredPersistence(): void {
    const value = this.#localStorageService.loadFromStorage<LocalPersistence>(
      this._REMEMBER_ME_TOKEN
    );

    if (!value) {
      return;
    }

    const date = Date.now();

    if (value.expires > date) {
      return;
    }

    this.#localStorageService.removeFromStorage(this._REMEMBER_ME_TOKEN);
  }
}
