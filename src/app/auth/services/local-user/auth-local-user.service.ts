import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { hsl } from 'random-color-creator';
import { LocalStorageService } from 'src/app/reusable/localStorage/local-storage.service';
import {
  LocalUserAccount,
  LocalUsers,
  LocalUserFormData,
  LocalUserAuth,
} from '../Models/LocalAuthModels.interface';

export interface LocalPersistence {
  type: 'session' | 'local' | undefined;
  user: LocalUserAuth | undefined;
  expires: number;
}

type ValidateUserError = {
  code: 'no-accounts' | 'invalid-passkey' | 'user-exists';
  message: string;
};

const USER_PATH = 'userData';
const REMEMBER_ME_TOKEN = 'localRememberMe';

const EXPIRES_AFTER_30_MINUTES = 1000 * 60 * 30;
const EXPIRES_AFTER_YEAR = 1000 * 60 * 60 * 24 * 365;

@Injectable({
  providedIn: 'root',
})
export class AuthLocalUserService implements OnDestroy {
  #localStorageService = inject(LocalStorageService);
  #router = inject(Router);
  private rccHsl = hsl;

  #allUsers =
    this.#localStorageService.loadFromStorage<LocalUserAccount[]>(USER_PATH) ||
    [];

  #localUserSubject$!: BehaviorSubject<LocalUserAccount | null | undefined>;

  constructor() {
    this._checkForExpiredPersistence();

    this.#localUserSubject$ = new BehaviorSubject<
      LocalUserAccount | null | undefined
    >(this._checkForPersistedUser());
  }

  ngOnDestroy(): void {
    this._removeCurrentUser();
    this.#localUserSubject$.complete();
  }

  get localUser$() {
    return this.#localUserSubject$.asObservable();
  }

  get allUsers(): LocalUsers[] {
    return this.#allUsers.map(
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
        REMEMBER_ME_TOKEN
      );

    return storedValue || defaultValue;
  }

  public set rememberMe(newValue: Omit<LocalPersistence, 'expires'>) {
    if (newValue.type === undefined) {
      this.#localStorageService.removeFromStorage(REMEMBER_ME_TOKEN);
      return;
    }

    const payload = {
      ...newValue,
      expires: this._setExpiration(newValue.type),
    };

    this.#localStorageService.saveToStorage(REMEMBER_ME_TOKEN, payload);
  }

  createUser(userData: LocalUserFormData): void | ValidateUserError {
    if (this._doesAccountExist(userData.auth.name)) {
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
    const result = this._validateUser(name, passKey);

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
    const previousData = this.#localUserSubject$.value;

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
    if (!this.#allUsers.length) {
      console.error('No users on the device');
      return false;
    }

    const previousData = this.#localUserSubject$.value;
    if (!previousData) {
      this._noLoggedInUser();
      return false;
    }

    const updatedUser: LocalUserAccount = { ...previousData, ...modifiedData };

    const updatedUserList = this.#allUsers.map((user) => {
      if (user.auth.name === previousData.auth.name) {
        return updatedUser;
      }

      return user;
    });

    this._loadUserData(updatedUser);
    this._saveUsersData(updatedUserList);
    return true;
  }

  deleteGroup(id: string) {
    const previousData = this.#localUserSubject$.value;

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

  private _saveNewUser(data: LocalUserAccount) {
    this._saveUsersData(
      this.#allUsers.length ? [...this.#allUsers, data] : [data]
    );

    this._loadUserData(data);
  }

  /**
   * It saves the user data changes and keeps the #allUsers up-to-date without re-reading from storage
   */
  private _saveUsersData(data: LocalUserAccount[]): void {
    this.#localStorageService.saveToStorage(USER_PATH, data);
    this.#allUsers = data;
  }

  private _noLoggedInUser() {
    console.error('Tried to override data without logged user');
  }

  private _validateUser(
    name: string,
    passKey: string
  ): LocalUserAccount | ValidateUserError {
    if (!this.#allUsers.length) {
      return { code: 'no-accounts', message: 'No Accounts on the device' };
    }

    const user = this.#allUsers.find(
      ({ auth }) => name === auth.name && passKey === auth.value
    );

    return user || { code: 'invalid-passkey', message: 'Invalid credentials' };
  }

  private _doesAccountExist(accountName: string) {
    return this.#allUsers.some(({ auth: { name } }) => name === accountName);
  }

  private _loadUserData(userCredentials: LocalUserAccount) {
    this.#localUserSubject$.next(userCredentials);
  }

  private _removeCurrentUser(): void {
    this.#localUserSubject$.next(null);
  }

  private _createAvatarColor() {
    return this.rccHsl({
      alphaChannel: 1,
      colorParts: ['', '', ''],
      optionsObj: {
        hsl: { saturation: { minValue: 25 }, lightness: { maxValue: 50 } },
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
      (type === 'session' ? EXPIRES_AFTER_30_MINUTES : EXPIRES_AFTER_YEAR)
    );
  }

  private _checkForPersistedUser(): LocalUserAccount | undefined {
    const savedUser = this.rememberMe.user;

    if (!savedUser) {
      return undefined;
    }

    const result = this._validateUser(savedUser.name, savedUser.value);

    if ('message' in result) {
      return undefined;
    }

    return result;
  }

  private _checkForExpiredPersistence(): void {
    const value =
      this.#localStorageService.loadFromStorage<LocalPersistence>(
        REMEMBER_ME_TOKEN
      );

    if (!value) {
      return;
    }

    const date = Date.now();

    if (value.expires > date) {
      return;
    }

    this.#localStorageService.removeFromStorage(REMEMBER_ME_TOKEN);
  }
}
