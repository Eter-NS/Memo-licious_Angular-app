import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NoteGroupListContainerComponent } from '../note-group-list-container/note-group-list-container.component';
import { SmilingFaceEmojiComponent } from '../../../reusable/SVGs/smiling-face-emoji/smiling-face-emoji.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-app-recycle-bin',
  standalone: true,
  templateUrl: './app-recycle-bin.page.component.html',
  styleUrl: './app-recycle-bin.page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NoteGroupListContainerComponent,
    SmilingFaceEmojiComponent,
    MatProgressSpinnerModule,
  ],
})
export class AppRecycleBinComponent {}
