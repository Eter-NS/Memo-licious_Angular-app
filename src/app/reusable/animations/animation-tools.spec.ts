import {
  addAnimations,
  finishAnimation,
  forEachAndCb,
  removeAnimations,
  startAnimation,
} from './animation-tools';

describe(`animation-tools`, () => {
  describe(`forEachAndCb()`, () => {
    it(`should run the callback function with DOM element`, () => {
      const elementArray = Array.from({ length: 2 }).map(() =>
        document.createElement('div')
      );
      const spy = jasmine.createSpy(`spy`);

      forEachAndCb(elementArray, spy);

      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe(`addAnimations()`, () => {
    it(`should apply the animation to the DOM element`, () => {
      const element = document.createElement('div');
      const animation = `example-css-animation`;

      addAnimations(element, animation);

      expect(element.classList.contains(animation)).toBeTrue();
    });

    it(`should apply the animation to the array of DOM elements`, () => {
      const elements = Array.from({ length: 10 }).map(() =>
        document.createElement('div')
      );
      const animation = `example-css-animation`;

      addAnimations(elements, animation);

      expect(
        elements.every((element) => element.classList.contains(animation))
      ).toBeTrue();
    });

    it(`should apply the animation to the element's children`, () => {
      const element = document.createElement('div');
      for (let i = 0; i < 10; i++) {
        const child = document.createElement('a');
        element.appendChild(child);
      }
      const animation = `example-css-animation`;

      addAnimations(element, animation, true);

      let check: boolean = true;
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i];
        if (!child.classList.contains(animation)) {
          check = false;
        }
      }
      expect(check).toBeTrue();
    });

    it(`should apply more than one animation from animation array to a DOM element`, () => {
      const element = document.createElement('div');
      const animations = Array.from({ length: 10 }).map(
        (_, i) => `example-css-animation-${i + 1}`
      );

      addAnimations(element, animations);

      expect(element.classList.contains(animations[0])).toBeTrue();
    });
  });

  describe(`removeAnimations()`, () => {
    it(`should remove the animation from the DOM element`, () => {
      const element = document.createElement('div');
      const animation = `example-css-animation`;

      addAnimations(element, animation);
      removeAnimations(element, animation);

      expect(element.classList.contains(animation)).toBeFalse();
    });

    it(`should remove the animation from the array of DOM elements`, () => {
      const elements = Array.from({ length: 10 }).map(() =>
        document.createElement('div')
      );
      const animation = `example-css-animation`;

      addAnimations(elements, animation);
      removeAnimations(elements, animation);

      expect(
        elements.every((element) => element.classList.contains(animation))
      ).toBeFalse();
    });

    it(`should remove the animation from the element's children`, () => {
      const element = document.createElement('div');
      for (let i = 0; i < 10; i++) {
        const child = document.createElement('a');
        element.appendChild(child);
      }
      const animation = `example-css-animation`;

      addAnimations(element, animation, true);
      removeAnimations(element, animation, true);

      let check: boolean = true;
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i];
        if (child.classList.contains(animation)) {
          check = false;
        }
      }
      expect(check).toBeTrue();
    });

    it(`should remove more than one animation from animation array from a DOM element`, () => {
      const element = document.createElement('div');
      const animations = Array.from({ length: 10 }).map(
        (_, i) => `example-css-animation-${i + 1}`
      );

      addAnimations(element, animations);
      removeAnimations(element, animations);

      expect(element.classList.contains(animations[0])).toBeFalse();
    });
  });

  describe(`startAnimation()`, () => {
    it(`should throw an error if the element is not defined`, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => startAnimation(undefined as any)).toThrowError();
    });

    it(`should throw an error if the element does not have a classList property`, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => startAnimation({} as any)).toThrowError();
    });

    it(`should add the 'play' class to the element`, () => {
      const element = document.createElement('div');
      const animation = `example-css-animation`;

      addAnimations(element, animation);
      startAnimation(element);

      expect(element.classList.contains('play')).toBeTrue();
    });
  });

  describe(`finishAnimation()`, () => {
    it(`should throw an error if the element is not defined`, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => finishAnimation(undefined as any)).toThrowError();
    });

    it(`should throw an error if the element does not have a classList property`, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => finishAnimation({} as any)).toThrowError();
    });

    it(`should remove the 'play' class from the element`, () => {
      const element = document.createElement('div');
      const animation = `example-css-animation`;

      addAnimations(element, animation);
      startAnimation(element);
      finishAnimation(element);

      expect(element.classList.contains('play')).toBeFalse();
    });
  });
});
