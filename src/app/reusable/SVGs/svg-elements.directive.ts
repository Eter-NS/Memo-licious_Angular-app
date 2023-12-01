import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appSvgElements]',
  standalone: true,
})
export class SvgElementsDirective implements AfterViewInit {
  #svgComponent = inject<ElementRef<HTMLElement>>(ElementRef<HTMLElement>);
  primaryColorElements!: NodeListOf<HTMLElement>;
  svgElement!: SVGElement;

  /**
   * The widthScale is used to change the size of the SVG based on the viewport size.
   * To use this value unset the svgWidth and svgHeight props.
   */
  @Input() svgWidthScale = 0.6;
  /**
   * primaryColor changes the default SVG main color.
   */
  @Input() svgPrimaryColor = '#000';
  /**
   * The static setting for the width, it's not responsive to the viewport.
   * @warn Try not to use it with svgHeight to keep the right aspect ratio.
   */
  @Input() svgWidth?: string;
  /**
   * The static setting for the height, it's not responsive to the viewport.
   * @warn Try not to use it with svgWidth to keep the right aspect ratio.
   */
  @Input() svgHeight?: string;
  /**
   * The size matrix for the smallest and the highest possible svg width. It works optionally with widthScale, when it's also set.
   */
  @Input() svgMinMaxWidth: [number, number] = [200, 450];

  ngAfterViewInit(): void {
    if (
      this.svgMinMaxWidth &&
      this.svgMinMaxWidth[0] >= this.svgMinMaxWidth[1]
    ) {
      throw new Error(
        'minMaxWidth: The minimum width cannot be greater than its maximum size'
      );
    }

    this.svgElement = this.#svgComponent.nativeElement.querySelector(
      'svg'
    ) as SVGElement;

    if (this.svgPrimaryColor) {
      this.primaryColorElements =
        this.#svgComponent.nativeElement.querySelectorAll(
          '[data-svg-primary-color]'
        );

      // SVG color customization
      this.primaryColorElements.forEach((el) => {
        el.style.fill = this.svgPrimaryColor || '#ffc727';
      });
    }

    this.assignNewSize();
  }

  @HostListener('window:resize')
  assignNewSize(): void {
    const metrics = {
      width: (this.svgHeight ? 'auto' : this.svgWidth) || this.changeSVGSize(),
      height: (this.svgWidth ? 'auto' : this.svgHeight) || this.changeSVGSize(),
    };

    this.updateSize(this.#svgComponent.nativeElement, metrics);
    this.updateSize(this.svgElement, metrics);
  }

  private changeSVGSize() {
    const minimumSize = this.svgMinMaxWidth?.[0];
    const maximumSize = this.svgMinMaxWidth?.[1];

    if (!minimumSize || !maximumSize) {
      throw new Error(
        'Hey, you forgot to set the minimum and maximum svg size!'
      );
    }
    let chosenValue: number;

    // Takes smaller viewport size as the size of the SVG
    window.outerHeight >= window.outerWidth
      ? (chosenValue = window.outerWidth)
      : (chosenValue = window.outerHeight);

    const value = chosenValue * this.svgWidthScale;

    if (value < minimumSize) return minimumSize.toString();
    else if (value > maximumSize) return maximumSize.toString();
    else return value.toString();
  }

  private updateSize(
    element: HTMLElement | SVGElement,
    { width, height }: { width: string; height: string }
  ) {
    element.style.setProperty('width', width);
    element.style.setProperty('height', height);
  }
}
