import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sparkles-emoji',
  standalone: true,
  templateUrl: './sparkles-emoji.component.html',
  styleUrl: `../emoji-styles/emoji-styles.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SparklesEmojiComponent {}
