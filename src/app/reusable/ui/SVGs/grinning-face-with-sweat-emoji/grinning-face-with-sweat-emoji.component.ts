import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-grinning-face-with-sweat-emoji',
  standalone: true,
  imports: [],
  templateUrl: './grinning-face-with-sweat-emoji.component.html',
  styleUrl: `../emoji-styles/emoji-styles.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrinningFaceWithSweatEmojiComponent {}
