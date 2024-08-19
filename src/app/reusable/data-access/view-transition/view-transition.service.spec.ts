/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { ViewTransitionService } from './view-transition.service';
import { BehaviorSubject } from 'rxjs';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Component, Provider, inject } from '@angular/core';
import { Location } from '@angular/common';
import { By } from '@angular/platform-browser';

const styles = `
@use './animations.scss';
`;

@Component({
  standalone: true,
  template: `<button
    (click)="viewTransitionService.goForward($event, '/example')"
    (keyup.enter)="viewTransitionService.goForward(element, '/example')"
    tabindex="0"
    data-test="test-button"
  >
    Hello there
  </button>`,
  styles: styles,
})
class TestComponent {
  viewTransitionService = inject(ViewTransitionService);
}

describe('ViewTransitionService', () => {
  const MockRouterEventsSubject = new BehaviorSubject<
    NavigationEnd | NavigationStart
  >(
    new NavigationEnd(
      1,
      'http://localhost:9876/',
      'http://localhost:9876/example'
    )
  );
  const MockRouter = {
    events: MockRouterEventsSubject.asObservable(),
    navigateByUrl: jasmine.createSpy(
      'navigateByUrl',
      Router.prototype.navigateByUrl
    ),
  };
  const MockLocation = {
    back: jasmine.createSpy('back', Location.prototype.back),
    go: jasmine.createSpy('go', Location.prototype.go),
  };

  let fixture: ComponentFixture<TestComponent>;
  let service: ViewTransitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        ViewTransitionService,
        {
          provide: Router,
          useValue: MockRouter,
        },
        {
          provide: Location,
          useValue: MockLocation,
        },
      ] satisfies Provider[],
    });

    fixture = TestBed.createComponent(TestComponent);
    service = TestBed.inject(ViewTransitionService);

    spyOn(service as any, '_runAnimationOnce').and.resolveTo();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`pageState$`, () => {
    it(`should emit 'end' on navigation end`, fakeAsync(() => {
      MockRouterEventsSubject.next(
        new NavigationEnd(
          1,
          'http://localhost:9876/',
          'http://localhost:9876/example'
        )
      );
      let result: 'start' | 'end' | 'idle';

      service.pageState$.subscribe((page) => {
        result = page;
      });

      tick(1_000);

      expect(result!).toBe('end');
    }));
  });

  describe(`goForward()`, () => {
    it(`should navigate to the destination`, async () => {
      const element = fixture.debugElement.query(
        By.css('[data-test=test-button]')
      ).nativeNode;

      await service.goForward(element, '/example2');

      expect(MockRouter.navigateByUrl).toHaveBeenCalledWith('/example2');
    });

    it(`should navigate to the destination with the origin`, async () => {
      const element = fixture.debugElement.query(
        By.css('[data-test=test-button]')
      ).nativeNode;

      await service.goForward(element, 'http://localhost:9876/example2');

      expect(MockRouter.navigateByUrl).toHaveBeenCalledWith('/example2');
    });
  });

  describe(`goBack()`, () => {
    it(`should navigate to the previous page`, async () => {
      const element = fixture.debugElement.query(
        By.css('[data-test=test-button]')
      ).nativeNode;

      await service.goForward(element, '/example2');
      await service.goBack(element);

      expect(MockLocation.back).toHaveBeenCalled();
    });

    it(`should navigate to the fallback page`, async () => {
      const element = fixture.debugElement.query(
        By.css('[data-test=test-button]')
      ).nativeNode;

      await service.goBack(element, '/example');

      expect(MockRouter.navigateByUrl).toHaveBeenCalledWith('/example');
    });

    it(`should navigate to the '/' page when no fallback was passed`, async () => {
      const element = fixture.debugElement.query(
        By.css('[data-test=test-button]')
      ).nativeNode;

      await service.goBack(element);

      expect(MockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });
  });

  describe(`viewFadeIn()`, () => {
    it(`should log an error when _runTransition() rejects (object with message property).`, async () => {
      // Arrange
      const element = fixture.debugElement.query(
        By.css('[data-test=test-button]')
      ).nativeNode;
      const spy = spyOn(console, 'error').and.stub();
      spyOn(service as any, '_runTransition').and.rejectWith(
        new Error('Example Error')
      );
      // Act
      await service.viewFadeIn(element);

      // Assert
      expect(spy).toHaveBeenCalledWith('Example Error');
    });

    it(`should log an error when _runTransition() rejects (object without message property).`, async () => {
      // Arrange
      const element = fixture.debugElement.query(
        By.css('[data-test=test-button]')
      ).nativeNode;
      const spy = spyOn(console, 'error').and.stub();
      const error = { msg: 'example other error' };
      spyOn(service as any, '_runTransition').and.rejectWith(error);
      // Act
      await service.viewFadeIn(element);

      // Assert
      expect(spy).toHaveBeenCalledWith(error);
    });

    it(`should fade in the element`, async () => {
      const element = fixture.debugElement.query(
        By.css('[data-test=test-button]')
      ).nativeNode;

      await service.viewFadeIn(element);

      expect(
        element.classList.contains('fadeIn-from-bottom-animation')
      ).toBeFalse();
    });

    it(`should remove the animation class after the animation is finished`, async () => {
      const element = fixture.debugElement.query(
        By.css('[data-test=test-button]')
      ).nativeNode;

      await service.viewFadeIn(element);

      expect(element.classList).not.toContain('fadeIn-from-bottom-animation');
    });

    it(`should stop the event propagation`, async () => {
      const element = fixture.debugElement.query(
        By.css('[data-test=test-button]')
      ).nativeNode;

      await service.viewFadeIn(element);

      expect(element.classList).not.toContain('fadeIn-from-bottom-animation');
    });
  });

  describe(`pageReload()`, () => {
    it(`should return false if the first navigateByUrl rejects. (object with message property).`, async () => {
      // Arrange
      MockRouter.navigateByUrl.and.rejectWith(new Error('example error'));

      // Act
      const result = await service.pageReload();

      // Assert
      expect(result).toBeFalse();
    });

    it(`should return false if the first navigateByUrl rejects. (object without message property).`, async () => {
      // Arrange
      MockRouter.navigateByUrl.and.rejectWith({
        msg: 'example error 2',
      });

      // Act
      const result = await service.pageReload();

      // Assert
      expect(result).toBeFalse();
    });

    it(`should return true if the first navigateByUrl resolves to true.`, async () => {
      // Arrange
      MockRouter.navigateByUrl.and.returnValues(
        ...[Promise.resolve(true), Promise.resolve(true)]
      );

      // Act
      const result = await service.pageReload();

      // Assert
      expect(result).toBeTrue();
    });
  });

  describe(`_runTransition()`, () => {
    it(`should run the transition`, async () => {
      const element = fixture.debugElement.query(
        By.css('[data-test=test-button]')
      ).nativeNode;

      await expectAsync(
        service['_runTransition'](element, 'fadeOut-to-left-animation', true)
      ).toBeResolved();
    });

    it(`should run the transition using the variable defined in the component's template`, () => {
      const element = fixture.debugElement.query(
        By.css('[data-test=test-button]')
      );
      const spy = spyOn(service as any, '_runTransition').and.callThrough();

      element.nativeNode.click();

      expect(spy).toHaveBeenCalled();
    });

    it(`should remove the animation class after the animation is finished`, async () => {
      const element = fixture.debugElement.query(
        By.css('[data-test=test-button]')
      ).nativeNode;

      await service['_runTransition'](
        element,
        'fadeOut-to-left-animation',
        true
      );

      expect(
        element.classList.contains('fadeOut-to-left-animation')
      ).toBeFalse();
    });
  });
});
