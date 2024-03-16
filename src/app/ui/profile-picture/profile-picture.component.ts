import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  signal,
} from '@angular/core';
import { NoProfilePictureComponent } from 'src/app/reusable/SVGs/no-profile-picture/no-profile-picture.component';

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
  #userTextData: TransformedAvatarInput | undefined;

  @Input() photoUrl?: string;
  @Input() set userTextAvatar(valueObj: TextAvatarInput | undefined) {
    if (!valueObj) {
      this.#userTextData = undefined;
      return;
    }

    this.#userTextData = {
      color: valueObj.color,
      character: valueObj.name[0].toUpperCase(),
    };
  }

  #viewOption = signal<'photoUrl' | 'singleCharacter' | 'default'>('default');

  get viewOptionSig() {
    return this.#viewOption.asReadonly();
  }

  get userTextData() {
    return this.#userTextData;
  }

  ngOnChanges(): void {
    this._checkInputs();
  }

  private _checkInputs() {
    if (this.photoUrl) {
      this.#viewOption.set('photoUrl');
    } else if (this.#userTextData) {
      this.#viewOption.set('singleCharacter');
    } else {
      this.#viewOption.set('default');
    }
  }
}
