import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginOrGuestViewComponent } from './login-or-guest-view.component';

describe('LoginOrGuestViewComponent', () => {
  let component: LoginOrGuestViewComponent;
  let fixture: ComponentFixture<LoginOrGuestViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginOrGuestViewComponent]
    });
    fixture = TestBed.createComponent(LoginOrGuestViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
