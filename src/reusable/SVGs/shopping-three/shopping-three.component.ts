import { Component } from '@angular/core';
import { SvgElementsDirective } from '../svg-elements.directive';

@Component({
  selector: 'app-shopping-three',
  standalone: true,
  imports: [],
  templateUrl: './shopping-three.component.html',
  styles: [],
  hostDirectives: [
    {
      directive: SvgElementsDirective,
      inputs: ['svgWidth', 'svgHeight', 'primaryColor'],
    },
  ],
})
export class ShoppingThreeComponent {}
