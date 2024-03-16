import { Component, OnDestroy, Renderer2, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { ViewportListenersService } from './reusable/data-access/viewport-listeners/viewport-listeners.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';
import { DarkModeSubscription } from './reusable/data-tools/listenerMethods';
import { ThemeOptions } from './app-view/utils/models/app-settings.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<router-outlet></router-outlet> `,
  imports: [RouterOutlet, MatIconModule],
})
export class AppComponent implements OnDestroy {
  #viewportListenersService = inject(ViewportListenersService);
  #document = inject(DOCUMENT);
  #renderer = inject(Renderer2);

  #darkModeSubscription!: DarkModeSubscription;
  #isDeviceInDarkMode!: boolean;
  currTheme!: ThemeOptions;

  private readonly LIGHT_THEME = 'light';
  private readonly DARK_THEME = 'dark';

  constructor() {
    this._listenForThemeChanges();
    this._listenForAutomaticThemeChanges();
  }

  ngOnDestroy(): void {
    this.#darkModeSubscription?.unsubscribe();
  }

  private _listenForAutomaticThemeChanges() {
    this.#darkModeSubscription =
      this.#viewportListenersService.darkModeListener((event) => {
        this.#isDeviceInDarkMode = event.matches;
        this.currTheme === 'auto' && this._updateBodyClass();
      });
  }

  private _listenForThemeChanges() {
    this.#viewportListenersService.appTheme$
      .pipe(takeUntilDestroyed())
      .subscribe((theme) => {
        this.currTheme = theme;
        this._updateBodyClass();
      });
  }

  private _updateBodyClass() {
    this.#renderer.removeClass(this.#document.body, this.LIGHT_THEME);
    this.#renderer.removeClass(this.#document.body, this.DARK_THEME);

    if (this.currTheme === 'auto') {
      this._toggleTheme();
      return;
    }

    this.#renderer.addClass(this.#document.body, this.currTheme);
  }

  private _toggleTheme() {
    this.#renderer.addClass(
      this.#document.body,
      this.#isDeviceInDarkMode ? this.DARK_THEME : this.LIGHT_THEME
    );
  }
}
