import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoosePathComponent } from './choose-path.component';

describe('LoginOrGuestViewComponent', () => {
  let component: ChoosePathComponent;
  let fixture: ComponentFixture<ChoosePathComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChoosePathComponent],
    });
    fixture = TestBed.createComponent(ChoosePathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
