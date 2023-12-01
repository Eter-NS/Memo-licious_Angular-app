import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthStateComponent } from './auth-state.component';

describe('AuthStateComponent', () => {
  let component: AuthStateComponent;
  let fixture: ComponentFixture<AuthStateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AuthStateComponent],
    });
    fixture = TestBed.createComponent(AuthStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
