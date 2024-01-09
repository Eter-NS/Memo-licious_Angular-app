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
        'svgScale',
        'svgPrimaryColor',
        'svgWidth',
        'svgHeight',
        'svgMinMaxWidth',
      ],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompletionOneComponent {}
