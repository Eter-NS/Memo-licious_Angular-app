import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appSvgElements]',
  standalone: true,
})
export class SvgElementsDirective implements AfterViewInit, OnChanges {
  #svgComponent = inject<ElementRef<HTMLElement>>(ElementRef<HTMLElement>);
  primaryColorElements?: NodeListOf<HTMLElement>;
  svgElement!: SVGElement;

  /**
   * The widthScale is used to change the size of the SVG based on the viewport size.
   * To use this value unset the svgWidth and svgHeight props.
   */
  @Input() svgScale = 0.6;
  /**
   * primaryColor changes the default SVG main color.
   */
  @Input() svgPrimaryColor?: string;
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
  @Input() svgMinMaxWidth?: [number, number] = [200, 450];

  ngAfterViewInit(): void {
    this.svgElement = this.#svgComponent.nativeElement.querySelector(
      'svg'
    ) as SVGElement;

    if (this.svgPrimaryColor) {
      this.primaryColorElements =
        this.#svgComponent.nativeElement.querySelectorAll(
          '[data-svg-primary-color]'
        );
      this.assignNewColor();
    }

    this.assignNewSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.hasPropertyChanged(changes, 'svgPrimaryColor')) {
      this.assignNewColor();
    }

    if (this.hasPropertyChanged(changes, 'svgMinMaxWidth')) {
      this.checkSvgMinMaxWidth();
    }

    const sizeProperties = [
      'svgMinMaxWidth',
      'svgScale',
      'svgWidth',
      'svgHeight',
    ] as const;

    if (
      sizeProperties.some((prop) => this.hasPropertyChanged(changes, prop)) &&
      this.svgElement
    ) {
      this.assignNewSize();
    }
  }

  private hasPropertyChanged(
    changes: SimpleChanges,
    propName: keyof SvgElementsDirective
  ): boolean {
    const prop = changes[propName];
    return prop && prop.currentValue !== prop.previousValue;
  }

  assignNewColor() {
    if (this.svgPrimaryColor != null) {
      // SVG color customization
      this.primaryColorElements?.forEach((el) => {
        el.style.fill = this.svgPrimaryColor as string;
      });
    }
  }

  checkSvgMinMaxWidth() {
    if (
      this.svgMinMaxWidth &&
      this.svgMinMaxWidth[0] >= this.svgMinMaxWidth[1]
    ) {
      throw new Error(
        'minMaxWidth: The minimum width cannot be greater than its maximum size'
      );
    }
  }

  @HostListener('window:resize')
  assignNewSize(): void {
    const metrics = this.checkSizeInputs();

    this.updateSize(this.#svgComponent.nativeElement, metrics);
    this.updateSize(this.svgElement, metrics);
  }

  changeSVGSize() {
    const minimumSize = this.svgMinMaxWidth?.[0];
    const maximumSize = this.svgMinMaxWidth?.[1];

    let chosenValue: number;

    // Takes the smaller viewport size as SVG size
    window.outerHeight <= window.outerWidth
      ? (chosenValue = window.outerHeight)
      : (chosenValue = window.outerWidth);

    const value = chosenValue * this.svgScale;

    if (!minimumSize || !maximumSize) {
      return value.toString();
    }

    if (value < minimumSize) return minimumSize.toString();
    else if (value > maximumSize) return maximumSize.toString();
    else return value.toString();
  }

  updateSize(
    element: HTMLElement | SVGElement,
    { width, height }: { width: string; height: string }
  ) {
    element.style.setProperty('width', width);
    element.style.setProperty('height', height);
  }

  checkSizeInputs() {
    let width = this.svgWidth;
    let height = this.svgHeight;

    if (!width && !height) {
      width = this.changeSVGSize();
      height = 'auto';
    }
    if (!width && height !== 'auto') {
      width = 'auto';
    }
    if (width !== 'auto' && !height) {
      height = 'auto';
    }

    return { width: width as string, height: height as string };
  }
}
