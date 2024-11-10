import {
  ChangeDetectionStrategy,
  Component,
  DebugElement,
  Input,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { LongPressDirective } from './long-press.directive';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-test',
  imports: [LongPressDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button appLongPress [duration]="duration" (longPress)="handleLongPress()">
      Test Button
    </button>
  `,
})
class TestComponent {
  @Input() duration = 500;

  pressCount = 0;

  handleLongPress() {
    this.pressCount++;
  }
}

describe('LongPressDirective', () => {
  // Mocks
  let eventObject: jasmine.SpyObj<PointerEvent>;

  // Component
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let button: DebugElement;

  beforeEach(() => {
    eventObject = jasmine.createSpyObj<PointerEvent>([
      'preventDefault',
      'stopPropagation',
    ]);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.debugElement.query(By.css('button'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit longPress event after specified duration.', fakeAsync(() => {
    // Arrange

    // Act
    button.triggerEventHandler('pointerdown', eventObject);
    tick(500);

    // Assert
    expect(component.pressCount).toBe(1);
  }));

  it('should not emit longPress if pointer is released before duration.', fakeAsync(() => {
    // Act
    button.triggerEventHandler('pointerdown', eventObject);
    tick(400); // Release before 500ms
    button.triggerEventHandler('pointerup', eventObject);
    tick(100);

    // Assert
    expect(component.pressCount).toBe(0);
  }));

  it('should respect custom duration input.', fakeAsync(() => {
    // Arrange
    fixture.componentRef.setInput('duration', 1000);
    fixture.detectChanges();
    flush();

    // Act
    button.triggerEventHandler('pointerdown', eventObject);
    tick(800);

    // Assert
    expect(component.pressCount).toBe(0);

    tick(200);
    expect(component.pressCount).toBe(1);
  }));

  it('should prevent default behavior on pointerdown.', () => {
    // Act
    button.triggerEventHandler('pointerdown', eventObject);

    // Assert
    expect(eventObject.preventDefault).toHaveBeenCalled();
    expect(eventObject.stopPropagation).toHaveBeenCalled();
  });

  it('should cleanup timeout on pointerup.', fakeAsync(() => {
    // Act
    button.triggerEventHandler('pointerdown', eventObject);
    button.triggerEventHandler('pointerup', eventObject);
    tick(500);

    // Assert
    expect(component.pressCount).toBe(0);
  }));
});
