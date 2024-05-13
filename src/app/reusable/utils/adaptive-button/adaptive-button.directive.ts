import {
  Directive,
  HostBinding,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CustomMatRippleDirective } from '../ripples/ripple-color-checker.directive';

interface IButtonStyleOptions {
  look: 'common' | 'fab' | 'extended-fab';
  shape: 'circle' | 'pill';
  color: 'primary' | 'primary-less' | 'accent' | 'accent-less';
}

interface IButtonOptions extends IButtonStyleOptions {
  notAnimated?: 'not-animated';
}

export type ButtonConfiguration = Partial<
  Omit<IButtonStyleOptions, 'notAnimated'>
>;

@Directive({
  selector: 'button[appAdaptiveButton], a[appAdaptiveButton]',
  standalone: true,
  hostDirectives: [
    { directive: CustomMatRippleDirective, inputs: ['matRippleDisabled'] },
  ],
})
export class AdaptiveButtonDirective implements OnChanges {
  #defaultStyles: IButtonStyleOptions = {
    look: 'common',
    shape: 'pill',
    color: 'accent',
  };

  @HostBinding('class') _class = this._updateClasses(this.#defaultStyles);

  @Input() animate = true;
  @Input() styleConfiguration: ButtonConfiguration = {
    look: 'common',
    shape: 'pill',
    color: 'accent',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['class']) {
      return;
    }

    this._class = this._updateClasses({
      ...this.#defaultStyles,
      ...this.styleConfiguration,
      notAnimated: this.animate ? undefined : 'not-animated',
    });
  }

  private _updateClasses(changes: IButtonOptions): string {
    return Object.values(changes).filter(Boolean).join(' ');
  }
}
