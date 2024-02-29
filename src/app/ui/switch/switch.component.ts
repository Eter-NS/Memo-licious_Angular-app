/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-switch',
  standalone: true,
  imports: [MatSlideToggleModule, NgTemplateOutlet],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true,
    },
  ],
  template: `
    <mat-slide-toggle
      color="{{ color }}"
      [checked]="checked"
      (change)="onToggleChange($event)"
    />
  `,
  styleUrl: './switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [],
})
export class SwitchComponent implements ControlValueAccessor {
  @Input() color: 'primary' | 'accent' | 'warn' = 'accent';
  @Input() checked: boolean = false;
  @Input() label: string = '';
  @Output() toggleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  onChange: any = () => {};
  onTouch: any = () => {};

  onToggleChange(event: MatSlideToggleChange) {
    this.checked = event.checked;
    this.onChange(this.checked);
    this.toggleChange.emit(this.checked);
  }

  writeValue(val: boolean): void {
    this.checked = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
}
