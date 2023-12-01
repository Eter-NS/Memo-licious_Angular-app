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
  goBackClicked = false;
  subscription!: Subscription;
  pageSubject = new BehaviorSubject<'start' | 'end' | 'idle'>('idle');
  page$ = this.pageSubject.asObservable();

  constructor() {
    this.subscription = this.#router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.#history.at(-1) !== event.urlAfterRedirects)
          this.pageSubject.next('end');
        this.#history.push(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async goForward(element: HTMLElement | Event, destination: string) {
    this.modifyStateOnTransition(false);
    await this.runTransition(element, 'fadeOut-to-left-animation');
    destination.startsWith('http')
      ? await this.#router.navigateByUrl(
          destination.replace(location.origin, '')
        )
      : await this.#router.navigateByUrl(destination);
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
    if (element instanceof Event) {
      element.stopPropagation();
      element.preventDefault();
      await runAnimationOnce(element.target as HTMLElement, animationClass, {
        removeAnimationClassOnFinish,
      });
    } else
      await runAnimationOnce(element, animationClass, {
        removeAnimationClassOnFinish,
      });
  }

  private modifyStateOnTransition(clickState: boolean) {
    this.pageSubject.next('start');
    this.goBackClicked = clickState;
  }
}
