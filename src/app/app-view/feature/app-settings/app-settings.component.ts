import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NotesService } from '../../data-access/notes/notes.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwitchComponent } from 'src/app/reusable/ui/switch/switch.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { LocalStorageService } from 'src/app/reusable/data-access/localStorage/local-storage.service';
import { ThemeOptions } from '../../utils/models/app-settings.interface';
import { AsyncPipe } from '@angular/common';
import { ProfilePictureComponent } from 'src/app/reusable/ui/profile-picture/profile-picture.component';
import { MatInputModule } from '@angular/material/input';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { ViewportListenersService } from 'src/app/reusable/data-access/viewport-listeners/viewport-listeners.service';
import { APP_SETTINGS_FORM_TOKEN } from '../../utils/tokens/app-settings.tokens';
import { UserProfileService } from '../../data-access/user-profile/user-profile.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SparklesEmojiComponent } from '../../../reusable/ui/SVGs/sparkles-emoji/sparkles-emoji.component';

interface SettingsFormModelI {
  theme: ThemeOptions;
  fastDeletingMode: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './app-settings.component.html',
  styleUrl: './app-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    AsyncPipe,
    SwitchComponent,
    ProfilePictureComponent,
    MatProgressSpinnerModule,
    SparklesEmojiComponent,
  ],
})
export class AppSettingsComponent implements OnInit {
  viewTransitionService = inject(ViewTransitionService);
  #userProfileService = inject(UserProfileService);
  #viewportListenersService = inject(ViewportListenersService);
  #localStorageService = inject(LocalStorageService);
  #notesService = inject(NotesService);
  #fb = inject(NonNullableFormBuilder);
  #destroyRef = inject(DestroyRef);

  appSettingsForm = this.#fb.group({
    theme: this.#fb.control<ThemeOptions>('auto'),
    fastDeletingMode: this.#fb.control(false),
  });

  existingUser$ = this.#userProfileService.userProfile$;

  #savedFormState: SettingsFormModelI | null =
    this.#localStorageService.loadFromStorage<SettingsFormModelI>(
      APP_SETTINGS_FORM_TOKEN
    );

  @ViewChild('container', { static: true })
  container!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this._loadAppState();
    this._listenForAppSettingsChanges();
    this.viewTransitionService.viewFadeIn(this.container.nativeElement);
  }

  private _listenForAppSettingsChanges() {
    this.appSettingsForm.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this._saveAppChanges();
      });
  }

  private _loadAppState() {
    if (!this.#savedFormState) {
      return;
    }
    this.appSettingsForm.setValue(this.#savedFormState);
  }

  private _saveAppChanges() {
    const currentFormState: SettingsFormModelI =
      this.appSettingsForm.getRawValue();

    // App modules change
    if (this.#savedFormState?.theme !== currentFormState.theme) {
      this.#viewportListenersService.changeTheme(currentFormState.theme);
    }

    if (
      this.#savedFormState?.fastDeletingMode !==
      currentFormState.fastDeletingMode
    ) {
      this.#notesService.changeRemovingStrategy(
        currentFormState.fastDeletingMode ? 'fast' : 'slow'
      );
    }

    this.#savedFormState = currentFormState;

    this.#localStorageService.saveToStorage(
      APP_SETTINGS_FORM_TOKEN,
      currentFormState
    );
  }
}
