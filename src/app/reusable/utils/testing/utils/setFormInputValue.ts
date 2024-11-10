export function setFormInputValue(el: HTMLInputElement, value: string) {
  el.focus();
  el.value = value;
  el.dispatchEvent(new Event('input'));
  el.dispatchEvent(new Event('blur'));
}
