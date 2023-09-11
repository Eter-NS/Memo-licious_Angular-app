export type ElementsArray =
  | NodeListOf<HTMLElement | Element>
  | HTMLCollection
  | Array<HTMLElement>;

export function forEachAndCb(elementArray: ElementsArray, cb: Function) {
  for (let i = 0; i < elementArray.length; i++) cb(elementArray[i]);
}

export function addAnimations(
  object: HTMLElement | NodeListOf<HTMLElement> | Array<HTMLElement>,
  animations: string | Array<string>,
  parent?: boolean
) {
  if ('classList' in object)
    parent
      ? forEachAndCb(object.children, applyAnimation)
      : applyAnimation(object);
  else forEachAndCb(object, applyAnimation);

  function applyAnimation(element: HTMLElement) {
    element.classList.add(
      typeof animations === 'string' ? animations : animations.join(' ')
    );
  }
}

export function removeAnimations(
  object: HTMLElement | NodeListOf<HTMLElement> | Array<HTMLElement>,
  animations: string | Array<string>,
  parent?: boolean
) {
  if ('classList' in object)
    parent
      ? forEachAndCb(object.children, removeAnimation)
      : removeAnimation(object);
  else forEachAndCb(object, removeAnimation);

  function removeAnimation(element: HTMLElement) {
    typeof animations === 'string'
      ? element.classList.remove(animations)
      : animations.forEach((animation) => element.classList.remove(animation));
  }
}

export function startAnimation(element: HTMLElement | EventTarget) {
  if (!element) throw new Error('The element is not defined');
  if (!('classList' in element))
    throw new Error(`The ${element} does not have a classList property`);
  element.classList.add('play');
}

export function stopAnimation(element: HTMLElement | EventTarget) {
  if (!element) throw new Error('The element is not defined');
  if (!('classList' in element))
    throw new Error('The element does not have a classList property');
  element.classList.remove('play');
}
