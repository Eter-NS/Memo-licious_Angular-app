import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { runAnimationOnce } from '../../utils/animations/animation-triggers';
import { BehaviorSubject } from 'rxjs';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { readMessageProperty } from '../../utils/data-tools/readMessageProperty';

@Injectable({
  providedIn: 'root',
})
export class ViewTransitionService {
  #router = inject(Router);
  #location = inject(Location);

  private _history: Array<string> = [];
  private _pageSubject = new BehaviorSubject<'start' | 'end' | 'idle'>('idle');

  private _runAnimationOnce = runAnimationOnce;
  goBackClicked = false;

  get pageState$() {
    return this._pageSubject.asObservable();
  }

  constructor() {
    this.#router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects.replace(location.origin, '');

        if (this._history.at(-1) !== currentUrl) {
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

    await this.#router.navigateByUrl(path);
    this._pushNewHistoryRecord(path);
  }

  async goBack(element: HTMLElement | Event, fallback?: string): Promise<void> {
    this._modifyStateOnTransition(true);
    await this._runTransition(element, 'fadeOut-to-right-animation');

    this._popLatestHistoryRecord();

    if (this._history.length > 0) {
      this.#location.back();
    } else {
      await this.#router.navigateByUrl(fallback || '/');
    }
  }

  async viewFadeIn(element: HTMLElement | Event): Promise<void> {
    try {
      await this._runTransition(element, 'fadeIn-from-bottom-animation', true);
    } catch (err) {
      console.error(readMessageProperty(err) || err);
    }
  }

  async pageReload() {
    try {
      const currentPage = this.#router.url;

      await this.#router.navigateByUrl('/', {
        skipLocationChange: true,
      });

      return await this.#router.navigateByUrl(currentPage);
    } catch (err) {
      console.error(readMessageProperty(err) || err);
      return false;
    }
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
    this._pageSubject.next('start');
  }

  private _pushNewHistoryRecord(path: string) {
    this._history = [...this._history, path];
    this._pageSubject.next('end');
  }

  private _popLatestHistoryRecord() {
    this._history.pop();
    this._history = [...this._history];
  }
}
