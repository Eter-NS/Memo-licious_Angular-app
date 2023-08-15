export function iterateOverElementsAndDoSomething(
  elementArray: NodeListOf<HTMLElement> | HTMLCollection | Array<HTMLElement>,
  cb: Function
) {
  for (let i = 0; i < elementArray.length; i++) cb(elementArray[i]);
}

export function addAnimations(
  object: HTMLElement | NodeListOf<HTMLElement> | Array<HTMLElement>,
  animations: string | Array<string>,
  global?: boolean
) {
  if ('classList' in object)
    global
      ? iterateOverElementsAndDoSomething(object.children, applyAnimation)
      : applyAnimation(object);
  else iterateOverElementsAndDoSomething(object, applyAnimation);

  function applyAnimation(element: HTMLElement) {
    element.classList.add(
      typeof animations === 'string' ? animations : animations.join(' ')
    );
  }
}

export function removeAnimations(
  object: HTMLElement | NodeListOf<HTMLElement> | Array<HTMLElement>,
  animations: string | Array<string>,
  global?: boolean
) {
  if ('classList' in object)
    global
      ? iterateOverElementsAndDoSomething(object.children, removeAnimation)
      : removeAnimation(object);
  else iterateOverElementsAndDoSomething(object, removeAnimation);

  function removeAnimation(element: HTMLElement) {
    typeof animations === 'string'
      ? element.classList.remove(animations)
      : animations.forEach((animation) => element.classList.remove(animation));
  }
}

export function startAnimation(element: HTMLElement) {
  element.classList.add('play');
}
