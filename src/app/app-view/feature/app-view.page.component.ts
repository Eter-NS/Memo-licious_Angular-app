import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
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
import { Subject, take, takeUntil } from 'rxjs';
import { AuthUserConnectorService } from '../data-access/auth-user-connector/auth-user-connector.service';
import { ViewportListenersService } from 'src/app/reusable/data-access/viewport-listeners/viewport-listeners.service';
@Component({
  standalone: true,
  imports: [
    NavbarComponent,
    NgOptimizedImage,
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
export class AppViewComponent implements OnInit, OnDestroy {
  snackbar = inject(MatSnackBar);
  #viewportListenersService = inject(ViewportListenersService);
  #errorHandlerService = inject(ErrorHandlerService);
  #authUserConnectorService = inject(AuthUserConnectorService);

  @ViewChild('navbar') navbarComponent!: NavbarComponent;

  destroy$ = new Subject();

  ngOnInit(): void {
    this.#errorHandlerService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        this.snackbar.dismiss();
        this.snackbar.open(error, 'close', { duration: 5_000 });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
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
