import {
  Component,
  DestroyRef,
  OnInit,
  Renderer2,
  inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { ViewportListenersService } from './reusable/data-access/viewport-listeners/viewport-listeners.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';
import { ThemeOptions } from './app-view/utils/models/app-settings.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<router-outlet></router-outlet> `,
  imports: [RouterOutlet, MatIconModule],
})
export class AppComponent implements OnInit {
  #viewportListenersService = inject(ViewportListenersService);
  #document = inject(DOCUMENT);
  #renderer = inject(Renderer2);
  #destroyRef = inject(DestroyRef);

  private _isDeviceInDarkMode!: boolean;
  private _currTheme!: ThemeOptions;

  private readonly LIGHT_THEME = 'light';
  private readonly DARK_THEME = 'dark';

  ngOnInit() {
    this._listenForThemeChanges();
    this._listenForAutomaticThemeChanges();
  }

  private _listenForThemeChanges() {
    this.#viewportListenersService.appTheme$
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((theme) => {
        this._currTheme = theme;
        this._updateBodyClass();
      });
  }

  private _listenForAutomaticThemeChanges() {
    this.#viewportListenersService.darkModeListener$
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((event) => {
        this._isDeviceInDarkMode = event.matches;

        if (this._currTheme === 'auto') {
          this._updateBodyClass();
        }
      });
  }

  private _updateBodyClass() {
    this.#renderer.removeClass(this.#document.body, this.LIGHT_THEME);
    this.#renderer.removeClass(this.#document.body, this.DARK_THEME);

    if (this._currTheme === 'auto') {
      this._toggleTheme();
      return;
    }

    this.#renderer.addClass(this.#document.body, this._currTheme);
  }

  private _toggleTheme() {
    this.#renderer.addClass(
      this.#document.body,
      this._isDeviceInDarkMode ? this.DARK_THEME : this.LIGHT_THEME
    );
  }
}
