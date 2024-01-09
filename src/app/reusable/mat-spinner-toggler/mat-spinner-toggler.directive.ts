import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appMatSpinnerToggler]',
  standalone: true,
})
export class MatSpinnerTogglerDirective {
  button = inject<ElementRef<HTMLButtonElement>>(ElementRef<HTMLButtonElement>);
  @Input({ required: true }) appMatSpinnerToggler = false;

  @HostListener('click') onClick() {
    this.button.nativeElement.classList.toggle(
      'sending',
      this.appMatSpinnerToggler
    );
  }
}
