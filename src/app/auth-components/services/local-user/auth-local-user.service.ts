import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, filter, map } from 'rxjs';
import { LocalStorageService } from 'src/app/reusable/localStorage/local-storage.service';
import { environment } from 'src/environments/environment.dev';
import { LocalUserData } from '../Models/UserDataModels';
import { Router } from '@angular/router';

const REMEMBER_ME_TOKEN = 'localRememberMe';

type ValidateUserError = { error: string };

@Injectable({
  providedIn: 'root',
})
export class AuthLocalUserService implements OnDestroy {
  #localStorageService = inject(LocalStorageService);
  #router = inject(Router);

  #allUsers =
    this.#localStorageService.loadFromStorage<LocalUserData[]>(
      environment.USER_PATH
    ) ?? [];

  #localUserSubject$ = new BehaviorSubject<LocalUserData | null | undefined>(
    undefined
  );

  ngOnDestroy(): void {
    this.removeCurrentUser();
    this.#localUserSubject$.unsubscribe();
  }

  /**
   * Contains latest user data from the localStorage.
   * @warn Remember to unsubscribe before destroying the component.
   */
  getCurrentUser() {
    return this.#localUserSubject$.asObservable().pipe(
      filter((user) => !!user),
      map((user) => user as LocalUserData)
    );
  }

  get localUser$() {
    return this.#localUserSubject$.asObservable();
  }

  public get rememberMe(): boolean {
    const defaultValue = false;

    return (
      this.#localStorageService.loadFromStorage<boolean>(REMEMBER_ME_TOKEN) ||
      defaultValue
    );
  }

  public set rememberMe(action: boolean) {
    this.#localStorageService.saveToStorage(REMEMBER_ME_TOKEN, action);
  }

  createUser(userData: LocalUserData) {
    if (this.doesAccountAlreadyExist(userData.auth.name)) {
      return { error: 'Account already exists' };
    }

    this.saveNewUser(userData);
    return;
  }

  logIn(name: string, passKey: string) {
    const user = this.validateUser(name, passKey);
    if ('error' in user) {
      return user;
    }

    this.loadUserData(user);
    return;
  }

  logout() {
    this.removeCurrentUser();
    this.redirectToLoginPage();
  }

  modifyCurrentUser(modifiedData: LocalUserData): void {
    const previousData = this.#localUserSubject$.getValue();
    let payload: LocalUserData;

    if (previousData) {
      payload = { ...previousData, ...modifiedData };
    } else {
      console.error('Tried to override data without logged user');
      return;
    }

    if (!this.#allUsers.length) {
      console.error('No users on the device');
    }

    this.#localUserSubject$.next(payload);

    this.#localStorageService.saveToStorage<LocalUserData[]>(
      environment.USER_PATH,
      [...(this.#allUsers as LocalUserData[]), payload]
    );
  }

  private saveNewUser(data: LocalUserData) {
    this.#localStorageService.saveToStorage<LocalUserData[]>(
      environment.USER_PATH,
      this.#allUsers.length ? [...this.#allUsers, data] : [data]
    );

    this.loadUserData(data);
    this.#allUsers.push(data);
  }

  private validateUser(
    name: string,
    passKey: string
  ): LocalUserData | ValidateUserError {
    if (!this.#allUsers.length) return { error: 'No Accounts on the device' };

    const user = this.#allUsers.find(
      ({ auth }) => name === auth.name && passKey === auth.value
    );

    return user || { error: 'Invalid credentials' };
  }

  private doesAccountAlreadyExist(accountName: string) {
    return this.#allUsers.some(({ auth: { name } }) => name === accountName);
  }

  private loadUserData(userCredentials: LocalUserData) {
    this.#localUserSubject$.next(userCredentials);
  }

  private removeCurrentUser(): void {
    this.#localUserSubject$.next(null);
  }

  redirectToLoginPage() {
    this.#router.navigateByUrl('/guest:force=login');
  }
}
