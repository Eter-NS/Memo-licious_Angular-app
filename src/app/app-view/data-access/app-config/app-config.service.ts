import { Injectable, inject } from '@angular/core';
import { LocalStorageService } from 'src/app/reusable/data-access/localStorage/local-storage.service';
import { AppSettingsToken } from '../../utils/models/app-settings.interface';
import { APP_SETTINGS_TOKEN } from '../../utils/tokens/app-settings.tokens';

const initialAppState: AppSettingsToken = {
  deletingMode: 'slow',
  theme: 'auto',
};

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  #localStorageService = inject(LocalStorageService);

  private _currentState =
    this.#localStorageService.loadFromStorage<AppSettingsToken>(
      APP_SETTINGS_TOKEN
    ) || initialAppState;

  get appConfigState() {
    return this._currentState;
  }

  updateConfig(changes: Partial<AppSettingsToken>) {
    const changedState = { ...this.appConfigState, ...changes };

    this._currentState = changedState;
    this.#localStorageService.saveToStorage(APP_SETTINGS_TOKEN, changedState);
  }
}
