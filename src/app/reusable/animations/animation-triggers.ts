type runWithDelayOptions = {
  timeoutTime?: number;
  delayT?: number;
  reverse?: boolean;
};

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
    removeAnimationClassOnFinish?: boolean;
  }
): Promise<void> {
  el.classList.add(animationClass);
  startAnimation(el);
  return new Promise<void>((resolve) => {
    el.addEventListener('animationend', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (options?.removeAnimationClassOnFinish) {
        finishAnimation(el);
        el.classList.remove(animationClass);
      }
      resolve();
    });
  });
}

/**
 * Runs animations specified in animationClass param
 */
export function runAnimations(
  object: NodeListOf<HTMLElement> | HTMLElement,
  animationClass: string,
  global?: boolean
) {
  if ('style' in object) {
    // if global is true, the object is the parent of animation elements, otherwise it's a target.
    global
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
  { delayT, reverse, timeoutTime }: runWithDelayOptions
) =>
  new Promise<void>((resolve, reject) => {
    const delay = delayT ?? 100,
      calculatedTimeout = delay * elementsArray.length,
      // reverse = reverse,
      lastElement = reverse
        ? elementsArray[0]
        : elementsArray[elementsArray.length - 1];

    if (timeoutTime)
      if (calculatedTimeout > timeoutTime)
        throw new Error(
          `Timeout time is too short, actual value: ${timeoutTime}, minimum time calculated for the elementsArray: ${calculatedTimeout}`
        );

    lastElement.addEventListener('animationend', afterLastAnimation);

    function* runInSequence() {
      for (
        let i = reverse ? elementsArray.length - 1 : 0;
        reverse ? i > -1 : i < elementsArray.length;
        reverse ? i-- : i++
      ) {
        const el = elementsArray[i] as HTMLElement;
        if (!el) reject(new Error('Element not found'));
        el.addEventListener(
          'animationend',
          el === lastElement ? afterLastAnimation : afterAnimation
        );
        yield startAnimation(el);
      }
    }
    const run = runInSequence();
    const runningEachAnimation = setInterval(() => {
      if (run.next().done) {
        clearInterval(runningEachAnimation);
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
      }, timeoutTime ?? calculatedTimeout);
      lastElement.removeEventListener('animationend', afterLastAnimation);
    }
  });
