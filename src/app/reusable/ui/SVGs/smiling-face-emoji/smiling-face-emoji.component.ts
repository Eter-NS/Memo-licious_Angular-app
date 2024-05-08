import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-smiling-face-emoji',
  standalone: true,
  imports: [],
  templateUrl: './smiling-face-emoji.component.html',
  styleUrl: `../emoji-styles/emoji-styles.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmilingFaceEmojiComponent {}
