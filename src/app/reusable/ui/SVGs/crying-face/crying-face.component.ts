import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-crying-face',
  standalone: true,
  imports: [],
  templateUrl: './crying-face.component.html',
  styleUrl: `../emoji-styles/emoji-styles.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CryingFaceComponent {}
