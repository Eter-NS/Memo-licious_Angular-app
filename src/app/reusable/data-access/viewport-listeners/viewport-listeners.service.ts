import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, shareReplay } from 'rxjs';
import { darkModeListener, throttle } from '../../data-tools/listenerMethods';
import { ThemeOptions } from 'src/app/app-view/utils/models/app-settings.interface';
import { AppConfigService } from 'src/app/app-view/data-access/app-config/app-config.service';

@Injectable({
  providedIn: 'root',
})
export class ViewportListenersService {
  #appConfigService = inject(AppConfigService);
  #breakpointObserver = inject(BreakpointObserver);

  private _darkModeListener = darkModeListener;
  private _throttle = throttle;

  #appTheme = new BehaviorSubject<ThemeOptions>(
    this.#appConfigService.appConfigState.theme
  );

  get appTheme$() {
    return this.#appTheme.asObservable();
  }

  get isHandset$(): Observable<boolean> {
    return this.#breakpointObserver.observe(Breakpoints.Handset).pipe(
      map((result) => result.matches),
      shareReplay(1)
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  darkModeListener(cb: (...args: any[]) => void) {
    return this._darkModeListener(this._throttle(cb, 1000 / 30));
  }

  changeTheme(value: ThemeOptions) {
    this.#appTheme.next(value);

    this.#appConfigService.updateConfig({ theme: value });
  }
}
