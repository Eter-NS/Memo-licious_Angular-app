import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { CustomMatRippleDirective } from 'src/app/reusable/ripples/ripple-color-checker.directive';
import { BulletTrainEmojiComponent } from '../../reusable/SVGs/bullet-train-emoji/bullet-train-emoji.component';
import { CompletionOneComponent } from '../../reusable/SVGs/completion-one/completion-one.component';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { PreviousPageButtonComponent } from 'src/app/ui/previous-page-button/previous-page-button.component';
import { AuthEmailService } from '../services/email/auth-email.service';
import { AuthStateService } from '../services/state/auth-state.service';
import { checkEmail } from 'src/app/custom-validations/custom-validations';

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
export class VerifyComponent implements OnInit, AfterViewInit, OnDestroy {
  #authStateService = inject(AuthStateService);
  #authEmailService = inject(AuthEmailService);
  viewTransitionService = inject(ViewTransitionService);
  sendingSubject = new BehaviorSubject<string>(SENDING_STATE.Sending);
  sendingState$ = this.sendingSubject.asObservable();
  userEmail = this.#authStateService.checkUserSession();
  @ViewChild('content') contentRef!: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.sendEmail();
  }

  ngAfterViewInit(): void {
    this.viewTransitionService.viewFadeIn(this.contentRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.sendingSubject.complete();
    this.sendingSubject.unsubscribe();
  }

  isValidEmail() {
    if (!this.userEmail || checkEmail(this.userEmail)) {
      this.sendingSubject.next(SENDING_STATE.Failure);
      return false;
    }
    return true;
  }

  async sendEmail() {
    if (!this.isValidEmail()) return;

    try {
      await this.#authEmailService.sendVerificationEmail();
      this.sendingSubject.next(SENDING_STATE.Success);
    } catch (err) {
      this.sendingSubject.next(SENDING_STATE.Failure);
      if (err instanceof Error && 'message' in err) console.error(err.message);
    }
  }
}
