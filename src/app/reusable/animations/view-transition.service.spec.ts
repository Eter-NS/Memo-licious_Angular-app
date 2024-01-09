/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTransitionService } from './view-transition.service';
import { of } from 'rxjs';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Component, Provider, inject } from '@angular/core';
import { Location } from '@angular/common';
import { By } from '@angular/platform-browser';

const styles = `
@use './animations.scss';
`;

@Component({
  standalone: true,
  template: `<div
    (click)="viewTransitionService.goForward($event, '/example')"
    (keyup.enter)="viewTransitionService.goForward(element, '/example')"
    tabindex="0"
  >
    Hello there
  </div>`,
  styles: styles,
})
class TestComponent {
  viewTransitionService = inject(ViewTransitionService);
}

describe('ViewTransitionService', () => {
  const MockRouter = {
    events: of<NavigationEnd | NavigationStart>(
      new NavigationEnd(
        1,
        'http://localhost:9876/',
        'http://localhost:9876/example'
      )
    ),
    navigateByUrl: jasmine.createSpy(
      'navigateByUrl',
      Router.prototype.navigateByUrl
    ),
  };
  const MockLocation = {
    back: jasmine.createSpy('back', Location.prototype.back),
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
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`page$`, () => {
    it(`should emit 'end' on navigation end`, (done: DoneFn) => {
      MockRouter.events = of<NavigationEnd | NavigationStart>(
        new NavigationEnd(
          1,
          'http://localhost:9876/',
          'http://localhost:9876/example'
        )
      );

      service.page$.subscribe((page) => {
        expect(page).toBe('end');
        done();
      });
    });
  });

  describe(`goForward()`, () => {
    it(`should navigate to the destination`, async () => {
      const element = fixture.debugElement.query(By.css('div')).nativeNode;

      await service.goForward(element, '/example2');

      expect(MockRouter.navigateByUrl).toHaveBeenCalledWith('/example2');
    });

    it(`should navigate to the destination with the origin`, async () => {
      const element = fixture.debugElement.query(By.css('div')).nativeNode;

      await service.goForward(element, 'http://localhost:9876/example2');

      expect(MockRouter.navigateByUrl).toHaveBeenCalledWith('/example2');
    });
  });

  describe(`goBack()`, () => {
    it(`should navigate to the previous page`, async () => {
      const element = fixture.debugElement.query(By.css('div')).nativeNode;

      await service.goForward(element, '/example2');
      await service.goBack(element);

      expect(MockLocation.back).toHaveBeenCalled();
    });

    it(`should navigate to the fallback page`, async () => {
      const element = fixture.debugElement.query(By.css('div')).nativeNode;

      await service.goBack(element, '/example');

      expect(MockRouter.navigateByUrl).toHaveBeenCalledWith('/example');
    });

    it(`should navigate to the '/' page when no fallback was passed`, async () => {
      const element = fixture.debugElement.query(By.css('div')).nativeNode;

      await service.goBack(element);

      expect(MockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });
  });

  describe(`viewFadeIn()`, () => {
    it(`should fade in the element`, async () => {
      const element = fixture.debugElement.query(By.css('div')).nativeNode;

      await service.viewFadeIn(element);

      expect(
        element.classList.contains('fadeIn-from-bottom-animation')
      ).toBeFalse();
    });

    it(`should remove the animation class after the animation is finished`, async () => {
      const element = fixture.debugElement.query(By.css('div')).nativeNode;

      await service.viewFadeIn(element);

      expect(element.classList).not.toContain('fadeIn-from-bottom-animation');
    });

    it(`should stop the event propagation`, async () => {
      const element = fixture.debugElement.query(By.css('div')).nativeNode;

      await service.viewFadeIn(element);

      expect(element.classList).not.toContain('fadeIn-from-bottom-animation');
    });
  });

  describe(`runTransition()`, () => {
    it(`should run the transition`, async () => {
      const element = fixture.debugElement.query(By.css('div')).nativeNode;
      const spy = spyOn(service as any, 'runAnimationOnce').and.callThrough();

      await (service as any).runTransition(
        element,
        'fadeOut-to-left-animation',
        true
      );

      expect(spy).toHaveBeenCalledWith(element, 'fadeOut-to-left-animation', {
        removeAnimationClassOnFinish: true,
      });
    });

    it(`should run the transition using the variable defined in the component's template`, () => {
      const element = fixture.debugElement.query(By.css('div'));
      const spy = spyOn(service as any, 'runTransition').and.callThrough();

      element.nativeNode.click();

      expect(spy).toHaveBeenCalled();
    });

    it(`should remove the animation class after the animation is finished`, async () => {
      const element = fixture.debugElement.query(By.css('div')).nativeNode;

      await (service as any).runTransition(
        element,
        'fadeOut-to-left-animation',
        { removeAnimationClassOnFinish: true }
      );

      expect(
        element.classList.contains('fadeOut-to-left-animation')
      ).toBeFalse();
    });
  });
});
