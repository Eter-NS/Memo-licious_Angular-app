import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { ChoosePathComponent } from './choose-path.component';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  standalone: true,
  template: `<p>Test component works!</p>`,
})
class TestComponent {}

describe('ChoosePathComponent', () => {
  let component: ChoosePathComponent;
  let fixture: ComponentFixture<ChoosePathComponent>;
  let viewTransitionServiceMock: ViewTransitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChoosePathComponent],
      providers: [
        provideRouter([
          { path: '', component: ChoosePathComponent },
          {
            path: 'online',
            component: TestComponent,
          },
          {
            path: 'guest',
            component: TestComponent,
          },
        ]),
        provideLocationMocks(),
        {
          provide: ViewTransitionService,
          useValue: {
            goBackClicked: true,
          } satisfies Partial<ViewTransitionService>,
        },
      ],
    });
    TestBed.inject(ViewTransitionService);
    fixture = TestBed.createComponent(ChoosePathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    viewTransitionServiceMock = fixture.debugElement.injector.get(
      ViewTransitionService
    );
  });

  describe('component', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('ShoppingThreeSvg', () => {
    it('should be rendered', () => {
      const shoppingThreeSvgDe = fixture.debugElement.query(
        By.css('app-shopping-three')
      );
      const shoppingThreeSvgEl = shoppingThreeSvgDe.nativeElement;
      expect(shoppingThreeSvgEl).toBeTruthy();
    });

    it('should have size between 250 and 350 pixels', () => {
      const shoppingThreeSvgDe = fixture.debugElement.query(
        By.css('app-shopping-three')
      );
      const shoppingThreeSvgComponent: HTMLElement =
        shoppingThreeSvgDe.nativeElement;
      const svgElement = shoppingThreeSvgComponent.querySelector('svg');

      const width = svgElement?.clientWidth;
      const height = svgElement?.clientHeight;

      expect(width).toBeGreaterThanOrEqual(250);
      expect(width).toBeLessThanOrEqual(350);
      expect(height).toBeGreaterThanOrEqual(250);
      expect(height).toBeLessThanOrEqual(350);
    });
  });

  describe('runTransition() - template check', () => {
    it('should be called after clicking the .CTA button by click event', () => {
      const spy = spyOn(component, 'runTransition');

      const buttonDe = fixture.debugElement.query(By.css('.CTA'));
      buttonDe.triggerEventHandler('click', null);

      expect(spy).toHaveBeenCalled();
    });

    it('should be called after clicking the .CTA button by keyup.enter event', () => {
      const spy = spyOn(component, 'runTransition');

      const buttonDe = fixture.debugElement.query(By.css('.CTA'));
      buttonDe.triggerEventHandler('keyup.enter', null);

      expect(spy).toHaveBeenCalled();
    });

    it('should be called after clicking the .CTA--alternative button by click event', () => {
      const spy = spyOn(component, 'runTransition');

      const buttonDe = fixture.debugElement.query(By.css('.CTA--alternative'));
      buttonDe.triggerEventHandler('click', null);

      expect(spy).toHaveBeenCalled();
    });

    it('should be called after clicking the .CTA--alternative button by keyup.enter event', () => {
      const spy = spyOn(component, 'runTransition');

      const buttonDe = fixture.debugElement.query(By.css('.CTA--alternative'));
      buttonDe.triggerEventHandler('keyup.enter', null);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('runTransition() - component check', () => {
    const suffix1 = 'guest';

    it('should be called with a suffix', () => {
      const spy = spyOn(component, 'runTransition');

      component.runTransition(suffix1);

      expect(spy).toHaveBeenCalledWith(suffix1);
    });

    it('should call removeAnimations with values (element, "fadeIn-vol-2-animation", true)', () => {
      const spy = spyOn(component, 'removeAnimations');
      const element = component.hostElement.nativeElement;

      component.runTransition(suffix1);

      expect(spy).toHaveBeenCalledWith(element, 'fadeIn-vol-2-animation', true);
    });

    it('should call addAnimations with values (element, "fade-out-animation", true)', () => {
      const spy = spyOn(component, 'addAnimations');
      const element = component.hostElement.nativeElement;

      component.runTransition(suffix1);

      expect(spy).toHaveBeenCalledWith(element, 'fade-out-animation', true);
    });

    it('should call runWithDelay with values (element.children, {reverse: true, timeoutTime: 1000 })', () => {
      const spy = spyOn(component, 'runWithDelay').and.returnValue(
        new Promise<void>(() => {})
      );
      const element = component.hostElement.nativeElement;

      component.runTransition(suffix1);

      expect(spy).toHaveBeenCalledWith(element.children, {
        reverse: true,
        timeout: 800,
      });
    });

    it('should call runWithDelay with values and run then block', fakeAsync(() => {
      spyOn(component, 'runWithDelay').and.resolveTo();
      const navigateByUrlSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');

      component.runTransition(suffix1);

      tick(1000);
      expect(viewTransitionServiceMock.goBackClicked).toBe(false);
      expect(navigateByUrlSpy).toHaveBeenCalledWith(suffix1);
    }));

    it('should call runWithDelay with values and run catch block', fakeAsync(() => {
      const errorMessage = 'Error';
      spyOn(component, 'runWithDelay').and.rejectWith(errorMessage);
      const spy = spyOn(console, 'error').and.stub();

      component.runTransition(suffix1);

      tick(1000);
      expect(spy).toHaveBeenCalledWith(errorMessage);
    }));
  });
});
