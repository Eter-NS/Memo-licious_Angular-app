import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CustomMatRippleDirective } from 'src/app/reusable/ripples/ripple-color-checker.directive';
import { NavbarComponent } from 'src/app/ui/navbar/navbar.component';
import { ErrorHandlerService } from '../data-access/error-handler/error-handler.service';
import { take, timer } from 'rxjs';
import { AuthUserConnectorService } from '../data-access/auth-user-connector/auth-user-connector.service';
import { ViewportListenersService } from 'src/app/reusable/data-access/viewport-listeners/viewport-listeners.service';
import { NotesService } from '../data-access/notes/notes.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  imports: [
    NavbarComponent,
    RouterLink,
    MatIconModule,
    RouterOutlet,
    CustomMatRippleDirective,
    MatSnackBarModule,
  ],
  templateUrl: './app-view.page.component.html',
  styleUrls: ['./app-view.page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppViewComponent implements OnInit {
  #snackbar = inject(MatSnackBar);
  #viewportListenersService = inject(ViewportListenersService);
  #errorHandlerService = inject(ErrorHandlerService);
  #authUserConnectorService = inject(AuthUserConnectorService);
  #notesService = inject(NotesService);
  #destroyRef = inject(DestroyRef);

  @ViewChild('navbar') navbarComponent!: NavbarComponent;

  ngOnInit(): void {
    this.#errorHandlerService.error$
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((error) => {
        this.#snackbar.dismiss();
        this.#snackbar.open(error, 'close', { duration: 5_000 });
      });

    const MINIMUM_EXECUTION_TIME = 0;
    const INTERVAL_PERIOD = 1000 * 60;

    timer(MINIMUM_EXECUTION_TIME, INTERVAL_PERIOD)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.#notesService.clearNoteGroups();
      });
  }

  closeNavbar() {
    this.#viewportListenersService.isHandset$
      .pipe(take(1))
      .subscribe((isMobile) => {
        if (isMobile) {
          this.navbarComponent.drawer.close();
        }
      });
  }

  logOut() {
    this.#authUserConnectorService.logOutUser();
  }
}
