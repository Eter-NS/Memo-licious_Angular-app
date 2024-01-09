import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';

import { FirstViewComponent } from './first-view.component';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterModule } from '@angular/router';

const ChoosePathComponentMock = jasmine.createSpyObj('ChoosePathComponent', [
  'anything',
]);

describe('FirstViewComponent', () => {
  let component: FirstViewComponent;
  let fixture: ComponentFixture<FirstViewComponent>;
  let buttonDe: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        RouterModule.forRoot([
          { path: '', component: FirstViewComponent },
          {
            path: 'getting-started/choose-path',
            component: ChoosePathComponentMock,
          },
        ]),
        FirstViewComponent,
      ],
    });
    fixture = TestBed.createComponent(FirstViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    buttonDe = fixture.debugElement.query(By.css('.greeting__CTA'));
  });

  it('should create created', () => {
    expect(component).toBeTruthy();
  });

  describe('fillView()', () => {
    it('should call fillView()', () => {
      const fillViewSpy = spyOn(component, 'fillView');

      component.fillView();

      expect(fillViewSpy).toHaveBeenCalled();
    });

    it('should call addAnimations and startAnimation', () => {
      const element = component.sectionContainer.nativeElement;
      const addAnimationsSpy = spyOn(
        component,
        'addAnimations'
      ).and.callThrough();
      const startAnimationSpy = spyOn(
        component,
        'startAnimation'
      ).and.callThrough();

      component.fillView();

      expect(addAnimationsSpy).toHaveBeenCalledWith(
        element,
        'fill-the-view-animation'
      );
      expect(startAnimationSpy).toHaveBeenCalledWith(element);
    });
  });

  describe('runTransition()', () => {
    it('should call runAnimations with the correct arguments', () => {
      const element = component.sectionContainer.nativeElement;

      spyOn(component, 'runAnimations');
      spyOn(component, 'fillView');

      component.runTransition();

      expect(component.runAnimations).toHaveBeenCalledWith(
        element,
        '.fade-out-animation',
        true
      );
    });

    it('should call fillView after a 300ms delay', fakeAsync(() => {
      spyOn(component, 'fillView');

      component.runTransition();

      flush();
      expect(component.fillView).toHaveBeenCalled();
    }));

    it('should call runTransition() after clicking the CTA button by click event', () => {
      const runAnimationSpy = spyOn(component, 'runTransition');
      buttonDe.triggerEventHandler('click', null);

      expect(runAnimationSpy).toHaveBeenCalled();
    });

    it('should call runTransition() after clicking the CTA button by keyup.enter event', () => {
      const runAnimationSpy = spyOn(component, 'runTransition');
      buttonDe.triggerEventHandler('keyup.enter', null);

      expect(runAnimationSpy).toHaveBeenCalled();
    });
  });
});
