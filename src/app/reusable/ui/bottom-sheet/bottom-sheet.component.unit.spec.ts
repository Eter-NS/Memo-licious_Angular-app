import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { BottomSheetComponent } from './bottom-sheet.component';
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Renderer2,
  Provider,
} from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-test',
  imports: [BottomSheetComponent],
  template: `
    <p>Testing BottomSheet component</p>

    <app-bottom-sheet
      [open]="open"
      [noAnimation]="noAnimation"
      (closed)="close($event)"
    >
      <ng-template #content>
        <p data-test="content-input-test">This is an example content</p>
      </ng-template>
    </app-bottom-sheet>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  @Input() open = false;
  @Input() noAnimation = false;

  close = (event: boolean) => {
    event;
  };
}

describe('BottomSheetComponent', () => {
  // Component
  let fixture: ComponentFixture<TestComponent>;
  let component: BottomSheetComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [Renderer2] as Provider[],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.debugElement.query(
      By.directive(BottomSheetComponent)
    ).componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    spyOn(window, 'requestAnimationFrame').and.callFake(
      (fn: FrameRequestCallback) => {
        fn(1);
        return 1;
      }
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe(`Inputs`, () => {
    it(`should call _isOpenedSubject.next when new value is passed in.`, () => {
      // Arrange
      const nextSpy = spyOn(
        component['_isOpenedSubject'],
        'next'
      ).and.callThrough();

      // Act
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();

      // Assert
      expect(nextSpy).toHaveBeenCalledWith(true);
    });

    it(`should call _noAnimationSubject.next when new value is passed in.`, () => {
      // Arrange
      const nextSpy = spyOn(
        component['_noAnimationSubject'],
        'next'
      ).and.callThrough();

      // Act
      fixture.componentRef.setInput('noAnimation', true);
      fixture.detectChanges();

      // Assert
      expect(nextSpy).toHaveBeenCalledWith(true);
    });
  });

  describe(`Observables`, () => {
    it(`should update the data$ when any of connected observables emits a new value.`, fakeAsync(() => {
      // Arrange
      let result:
        | {
            isOpened: boolean;
            noAnimation: boolean;
            isDragging: boolean;
          }
        | undefined;
      const subscription = component['data$'].subscribe((value) => {
        result = value;
      });

      // Act
      component['_isOpenedSubject'].next(true);

      tick();
      subscription.unsubscribe();

      // Assert
      expect(result).toEqual({
        isOpened: true,
        noAnimation: false,
        isDragging: false,
      });
    }));
  });

  describe(`Lifecycle hooks`, () => {
    describe(`ngAfterContentInit()`, () => {
      it(`should find the ng-template element with 'content' selector from the parent component.`, () => {
        // Act
        const defaultContent = fixture.debugElement.query(
          By.css(`[data-test="default-content"]`)
        );

        // Assert
        expect(component.content).toBeTruthy();
        expect(defaultContent).toBeFalsy();
      });
    });

    describe(`ngAfterViewInit()`, () => {
      it(`should find the bottom sheet element.`, () => {
        // Act & Assert
        expect(component.element).toBeTruthy();
      });
    });
  });

  describe(`methods`, () => {
    describe(`close()`, () => {
      it(`should execute the callback on 'transitionend'.`, () => {
        // Arrange
        const setNewHeightSpy = spyOn(component, 'setNewHeight');

        // Act
        component.close();
        component.element.nativeElement.dispatchEvent(
          new Event('transitionend')
        );
        fixture.detectChanges();

        // Assert
        expect(setNewHeightSpy).toHaveBeenCalled();
      });

      it(`should execute the callback on 'animationend'.`, () => {
        // Arrange
        const setNewHeightSpy = spyOn(component, 'setNewHeight');

        // Act
        component.close();
        component.element.nativeElement.dispatchEvent(
          new Event('animationend')
        );
        fixture.detectChanges();

        // Assert
        expect(setNewHeightSpy).toHaveBeenCalled();
      });

      it(`should emit the 'closed' event only once in case two animation events were triggered.`, () => {
        // Arrange
        const setNewHeightSpy = spyOn(component, 'setNewHeight');
        const emitSpy = spyOn(component.closed, 'emit');

        // Act
        component.close();
        component.element.nativeElement.dispatchEvent(
          new Event('transitionend')
        );
        component.element.nativeElement.dispatchEvent(
          new Event('animationend')
        );
        fixture.detectChanges();

        // Assert
        expect(emitSpy).toHaveBeenCalledOnceWith(false);
        expect(setNewHeightSpy).toHaveBeenCalledTimes(2);
      });
    });

    describe(`startDragging()`, () => {
      it(`should stop method execution if the PointerEvent is not primary.`, () => {
        // Arrange
        const nextSpy = spyOn(component['_isDraggingSubject'], 'next');

        // Act
        component.startDragging(
          new PointerEvent('pointerdown', {
            pointerType: 'mouse',
            isPrimary: false,
          })
        );

        // Assert
        expect(nextSpy).not.toHaveBeenCalled();
      });

      it(`should emit new value to _isDraggingSubject if the PointerEvent is primary.`, () => {
        // Arrange
        const nextSpy = spyOn(component['_isDraggingSubject'], 'next');

        // Act
        component.startDragging(
          new PointerEvent('pointerdown', {
            pointerType: 'mouse',
            isPrimary: true,
          })
        );

        // Assert
        expect(nextSpy).toHaveBeenCalled();
      });
    });

    describe(`dragTo()`, () => {
      it(`should stop method execution if _isDraggingSubject's value is false.`, () => {
        // Arrange
        const hasPointerCaptureSpy = spyOn(
          component.element.nativeElement,
          'hasPointerCapture'
        );

        component['_isDraggingSubject'].next(false);
        fixture.detectChanges();

        // Act
        component.dragTo(
          new PointerEvent('pointermove', {
            pointerType: 'mouse',
            isPrimary: true,
          })
        );

        // Assert
        expect(hasPointerCaptureSpy).not.toHaveBeenCalled();
      });

      it(`should stop method execution if the PointerEvent is not primary.`, () => {
        // Arrange
        const hasPointerCaptureSpy = spyOn(
          component.element.nativeElement,
          'hasPointerCapture'
        );

        component['_isDraggingSubject'].next(true);
        fixture.detectChanges();

        // Act
        component.dragTo(
          new PointerEvent('pointermove', {
            pointerType: 'mouse',
            isPrimary: false,
          })
        );

        // Assert
        expect(hasPointerCaptureSpy).not.toHaveBeenCalled();
      });

      it(`should set pointer capture on the bottom sheet element for the event source (mouse/touch) if it's not registered.`, () => {
        // Arrange
        spyOn(
          component.element.nativeElement,
          'hasPointerCapture'
        ).and.returnValue(false);

        const setPointerCaptureSpy = spyOn(
          component.element.nativeElement,
          'setPointerCapture'
        );

        component['_isDraggingSubject'].next(true);
        fixture.detectChanges();

        // Act
        component.dragTo(
          new PointerEvent('pointermove', {
            pointerId: 0,
            pointerType: 'mouse',
            isPrimary: true,
          })
        );

        // Assert
        expect(setPointerCaptureSpy).toHaveBeenCalled();
      });
    });

    describe(`stopDragging()`, () => {
      it(`should stop method execution if _isDraggingSubject's value is false.`, () => {
        // Arrange
        const hasPointerCaptureSpy = spyOn(
          component.element.nativeElement,
          'hasPointerCapture'
        );

        component['_isDraggingSubject'].next(false);
        fixture.detectChanges();

        // Act
        component.stopDragging(
          new PointerEvent('pointermove', {
            pointerType: 'mouse',
            isPrimary: true,
          })
        );

        // Assert
        expect(hasPointerCaptureSpy).not.toHaveBeenCalled();
      });

      it(`should stop method execution if the PointerEvent is not primary.`, () => {
        // Arrange
        const hasPointerCaptureSpy = spyOn(
          component.element.nativeElement,
          'hasPointerCapture'
        );

        component['_isDraggingSubject'].next(true);
        fixture.detectChanges();

        // Act
        component.stopDragging(
          new PointerEvent('pointermove', {
            pointerType: 'mouse',
            isPrimary: false,
          })
        );

        // Assert
        expect(hasPointerCaptureSpy).not.toHaveBeenCalled();
      });

      it(`should release pointer capture on the bottom sheet for the event source (mouse/touch) if it's registered.`, () => {
        // Arrange
        const releasePointerCaptureSpy = spyOn(
          component.element.nativeElement,
          'releasePointerCapture'
        );
        spyOn(
          component.element.nativeElement,
          'hasPointerCapture'
        ).and.returnValue(true);

        component['_isDraggingSubject'].next(true);
        fixture.detectChanges();

        // Act
        component.stopDragging(
          new PointerEvent('pointermove', {
            pointerType: 'mouse',
            isPrimary: true,
          })
        );

        // Assert
        expect(releasePointerCaptureSpy).toHaveBeenCalled();
      });

      it(`should call close method when bottom sheet height is smaller than minimum height.`, () => {
        // Arrange
        const closeSpy = spyOn(component, 'close');

        component['_isDraggingSubject'].next(true);
        fixture.detectChanges();

        // Act
        (
          fixture.debugElement.query(
            By.css(`[data-test="bottom-sheet-element"]`)
          ).nativeElement as HTMLElement
        ).style.height = '10px';

        component.stopDragging(
          new PointerEvent('pointermove', {
            pointerType: 'mouse',
            isPrimary: true,
          })
        );

        // Assert
        expect(closeSpy).toHaveBeenCalled();
      });
    });

    describe(`setNewHeight()`, () => {
      let renderer: Renderer2;

      beforeEach(() => {
        renderer = fixture.debugElement
          .query(By.directive(BottomSheetComponent))
          .injector.get(Renderer2);
      });

      it(`should call renderer.setStyle and apply new height for the bottom sheet.`, () => {
        // Arrange
        const setStyleSpy = spyOn(renderer, 'setStyle');
        const newHeight = 100;

        // Act
        component.setNewHeight(newHeight);

        // Assert
        expect(setStyleSpy).toHaveBeenCalledWith(
          component.element.nativeElement,
          'height',
          `${newHeight}px`
        );
      });
    });
  });
});
