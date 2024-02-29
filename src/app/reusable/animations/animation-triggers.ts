type runWithDelayOptions = {
  timeout?: number;
  delayT?: number;
  reverse?: boolean;
};

import { environment } from 'src/environments/environment.dev';
import {
  forEachAndCb,
  startAnimation,
  finishAnimation,
} from './animation-tools';

/**
 * The animation must have finite amount of iterations
 */
export function runAnimationOnce(
  el: HTMLElement,
  animationClass: string,
  options?: {
    removeClassOnFinish?: boolean;
  }
): Promise<void> {
  el.classList.add(animationClass);
  startAnimation(el);

  return new Promise<void>((resolve) => {
    const effect = (e: AnimationEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (options?.removeClassOnFinish) {
        finishAnimation(el);
        el.classList.remove(animationClass);
      }

      el.removeEventListener('animationend', effect);

      resolve();
    };

    el.addEventListener('animationend', effect);
  });
}

/**
 * Runs animations specified in animationClass param
 */
export function runAnimations(
  object: NodeListOf<HTMLElement> | HTMLElement | Array<HTMLElement>,
  animationClass?: string,
  parent?: boolean
): void {
  if ('classList' in object) {
    // if global is true, the object is the parent of animation elements, otherwise it's a target.
    parent && animationClass
      ? forEachAndCb(object.querySelectorAll(animationClass), startAnimation)
      : startAnimation(object);
  } else {
    forEachAndCb(object, startAnimation);
  }
}

/**
 * Runs animations in sequence with a specified delay
 */
export const runWithDelay = (
  elementsArray:
    | NodeListOf<HTMLElement | Element>
    | HTMLCollection
    | Array<HTMLElement>,
  options?: runWithDelayOptions
) =>
  new Promise<void>((resolve, reject) => {
    const delay = options?.delayT ?? 100,
      calculatedTimeout = delay * elementsArray.length,
      lastElement = options?.reverse
        ? elementsArray[0]
        : elementsArray[elementsArray.length - 1];

    if (
      options?.timeout &&
      options.timeout < calculatedTimeout &&
      !environment.production
    ) {
      console.warn(`Your timeout is lower than recommended one`);
    }

    function* runInSequence() {
      for (
        let i = options?.reverse ? elementsArray.length - 1 : 0;
        options?.reverse ? i > -1 : i < elementsArray.length;
        options?.reverse ? i-- : i++
      ) {
        const el = elementsArray[i] as HTMLElement;
        if (!el) {
          reject(new Error(`Element ${i} was not found`));
          return;
        }
        el.addEventListener(
          'animationend',
          el === lastElement ? afterLastAnimation : afterAnimation
        );
        yield startAnimation(el);
      }
    }
    const run = runInSequence();
    const intervalId = setInterval(() => {
      if (run.next().done) {
        clearInterval(intervalId);
      }
    }, delay);

    function afterAnimation(e: Event) {
      e.stopPropagation();
      e.preventDefault();

      finishAnimation(e.target as HTMLElement);
    }

    function afterLastAnimation(e: Event) {
      afterAnimation(e);

      setTimeout(() => {
        resolve();
      }, options?.timeout ?? calculatedTimeout);

      lastElement.removeEventListener('animationend', afterLastAnimation);
    }
  });
