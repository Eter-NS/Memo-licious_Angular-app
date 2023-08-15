import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgElementsDirective } from '../svg-elements.directive';

@Component({
  selector: 'app-shopping-three',
  standalone: true,
  imports: [CommonModule],
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
