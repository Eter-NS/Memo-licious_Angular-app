import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AdaptiveButtonDirective,
  ButtonConfiguration,
} from './adaptive-button.directive';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

describe('AdaptiveButtonDirective', () => {
  it('should create an instance', () => {
    const directive = new AdaptiveButtonDirective();
    expect(directive).toBeTruthy();
  });

  it(`should apply default classes at directive composition.`, () => {
    // Act
    const directive = new AdaptiveButtonDirective();

    // Assert
    expect(directive['_class']).toBe('app-button common pill accent');
  });

  it(`should change classes that was modified by user.`, () => {
    // Arrange
    const directive = new AdaptiveButtonDirective();

    // Act
    directive.look = 'fab';
    directive.color = 'primary';

    // Assert
    expect(directive['_class']).toBe('app-button fab pill primary');
  });

  it(`should add 'not-animated' class when disableAnimations prop is set to true`, () => {
    // Arrange
    const directive = new AdaptiveButtonDirective();

    // Act
    directive.disableAnimations = true;

    // Assert
    expect(directive['_class']).toContain('not-animated');
  });

  it(`should remove 'not-animated' class when disableAnimations prop is set to false`, () => {
    // Arrange
    const directive = new AdaptiveButtonDirective();
    directive.disableAnimations = true;
    expect(directive['_class']).toContain('not-animated');

    // Act
    directive.disableAnimations = false;

    // Assert
    expect(directive['_class']).not.toContain('not-animated');
  });
});

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [AdaptiveButtonDirective, AsyncPipe],
  template: `
    @if (styleConfig$ | async; as styleConfig) {
    <button
      appAdaptiveButton
      [look]="styleConfig.look"
      [shape]="styleConfig.shape"
      [color]="styleConfig.color"
    >
      Example button
    </button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  private _styleConfigSubject = new BehaviorSubject<ButtonConfiguration>({});

  get styleConfig$() {
    return this._styleConfigSubject.asObservable();
  }

  changeConfig(change: ButtonConfiguration) {
    this._styleConfigSubject.next(change);
  }
}

describe('AdaptiveButtonDirective - integration', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent, AdaptiveButtonDirective],
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(`should apply the button styles.`, () => {
    // Arrange

    // Act
    const element = fixture.debugElement.query(
      By.directive(AdaptiveButtonDirective)
    ).nativeElement;

    const classes = (element as HTMLElement).classList;

    // Assert
    expect(element).toBeTruthy();
    expect(classes.contains('app-button')).toBeTrue();
  });

  it(`should apply user defined styles.`, () => {
    // Arrange
    component.changeConfig({
      look: 'fab',
      shape: 'circle',
    });
    fixture.detectChanges();

    // Act
    const element = fixture.debugElement.query(
      By.directive(AdaptiveButtonDirective)
    ).nativeElement;
    const classes = (element as HTMLElement).classList;

    // Assert
    expect(classes.contains('app-button')).toBeTrue();
    expect(classes.contains('fab')).toBeTrue();
    expect(classes.contains('circle')).toBeTrue();
    expect(classes.contains('accent')).toBeTrue();
  });
});
