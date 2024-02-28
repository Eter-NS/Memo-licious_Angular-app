import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyComponent } from './verify.component';
import { AuthStateService } from '../services/state/auth-state.service';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { AuthEmailService } from '../services/email/auth-email.service';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('VerifyComponent', () => {
  const authStateServiceMock = {
    checkUserSession: jasmine.createSpy(
      'checkUserSession',
      AuthStateService.prototype.checkUserSession
    ),
  };
  const authEmailServiceMock = {
    sendVerificationEmail: jasmine.createSpy(
      'sendVerificationEmail',
      AuthEmailService.prototype.sendVerificationEmail
    ),
  };
  const pageSubject = new BehaviorSubject<'start' | 'end' | 'idle'>('idle');
  const viewTransitionServiceMock = {
    page$: pageSubject.asObservable(),
    viewFadeIn: jasmine.createSpy(
      'viewFadeIn',
      ViewTransitionService.prototype.viewFadeIn
    ),
  };

  let component: VerifyComponent;
  let fixture: ComponentFixture<VerifyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VerifyComponent],
      providers: [
        {
          provide: AuthStateService,
          useValue: authStateServiceMock,
        },
        {
          provide: AuthEmailService,
          useValue: authEmailServiceMock,
        },
        {
          provide: ViewTransitionService,
          useValue: viewTransitionServiceMock,
        },
      ],
    });
    fixture = TestBed.createComponent(VerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template', () => {
    describe('app-previous-page-button', () => {
      it('should be rendered', () => {
        const element = fixture.debugElement.query(
          By.css('app-previous-page-button')
        );

        expect(element).toBeTruthy();
      });

      it('should call viewTransitionService.goBack() when clicked event was emitted', () => {
        const element = fixture.debugElement.query(
          By.css('app-previous-page-button')
        );

        element.triggerEventHandler('clicked');

        expect(viewTransitionServiceMock.viewFadeIn).toHaveBeenCalled();
      });
    });

    describe('sendingState$ switch elements', () => {
      it('should render mat-spinner if sendingState$ equals "sending"', () => {
        component.sendingSubject.next('sending');
        fixture.detectChanges();

        const sending = fixture.debugElement.query(
          By.css(`[data-test="sending-state"]`)
        );

        expect(sending).toBeTruthy();
      });

      it('should render success block if sendingState$ equals "success"', () => {
        component.sendingSubject.next('success');
        fixture.detectChanges();

        const success = fixture.debugElement.query(
          By.css(`[data-test="success-state"]`)
        );

        expect(success).toBeTruthy();
      });

      it('should render failure block if sendingState$ equals "failure"', () => {
        component.sendingSubject.next('failure');
        fixture.detectChanges();

        const failure = fixture.debugElement.query(
          By.css(`[data-test="failure-state"]`)
        );

        expect(failure).toBeTruthy();
      });

      it('should render a paragraph if sendingState$ equals "failure" and userMail is falsy', () => {
        component.userEmail = '';
        component.sendingSubject.next('failure');
        fixture.detectChanges();

        const pElement = fixture.debugElement.query(
          By.css(`[data-test="userEmailEmpty"]`)
        );

        expect(pElement).toBeTruthy();
      });
    });
  });

  describe('component logic', () => {
    describe('ngOnInit()', () => {
      it('should call sendEmail() method', () => {
        spyOn(component, 'sendEmail');

        component.ngOnInit();

        expect(component.sendEmail).toHaveBeenCalled();
      });
    });

    describe('ngAfterViewInit()', () => {
      it('should call viewTransitionService.viewFadeIn() method', () => {
        component.ngAfterViewInit();

        expect(viewTransitionServiceMock.viewFadeIn).toHaveBeenCalledWith(
          component.contentRef.nativeElement
        );
      });
    });

    describe('checkEmail()', () => {
      it('should NOT call next() method on sendingSubject property when userMail is truthy', () => {
        component.userEmail = 'example@example.com';
        spyOn(component.sendingSubject, 'next');

        component.isValidEmail();

        expect(component.sendingSubject.next).not.toHaveBeenCalled();
      });

      it('should call next() method on sendingSubject property when userEmail is falsy', () => {
        component.userEmail = 'XXXXXXXXXXXXX';
        spyOn(component.sendingSubject, 'next');

        component.isValidEmail();

        expect(component.sendingSubject.next).toHaveBeenCalled();
      });
    });

    describe('sendEmail()', () => {
      it('should call isValidEmail() method', async () => {
        spyOn(component, 'isValidEmail');

        await component.sendEmail();

        expect(component.isValidEmail).toHaveBeenCalled();
      });

      it('should call authEmailService.sendVerificationEmail()', async () => {
        component.userEmail = 'example@example.com';
        fixture.detectChanges();

        await component.sendEmail();

        expect(authEmailServiceMock.sendVerificationEmail).toHaveBeenCalled();
      });

      it('should call authEmailService.sendVerificationEmail() method and resolve the promise', async () => {
        component.userEmail = 'example@example.com';
        const spy = spyOn(component.sendingSubject, 'next').and.callThrough();

        await component.sendEmail();

        expect(spy).toHaveBeenCalledWith('success');
      });

      it('should call authEmailService.sendVerificationEmail() method and reject the promise', async () => {
        const spy = spyOn(component.sendingSubject, 'next').and.callThrough();
        authEmailServiceMock.sendVerificationEmail.and.rejectWith(
          new Error('No Internet connection')
        );

        await component.sendEmail();

        expect(spy).toHaveBeenCalledWith('failure');
      });
    });
  });
});
