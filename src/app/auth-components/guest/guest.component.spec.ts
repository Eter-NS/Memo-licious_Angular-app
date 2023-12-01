import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestComponent } from './GuestComponent';

describe('GuestComponent', () => {
  let component: GuestComponent;
  let fixture: ComponentFixture<GuestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GuestComponent],
    });
    fixture = TestBed.createComponent(GuestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
