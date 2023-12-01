import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-bullet-train-emoji',
  standalone: true,
  templateUrl: './bullet-train-emoji.component.html',
  styles: [
    `
      :host,
      svg {
        display: inline-block;
        width: calc(var(--p) * 1.75);
        height: calc(var(--p) * 1.75);
        transform: translateY(10%);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulletTrainEmojiComponent {}
