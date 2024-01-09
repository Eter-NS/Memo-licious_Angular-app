import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SvgElementsDirective } from '../svg-elements.directive';

@Component({
  selector: 'app-mini-completion',
  standalone: true,
  imports: [],
  templateUrl: './mini-completion.component.html',
  styles: [],
  hostDirectives: [
    {
      directive: SvgElementsDirective,
      inputs: ['svgScale', 'svgPrimaryColor', 'svgWidth', 'svgMinMaxWidth'],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniCompletionComponent {}
