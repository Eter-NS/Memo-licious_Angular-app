import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-crying-face',
  standalone: true,
  templateUrl: './crying-face-emoji.component.html',
  styleUrl: `../emoji-styles/emoji-styles.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CryingFaceComponent {}
