export type ElementsArray =
  | NodeListOf<HTMLElement | Element>
  | HTMLCollection
  | Array<HTMLElement>;

export function forEachAndCb(
  elementArray: ElementsArray,
  cb: (element: HTMLElement) => void
) {
  for (let i = 0; i < elementArray.length; i++)
    cb(elementArray[i] as HTMLElement);
}

export function addAnimations(
  object: HTMLElement | NodeListOf<HTMLElement> | Array<HTMLElement>,
  animations: string | Array<string>,
  parent?: boolean
) {
  const applyAnimation = (element: HTMLElement) => {
    element.classList.add(
      ...(typeof animations === 'string' ? [animations] : animations)
    );
  };

  checkParent(object, applyAnimation, parent);
}

export function removeAnimations(
  object: HTMLElement | NodeListOf<HTMLElement> | Array<HTMLElement>,
  animations: string | Array<string>,
  parent?: boolean
) {
  const removeAnimation = (element: HTMLElement) => {
    typeof animations === 'string'
      ? element.classList.remove(animations)
      : animations.forEach((animation) => element.classList.remove(animation));
  };

  checkParent(object, removeAnimation, parent);
}

export function startAnimation(element: HTMLElement | EventTarget) {
  if (doesElementExist(element) && hasClassListProperty(element)) {
    element.classList.add('play');
  }
}

export function finishAnimation(element: HTMLElement | EventTarget) {
  if (doesElementExist(element) && hasClassListProperty(element)) {
    element.classList.remove('play');
  }
}

function doesElementExist(element: HTMLElement | EventTarget) {
  if (element) {
    return true;
  } else {
    throw new Error('The element is not defined');
  }
}

function hasClassListProperty(
  element: HTMLElement | EventTarget
): element is HTMLElement {
  if (!('classList' in element)) {
    throw new Error(`The ${element} does not have a classList property`);
  } else {
    return true;
  }
}

function checkParent(
  object: HTMLElement | NodeListOf<HTMLElement> | HTMLElement[],
  cb: (element: HTMLElement) => void,
  parent?: boolean
) {
  if ('classList' in object) {
    parent ? forEachAndCb(object.children, cb) : cb(object);
  } else {
    forEachAndCb(object, cb);
  }
}
