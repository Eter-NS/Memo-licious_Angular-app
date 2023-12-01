import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { PreviousPageButtonComponent } from '../../ui/previous-page-button/previous-page-button.component';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { checkPassword } from 'src/app/custom-validations/custom-validations';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { parseActionCodeURL } from '@angular/fire/auth';
import { AuthEmailService } from '../services/email/auth-email.service';
import { AuthAccountService } from '../services/account/auth-account.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  templateUrl: './auth-state.component.html',
  styleUrls: [
    '../form.scss',
    '../password-reset.scss',
    './auth-state.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PreviousPageButtonComponent,
    NgIf,
    MatSnackBarModule,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    MatIconModule,
  ],
})
export class AuthStateComponent implements AfterViewInit {
  viewTransitionService = inject(ViewTransitionService);
  route = inject(ActivatedRoute);
  authAccountService = inject(AuthAccountService);
  authEmailService = inject(AuthEmailService);

  fb = inject(NonNullableFormBuilder);
  snackBar = inject(MatSnackBar);
  @ViewChild('content') content!: ElementRef<HTMLElement>;
  urlData = parseActionCodeURL(location.href);

  newPassword = this.fb.control('', {
    validators: [checkPassword],
    updateOn: 'blur',
  });

  ngAfterViewInit(): void {
    this.viewTransitionService.viewFadeIn(this.content.nativeElement);
  }

  handleChangePassword(e: Event) {
    e.preventDefault();
    if (this.newPassword.invalid) return;
    if (!this.urlData || this.urlData.code) return;
    this.authAccountService
      .newPasswordChecker(
        this.urlData.code,
        this.newPassword.getRawValue() as string
      )
      .then(() => {
        setTimeout(() => {
          this.viewTransitionService.goForward(
            this.content.nativeElement,
            this.urlData?.continueUrl || '/online/force=login'
          );
        }, 3000);
      })
      .catch((err) => {
        this.snackBar.open(err.message, 'close', { duration: 5000 });
      });
  }
}
