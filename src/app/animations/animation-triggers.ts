type runWithDelayOptions = {
  timeoutTime?: number;
  delay?: number;
  reverse?: boolean;
};

import {
  iterateOverElementsAndDoSomething,
  startAnimation,
} from './animation-tools';

export function runAnimations(
  object: NodeListOf<HTMLElement> | HTMLElement,
  animationClass: string,
  global?: boolean
) {
  if ('style' in object) {
    global
      ? iterateOverElementsAndDoSomething(
          object.querySelectorAll(animationClass),
          startAnimation
        )
      : startAnimation(object);
  } else {
    iterateOverElementsAndDoSomething(object, startAnimation);
  }
}

export const runWithDelay = (
  elementsArray:
    | NodeListOf<HTMLElement | Element>
    | HTMLCollection
    | HTMLElement[],
  options?: runWithDelayOptions
) =>
  new Promise<void>((resolve, reject) => {
    const run = runInSequence();
    const delay = options?.delay ? options.delay : 100;
    const reverse = options?.reverse;
    const lastElement = reverse
      ? elementsArray[0]
      : elementsArray[elementsArray.length - 1];

    lastElement.addEventListener('animationend', afterLastAnimation);

    const runningEachAnimation = setInterval(() => {
      if (run.next().done) {
        clearInterval(runningEachAnimation);
      }
    }, delay);

    function* runInSequence() {
      for (
        let i = reverse ? elementsArray.length - 1 : 0;
        reverse ? i > -1 : i < elementsArray.length;
        reverse ? i-- : i++
      ) {
        const el = elementsArray[i] as HTMLElement;
        if (!el) reject(new Error('Element not found'));

        yield startAnimation(el);
      }
    }

    function removePlayState() {
      for (let i = 0; i < elementsArray.length; i++) {
        const el = elementsArray[i] as HTMLElement;
        if (!el) reject(new Error('Element not found'));
        el.classList.remove('play');
      }
    }

    function afterLastAnimation(e: Event) {
      removePlayState();

      setTimeout(
        () => {
          resolve();
        },
        options?.timeoutTime ? options.timeoutTime : 500
      );
      lastElement.removeEventListener('animationend', afterLastAnimation);
    }
  });
