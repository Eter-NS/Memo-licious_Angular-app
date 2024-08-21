import { Directive, HostBinding, Input, booleanAttribute } from '@angular/core';
import { CustomMatRippleDirective } from '../ripples/ripple-color-checker.directive';

export interface ButtonConfiguration {
  look?: 'common' | 'fab' | 'extended-fab';
  shape?: 'circle' | 'pill';
  color?: 'primary' | 'primary-less' | 'accent' | 'accent-less';
}

interface ButtonStyleOptions extends Required<ButtonConfiguration> {
  default: 'app-button';
  notAnimated: 'not-animated' | undefined;
}

@Directive({
  selector: 'button[appAdaptiveButton], a[appAdaptiveButton]',
  standalone: true,
  hostDirectives: [
    { directive: CustomMatRippleDirective, inputs: ['matRippleDisabled'] },
  ],
})
export class AdaptiveButtonDirective {
  /*
  Declares button default styles before user interaction.
  */
  #styles: ButtonStyleOptions = {
    default: 'app-button',
    look: 'common',
    shape: 'pill',
    color: 'accent',
    notAnimated: undefined,
  };

  @HostBinding('class')
  protected _class = this._generateClassString(this.#styles);

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input({ alias: 'disable-animations', transform: booleanAttribute })
  set disableAnimations(newValue: boolean) {
    this._updateClasses('notAnimated', newValue ? 'not-animated' : '');
  }

  @Input()
  set look(newValue: ButtonConfiguration['look']) {
    this._updateClasses('look', newValue);
  }

  @Input()
  set shape(newValue: ButtonConfiguration['shape']) {
    this._updateClasses('shape', newValue);
  }

  @Input()
  set color(newValue: ButtonConfiguration['color']) {
    this._updateClasses('color', newValue);
  }

  private _updateClasses(
    key: keyof ButtonStyleOptions,
    value: string | undefined
  ): void {
    // If the new value is 'undefined', don't update any styles.
    if (value === undefined) {
      return;
    }

    this.#styles = { ...this.#styles, [key]: value };
    this._class = this._generateClassString(this.#styles);
  }

  private _generateClassString(obj: ButtonStyleOptions): string {
    return Object.values(obj).filter(Boolean).join(' ');
  }
}
