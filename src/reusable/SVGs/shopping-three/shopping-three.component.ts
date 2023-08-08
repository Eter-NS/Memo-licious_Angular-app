import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgElementsDirective } from '../svg-elements.directive';
import { SvgElement } from '../svg-element';

@Component({
  selector: 'app-shopping-three',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shopping-three.component.html',
  styles: [],
  // hostDirectives: [
  //   {
  //     directive: SvgElementsDirective,
  //     inputs: ['svgWidth', 'svgHeight', 'svgColor'],
  //   },
  // ],
})
export class ShoppingThreeComponent extends SvgElement {}
