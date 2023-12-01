import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, filter } from 'rxjs';
import { hasNestedKey } from 'src/app/reusable/data-tools/objectTools';
import { LocalStorageService } from 'src/app/reusable/localStorage/local-storage.service';
import { environment } from 'src/environments/environment.dev';
import { LocalUserData } from './Models/UserDataModels';
import { Router } from '@angular/router';

const REMEMBER_ME_TOKEN = 'localRememberMe';

@Injectable({
  providedIn: 'root',
})
export class AuthLocalUserService {
  #localStorageService = inject(LocalStorageService);
  #router = inject(Router);

  #localUser$ = new BehaviorSubject<LocalUserData | null | undefined>(
    undefined
  );
  #userInstance$ = this.#localUser$
    .asObservable()
    .pipe(filter((user) => !!user));

  public get rememberMe(): boolean {
    const defaultValue = false;
    return (
      this.#localStorageService.loadFromStorage(REMEMBER_ME_TOKEN) ||
      defaultValue
    );
  }

  public set rememberMe(action: boolean) {
    this.#localStorageService.saveToStorage(REMEMBER_ME_TOKEN, action);
  }

  createUser(userData: LocalUserData) {
    this.modifyCurrentUser(userData);
    this.redirectToApp();
  }

  logIn(name: string, passKey: string) {
    const user = this.validateUser(name, passKey);
    if ('error' in user) {
      return user;
    } else {
      this.loadUserData(user);
      return this.redirectToApp;
    }
  }

  logout() {
    this.removeCurrentUser();
    this.#router.navigateByUrl('/online:force=login');
  }

  getCurrentUser() {
    return this.#userInstance$;
  }

  checkCurrentUserProperty(key: string): boolean {
    let doesKeyExists = false;
    const subscription = this.#localUser$.subscribe({
      next: (userModel) => {
        if (!userModel) return;
        doesKeyExists = hasNestedKey(userModel, key);
      },
    });
    subscription.unsubscribe();
    return doesKeyExists;
  }

  modifyCurrentUser(modifiedData: LocalUserData): void {
    this.#localUser$.next({ ...this.#localUser$.getValue(), ...modifiedData });
    this.#localStorageService.saveToStorage(
      environment.USER_PATH,
      modifiedData
    );
  }

  private validateUser(
    name: string,
    passKey: string
  ): LocalUserData | { error: string } {
    const accounts = this.#localStorageService.loadFromStorage<LocalUserData[]>(
      environment.USER_PATH
    );
    if (!accounts) return { error: 'No Accounts on the device' };
    const user = accounts.find(
      (userCredentials) =>
        name === userCredentials.auth.name &&
        passKey === userCredentials.auth.value
    );

    return user || { error: 'Invalid credentials' };
  }

  private loadUserData(userCredentials: LocalUserData) {
    this.#localUser$.next(userCredentials);
  }

  private removeCurrentUser(): void {
    this.#localUser$.next(null);
  }

  private redirectToApp() {
    return this.#router.navigateByUrl('/app');
  }
}
