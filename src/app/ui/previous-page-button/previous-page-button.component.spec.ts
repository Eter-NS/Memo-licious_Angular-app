import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousPageButtonComponent } from './previous-page-button.component';
import { ViewTransitionService } from 'src/app/reusable/animations/view-transition.service';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('GoBackButtonComponent', () => {
  const pageSubject = new BehaviorSubject<'start' | 'end' | 'idle'>('idle');
  const viewTransitionServiceMock = {
    pageSubject,
    page$: pageSubject.asObservable(),
  };

  let component: PreviousPageButtonComponent;
  let fixture: ComponentFixture<PreviousPageButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PreviousPageButtonComponent],
      providers: [
        {
          provide: ViewTransitionService,
          useValue: viewTransitionServiceMock,
        },
      ],
    });
    fixture = TestBed.createComponent(PreviousPageButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template', () => {
    it('should render the anchor tag', () => {
      const anchor = fixture.debugElement.query(By.css('a'));

      expect(anchor).toBeTruthy();
    });

    it('should call goBackEmitter() if click or keyup.enter events were emitted', () => {
      const spy = spyOn(component, 'goBackEmitter');
      const anchor = fixture.debugElement.query(By.css('a'));

      anchor.triggerEventHandler('click');
      anchor.triggerEventHandler('keyup.enter');

      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('component logic', () => {
    describe('ngAfterViewInit()', () => {
      it('should subscribe and call fadeOut() when the page$ contains value "start"', () => {
        viewTransitionServiceMock.pageSubject.next('start');
        const spy = spyOn(component, 'fadeOut');
        fixture.detectChanges();

        component.ngAfterViewInit();

        expect(spy).toHaveBeenCalled();
      });
    });

    describe('goBackEmitter()', () => {
      it('should emit clicked event', () => {
        spyOn(component.clicked, 'emit');

        component.goBackEmitter();

        expect(component.clicked.emit).toHaveBeenCalled();
      });
    });

    describe('fadeOut()', () => {
      it('should call runAnimationOnce() with anchor element, "fade-out-vol-2-animation" and removeAnimationClassOnFinish set to true', () => {
        const spy = spyOn(component, 'runAnimationOnce').and.callThrough();

        component.fadeOut();

        expect(spy).toHaveBeenCalledWith(
          component.anchor.nativeElement,
          'fade-out-vol-2-animation',
          { removeAnimationClassOnFinish: true }
        );
      });
    });
  });
});
