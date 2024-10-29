import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NoteGroupModel } from 'src/app/auth/utils/Models/UserDataModels.interface';

@Component({
  selector: 'app-notes-list-group-element',
  standalone: true,
  imports: [MatChipsModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './notes-list-group-element.component.html',
  styleUrl: './notes-list-group-element.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesListGroupElementComponent {
  @Input({ required: true }) groupName!: string;
  @Input({ required: true }) groupValue!: NoteGroupModel;
  @Input({ required: true }) done!: boolean;

  @Output() cardClick = new EventEmitter<void>();
  @Output() toggleRemove = new EventEmitter<boolean>();

  onCardClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.cardClick.emit();
  }

  toggleRemoveGroup(e: Event) {
    e.stopPropagation();
    this.toggleRemove.emit(!this.done);
  }
}
