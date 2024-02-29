import { Component } from '@angular/core';
import {
  runAnimationOnce,
  runAnimations,
  runWithDelay,
} from './animation-triggers';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

const styles = `
@use "./animations.scss"
`;

@Component({
  standalone: true,
  template: `<div>
    <div class="fade-out-animation"></div>
    <div></div>
    <div class="fade-out-animation"></div>
    <div></div>
    <div class="fade-out-animation"></div>
    <div></div>
    <div class="fade-out-animation"></div>
    <div></div>
    <div class="fade-out-animation"></div>
    <div></div>
    <div class="fade-out-animation"></div>
  </div>`,
  styles: styles,
})
class TestComponent {}

describe(`animation-triggers`, () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.nativeElement.className = '';
    fixture.detectChanges();
  });

  describe(`runAnimationOnce()`, () => {
    it(`should run the animation only once (without removing after animation finishes)`, async () => {
      const element = fixture.nativeElement;
      const animation = `fade-out-animation`;

      await runAnimationOnce(element, animation);

      expect(element.classList.contains(animation)).toBeTrue();
    });

    it(`should run the animation only once (removes animation class when finished)`, async () => {
      const element = fixture.nativeElement;
      const animation = `fade-out-animation`;

      await runAnimationOnce(element, animation, {
        removeClassOnFinish: true,
      });

      expect(element.classList.contains(animation)).toBeFalse();
    });
  });

  describe(`runAnimations()`, () => {
    it(`should start the animation on a DOM element`, () => {
      const element = fixture.nativeElement;

      runAnimations(element);

      expect(element.classList.contains(`play`)).toBeTrue();
    });

    it(`should run the animation on DOM element's children which contain such animation`, () => {
      const element = fixture.nativeElement;
      const animation = `.fade-out-animation`;

      runAnimations(element, animation, true);

      const children = fixture.debugElement.queryAll(
        By.css(`.fade-out-animation`)
      );
      expect(
        children.every((element) =>
          (element.nativeElement as HTMLElement).classList.contains('play')
        )
      ).toBeTrue();
    });

    it(`should run the animation on DOM element's array (Array<HTMLElement>)`, () => {
      const debugElements = fixture.debugElement.queryAll(
        By.css(`.fade-out-animation`)
      );
      const elements: Array<HTMLElement> = debugElements.map(
        (debugElement) => debugElement.nativeElement
      );

      runAnimations(elements);

      expect(
        elements.every((element) => element.classList.contains('play'))
      ).toBeTrue();
    });

    it(`should run the animation on DOM element's collection (NodeListOf<HTMLElement>)`, () => {
      const elements = (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLElement>(`.fade-out-animation`);

      runAnimations(elements);

      const checkArray = Array.from(elements);
      expect(
        checkArray.every((element) => element.classList.contains('play'))
      ).toBeTrue();
    });
  });

  describe(`runWithDelay()`, () => {
    it(`should run the animation with a specified delay`, async () => {
      const elements = (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLElement>(`.fade-out-animation`);

      await runWithDelay(elements, {
        delayT: 100,
        reverse: true,
        timeout: 100,
      });

      const checkArray = Array.from(elements);
      expect(
        checkArray.every((element) => !element.classList.contains('play'))
      ).toBeTrue();
    });

    it(`should run the animation with a specified delay (reverse)`, async () => {
      const elements = (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLElement>(`.fade-out-animation`);

      await runWithDelay(elements, {
        reverse: true,
      });

      const checkArray = Array.from(elements);
      expect(
        checkArray.every((element) => !element.classList.contains('play'))
      ).toBeTrue();
    });

    it(`should run the animation with a specified delay (no options)`, async () => {
      const elements = (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLElement>(`.fade-out-animation`);

      await runWithDelay(elements);

      const checkArray = Array.from(elements);
      expect(
        checkArray.every((element) => !element.classList.contains('play'))
      ).toBeTrue();
    });

    it(`should reject the promise when the array's element is falsy`, async () => {
      const elements = (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLElement>(`.fade-out-animation`);
      const unknownElements = Array.from(elements).map((element, index) => {
        if (index === 2) return null;
        return element;
      });

      try {
        await runWithDelay(unknownElements as Array<HTMLElement>);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
  });
});
