import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SvgElementsDirective } from '../svg-elements.directive';

@Component({
  selector: 'app-hammocking-people',
  standalone: true,
  imports: [],
  templateUrl: './hammocking-people.component.html',
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
export class HammockingPeopleComponent {}
