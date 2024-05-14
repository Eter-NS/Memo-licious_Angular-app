import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { checkEmail } from 'src/app/reusable/utils/custom-validations/custom-validations';
import { AsyncPipe } from '@angular/common';
import { CustomMatRippleDirective } from 'src/app/reusable/utils/ripples/ripple-color-checker.directive';
import { PreviousPageButtonComponent } from 'src/app/reusable/ui/previous-page-button/previous-page-button.component';
import { AuthEmailService } from '../../data-access/email/auth-email.service';
import { Subject, filter, from, switchMap } from 'rxjs';

@Component({
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrls: [
    '/src/app/reusable/utils/forms/form.scss',
    './forgot-password.component.scss',
  ],
  imports: [
    PreviousPageButtonComponent,
    ReactiveFormsModule,
    CustomMatRippleDirective,
    AsyncPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent implements OnInit {
  viewTransitionService = inject(ViewTransitionService);
  private _authEmailService = inject(AuthEmailService);
  fb = inject(NonNullableFormBuilder);

  @ViewChild('content', { static: true }) content!: ElementRef<HTMLElement>;

  private _sendEmailSubject = new Subject<string>();
  readonly sendEmail$ = this._sendEmailSubject.asObservable().pipe(
    filter((email) => this.emailAddress.invalid && !email),
    switchMap((email) => from(this._authEmailService.sendResetEmail(email)))
  );

  emailAddress = this.fb.control('', {
    validators: [Validators.required, checkEmail],
    updateOn: 'blur',
  });

  readonly emailAddress$ = this.emailAddress.valueChanges;

  ngOnInit(): void {
    this.viewTransitionService.viewFadeIn(this.content.nativeElement);
  }

  sendEmail(e: Event) {
    e.preventDefault();
    this._sendEmailSubject.next(this.emailAddress.value);
  }
}
