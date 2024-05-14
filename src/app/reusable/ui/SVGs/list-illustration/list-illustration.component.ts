import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SvgElementsDirective } from '../svg-elements.directive';

@Component({
  selector: 'app-list-illustration',
  standalone: true,
  imports: [],
  templateUrl: './list-illustration.component.html',
  styles: [],
  hostDirectives: [
    {
      directive: SvgElementsDirective,
      inputs: ['svgScale', 'svgPrimaryColor', 'svgWidth', 'svgMinMaxWidth'],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListIllustrationComponent {}
