import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { checkEmail } from 'src/app/custom-validations/custom-validations';
import { AsyncPipe, NgIf } from '@angular/common';
import { CustomMatRippleDirective } from 'src/app/reusable/ripples/ripple-color-checker.directive';
import { PreviousPageButtonComponent } from 'src/app/ui/previous-page-button/previous-page-button.component';
import { AuthEmailService } from '../services/email/auth-email.service';
import { MatSpinnerTogglerDirective } from 'src/app/reusable/mat-spinner-toggler.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeLast } from 'rxjs';

@Component({
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrls: [
    '../form.scss',
    '../password-reset.scss',
    './forgot-password.component.scss',
  ],
  imports: [
    PreviousPageButtonComponent,
    ReactiveFormsModule,
    NgIf,
    CustomMatRippleDirective,
    MatSpinnerTogglerDirective,
    MatProgressSpinnerModule,
    AsyncPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent implements AfterViewInit {
  viewTransitionService = inject(ViewTransitionService);
  authEmailService = inject(AuthEmailService);
  fb = inject(NonNullableFormBuilder);
  @ViewChild('content') content!: ElementRef<HTMLElement>;
  emailSent = false;
  emailAddress = this.fb.control('', {
    validators: [checkEmail],
    updateOn: 'blur',
  });

  emailAddress$ = this.emailAddress.valueChanges.pipe(takeLast(1));

  ngAfterViewInit(): void {
    this.viewTransitionService.viewFadeIn(this.content.nativeElement);
  }

  async checkEmail(e: Event) {
    e.preventDefault();
    if (this.emailAddress.invalid && !this.emailAddress.value) return;
    this.emailSent = await this.authEmailService.sendResetEmail(
      this.emailAddress.value as string
    );
  }
}
