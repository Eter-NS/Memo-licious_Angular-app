import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SvgElementsDirective } from '../svg-elements.directive';

@Component({
  selector: 'app-shopping-bags-emoji',
  standalone: true,
  imports: [],
  templateUrl: './shopping-bags-emoji.component.html',
  hostDirectives: [
    {
      directive: SvgElementsDirective,
      inputs: [
        'svgPrimaryColor',
        'svgWidth',
        'svgWidthScale',
        'svgMinMaxWidth',
      ],
    },
  ],
  styles: [
    `
      :host,
      svg {
        display: inline-block;
        transform: translateY(9%);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingBagsEmojiComponent {
  @Input() color = '#FCEA2B';
}
