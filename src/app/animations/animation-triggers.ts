type runWithDelayOptions = {
  timeoutTime?: number;
  delayT?: number;
  reverse?: boolean;
};

import { forEachAndCb, startAnimation, stopAnimation } from './animation-tools';

/**
 * The animation must have finite amount of iterations
 */
export function runAnimationOnce(object: HTMLElement, animationClass: string) {
  object.classList.add(animationClass);
  object.addEventListener('animationend', () => {
    object.classList.remove(animationClass);
  });
}

export function runAnimations(
  object: NodeListOf<HTMLElement> | HTMLElement,
  animationClass: string,
  global?: boolean
) {
  if ('style' in object) {
    global
      ? forEachAndCb(object.querySelectorAll(animationClass), startAnimation)
      : startAnimation(object);
  } else {
    forEachAndCb(object, startAnimation);
  }
}

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
      stopAnimation(e.target as HTMLElement);
    }

    function afterLastAnimation(e: Event) {
      afterAnimation(e);
      setTimeout(() => {
        resolve();
      }, timeoutTime ?? calculatedTimeout);
      lastElement.removeEventListener('animationend', afterLastAnimation);
    }
  });
