import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-no-profile-picture',
  standalone: true,
  imports: [],
  templateUrl: './no-profile-picture.component.html',
  styles: `
    :host,
      svg {
        display: inline-block;
        width: var(--custom-svg-size, calc(var(--p) * 1.75));
        height: var(--custom-svg-size, calc(var(--p) * 1.75));
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoProfilePictureComponent {}
