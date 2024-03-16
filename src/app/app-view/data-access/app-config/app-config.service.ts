import { Injectable, inject } from '@angular/core';
import { LocalStorageService } from 'src/app/reusable/localStorage/local-storage.service';
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

  #currentState =
    this.#localStorageService.loadFromStorage<AppSettingsToken>(
      APP_SETTINGS_TOKEN
    ) || initialAppState;

  get appConfigState() {
    return this.#currentState;
  }

  updateConfig(changes: Partial<AppSettingsToken>) {
    const changedState = { ...this.appConfigState, ...changes };

    this.#currentState = changedState;
    this.#localStorageService.saveToStorage(APP_SETTINGS_TOKEN, changedState);
  }
}
