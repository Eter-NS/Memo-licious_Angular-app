import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NotesService } from '../../data-access/notes/notes.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwitchComponent } from 'src/app/ui/switch/switch.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { LocalStorageService } from 'src/app/reusable/localStorage/local-storage.service';
import { ThemeOptions } from '../../utils/models/app-settings.interface';
import { AuthUserConnectorService } from '../../data-access/auth-user-connector/auth-user-connector.service';
import { AsyncPipe } from '@angular/common';
import { ProfilePictureComponent } from 'src/app/ui/profile-picture/profile-picture.component';
import { MatInputModule } from '@angular/material/input';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { ViewportListenersService } from 'src/app/reusable/data-access/viewport-listeners/viewport-listeners.service';
import { APP_SETTINGS_FORM_TOKEN } from '../../utils/tokens/app-settings.tokens';

interface SettingsFormModelI {
  theme: ThemeOptions;
  fastDeletingMode: boolean;
}

@Component({
  selector: 'app-app-settings',
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
  ],
})
export class AppSettingsComponent implements OnInit {
  viewTransitionService = inject(ViewTransitionService);
  #authUserConnectorService = inject(AuthUserConnectorService);
  #viewportListenersService = inject(ViewportListenersService);
  #localStorageService = inject(LocalStorageService);
  #notesService = inject(NotesService);
  #fb = inject(NonNullableFormBuilder);

  appSettingsForm = this.#fb.group({
    theme: this.#fb.control<ThemeOptions>('auto'),
    fastDeletingMode: this.#fb.control(false),
  });

  existingUser$ = this.#authUserConnectorService.userProfile$.pipe(
    takeUntilDestroyed()
  );

  #savedFormState!: SettingsFormModelI;

  constructor() {
    this._listenForAppSettingsChanges();
  }

  ngOnInit(): void {
    this._loadAppState();
  }

  private _listenForAppSettingsChanges() {
    this.appSettingsForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._saveAppChanges();
      });
  }

  private _loadAppState() {
    const previousState =
      this.#localStorageService.loadFromStorage<SettingsFormModelI>(
        APP_SETTINGS_FORM_TOKEN
      );

    if (!previousState) {
      return;
    }

    this.#savedFormState = previousState;
    this.appSettingsForm.setValue(previousState);
  }

  private _saveAppChanges() {
    const currentFormState: SettingsFormModelI =
      this.appSettingsForm.getRawValue();

    // App modules change
    if (this.#savedFormState.theme !== currentFormState.theme) {
      this.#viewportListenersService.changeTheme(currentFormState.theme);
    }

    if (
      this.#savedFormState.fastDeletingMode !==
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
