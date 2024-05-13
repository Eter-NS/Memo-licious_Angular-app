import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-bullet-train-emoji',
  standalone: true,
  templateUrl: './bullet-train-emoji.component.html',
  styleUrl: '../emoji-styles/emoji-styles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulletTrainEmojiComponent {}
