import {
  AfterViewChecked,
  Directive,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';

@Directive()
export class SvgElement implements AfterViewChecked {
  @Input() svgUrl: string = '';
  @Input() svgHeight: string = ' 500';
  @Input() svgWidth: string = ' 500';
  @Input() primaryColor: string = '#ffc727';
  @ViewChild('svgElement') SVG!: ElementRef<SVGElement>;

  ngAfterViewChecked(): void {
    this.SVG.nativeElement.setAttribute('width', this.svgWidth);
    this.SVG.nativeElement.setAttribute('height', this.svgHeight);
  }
}
