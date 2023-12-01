import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SvgElementsDirective } from '../svg-elements.directive';

@Component({
  selector: 'app-shopping-three',
  standalone: true,
  imports: [],
  templateUrl: './shopping-three.component.html',
  styles: [
    `
      svg {
        position: relative;
        top: 4px;
      }
    `,
  ],
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
export class ShoppingThreeComponent {}
