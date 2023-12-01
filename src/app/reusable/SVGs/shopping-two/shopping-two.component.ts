import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SvgElementsDirective } from '../svg-elements.directive';

@Component({
  selector: 'app-shopping-two',
  standalone: true,
  imports: [],
  templateUrl: './shopping-two.component.html',
  styles: [],
  hostDirectives: [
    {
      directive: SvgElementsDirective,
      inputs: [
        'svgWidthScale',
        'svgPrimaryColor',
        'svgWidth',
        'svgMinMaxWidth',
      ],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingTwoComponent {}
