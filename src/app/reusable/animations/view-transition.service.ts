import { Injectable, OnDestroy, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { runAnimationOnce } from './animation-triggers';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ViewTransitionService implements OnDestroy {
  #router = inject(Router);
  #location = inject(Location);
  #history: Array<string> = [];
  #pageSubject = new BehaviorSubject<'start' | 'end' | 'idle'>('idle');
  #subscription!: Subscription;

  private runAnimationOnce = runAnimationOnce;
  goBackClicked = false;

  get page$() {
    return this.#pageSubject.asObservable();
  }

  constructor() {
    this.#subscription = this.#router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.#history.at(-1) !== event.urlAfterRedirects) {
          this.#history.push(event.urlAfterRedirects);
          this.#pageSubject.next('end');
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.#subscription.unsubscribe();
  }

  async goForward(element: HTMLElement | Event, destination: string) {
    this.modifyStateOnTransition(false);
    await this.runTransition(element, 'fadeOut-to-left-animation');

    const path = destination.startsWith('http')
      ? destination.replace(location.origin, '')
      : destination;

    await this.#router.navigateByUrl(path);

    this.#history.push(path);
    this.#pageSubject.next('end');
  }

  async goBack(element: HTMLElement | Event, fallback?: string) {
    this.modifyStateOnTransition(true);
    await this.runTransition(element, 'fadeOut-to-right-animation');
    this.#history.pop();
    if (this.#history.length > 0) {
      this.#location.back();
    } else {
      this.#router.navigateByUrl(fallback || '/');
    }
  }

  async viewFadeIn(element: HTMLElement | Event) {
    await this.runTransition(element, 'fadeIn-from-bottom-animation', true);
  }

  private async runTransition(
    element: HTMLElement | Event,
    animationClass: string,
    removeAnimationClassOnFinish?: boolean
  ) {
    const target =
      element instanceof Event ? (element.target as HTMLElement) : element;

    const options = {
      removeAnimationClassOnFinish,
    };

    if (element instanceof Event) {
      element.stopPropagation();
      element.preventDefault();
    }

    await this.runAnimationOnce(target, animationClass, options);
  }

  private modifyStateOnTransition(clickState: boolean) {
    this.#pageSubject.next('start');
    this.goBackClicked = clickState;
  }
}
