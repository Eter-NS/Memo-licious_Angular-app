import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  booleanAttribute,
} from '@angular/core';
import { CustomMatRippleDirective } from 'src/app/reusable/ripples/ripple-color-checker.directive';

interface IButtonStyleOptions {
  look: 'common' | 'fab' | 'extended-fab';
  shape: 'circle' | 'pill';
  color: 'primary' | 'primary-less' | 'accent' | 'accent-less';
}

export type ButtonConfiguration = Partial<IButtonStyleOptions>;

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgTemplateOutlet, CustomMatRippleDirective],
  template: `
    @if (ripple) {
    <button
      appCustomMatRipple
      [type]="type"
      [title]="title"
      (click)="clicked.emit($event)"
      [class]="classes"
      [class.not-animated]="!animate"
    >
      <ng-container *ngTemplateOutlet="content"></ng-container>
    </button>
    <!--  -->
    }@else {
    <!--  -->
    <button [type]="type" (click)="clicked.emit($event)" [class]="classes">
      <ng-container *ngTemplateOutlet="content"></ng-container>
    </button>

    }
  `,
  styles: [
    `
      @use 'src/scss/utils.scss' as *;
      @use 'src/scss/components.scss' as *;

      :host {
        display: block;
      }

      button {
        display: grid;
        place-content: center;
      }

      .common {
        @extend %common-button;
      }
      .fab {
        @extend %floating-action-button;
      }
      .extended-fab {
        @extend %extended-fab;
      }

      .primary {
        @extend %primary-button-1;
      }
      .primary-less {
        @extend %primary-button-2;
      }
      .accent {
        @extend %accent-button-1;
      }
      .accent-less {
        @extend %accent-button-2;
      }

      .circle {
        padding: 0.75em;
      }
      .not-animated {
        transition-property: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdaptiveButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() title = '';
  @Input() animate = true;
  @Input({ transform: booleanAttribute }) ripple = false;

  @Input() set styleConfiguration(value: ButtonConfiguration) {
    this.updateClasses({ ...this.currentStyles, ...value });
  }

  @Output() clicked = new EventEmitter<Event>();

  @ContentChild('content') content!: TemplateRef<unknown>;

  currentStyles: IButtonStyleOptions = {
    look: 'common',
    shape: 'pill',
    color: 'accent',
  };

  classes: string = Object.values(this.currentStyles).filter(Boolean).join(' ');

  updateClasses(changes: IButtonStyleOptions) {
    this.classes = Object.values(changes).filter(Boolean).join(' ');
  }
}
