import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  signal,
} from '@angular/core';
import { NoProfilePictureComponent } from 'src/app/reusable/ui/SVGs/no-profile-picture/no-profile-picture.component';

export interface TextAvatarInput {
  name: string;
  color: string;
}

interface TransformedAvatarInput {
  character: string;
  color: string;
}

@Component({
  selector: 'app-profile-picture',
  standalone: true,
  imports: [NoProfilePictureComponent],
  templateUrl: './profile-picture.component.html',
  styleUrl: './profile-picture.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePictureComponent implements OnChanges {
  private _userTextData: TransformedAvatarInput | undefined;

  @Input() photoUrl?: string;
  @Input() set userTextAvatar(valueObj: TextAvatarInput | undefined) {
    if (!valueObj) {
      this._userTextData = undefined;
      return;
    }

    this._userTextData = {
      color: valueObj.color,
      character: valueObj.name[0].toUpperCase(),
    };
  }

  private _viewOption = signal<'photoUrl' | 'singleCharacter' | 'default'>(
    'default'
  );

  viewOptionSig = this._viewOption.asReadonly();

  get userTextData() {
    return this._userTextData;
  }

  ngOnChanges(): void {
    this._checkInputs();
  }

  private _checkInputs() {
    if (this.photoUrl) {
      this._viewOption.set('photoUrl');
    } else if (this._userTextData) {
      this._viewOption.set('singleCharacter');
    } else {
      this._viewOption.set('default');
    }
  }
}
