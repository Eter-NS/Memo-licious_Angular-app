import { Injectable, NgZone, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { runAnimationOnce } from './animation-triggers';
import { BehaviorSubject } from 'rxjs';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ViewTransitionService {
  #router = inject(Router);
  #location = inject(Location);
  #zone = inject(NgZone);
  #history: Array<string> = [];
  #pageSubject = new BehaviorSubject<'start' | 'end' | 'idle'>('idle');

  private _runAnimationOnce = runAnimationOnce;
  goBackClicked = false;

  get page$() {
    return this.#pageSubject.asObservable();
  }

  constructor() {
    this.#router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects.replace(location.origin, '');

        if (this.#history.at(-1) !== currentUrl) {
          this._pushNewHistoryRecord(currentUrl);
        }
      }
    });
  }

  async goForward(
    element: HTMLElement | Event,
    destination: string
  ): Promise<void> {
    this._modifyStateOnTransition(false);
    await this._runTransition(element, 'fadeOut-to-left-animation');

    const path = destination.startsWith('http')
      ? destination.replace(location.origin, '')
      : destination;

    this.#router.navigateByUrl(path);
    this._pushNewHistoryRecord(path);
  }

  async goBack(element: HTMLElement | Event, fallback?: string): Promise<void> {
    this._modifyStateOnTransition(true);
    await this._runTransition(element, 'fadeOut-to-right-animation');

    this._popLatestHistoryRecord();

    if (this.#history.length > 0) {
      this.#location.back();
    } else {
      this.#router.navigateByUrl(fallback || '/');
    }
  }

  async viewFadeIn(element: HTMLElement | Event): Promise<void> {
    try {
      await this._runTransition(element, 'fadeIn-from-bottom-animation', true);
    } catch (err) {
      console.error(err);
    }
  }

  reloadPage() {
    this.#router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.#router.navigateByUrl(this.#router.url);
    });
  }

  private async _runTransition(
    element: HTMLElement | Event,
    animationClass: string,
    removeClassOnFinish?: boolean
  ): Promise<void> {
    const isEventInstance = element instanceof Event;
    const target = isEventInstance ? (element.target as HTMLElement) : element;

    if (isEventInstance) {
      element.stopPropagation();
      element.preventDefault();
    }

    await this._runAnimationOnce(target, animationClass, {
      removeClassOnFinish,
    });
  }

  private _modifyStateOnTransition(value: boolean) {
    this.goBackClicked = value;
    this.#pageSubject.next('start');
  }

  private _pushNewHistoryRecord(path: string) {
    this.#history = [...this.#history, path];
    this.#pageSubject.next('end');
  }

  private _popLatestHistoryRecord() {
    this.#history.pop();
    this.#history = [...this.#history];
  }
}
