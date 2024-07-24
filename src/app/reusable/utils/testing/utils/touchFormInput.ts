export function touchFormInput(el: HTMLInputElement) {
  el.focus();
  el.dispatchEvent(new Event('change'));
  el.blur();
}
