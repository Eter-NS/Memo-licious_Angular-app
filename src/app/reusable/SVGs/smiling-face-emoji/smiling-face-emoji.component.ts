import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-smiling-face-emoji',
  standalone: true,
  imports: [],
  templateUrl: './smiling-face-emoji.component.html',
  styles: `
      :host,
      svg {
        display: inline-block;
        width: var(--custom-svg-size, calc(var(--p) * 1.75));
        height: var(--custom-svg-size, calc(var(--p) * 1.75));
        transform: translateY(10%);
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmilingFaceEmojiComponent {}
