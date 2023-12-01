import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SvgElementsDirective } from '../svg-elements.directive';

@Component({
  selector: 'app-completion-one',
  standalone: true,
  imports: [],
  templateUrl: './completion-one.component.html',
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
export class CompletionOneComponent {}
