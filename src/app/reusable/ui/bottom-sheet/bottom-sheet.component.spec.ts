import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BottomSheetComponent } from './bottom-sheet.component';
import {
  Renderer2,
  Provider,
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-test',
  imports: [BottomSheetComponent],
  template: `
    <p>Testing BottomSheet component</p>

    @if (showContent) {
    <app-bottom-sheet
      [open]="open"
      [noAnimation]="noAnimation"
      (closed)="close($event)"
    >
      <ng-template #content>
        <p data-test="content-input-test">This is an example content</p>
      </ng-template>
    </app-bottom-sheet>
    } @else {
    <app-bottom-sheet
      [open]="open"
      [noAnimation]="noAnimation"
      (closed)="close($event)"
    />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  @Input() open = false;
  @Input() noAnimation = false;
  @Input() showContent = true;

  close = (event: boolean) => {
    event;
  };
}

describe(`BottomSheetComponent - template`, () => {
  // Component
  let fixture: ComponentFixture<TestComponent>;
  let component: BottomSheetComponent;

  let renderer: Renderer2;

  beforeEach(() => {
    spyOn(window, 'requestAnimationFrame').and.callFake(
      (fn: FrameRequestCallback) => {
        fn(1);
        return 1;
      }
    );
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [Renderer2] as Provider[],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    component = fixture.debugElement.query(
      By.directive(BottomSheetComponent)
    ).componentInstance;

    renderer = fixture.debugElement
      .query(By.directive(BottomSheetComponent))
      .injector.get(Renderer2);
  });

  it(`should create`, () => {
    // Assert
    expect(fixture.componentInstance).toBeTruthy();
    expect(component).toBeTruthy();
  });

  describe(`view`, () => {
    describe(`Open/Close State`, () => {
      it(`should open and close the bottom sheet.`, async () => {
        // Arrange
        let dataValue:
          | {
              isOpened: boolean;
              noAnimation: boolean;
              isDragging: boolean;
            }
          | undefined;

        const subscription = component['data$'].subscribe((data) => {
          dataValue = data;
        });

        const testCases = [
          { open: true, expectedResult: true },
          { open: false, expectedResult: false },
        ];

        testCases.forEach(({ open, expectedResult }, i, arr) => {
          // Act
          fixture.componentRef.setInput('open', open);
          fixture.detectChanges();

          const element = fixture.debugElement.query(
            By.css(`[data-test="bottom-sheet-element"]`)
          ).classes['open'];

          if (i === arr.length - 1) {
            subscription.unsubscribe();
          }

          // Assert
          expect(!!dataValue?.isOpened).toBe(expectedResult);
          expect(!!element).toBe(expectedResult);
        });
      });

      it(`should apply correct classes for overlay when open and closed.`, () => {
        const testCases = [
          { open: false, expectedResult: false },
          { open: true, expectedResult: true },
          { open: false, expectedResult: false },
        ];

        testCases.forEach(({ open, expectedResult }) => {
          fixture.componentRef.setInput('open', open);
          fixture.detectChanges();

          const overlayClasses = fixture.debugElement.query(
            By.css(`[data-test="bottom-sheet-overlay"]`)
          ).classes;

          expect(!!overlayClasses['visible']).toBe(expectedResult);
        });
      });
    });

    describe(`Animation Control`, () => {
      it(`should apply do-not-animate class based on noAnimation input.`, async () => {
        // Arrange
        fixture.componentRef.setInput('noAnimation', true);
        fixture.detectChanges();
        await fixture.whenStable();

        // Act
        const overlayClasses = fixture.debugElement.query(
          By.css(`[data-test="bottom-sheet-overlay"]`)
        ).classes;
        const elementClasses = fixture.debugElement.query(
          By.css(`[data-test="bottom-sheet-overlay"]`)
        ).classes;

        // Assert
        expect(overlayClasses['do-not-animate']).toBeTruthy();
        expect(elementClasses['do-not-animate']).toBeTruthy();
      });
    });

    describe(`Dragging Functionality`, () => {
      it(`should start dragging from pointerdown event.`, () => {
        // Arrange
        const nextSpy = spyOn(
          component['_isDraggingSubject'],
          'next'
        ).and.callThrough();
        const dragIcon = fixture.debugElement.query(
          By.css(`[data-test="drag-icon"]`)
        );

        // Act
        dragIcon.triggerEventHandler('pointerdown', {
          isPrimary: true,
          preventDefault: () => {},
          stopPropagation: () => {},
        } as PointerEvent);
        fixture.detectChanges();

        // Assert
        expect(nextSpy).toHaveBeenCalledWith(true);
      });

      it(`should update bottom sheet height during drag.`, async () => {
        // Arrange
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();
        await fixture.whenStable();

        spyOn(
          component.element.nativeElement,
          'hasPointerCapture'
        ).and.returnValue(false);
        const setStyleSpy = spyOn(renderer, 'setStyle').and.callThrough();

        let bottomSheetElement = fixture.debugElement.query(
          By.css(`[data-test="bottom-sheet-element"]`)
        );

        const startHeight = bottomSheetElement.nativeElement
          .offsetHeight as number;
        const mockStartY = 500; // Mock starting Y position
        const mockMoveY = 300; // Mock move Y position (moving upward)

        const eventBase = {
          isPrimary: true,
          preventDefault: () => {},
          stopPropagation: () => {},
        } as PointerEvent;

        // Act - Step 1: Start dragging
        component.startDragging({
          ...eventBase,
          pageY: mockStartY,
        } as PointerEvent);
        fixture.detectChanges();

        // Act - Step 2: Simulate drag movement
        component.dragTo({
          ...eventBase,
          pageY: mockMoveY,
          pointerId: 1,
        } as PointerEvent);

        // Wait for requestAnimationFrame
        fixture.detectChanges();
        await fixture.whenStable();

        // Assert
        bottomSheetElement = fixture.debugElement.query(
          By.css(`[data-test="bottom-sheet-element"]`)
        );
        const expectedHeight = startHeight + (mockStartY - mockMoveY);
        expect(setStyleSpy).toHaveBeenCalledWith(
          bottomSheetElement.nativeElement,
          'height',
          `${expectedHeight}px`
        );
      });

      it(`should stop dragging when pointerup occurs.`, () => {
        // Arrange
        const isDraggingSpy = spyOn(
          component['_isDraggingSubject'],
          'next'
        ).and.callThrough();

        // Start dragging
        component.startDragging({
          isPrimary: true,
          preventDefault: () => {},
          stopPropagation: () => {},
          pageY: 500,
        } as PointerEvent);
        fixture.detectChanges();

        // Act
        component.stopDragging({
          pointerId: 1,
          isPrimary: true,
        } as PointerEvent);
        fixture.detectChanges();

        // Assert
        expect(isDraggingSpy).toHaveBeenCalledWith(false);
      });

      it(`should close bottom sheet if dragged below minHeight.`, async () => {
        // Arrange
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();

        const closeSpy = spyOn(component, 'close').and.callThrough();
        const mockStartY = 500;
        const mockMoveY = window.innerHeight; // Moving downward significantly

        const eventBase = {
          isPrimary: true,
          preventDefault: () => {},
          stopPropagation: () => {},
        } as PointerEvent;

        // Act - Start dragging
        component.startDragging({
          ...eventBase,
          pageY: mockStartY,
        } as PointerEvent);
        fixture.detectChanges();
        await fixture.whenStable();

        // Simulate drag movement below minHeight
        component.dragTo({
          ...eventBase,
          pageY: mockMoveY,
          pointerId: 1,
        } as PointerEvent);

        fixture.detectChanges();
        await fixture.whenStable();

        // Trigger pointer up to end drag
        component.stopDragging({
          pointerId: 1,
          isPrimary: true,
        } as PointerEvent);
        fixture.detectChanges();
        await fixture.whenStable();

        // Assert
        expect(closeSpy).toHaveBeenCalled();
      });
    });

    describe(`Content Display`, () => {
      it(`should not show any content if open input equals false.`, () => {
        // Arrange
        fixture.componentRef.setInput('showContent', false);
        fixture.detectChanges();

        // Act
        const defaultContent = fixture.debugElement.query(
          By.css(`[data-test="default-content"]`)
        );

        // Assert
        expect(defaultContent).toBeFalsy();
      });

      it(`should display custom content provided via content input.`, () => {
        // Arrange
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();

        // Act
        const projectedContent = fixture.debugElement.query(
          By.css(`[data-test="content-input-test"]`)
        );

        // Assert
        expect(projectedContent).toBeTruthy();
      });

      it(`should display default content when no custom content is provided.`, () => {
        // Arrange
        fixture.componentRef.setInput('showContent', false);
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();

        // Act
        const projectedContent = fixture.debugElement.query(
          By.css(`[data-test="content-input-test"]`)
        );

        const defaultContent = fixture.debugElement.query(
          By.css(`[data-test="default-content"]`)
        );

        // Assert
        expect(projectedContent).toBeFalsy();
        expect(defaultContent).toBeTruthy();
      });
    });

    describe(`Accessibility`, () => {
      it(`should set ariaHidden correctly to the overlay.`, () => {
        // Arrange
        const componentStatesAndExpectedValues = [
          { state: false, expectedValue: 'true' },
          { state: true, expectedValue: 'false' },
          { state: false, expectedValue: 'true' },
        ];

        // Act
        componentStatesAndExpectedValues.map(({ state, expectedValue }) => {
          fixture.componentRef.setInput('open', state);
          fixture.detectChanges();

          const overlay = fixture.debugElement.query(
            By.css(`[data-test="bottom-sheet-overlay"]`)
          );
          const bottomSheet = fixture.debugElement.query(
            By.css(`[data-test="bottom-sheet-element"]`)
          );

          // Assert
          expect(overlay.attributes['aria-hidden']).toEqual(expectedValue);
          expect(bottomSheet.attributes['aria-hidden']).toEqual(expectedValue);
        });
      });

      it(`should close the bottom sheet when user clicks Escape.`, () => {
        // Arrange
        const emitSpy = spyOn(component.closed, 'emit').and.callThrough();

        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();

        const bottomSheetElement = fixture.debugElement.query(
          By.css(`[data-test="bottom-sheet-element"]`)
        ).nativeElement as HTMLElement;

        // Act
        bottomSheetElement.dispatchEvent(
          new KeyboardEvent('keyup', {
            key: 'Escape',
            code: 'Escape',
            bubbles: true,
          })
        );
        bottomSheetElement.dispatchEvent(new AnimationEvent('animationend'));

        fixture.detectChanges();

        // Assert
        expect(emitSpy).toHaveBeenCalled();
      });
    });

    describe(`Event Handling`, () => {
      it(`should close the bottom sheet after clicking the overlay.`, () => {
        // Arrange
        const closeSpy = spyOn(component, 'close').and.callThrough();

        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();

        const overlay = fixture.debugElement.query(
          By.css('[data-test="bottom-sheet-overlay"]')
        );
        expect(overlay.attributes['aria-hidden']).toEqual('false');

        // Act
        overlay.triggerEventHandler('click', null);
        fixture.detectChanges();

        // Assert
        const bottomSheet = fixture.debugElement.query(
          By.css('[data-test="bottom-sheet-element"]')
        );
        expect(bottomSheet.attributes['aria-hidden']).toEqual('true');
        expect(overlay.attributes['aria-hidden']).toEqual('true');
        expect(closeSpy).toHaveBeenCalled();
      });

      it(`should close the bottom sheet after pressing enter while overlay is being focused.`, () => {
        // Arrange
        const closeSpy = spyOn(component, 'close').and.callThrough();

        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();

        const overlay = fixture.debugElement.query(
          By.css('[data-test="bottom-sheet-overlay"]')
        );
        expect(overlay.attributes['aria-hidden']).toEqual('false');

        // Act
        overlay.triggerEventHandler('keyup.enter', null);
        fixture.detectChanges();

        // Assert
        const bottomSheet = fixture.debugElement.query(
          By.css('[data-test="bottom-sheet-element"]')
        );
        expect(bottomSheet.attributes['aria-hidden']).toEqual('true');
        expect(overlay.attributes['aria-hidden']).toEqual('true');
        expect(closeSpy).toHaveBeenCalled();
      });
    });
  });
});
