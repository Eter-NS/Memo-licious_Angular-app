import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  computed,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { CustomMatRippleDirective } from 'src/app/reusable/utils/ripples/ripple-color-checker.directive';
import { BulletTrainEmojiComponent } from '../../../reusable/ui/SVGs/bullet-train-emoji/bullet-train-emoji.component';
import { CompletionOneComponent } from '../../../reusable/ui/SVGs/completion-one/completion-one.component';
import { ViewTransitionService } from 'src/app/reusable/data-access/view-transition/view-transition.service';
import { PreviousPageButtonComponent } from 'src/app/reusable/ui/previous-page-button/previous-page-button.component';
import { AuthEmailService } from '../../data-access/email/auth-email.service';
import { AuthStateService } from '../../data-access/state/auth-state.service';
import { checkEmail } from 'src/app/reusable/utils/custom-validations/custom-validations';

const SENDING_STATE = {
  Sending: 'sending',
  Success: 'success',
  Failure: 'failure',
} as const;

@Component({
  standalone: true,
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    CustomMatRippleDirective,
    BulletTrainEmojiComponent,
    CompletionOneComponent,
    PreviousPageButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyComponent implements OnInit, AfterViewInit {
  #authStateService = inject(AuthStateService);
  #authEmailService = inject(AuthEmailService);
  viewTransitionService = inject(ViewTransitionService);

  private _sendingSubject = new BehaviorSubject<string>(SENDING_STATE.Sending);
  get sendingState$() {
    return this._sendingSubject.asObservable();
  }

  hasBeenVerified = computed(
    () => this.#authStateService.sessionSig()?.emailVerified
  );

  userEmail = this.#authStateService.checkUserSession();
  @ViewChild('content') contentRef!: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.sendEmail();
  }

  ngAfterViewInit(): void {
    this.viewTransitionService.viewFadeIn(this.contentRef.nativeElement);
  }

  isValidEmail() {
    if (!this.userEmail || checkEmail(this.userEmail)) {
      this._sendingSubject.next(SENDING_STATE.Failure);
      return false;
    }
    return true;
  }

  async sendEmail() {
    if (!this.isValidEmail()) return;

    try {
      await this.#authEmailService.sendVerificationEmail();
      this._sendingSubject.next(SENDING_STATE.Success);
    } catch (err) {
      this._sendingSubject.next(SENDING_STATE.Failure);
      if (err instanceof Error && 'message' in err) console.error(err.message);
    }
  }
}
