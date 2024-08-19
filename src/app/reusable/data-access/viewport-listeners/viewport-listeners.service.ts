import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  map,
  shareReplay,
  throttleTime,
} from 'rxjs';
import { darkModeListener } from '../../utils/data-tools/listenerMethods';
import { ThemeOptions } from 'src/app/app-view/utils/models/app-settings.interface';
import { AppConfigService } from 'src/app/app-view/data-access/app-config/app-config.service';

@Injectable({
  providedIn: 'root',
})
export class ViewportListenersService {
  #appConfigService = inject(AppConfigService);
  #breakpointObserver = inject(BreakpointObserver);

  private _darkModeListener = darkModeListener;

  private _appTheme = new BehaviorSubject<ThemeOptions>(
    this.#appConfigService.appConfigState.theme
  );

  get appTheme$() {
    return this._appTheme.asObservable();
  }

  get isHandset$(): Observable<boolean> {
    return this.#breakpointObserver.observe(Breakpoints.Handset).pipe(
      map((result) => result.matches),
      shareReplay({ refCount: true, bufferSize: 1 })
    );
  }

  get darkModeListener$() {
    return this._darkModeListener().pipe(throttleTime(1000 / 30));
  }

  changeTheme(value: ThemeOptions) {
    this._appTheme.next(value);

    this.#appConfigService.updateConfig({ theme: value });
  }
}
