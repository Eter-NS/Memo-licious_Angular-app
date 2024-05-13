import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-partying-face-emoji',
  standalone: true,
  imports: [],
  templateUrl: './partying-face-emoji.component.html',
  styleUrl: `../emoji-styles/emoji-styles.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyingFaceEmojiComponent {}
