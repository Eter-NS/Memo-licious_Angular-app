import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-no-profile-picture',
  standalone: true,
  imports: [],
  templateUrl: './no-profile-picture.component.html',
  styleUrl: `../emoji-styles/emoji-styles.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoProfilePictureComponent {}
