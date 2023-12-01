import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SvgElementsDirective } from '../svg-elements.directive';

@Component({
  selector: 'app-google-logo',
  standalone: true,
  imports: [],
  templateUrl: './google-logo.component.html',
  styles: [],
  hostDirectives: [
    {
      directive: SvgElementsDirective,
      inputs: ['svgWidthScale', 'svgWidth', 'svgMinMaxWidth'],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleLogoComponent {}
