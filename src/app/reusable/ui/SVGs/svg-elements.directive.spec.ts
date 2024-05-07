import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SvgElementsDirective } from './svg-elements.directive';
import { Component } from '@angular/core';
import { CompletionOneComponent } from './completion-one/completion-one.component';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'app-test',
  standalone: true,
  template: `<app-completion-one
    [svgScale]="svgScale"
    [svgPrimaryColor]="svgPrimaryColor"
    [svgWidth]="svgWidth"
    [svgHeight]="svgHeight"
    [svgMinMaxWidth]="svgMinMaxWidth"
  />`,
  imports: [CompletionOneComponent],
})
class TestComponent {
  svgScale: number | undefined = 0.6;
  svgPrimaryColor: string | undefined = `#000`;
  svgWidth: string | undefined = undefined;
  svgHeight: string | undefined = undefined;
  svgMinMaxWidth: [number, number] = [200, 450];
}

describe('SvgElementsDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SvgElementsDirective, TestComponent],
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  describe('svgScale', () => {
    it('should override the default scale', () => {
      const svgComponent = fixture.debugElement.query(
        By.css(`app-completion-one svg`)
      );
      fixture.detectChanges();
      const initialWidth = svgComponent.nativeNode.style.width;
      component.svgScale = 1;
      fixture.detectChanges();

      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();

      const newHeight = svgComponent.nativeElement.style.height;
      const newWidth = svgComponent.nativeElement.style.width;
      expect(newHeight).toBe('auto');
      expect(newWidth).toBeGreaterThanOrEqual(initialWidth);
    });
  });

  describe(`svgPrimaryColor`, () => {
    it(`should override the initial primary color`, () => {
      const svgPrimaryColorElement = fixture.debugElement.query(
        By.css(`[data-svg-primary-color]`)
      );
      const initialColor = svgPrimaryColorElement.nativeNode.style.fill;

      component.svgPrimaryColor = '#fff';
      fixture.detectChanges();
      const newColor = svgPrimaryColorElement.nativeNode.style.fill;

      expect(newColor).not.toBe(initialColor);
    });
  });

  describe(`checkSvgMinMaxWith()`, () => {
    it(`should throw an error if the minimum width is greater than the maximum width`, () => {
      expect(() => {
        component.svgMinMaxWidth = [100, 50];
        fixture.detectChanges();
      }).toThrowError();
    });
  });

  describe(`changeSVGSize()`, () => {
    it(`should change the size without svgMinMaxWidth set`, () => {
      const payload = [undefined, undefined] as unknown as [number, number];

      component.svgMinMaxWidth = payload;
      fixture.detectChanges();

      expect(component.svgMinMaxWidth).toEqual(payload);
      expect(() => {
        component;
      }).not.toThrowError();
    });

    it(`should pick height as the chosenValue when height is a smaller value`, () => {
      const payload = [100, Infinity] as [number, number];
      const height = 1080;
      const scale = 1;
      const value = height * scale;
      spyOnProperty(window, 'outerHeight', 'get').and.returnValue(height);
      spyOnProperty(window, 'outerWidth', 'get').and.returnValue(1920);

      component.svgMinMaxWidth = payload;
      component.svgScale = scale;
      fixture.detectChanges();

      const svgElement = fixture.debugElement.query(
        By.css(`app-completion-one svg`)
      );
      const width: string = svgElement.nativeNode.style.width;
      expect(parseFloat(width.replace('px', ''))).toBe(value);
    });

    it(`should pick width as the chosenValue when width is a smaller value`, () => {
      const payload = [100, Infinity] as [number, number];
      const windowWidth = 1080;
      const scale = 1;
      const value = windowWidth * scale;
      spyOnProperty(window, 'outerHeight', 'get').and.returnValue(1920);
      spyOnProperty(window, 'outerWidth', 'get').and.returnValue(windowWidth);

      component.svgMinMaxWidth = payload;
      component.svgScale = scale;
      fixture.detectChanges();

      const svgElement = fixture.debugElement.query(
        By.css(`app-completion-one svg`)
      );
      const width: string = svgElement.nativeNode.style.width;
      expect(parseFloat(width.replace('px', ''))).toBe(value);
    });

    it(`should return the minimum value from svgMinMaxWidth if the computed value is too low`, () => {
      const payload = [100, 200] as [number, number];

      component.svgMinMaxWidth = payload;
      component.svgScale = 0.1;
      fixture.detectChanges();

      const svgElement = fixture.debugElement.query(
        By.css(`app-completion-one svg`)
      );
      const width = svgElement.nativeNode.style.width;
      expect(width).toBe('100px');
    });

    it(`should return the maximum value from svgMinMaxWidth if the computed value is too high`, () => {
      const payload = [100, 200] as [number, number];

      component.svgMinMaxWidth = payload;
      component.svgScale = 1;
      fixture.detectChanges();

      const svgElement = fixture.debugElement.query(
        By.css(`app-completion-one svg`)
      );
      const width = svgElement.nativeNode.style.width;
      expect(width).toBe('200px');
    });

    it(`should return the computed value from svgMinMaxWidth if the computed value is neither too high nor low`, () => {
      const payload = [100, 600] as [number, number];

      component.svgMinMaxWidth = payload;
      component.svgScale = 0.75;
      fixture.detectChanges();

      const svgElement = fixture.debugElement.query(
        By.css(`app-completion-one svg`)
      );
      const width: number = parseFloat(
        (svgElement.nativeNode.style.width as string).replace('px', '')
      );
      expect(width).toBeGreaterThan(payload[0]);
      expect(width).toBeLessThan(payload[1]);
    });
  });

  describe(`checkSizeInputs()`, () => {
    it(`should return the computed width and height set to 'auto' when neither svgWidth nor svgHeight is set`, () => {
      component.svgHeight = undefined;
      component.svgWidth = undefined;

      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();

      const svgElement = fixture.debugElement.query(
        By.css(`app-completion-one svg`)
      );
      const width = svgElement.nativeNode.style.width;
      const height = svgElement.nativeNode.style.height;
      expect(width).not.toBe('auto');
      expect(height).toBe('auto');
    });

    it(`should return width set to 'auto' and height provided by svgHeight`, () => {
      component.svgHeight = '150';
      component.svgWidth = undefined;

      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();

      const svgElement = fixture.debugElement.query(
        By.css(`app-completion-one svg`)
      );
      const width = svgElement.nativeNode.style.width;
      const height = svgElement.nativeNode.style.height;
      expect(width).toBe('auto');
      expect(height).toBe('150px');
    });

    it(`should return width provided by svgWidth and height set to 'auto'`, () => {
      component.svgHeight = undefined;
      component.svgWidth = '150';

      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();

      const svgElement = fixture.debugElement.query(
        By.css(`app-completion-one svg`)
      );
      const width = svgElement.nativeNode.style.width;
      const height = svgElement.nativeNode.style.height;
      expect(width).toBe('150px');
      expect(height).toBe('auto');
    });
  });
});
