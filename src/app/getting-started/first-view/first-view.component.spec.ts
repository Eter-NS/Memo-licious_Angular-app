import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstViewComponent } from './first-view.component';
import { By } from '@angular/platform-browser';

describe('FirstViewComponent', () => {
  let component: FirstViewComponent;
  let fixture: ComponentFixture<FirstViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FirstViewComponent],
    });
    fixture = TestBed.createComponent(FirstViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create created', () => {
    expect(component).toBeTruthy();
  });

  it('should call runTransition() after clicking the CTA button by click event', () => {
    const de = fixture.debugElement.query(By.css('greeting__CTA'));

    de.triggerEventHandler('click', null);

    expect(component.runTransition).toHaveBeenCalled();
  });

  it('should call runTransition() after clicking the CTA button by keyup.enter event', () => {
    const de = fixture.debugElement.query(By.css('greeting__CTA'));

    de.triggerEventHandler('keyup.enter', null);

    expect(component.runTransition).toHaveBeenCalled();
  });
});
