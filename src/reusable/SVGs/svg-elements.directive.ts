import {
  AfterViewChecked,
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appSvgElements]',
  standalone: true,
})
export class SvgElementsDirective implements AfterViewInit, AfterViewChecked {
  @Input() svgWidth: string = ' 500';
  @Input() svgHeight: string = ' 500';
  @Input() primaryColor: string = '#ffc727';
  private svgComponent = inject<ElementRef<HTMLElement>>(
    ElementRef<HTMLElement>
  );
  svgElement!: SVGElement;
  primaryColorElements!: NodeListOf<HTMLElement>;

  ngAfterViewInit(): void {
    this.svgElement = this.svgComponent.nativeElement.querySelector(
      'svg'
    ) as SVGElement;
    this.primaryColorElements =
      this.svgComponent.nativeElement.querySelectorAll(
        '[data-svg-primary-color]'
      );

    // SVG color customization
    this.primaryColorElements.forEach((el) => {
      el.style.fill = this.primaryColor;
    });
  }

  ngAfterViewChecked(): void {
    this.svgComponent.nativeElement.style.setProperty('width', this.svgWidth);
    this.svgComponent.nativeElement.style.setProperty('height', this.svgHeight);
    this.svgElement.style.setProperty('width', this.svgWidth);
    this.svgElement.style.setProperty('height', this.svgHeight);
  }
}
