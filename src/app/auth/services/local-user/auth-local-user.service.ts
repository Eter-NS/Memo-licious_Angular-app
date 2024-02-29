import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from 'src/app/reusable/localStorage/local-storage.service';

import {
  LocalUserAccount,
  LocalUserFormData,
  LocalUsers,
} from '../Models/UserDataModels';
import { Router } from '@angular/router';
import { hsl } from 'random-color-creator';

export interface LocalPersistence {
  action: boolean;
  user: LocalUserAccount | undefined;
}

const USER_PATH = 'userData';
const REMEMBER_ME_TOKEN = 'localRememberMe';

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

  #allUsers =
    this.#localStorageService.loadFromStorage<LocalUserAccount[]>(USER_PATH) ??
    [];

  #localUserSubject$ = new BehaviorSubject<LocalUserAccount | null | undefined>(
    undefined
  );

  constructor() {
    this.readPersistence();
  }

  ngOnDestroy(): void {
    this.removeCurrentUser();
    this.#localUserSubject$.complete();
    this.#localUserSubject$.unsubscribe();
  }

  get localUser$() {
    return this.#localUserSubject$.asObservable();
  }

  get allUsers(): LocalUsers[] {
    return this.#allUsers.map(({ auth: { name }, profileColor }) => ({
      name,
      profileColor,
    }));
  }

  public get rememberMe(): LocalPersistence {
    const defaultValue = {
      action: false,
      user: undefined,
    };

    const storedValue =
      this.#localStorageService.loadFromStorage<LocalPersistence>(
        REMEMBER_ME_TOKEN
      );

    return storedValue || defaultValue;
  }

  public set rememberMe(actionObj: LocalPersistence) {
    const defaultValue: LocalPersistence = { action: false, user: undefined };

    this.#localStorageService.saveToStorage(
      REMEMBER_ME_TOKEN,
      actionObj.action == false ? defaultValue : actionObj
    );
  }

  createUser(userData: LocalUserFormData): void | ValidateUserError {
    if (this.doesAccountExist(userData.auth.name)) {
      return { code: 'user-exists', message: 'Account already exists' };
    }

    const user = this.buildUserAccount(userData);

    this.saveNewUser(user);
  }

  logIn(
    name: string,
    passKey: string,
    persistence?: boolean
  ): void | ValidateUserError {
    const user = this.validateUser(name, passKey);

    if ('message' in user) {
      return user;
    }

    if (persistence !== undefined) {
      this.rememberMe = {
        action: persistence,
        user,
      };
    }

    this.loadUserData(user);
  }

  logOut(unsavedUserData?: LocalUserAccount): void {
    const previousData = this.#localUserSubject$.getValue();

    if (!previousData) {
      return this.noLoggedInUser();
    }

    if (unsavedUserData) {
      this.modifyCurrentUser(unsavedUserData);
    }

    this.removeCurrentUser();
    this.redirectToLoginPage();
  }

  modifyCurrentUser(modifiedData: Partial<LocalUserAccount>): boolean {
    if (!this.#allUsers.length) {
      console.error('No users on the device');
      return false;
    }

    const previousData = this.#localUserSubject$.value;

    if (!previousData) {
      this.noLoggedInUser();
      return false;
    }

    const updatedUser: LocalUserAccount = { ...previousData, ...modifiedData };

    const updatedUserList = this.#allUsers.map((user) => {
      if (user.auth.name === previousData.auth.name) {
        return updatedUser;
      }

      return user;
    });

    this.loadUserData(updatedUser);
    this.saveUsersData(updatedUserList);

    return true;
  }

  deleteGroup(id: string) {
    const previousData = this.#localUserSubject$.value;

    if (!previousData) {
      this.noLoggedInUser();
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

  private saveNewUser(data: LocalUserAccount) {
    this.saveUsersData(
      this.#allUsers.length ? [...this.#allUsers, data] : [data]
    );

    this.loadUserData(data);
  }

  /**
   * It saves the user data changes and keeps the #allUsers up-to-date without re-reading from storage
   */
  private saveUsersData(data: LocalUserAccount[]): void {
    this.#localStorageService.saveToStorage(USER_PATH, data);
    this.#allUsers = data;
  }

  private noLoggedInUser() {
    console.error('Tried to override data without logged user');
  }

  private validateUser(
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

  private doesAccountExist(accountName: string) {
    return this.#allUsers.some(({ auth: { name } }) => name === accountName);
  }

  private loadUserData(userCredentials: LocalUserAccount) {
    this.#localUserSubject$.next(userCredentials);
  }

  private removeCurrentUser(): void {
    this.#localUserSubject$.next(null);
  }

  private createAvatarColor() {
    return this.rccHsl({
      alphaChannel: 1,
      colorParts: ['', '', ''],
      optionsObj: {
        hsl: { saturation: { minValue: 25 }, lightness: { maxValue: 50 } },
      },
    }) as string;
  }

  private buildUserAccount(formData: LocalUserFormData): LocalUserAccount {
    const account: LocalUserAccount = {
      ...formData,
      profileColor: this.createAvatarColor(),
      groups: [],
    };
    return account;
  }

  redirectToLoginPage() {
    this.#router.navigateByUrl('/guest/force=login');
  }

  private readPersistence() {
    const { action, user } = this.rememberMe;

    if (action && user) {
      this.logIn(user.auth.name, user.auth.value);
    }
  }
}
