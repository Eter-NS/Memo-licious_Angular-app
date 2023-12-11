import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-adaptive-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (formula === 'anchor') { @if (href && href.length > 0 && ripple) {
    <a
      appCustomMatRipple
      [routerLink]="[href]"
      (click)="buttonClick.emit($event)"
      [ngClass]="type + ' ' + color + ' ' + classes"
    >
      {{ placeholder }}
    </a>
    } @if (href && href.length > 0 && !ripple) {
    <a
      [routerLink]="[href]"
      (click)="buttonClick.emit($event)"
      [ngClass]="type + ' ' + color + ' ' + classes"
    >
      {{ placeholder }}
    </a>
    } @else {
    <a
      (click)="buttonClick.emit($event)"
      (keyup.enter)="buttonClick.emit($event)"
      [ngClass]="type + ' ' + color + ' ' + classes"
      tabindex="0"
    >
      {{ placeholder }}
    </a>
    } }@else {
    <button
      appCustomMatRipple
      [type]="type"
      (click)="buttonClick.emit($event)"
      [ngClass]="type + ' ' + color + ' ' + classes"
    >
      {{ placeholder }}
    </button>
    }
  `,
  styles: [
    `
      @use '/src/scss/utils.scss' as *;
      @use '/src/scss/components.scss' as *;

      .common-button {
        @extend %common-button;
      }
      .fab {
        @extend %floating-action-button;
      }
      .extended-fab {
        @extend %extended-fab;
      }

      .primary {
        @extend %primary-button;
      }
      .secondary {
        @extend %secondary-button;
      }
    `,
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdaptiveButtonComponent {
  @Input({ required: true }) type!: 'common-button' | 'fab' | 'extended-fab';
  @Input({ required: true }) formula!: 'anchor' | 'button';
  /**
   * Applied only to formula='anchor'
   */
  @Input() color: 'primary' | 'secondary' = 'secondary';
  @Input() classes = '';
  @Input() placeholder = '';
  @Input() ripple?: boolean;
  @Input() href?: string;
  @Output() buttonClick = new EventEmitter<Event | null>();
}
