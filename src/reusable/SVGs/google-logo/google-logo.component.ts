import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgElementsDirective } from '../svg-elements.directive';

@Component({
  selector: 'app-google-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './google-logo.component.html',
  styles: [],
  hostDirectives: [
    {
      directive: SvgElementsDirective,
      inputs: ['svgWidth', 'svgHeight'],
    },
  ],
})
export class GoogleLogoComponent {}
