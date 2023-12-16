import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousPageButtonComponent } from './previous-page-button.component';

describe('GoBackButtonComponent', () => {
  let component: PreviousPageButtonComponent;
  let fixture: ComponentFixture<PreviousPageButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PreviousPageButtonComponent],
    });
    fixture = TestBed.createComponent(PreviousPageButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
